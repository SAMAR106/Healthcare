import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import Layout from './Layout'
import Home from './pages/Home'
import Health from './pages/Health'
import Sports from './pages/Sports'
import Education from './pages/Education'
import Chat from './pages/Chat'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/health" element={<Layout currentPageName="Health"><Health /></Layout>} />
          <Route path="/sports" element={<Layout currentPageName="Sports"><Sports /></Layout>} />
          <Route path="/education" element={<Layout currentPageName="Education"><Education /></Layout>} />
          <Route path="/chat" element={<Layout currentPageName="Chat"><Chat /></Layout>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)