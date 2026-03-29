import React from 'react'
import RadialNav from './components/shared/RadialNav'

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen" style={{ background: '#050505', color: '#FAFAFA' }}>
      <RadialNav currentPage={currentPageName} />
      <main className="md:ml-20 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}