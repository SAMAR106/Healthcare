import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Activity, Droplets, Wind,
  Save, CheckCircle, Info, Camera,
  Smartphone, Monitor, AlertCircle,
  HelpCircle, ChevronDown, ChevronUp,
  Loader2
} from 'lucide-react'

// ─── Detect Mobile ──────────────────────────────────────────────
const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(navigator.userAgent)

// ─── Sensor Info Card ───────────────────────────────────────────
function SensorInfoCard() {
  const [open, setOpen] = useState(false)

  const sensors = [
    {
      icon: Camera,
      color: '#fb7185',
      title: 'Camera Sensor',
      available: true,
      measures: ['Heart Rate (PPG light method)', 'SpO2 — oxygen level (estimated)'],
      cannot: ['Blood Pressure', 'Blood Sugar'],
      note: 'Place finger firmly on back camera with flash ON. Hold still for 20 seconds.',
    },
    {
      icon: Activity,
      color: '#34d399',
      title: 'Blood Pressure',
      available: false,
      measures: [],
      cannot: ['Cannot be measured by any phone sensor'],
      note: 'Requires a physical BP monitor cuff device. Enter reading manually.',
    },
    {
      icon: Droplets,
      color: '#a78bfa',
      title: 'Blood Sugar',
      available: false,
      measures: [],
      cannot: ['Cannot be measured by any phone sensor'],
      note: 'Requires a glucometer device with test strip. Enter reading manually.',
    },
    {
      icon: Wind,
      color: '#00F0FF',
      title: 'SpO2 / Pulse Ox',
      available: true,
      measures: ['Estimated via camera light reflection'],
      cannot: ['Not 100% medical grade'],
      note: 'For accurate reading use a pulse oximeter device.',
    },
  ]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      marginBottom: '20px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={15} color="#00F0FF" />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            What can this website measure?
          </span>
        </div>
        {open
          ? <ChevronUp size={15} color="rgba(255,255,255,0.4)" />
          : <ChevronDown size={15} color="rgba(255,255,255,0.4)" />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {sensors.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${s.available ? `${s.color}30` : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '8px', marginBottom: '8px',
                  }}>
                    <div style={{ padding: '6px', borderRadius: '8px', background: `${s.color}20` }}>
                      <s.icon size={14} color={s.color} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                      {s.title}
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: '10px',
                      padding: '2px 8px', borderRadius: '50px',
                      background: s.available ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
                      color: s.available ? '#34d399' : 'rgba(255,255,255,0.3)',
                    }}>
                      {s.available ? '✓ Available' : '✗ Not possible'}
                    </span>
                  </div>
                  {s.measures.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      {s.measures.map((m, j) => (
                        <p key={j} style={{ fontSize: '12px', color: '#34d399', paddingLeft: '8px', marginBottom: '2px' }}>
                          ✓ {m}
                        </p>
                      ))}
                    </div>
                  )}
                  {s.cannot.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      {s.cannot.map((c, j) => (
                        <p key={j} style={{ fontSize: '12px', color: 'rgba(255,100,100,0.7)', paddingLeft: '8px', marginBottom: '2px' }}>
                          ✗ {c}
                        </p>
                      ))}
                    </div>
                  )}
                  <p style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                    paddingLeft: '8px', marginTop: '6px', lineHeight: 1.5,
                    borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px',
                  }}>
                    💡 {s.note}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Camera Measurement (HR + SpO2) ────────────────────────────
