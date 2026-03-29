const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
].join(' ')

const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) { resolve(); return }
    const script = document.createElement('script')
    script.src     = 'https://accounts.google.com/gsi/client'
    script.onload  = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const getToken = async () => {
  await loadGoogleScript()
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope:     SCOPES,
      callback:  (response) => {
        if (response.error) { reject(new Error(response.error)); return }
        resolve(response.access_token)
      },
    })
    client.requestAccessToken()
  })
}

const fetchHeartRate = async (token) => {
  const endTime   = Date.now()
  const startTime = endTime - 7 * 24 * 60 * 60 * 1000
  const response  = await fetch(
    'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateBy: [{
          dataTypeName: 'com.google.heart_rate.bpm',
          dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
        }],
        bucketByTime:    { durationMillis: 24 * 60 * 60 * 1000 },
        startTimeMillis: startTime,
        endTimeMillis:   endTime,
      }),
    }
  )
  if (!response.ok) return null
  const data = await response.json()
  let latest = null
  for (const bucket of data.bucket || []) {
    for (const dataset of bucket.dataset || []) {
      for (const point of dataset.point || []) {
        for (const val of point.value || []) {
          if (val.fpVal && val.fpVal > 0) latest = Math.round(val.fpVal)
        }
      }
    }
  }
  return latest
}

const fetchSpO2 = async (token) => {
  const endTime   = Date.now()
  const startTime = endTime - 7 * 24 * 60 * 60 * 1000
  const response  = await fetch(
    'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateBy:     [{ dataTypeName: 'com.google.oxygen_saturation' }],
        bucketByTime:    { durationMillis: 24 * 60 * 60 * 1000 },
        startTimeMillis: startTime,
        endTimeMillis:   endTime,
      }),
    }
  )
  if (!response.ok) return null
  const data = await response.json()
  let latest = null
  for (const bucket of data.bucket || []) {
    for (const dataset of bucket.dataset || []) {
      for (const point of dataset.point || []) {
        for (const val of point.value || []) {
          if (val.fpVal && val.fpVal > 0) latest = Math.round(val.fpVal)
        }
      }
    }
  }
  return latest
}

export const importFromGoogleFit = async () => {
  if (!CLIENT_ID) {
    throw new Error('Google Client ID not found. Add VITE_GOOGLE_CLIENT_ID to your .env file.')
  }
  const token = await getToken()
  const [heartRate, spO2] = await Promise.all([
    fetchHeartRate(token),
    fetchSpO2(token),
  ])
  return { heartRate, spO2 }
}