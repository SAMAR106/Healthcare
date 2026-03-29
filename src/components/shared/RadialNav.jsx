import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Heart, Dumbbell, GraduationCap, MessageCircle } from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home,          label: 'Home',      path: '/',          page: 'Home',      color: '#00F0FF' },
  { icon: Heart,         label: 'Health',    path: '/health',    page: 'Health',    color: '#fb7185' },
  { icon: Dumbbell,      label: 'Sports',    path: '/sports',    page: 'Sports',    color: '#a78bfa' },
  { icon: GraduationCap, label: 'Education', path: '/education', page: 'Education', color: '#fbbf24' },
  { icon: MessageCircle, label: 'AI Chat',   path: '/chat',      page: 'Chat',      color: '#34d399' },
]

export default function RadialNav({ currentPage }) {
  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)', borderTop: '1px solid rgba(255,255,255,0.1)' }} className="md:hidden">
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page
            return (
              <Link key={item.page} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px', borderRadius: '12px', background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent', opacity: isActive ? 1 : 0.5, minWidth: '48px', minHeight: '48px', justifyContent: 'center', textDecoration: 'none' }}>
                <item.icon size={20} color={isActive ? item.color : 'rgba(255,255,255,0.6)'} />
                <span style={{ fontSize: '10px', color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Side Nav */}
      <nav style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, width: '80px', display: 'none', flexDirection: 'column', alignItems: 'center', padding: '32px 0', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255,255,255,0.1)' }} className="hidden md:flex">
        <div style={{ color: '#00F0FF', fontWeight: 'bold', fontSize: '18px', marginBottom: '40px' }}>AV</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page
            return (
              <Link key={item.page} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px', borderRadius: '12px', background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent', opacity: isActive ? 1 : 0.6, textDecoration: 'none', minWidth: '48px', minHeight: '48px', justifyContent: 'center' }}>
                <item.icon size={20} color={isActive ? item.color : 'rgba(255,255,255,0.7)'} />
                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}