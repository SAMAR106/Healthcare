import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Dumbbell, GraduationCap, MessageCircle } from 'lucide-react'
import GlassCard from '../shared/GlassCard'

const features = [
  { icon: Heart,         title: 'Health Monitor', desc: 'Track vitals, generate AI health reports, and get personalized guidance.', path: '/health',    color: '#fb7185', bg: 'rgba(251,113,133,0.1)' },
  { icon: Dumbbell,      title: 'Sports Coach',   desc: 'AI-powered sport recommendations tailored to your health metrics.',       path: '/sports',    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  { icon: GraduationCap, title: 'Education Hub',  desc: 'AI tutor for any topic — explanations, study materials, and resources.',  path: '/education', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  { icon: MessageCircle, title: 'AI Assistant',   desc: 'Context-aware chatbot using your health data for accurate guidance.',     path: '/chat',      color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
]

export default function FeatureCards() {
  return (
    <div style={{ padding: '32px 20px' }}>
      <h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>System Modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {features.map((f, i) => (
          <Link key={f.path} to={f.path} style={{ textDecoration: 'none' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: f.bg, flexShrink: 0 }}>
                    <f.icon size={24} color={f.color} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>{f.title}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}