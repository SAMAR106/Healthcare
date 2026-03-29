import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Fingerprint } from 'lucide-react'

export default function HeroSection() {
  return (
    <div style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.05) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: '480px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={{ fontSize: 'clamp(40px, 10vw, 72px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.1 }}>
            <span className="text-gradient-blue">AETHER</span>
            <br />
            <span className="text-gradient-vital">VITALIS</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', letterSpacing: '0.05em', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
            Your biological & cognitive operating system. Health. Sports. Knowledge. All in one.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
          <Link to="/health" style={{ textDecoration: 'none' }}>
            <button style={{ position: 'relative', background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '50px', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#00F0FF', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 auto', minHeight: '48px' }}>
              <Fingerprint size={20} className="animate-bio-pulse" />
              Initiate Bio-Sync
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}