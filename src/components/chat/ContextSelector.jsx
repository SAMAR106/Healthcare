import React from 'react'
import { Heart, Dumbbell, GraduationCap, MessageCircle } from 'lucide-react'

const CONTEXTS = [
  { id: 'general',   label: 'General', icon: MessageCircle, color: 'rgba(255,255,255,0.6)' },
  { id: 'health',    label: 'Health',  icon: Heart,         color: '#fb7185' },
  { id: 'sports',    label: 'Sports',  icon: Dumbbell,      color: '#a78bfa' },
  { id: 'education', label: 'Study',   icon: GraduationCap, color: '#fbbf24' },
]

export default function ContextSelector({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
      {CONTEXTS.map((ctx) => (
        <button key={ctx.id} onClick={() => onChange(ctx.id)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '12px', border: selected === ctx.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent', background: selected === ctx.id ? 'rgba(255,255,255,0.06)' : 'transparent', color: selected === ctx.id ? ctx.color : 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '44px' }}>
          <ctx.icon size={12} />
          {ctx.label}
        </button>
      ))}
    </div>
  )
}