import React from 'react'
import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', glowColor = 'blue', animate = true, onClick, style = {} }) {
  const glowMap = {
    blue: '0 0 20px rgba(0,240,255,0.15), 0 0 60px rgba(0,240,255,0.05)',
    red: '0 0 20px rgba(255,0,76,0.15), 0 0 60px rgba(255,0,76,0.05)',
    violet: '0 0 20px rgba(138,43,226,0.15), 0 0 60px rgba(138,43,226,0.05)',
    none: 'none',
  }

  const baseStyle = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: glowMap[glowColor] || 'none',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }

  const Wrapper = animate ? motion.div : 'div'
  const animProps = animate ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } } : {}

  return (
    <Wrapper style={baseStyle} className={className} onClick={onClick} {...animProps}>
      {children}
    </Wrapper>
  )
}