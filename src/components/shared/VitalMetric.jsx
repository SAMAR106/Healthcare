import React from 'react'
import { motion } from 'framer-motion'

const colorMap = {
  blue:   { text: '#00F0FF', bg: 'rgba(0,240,255,0.1)',   border: 'rgba(0,240,255,0.2)' },
  red:    { text: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)' },
  violet: { text: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  green:  { text: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)' },
}

export default function VitalMetric({ label, value, unit, icon: Icon, color = 'blue', trend, small = false }) {
  const c = colorMap[color]
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${c.border}`, borderRadius: '12px', padding: small ? '12px' : '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
        {Icon && <div style={{ padding: '6px', borderRadius: '8px', background: c.bg }}><Icon size={14} color={c.text} /></div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontWeight: 'bold', color: c.text, fontSize: small ? '20px' : '24px' }}>{value}</span>
        {unit && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{unit}</span>}
      </div>
      {trend && (
        <p style={{ fontSize: '11px', marginTop: '6px', color: trend === 'normal' ? '#34d399' : '#fbbf24' }}>
          {trend === 'normal' ? '● Normal' : '● Attention needed'}
        </p>
      )}
    </motion.div>
  )
}