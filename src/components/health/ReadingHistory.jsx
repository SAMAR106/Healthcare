import React from 'react'
import { Heart, Activity, Droplets, Wind } from 'lucide-react'
import GlassCard from '../shared/GlassCard'

export default function ReadingHistory({ readings }) {
  if (!readings || readings.length === 0) {
    return <div style={{ textAlign: 'center', padding: '32px 0' }}><p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No readings yet. Start a scan to begin.</p></div>
  }

  const fmt = (dateStr) => {
    if (!dateStr) return 'Just now'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {readings.map((r, i) => (
        <GlassCard key={r.id || i} glowColor="none" style={{ padding: '16px' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '12px' }}>{fmt(r.created_date)}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { icon: Heart, color: '#fb7185', value: r.heart_rate, label: 'BPM' },
              { icon: Activity, color: '#34d399', value: `${r.blood_pressure_systolic}/${r.blood_pressure_diastolic}`, label: 'BP' },
              { icon: Droplets, color: '#a78bfa', value: r.blood_sugar, label: 'mg/dL' },
              { icon: Wind, color: '#00F0FF', value: `${r.pulse_ox}%`, label: 'SpO2' },
            ].map((m, j) => (
              <div key={j} style={{ textAlign: 'center' }}>
                <m.icon size={14} color={m.color} style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{m.value}</p>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  )
}