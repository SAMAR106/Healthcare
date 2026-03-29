import React from 'react'
import { motion } from 'framer-motion'

export default function PulseBackground({ color = 'cyan' }) {
  const colorMap = { cyan: '#06b6d4', red: '#f43f5e', violet: '#8b5cf6' }
  const c = colorMap[color] || '#06b6d4'

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <motion.div
        style={{ position: 'absolute', top: '-30%', left: '-20%', width: '80vw', height: '80vw', borderRadius: '50%', background: c, filter: 'blur(120px)', opacity: 0.03 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '60vw', height: '60vw', borderRadius: '50%', background: '#8b5cf6', filter: 'blur(100px)', opacity: 0.02 }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}