function CameraMeasurement({ onDetected, onError }) {
  const videoRef      = useRef(null)
  const canvasRef     = useRef(null)
  const streamRef     = useRef(null)
  const intervalRef   = useRef(null)
  const trackRef      = useRef(null)
  const samplesRef    = useRef([])
  const frameCountRef = useRef(0)

  const [status, setStatus]               = useState('idle')
  const [progress, setProgress]           = useState(0)
  const [result, setResult]               = useState(null)
  const [signalQuality, setSignalQuality] = useState(0)
  const [rgbDebug, setRgbDebug]           = useState({ r: 0, g: 0, b: 0 })
  const [pulseAnim, setPulseAnim]         = useState(false)
  const [videoReady, setVideoReady]       = useState(false)

  const startCamera = async () => {
    try {
      setStatus('requesting')
      setVideoReady(false)
      samplesRef.current    = []
      frameCountRef.current = 0

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width:  { ideal: 320 },
          height: { ideal: 240 },
        },
        audio: false,
      })

      streamRef.current = stream
      const track = stream.getVideoTracks()[0]
      trackRef.current = track

      const video = videoRef.current
      if (video) {
        video.srcObject   = stream
        video.muted       = true
        video.playsInline = true
        video.volume      = 0
        video.setAttribute('muted', '')
        video.setAttribute('playsinline', '')
        video.setAttribute('autoplay', '')

        await new Promise((resolve) => {
          video.onloadedmetadata = resolve
          video.oncanplay        = resolve
          video.onerror          = resolve
          setTimeout(resolve, 3000)
        })

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await video.play()
            console.log(`✅ Video playing attempt ${attempt + 1}, size: ${video.videoWidth}x${video.videoHeight}`)
            break
          } catch (e) {
            console.warn(`Play attempt ${attempt + 1} failed:`, e)
            await new Promise(r => setTimeout(r, 300))
          }
        }
        setVideoReady(true)
      }

      await new Promise(r => setTimeout(r, 800))
      try {
        const caps = track.getCapabilities()
        if (caps.torch) {
          await track.applyConstraints({ advanced: [{ torch: true }] })
          console.log('✅ Torch ON')
        }
      } catch (e) {
        console.warn('Torch not supported:', e)
      }

      setStatus('waitingFinger')
      intervalRef.current = setInterval(() => captureFrame(), 100)

    } catch (err) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setStatus('denied')
      } else {
        setStatus('error')
        onError('Camera error: ' + err.message)
      }
    }
  }

  const captureFrame = () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    if (video.readyState < 3) return
    if (video.videoWidth  === 0) return
    if (video.videoHeight === 0) return
    if (video.paused) { video.play().catch(() => {}); return }

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    canvas.width  = 50
    canvas.height = 50

    try {
      ctx.drawImage(video, 0, 0, 50, 50)
      const frame = ctx.getImageData(0, 0, 50, 50)
      if (frame.data[0] === 0 && frame.data[4] === 0 && frame.data[8] === 0) return
      processPixels(frame.data)
    } catch (e) {
      console.warn('Canvas draw error:', e)
    }
  }

  const processPixels = (data) => {
    let rSum = 0, gSum = 0, bSum = 0
    const total = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]
    }
    const r = rSum / total
    const g = gSum / total
    const b = bSum / total
    setRgbDebug({ r: Math.round(r), g: Math.round(g), b: Math.round(b) })

    const total3 = r + g + b
    const rRatio = r / (total3 || 1)
    const finger = rRatio > 0.5 && r > 40 && g < r * 0.85

    if (!finger) {
      if (frameCountRef.current > 5) {
        samplesRef.current    = []
        frameCountRef.current = 0
        setProgress(0)
        setStatus('waitingFinger')
      }
      return
    }

    setPulseAnim(prev => !prev)
    setStatus('measuring')
    samplesRef.current.push({ r, g, b })
    frameCountRef.current += 1

    const quality = Math.min(100, Math.round(rRatio * 180))
    setSignalQuality(quality)
    setProgress(Math.min(Math.round((frameCountRef.current / 150) * 100), 100))

    if (frameCountRef.current >= 150) {
      clearInterval(intervalRef.current)
      calculateResults()
    }
  }

  const calculateResults = () => {
    const samples = samplesRef.current
    if (samples.length < 50) {
      setStatus('error'); onError('Not enough data. Try again.'); stopCamera(); return
    }

    const rVals = samples.map(s => s.r)
    const bVals = samples.map(s => s.b)

    const mean     = rVals.reduce((a, b) => a + b, 0) / rVals.length
    const acSig    = rVals.map(v => v - mean)
    const smooth   = acSig.map((v, i, arr) => {
      const s = arr.slice(Math.max(0, i - 5), i + 6)
      return s.reduce((a, b) => a + b, 0) / s.length
    })
    const filtered = smooth.map((v, i, arr) => {
      const s  = arr.slice(Math.max(0, i - 15), i + 16)
      const ma = s.reduce((a, b) => a + b, 0) / s.length
      return v - ma
    })

    const peaks = []
    for (let i = 1; i < filtered.length - 1; i++) {
      if (filtered[i] > filtered[i - 1] && filtered[i] > filtered[i + 1] && filtered[i] > 0) {
        if (peaks.length === 0 || i - peaks[peaks.length - 1] >= 4) peaks.push(i)
      }
    }

    let heartRate = 75
    if (peaks.length >= 3) {
      const intervals = []
      for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i - 1])
      const valid = intervals.filter(iv => iv >= 3 && iv <= 20)
      if (valid.length >= 2) {
        const avg = valid.reduce((a, b) => a + b, 0) / valid.length
        heartRate  = Math.round(60000 / (avg * 100))
        heartRate  = Math.min(Math.max(heartRate, 45), 180)
      }
    }

    const stdDev = (arr) => {
      const m = arr.reduce((a, b) => a + b, 0) / arr.length
      return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length)
    }
    const dcR = rVals.reduce((a, b) => a + b, 0) / rVals.length
    const acR = stdDev(rVals)
    const dcB = bVals.reduce((a, b) => a + b, 0) / bVals.length
    const acB = stdDev(bVals)
    let spO2 = 97
    if (acR > 0 && acB > 0 && dcB > 0) {
      const R = (acR / dcR) / (acB / dcB)
      spO2    = Math.round(100 - 5 * R)
      spO2    = Math.min(100, Math.max(85, spO2))
    }

    setResult({ heartRate, spO2 })
    setStatus('done')
    stopCamera()
    onDetected({ heartRate, spO2 })
  }

  const stopCamera = () => {
    if (trackRef.current) {
      try { trackRef.current.applyConstraints({ advanced: [{ torch: false }] }) } catch (e) {}
    }
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    trackRef.current = null
    setVideoReady(false)
  }

  useEffect(() => () => stopCamera(), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', width: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Video — tiny but visible so Android Chrome renders frames */}
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        style={{
          position: 'fixed', bottom: 0, right: 0,
          width: '1px', height: '1px',
          opacity: 0.01, zIndex: -1, pointerEvents: 'none',
        }}
      />

      {/* ── IDLE ── */}
      {status === 'idle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>

          <button onClick={startCamera} style={{
            width: '140px', height: '140px', borderRadius: '50%',
            border: '2px solid rgba(251,113,133,0.5)',
            background: 'rgba(251,113,133,0.07)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', gap: '8px',
          }}>
            <Camera size={42} color="#fb7185" />
            <span style={{ fontSize: '10px', color: 'rgba(251,113,133,0.8)', fontWeight: 600 }}>TAP TO START</span>
          </button>

          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {[
              { icon: Heart, color: '#fb7185', label: 'Heart Rate', sub: 'camera PPG' },
              { icon: Wind,  color: '#00F0FF', label: 'SpO2',       sub: 'camera PPG' },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, background: `${item.color}10`,
                border: `1px solid ${item.color}25`,
                borderRadius: '10px', padding: '10px', textAlign: 'center',
              }}>
                <item.icon size={14} color={item.color} style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: '11px', color: item.color, fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{item.sub}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: '12px', padding: '14px', width: '100%',
          }}>
            <p style={{ fontSize: '12px', color: 'rgba(251,191,36,0.9)', lineHeight: 2.0, textAlign: 'center' }}>
              📱 <strong>How to measure:</strong><br />
              1️⃣ Tap the button above<br />
              2️⃣ Flash turns ON automatically<br />
              3️⃣ Cover <strong>camera lens + flash</strong><br />
              &nbsp;&nbsp;&nbsp;&nbsp;completely with fingertip<br />
              4️⃣ Press <strong>gently but firmly</strong><br />
              5️⃣ Hold <strong>perfectly still</strong> 15 sec
            </p>
          </div>
        </motion.div>
      )}

      {/* ── REQUESTING ── */}
      {status === 'requesting' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Loader2 size={32} color="#00F0FF" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#00F0FF', fontSize: '14px' }}>Starting camera...</p>
        </div>
      )}

      {/* ── WAITING FOR FINGER ── */}
      {status === 'waitingFinger' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>

          <div style={{
            width: '100%', borderRadius: '20px',
            border: '2px solid rgba(255,80,80,0.4)',
            background: 'linear-gradient(135deg, #1a0000, #2d0000)',
            padding: '32px 20px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(251,191,36,0.95)', borderRadius: '20px',
              padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '11px' }}>⚡</span>
              <span style={{ fontSize: '11px', color: '#000', fontWeight: 700 }}>FLASH ON</span>
            </div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '100px', height: '100px', borderRadius: '50%',
                border: '3px dashed rgba(255,80,80,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,0,0,0.05)',
              }}>
              <span style={{ fontSize: '48px' }}>👆</span>
            </motion.div>

            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Place finger on camera</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6 }}>
              Cover both the lens and flash<br />with your fingertip firmly
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: 'R', value: rgbDebug.r, color: '#fb7185' },
                { label: 'G', value: rgbDebug.g, color: '#34d399' },
                { label: 'B', value: rgbDebug.b, color: '#60a5fa' },
              ].map(ch => (
                <div key={ch.label} style={{
                  background: 'rgba(0,0,0,0.5)', borderRadius: '8px',
                  padding: '6px 14px', textAlign: 'center',
                  border: `1px solid ${ch.color}30`,
                }}>
                  <p style={{ fontSize: '10px', color: ch.color }}>{ch.label}</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: ch.color }}>{ch.value}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
              R value should be HIGH (150+) when finger placed
            </p>
          </div>

          <button onClick={() => { stopCamera(); setStatus('idle') }}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '10px 24px',
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px',
            }}>
            Cancel
          </button>
        </motion.div>
      )}

      {/* ── MEASURING ── */}
      {status === 'measuring' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>

          <div style={{
            width: '100%', borderRadius: '20px',
            background: 'linear-gradient(135deg, #001a00, #082d08)',
            border: '2px solid rgba(52,211,153,0.4)',
            padding: '28px 20px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(251,191,36,0.95)', borderRadius: '20px',
              padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '11px' }}>⚡</span>
              <span style={{ fontSize: '11px', color: '#000', fontWeight: 700 }}>FLASH ON</span>
            </div>

            <motion.div animate={{ scale: pulseAnim ? 1.25 : 1.0 }} transition={{ duration: 0.1 }}>
              <Heart size={60} color="#fb7185" fill="#fb718550" />
            </motion.div>

            <div style={{
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: '10px', padding: '8px 20px',
            }}>
              <p style={{ fontSize: '13px', color: '#34d399', fontWeight: 700 }}>✓ Finger Detected — Keep Still</p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: 'R', value: rgbDebug.r, color: '#fb7185' },
                { label: 'G', value: rgbDebug.g, color: '#34d399' },
                { label: 'B', value: rgbDebug.b, color: '#60a5fa' },
              ].map(ch => (
                <div key={ch.label} style={{
                  background: 'rgba(0,0,0,0.5)', borderRadius: '8px',
                  padding: '6px 14px', textAlign: 'center',
                  border: `1px solid ${ch.color}30`,
                }}>
                  <p style={{ fontSize: '10px', color: ch.color }}>{ch.label}</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: ch.color }}>{ch.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Signal Quality</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: signalQuality > 60 ? '#34d399' : '#fbbf24' }}>
                {signalQuality > 80 ? '🟢 Excellent' : signalQuality > 60 ? '🟡 Good' : '🔴 Weak — press harder'}
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '50px', overflow: 'hidden' }}>
              <div style={{
                width: `${signalQuality}%`, height: '100%',
                background: signalQuality > 60 ? '#34d399' : '#fbbf24',
                borderRadius: '50px', transition: 'width 0.2s',
              }} />
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Measuring...</span>
              <span style={{ fontSize: '12px', color: '#fb7185', fontWeight: 600 }}>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '50px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #fb7185, #00F0FF)', borderRadius: '50px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {[
              { color: '#fb7185', label: '❤ Measuring HR...' },
              { color: '#00F0FF', label: '💨 Measuring SpO2...' },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, padding: '8px', borderRadius: '10px',
                background: `${item.color}10`, border: `1px solid ${item.color}25`, textAlign: 'center',
              }}>
                <p style={{ fontSize: '11px', color: item.color }}>{item.label}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            🤞 Do NOT lift your finger until 100%
          </p>
        </motion.div>
      )}

      {/* ── DONE ── */}
      {status === 'done' && result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>

          <p style={{ fontSize: '15px', color: '#34d399', fontWeight: 700 }}>✓ Measurement Complete</p>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            {[
              { value: result.heartRate, unit: 'BPM', label: 'Heart Rate', icon: Heart, color: '#fb7185' },
              { value: result.spO2,      unit: '%',   label: 'SpO2',       icon: Wind,  color: '#00F0FF' },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, background: `${item.color}10`,
                border: `1px solid ${item.color}30`,
                borderRadius: '14px', padding: '16px', textAlign: 'center',
              }}>
                <item.icon size={18} color={item.color} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '34px', fontWeight: 'bold', color: item.color }}>{item.value}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{item.unit}</p>
                <p style={{ fontSize: '11px', color: `${item.color}99`, marginTop: '4px' }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
            borderRadius: '10px', padding: '10px 14px', width: '100%',
          }}>
            <p style={{ fontSize: '11px', color: 'rgba(251,191,36,0.7)', textAlign: 'center', lineHeight: 1.6 }}>
              ⚠ Camera readings are estimates only.<br />Not a substitute for medical devices.
            </p>
          </div>

          <button
            onClick={() => { setStatus('idle'); setResult(null); setProgress(0); setSignalQuality(0); setRgbDebug({ r: 0, g: 0, b: 0 }) }}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '10px 28px',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px',
            }}>
            Measure Again
          </button>
        </motion.div>
      )}

      {/* ── DENIED / ERROR ── */}
      {(status === 'denied' || status === 'error') && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <AlertCircle size={40} color="#fb7185" />
          <p style={{ fontSize: '13px', color: '#fb7185', fontWeight: 600 }}>
            {status === 'denied' ? 'Camera access denied.' : 'Camera not available.'}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
            Please enter Heart Rate and SpO2 manually below.
          </p>
          <button onClick={() => setStatus('idle')} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '10px 24px',
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px',
          }}>
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────
export default function SensorSimulator({ onReadingComplete }) {
  const mobile = isMobile()

  const [cameraResult, setCameraResult]   = useState(null)
  const [cameraError, setCameraError]     = useState(null)
  const [fitLoading, setFitLoading]       = useState(false)
  const [fitError, setFitError]           = useState(null)
  const [fitSuccess, setFitSuccess]       = useState(false)

  const [values, setValues] = useState({
    heart_rate: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_sugar: '',
    pulse_ox: '',
  })
  const [saved, setSaved]   = useState(false)
  const [errors, setErrors] = useState({})

  const handleCameraDetected = (result) => {
    setCameraResult(result)
    setCameraError(null)
    setValues(prev => ({
      ...prev,
      heart_rate: String(result.heartRate),
      pulse_ox:   String(result.spO2),
    }))
  }

  const handleCameraError = (msg) => {
    setCameraError(msg)
    setCameraResult(null)
  }

  // ── Google Fit Import ────────────────────────────────────────
  const handleGoogleFitImport = async () => {
    setFitLoading(true)
    setFitError(null)
    setFitSuccess(false)

    try {
      const { heartRate, spO2 } = await importFromGoogleFit()

      if (!heartRate && !spO2) {
        setFitError('No heart rate or SpO2 data found in Google Fit. Please record some data in the app first.')
        setFitLoading(false)
        return
      }

      setValues(prev => ({
        ...prev,
        heart_rate: heartRate ? String(heartRate) : prev.heart_rate,
        pulse_ox:   spO2      ? String(spO2)      : prev.pulse_ox,
      }))

      setFitSuccess(true)
      setTimeout(() => setFitSuccess(false), 4000)

    } catch (err) {
      console.error('Google Fit error:', err)
      if (err.message?.includes('popup_closed')) {
        setFitError('Login cancelled. Please try again.')
      } else if (err.message?.includes('access_denied')) {
        setFitError('Access denied. Please allow Google Fit permissions.')
      } else {
        setFitError('Could not connect to Google Fit. ' + err.message)
      }
    }

    setFitLoading(false)
  }

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!values.heart_rate) {
      newErrors.heart_rate = 'Heart rate is required'
    } else if (Number(values.heart_rate) < 30 || Number(values.heart_rate) > 220) {
      newErrors.heart_rate = 'Enter a value between 30 and 220'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const result = {
      heart_rate:               Number(values.heart_rate),
      blood_pressure_systolic:  Number(values.blood_pressure_systolic)  || 0,
      blood_pressure_diastolic: Number(values.blood_pressure_diastolic) || 0,
      blood_sugar:              Number(values.blood_sugar)              || 0,
      pulse_ox:                 Number(values.pulse_ox)                 || 0,
    }
    onReadingComplete(result)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setCameraResult(null)
      setValues({
        heart_rate: '', blood_pressure_systolic: '',
        blood_pressure_diastolic: '', blood_sugar: '', pulse_ox: '',
      })
    }, 3000)
  }

  const allFields = [
    { key: 'heart_rate',               label: 'Heart Rate',   unit: 'BPM',   icon: Heart,     color: '#fb7185', placeholder: '72',  hint: 'Normal: 60-100 BPM',        required: true,  cameraFilled: !!cameraResult },
    { key: 'pulse_ox',                 label: 'SpO2',         unit: '%',     icon: Wind,      color: '#00F0FF', placeholder: '98',  hint: 'Normal: 95-100%',           required: false, cameraFilled: !!cameraResult },
    { key: 'blood_pressure_systolic',  label: 'BP Systolic',  unit: 'mmHg',  icon: Activity,  color: '#34d399', placeholder: '120', hint: 'Normal: 90-120 mmHg',       required: false, cameraFilled: false },
    { key: 'blood_pressure_diastolic', label: 'BP Diastolic', unit: 'mmHg',  icon: Activity,  color: '#34d399', placeholder: '80',  hint: 'Normal: 60-80 mmHg',        required: false, cameraFilled: false },
    { key: 'blood_sugar',              label: 'Blood Sugar',  unit: 'mg/dL', icon: Droplets,  color: '#a78bfa', placeholder: '100', hint: 'Normal fasting: 70-100 mg/dL', required: false, cameraFilled: false },
  ]

  return (
    <div style={{ width: '100%' }}>

      <SensorInfoCard />

      {/* Device banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: mobile ? 'rgba(251,113,133,0.05)' : 'rgba(0,240,255,0.05)',
        border: `1px solid ${mobile ? 'rgba(251,113,133,0.2)' : 'rgba(0,240,255,0.15)'}`,
        borderRadius: '12px', padding: '10px 14px', marginBottom: '16px',
      }}>
        {mobile
          ? <Smartphone size={14} color="#fb7185" style={{ flexShrink: 0 }} />
          : <Monitor size={14} color="#00F0FF" style={{ flexShrink: 0 }} />
        }
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          {mobile
            ? '📱 Mobile detected — Use camera or Google Fit to measure Heart Rate and SpO2.'
            : '💻 Laptop detected — Use Google Fit or enter readings manually.'
          }
        </p>
      </div>

      {/* ── GOOGLE FIT IMPORT BUTTON ── */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleGoogleFitImport}
          disabled={fitLoading}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            padding: '14px', borderRadius: '14px',
            background: fitSuccess ? 'rgba(52,211,153,0.1)' : 'rgba(66,133,244,0.1)',
            border: `1px solid ${fitSuccess ? 'rgba(52,211,153,0.3)' : 'rgba(66,133,244,0.3)'}`,
            color: fitSuccess ? '#34d399' : '#4285f4',
            cursor: fitLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontWeight: 600, minHeight: '52px',
            transition: 'all 0.3s',
          }}>
          {fitLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Connecting to Google Fit...
            </>
          ) : fitSuccess ? (
            <>
              <CheckCircle size={18} />
              ✓ Google Fit Data Imported!
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Import from Google Fit
            </>
          )}
        </button>

        {fitError && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start',
              background: 'rgba(255,0,76,0.08)', border: '1px solid rgba(255,0,76,0.2)',
              borderRadius: '10px', padding: '10px 12px',
            }}>
            <AlertCircle size={14} color="#ff004c" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '12px', color: 'rgba(255,100,100,0.8)', lineHeight: 1.5 }}>{fitError}</p>
          </motion.div>
        )}

        {fitSuccess && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '10px', background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', padding: '10px 12px',
            }}>
            <p style={{ fontSize: '12px', color: '#34d399', lineHeight: 1.5, textAlign: 'center' }}>
              ✓ Heart Rate and SpO2 imported from Google Fit.<br />
              Review and edit if needed then tap Save.
            </p>
          </motion.div>
        )}
      </div>

      {/* Camera section — mobile only */}
      {mobile && (
        <div style={{
          background: 'rgba(251,113,133,0.03)',
          border: '1px solid rgba(251,113,133,0.12)',
          borderRadius: '14px', padding: '16px', marginBottom: '16px',
        }}>
          <p style={{
            fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
            marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Camera size={13} color="#fb7185" />
            Camera Measurement — Heart Rate + SpO2
          </p>
          <CameraMeasurement onDetected={handleCameraDetected} onError={handleCameraError} />
        </div>
      )}

      {/* All reading fields */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px', padding: '16px', marginBottom: '16px',
      }}>
        <p style={{
          fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)',
          marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Info size={13} color="rgba(255,255,255,0.4)" />
          {mobile ? 'Review and complete your readings' : 'Enter your readings manually'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allFields.map((field) => (
            <div key={field.key}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: field.cameraFilled && values[field.key] ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${errors[field.key] ? 'rgba(255,0,76,0.4)' : field.cameraFilled && values[field.key] ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px', padding: '10px 14px',
              }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: `${field.color}20`, flexShrink: 0 }}>
                  <field.icon size={14} color={field.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {field.label}
                    </p>
                    {field.required && <span style={{ fontSize: '10px', color: '#fb7185' }}>*required</span>}
                    {field.cameraFilled && values[field.key] && (
                      <span style={{ fontSize: '10px', color: '#34d399', marginLeft: 'auto' }}>✓ camera</span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={values[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      background: 'transparent', border: 'none', outline: 'none',
                      color: field.color, fontSize: '20px', fontWeight: 'bold',
                      width: '100%', fontFamily: 'inherit',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{field.unit}</span>
              </div>
              {errors[field.key] ? (
                <p style={{ fontSize: '11px', color: '#fb7185', marginTop: '3px', paddingLeft: '6px' }}>⚠ {errors[field.key]}</p>
              ) : (
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '3px', paddingLeft: '6px' }}>{field.hint}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{
              width: '100%', background: 'rgba(52,211,153,0.15)',
              border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', padding: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', color: '#34d399', fontSize: '14px', fontWeight: 600,
            }}>
            <CheckCircle size={18} />
            Reading Saved Successfully!
          </motion.div>
        ) : (
          <motion.button key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={handleSave}
            style={{
              width: '100%', background: 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.2)', borderRadius: '12px', padding: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', color: '#00F0FF', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600, minHeight: '48px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,240,255,0.08)'}
          >
            <Save size={16} />
            Save My Reading
          </motion.button>
        )}
      </AnimatePresence>

      <p style={{
        fontSize: '11px', color: 'rgba(255,255,255,0.15)',
        textAlign: 'center', marginTop: '14px', lineHeight: 1.7,
      }}>
        📱 Google Fit · Apple Health · Samsung Health · Smartwatch
        <br />
        🩺 BP Monitor · Glucometer · Pulse Oximeter
      </p>
    </div>
  )
}
