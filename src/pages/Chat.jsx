import React, { useState, useRef, useEffect } from 'react'
import { db } from '../api/storage'
import { invokeLLM } from '../api/claudeClient'
import PulseBackground from '../components/shared/PulseBackground'
import ChatBubble from '../components/chat/ChatBubble'
import ContextSelector from '../components/chat/ContextSelector'
import { Send, Loader2, Heart, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'

// ── Keywords that indicate a health-related question ──────────
const HEALTH_KEYWORDS = [
  'heart rate', 'heartrate', 'bpm', 'pulse',
  'blood pressure', 'bp', 'systolic', 'diastolic',
  'blood sugar', 'glucose', 'sugar level',
  'spo2', 'oxygen', 'pulse ox', 'oxygen level',
  'my health', 'my vitals', 'my readings', 'my report',
  'am i healthy', 'is my', 'how is my',
  'health status', 'health condition', 'my body',
  'my heart', 'my blood', 'feeling sick', 'not feeling well',
  'fever', 'tired', 'fatigue', 'dizzy', 'breathless',
  'chest pain', 'headache', 'stress', 'anxiety',
  'weight', 'bmi', 'calories', 'diet', 'sleep',
]

// ── Check if message is asking about personal health ─────────
const isHealthQuestion = (message) => {
  const lower = message.toLowerCase()
  return HEALTH_KEYWORDS.some(keyword => lower.includes(keyword))
}

export default function Chat() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const params    = new URLSearchParams(location.search)

  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [context, setContext]   = useState(params.get('context') || 'general')
  const [loading, setLoading]   = useState(false)
  const [noHealthData, setNoHealthData] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Get latest health data from localStorage ──────────────
  const getHealthData = () => {
    const readings = db.list('health_readings', 5)
    const reports  = db.list('health_reports', 1)
    return {
      latest: readings[0] || null,
      report: reports[0] || null,
      hasData: readings.length > 0,
    }
  }

  // ── Build prompt with smart health context injection ──────
  const buildPrompt = (userMsg) => {
    const { latest, report, hasData } = getHealthData()
    const needsHealth = isHealthQuestion(userMsg) || context === 'health' || context === 'sports'

    let prompt = `You are AETHER VITALIS AI — a multi-domain assistant for health, sports, and education. Be helpful, accurate, and concise. Use markdown for formatting. Mode: ${context}.\n\n`

    // Inject health data if question needs it and data exists
    if (needsHealth && hasData && latest) {
      prompt += `--- USER HEALTH DATA ---\n`
      if (latest.heart_rate)                prompt += `Heart Rate: ${latest.heart_rate} BPM\n`
      if (latest.blood_pressure_systolic)   prompt += `Blood Pressure: ${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic} mmHg\n`
      if (latest.blood_sugar)               prompt += `Blood Sugar: ${latest.blood_sugar} mg/dL\n`
      if (latest.pulse_ox)                  prompt += `SpO2: ${latest.pulse_ox}%\n`
      prompt += `--- END HEALTH DATA ---\n\n`
      prompt += `Use the above health data to give a personalized answer.\n\n`
    }

    if (needsHealth && !hasData) {
      prompt += `IMPORTANT: The user is asking about their personal health but they have NOT entered any health readings yet. Tell them you do not have their current health information and guide them to go to the Health page to measure and save their vitals first. Be friendly and helpful.\n\n`
    }

    if (report && needsHealth && hasData) {
      prompt += `Health Report Summary: ${report.summary} | Risk Level: ${report.risk_level}\n\n`
    }

    if (context === 'health')     prompt += 'Focus on health guidance. Always remind this is AI advice, not medical diagnosis.\n\n'
    else if (context === 'sports')    prompt += 'Focus on fitness and exercise. Use health data to personalize recommendations.\n\n'
    else if (context === 'education') prompt += 'Be an excellent tutor. Explain clearly with examples.\n\n'

    const history = messages.slice(-8).map(m => `${m.role}: ${m.content}`).join('\n')
    return `${prompt}${history ? `Conversation:\n${history}\n\n` : ''}User: ${userMsg}\n\nRespond:`
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    const { hasData } = getHealthData()
    const needsHealth = isHealthQuestion(userMsg) || context === 'health' || context === 'sports'

    // Show no-health-data banner if health question but no data
    if (needsHealth && !hasData) {
      setNoHealthData(true)
    } else {
      setNoHealthData(false)
    }

    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setLoading(true)

    const response = await invokeLLM({ prompt: buildPrompt(userMsg) })

    setMessages(prev => [...prev, { role: 'assistant', content: response }])
    setLoading(false)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <PulseBackground color="cyan" />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(30px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '24px 20px 16px',
      }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            AI Assistant
          </h1>
          <ContextSelector selected={context} onChange={(val) => {
            setContext(val)
            setNoHealthData(false)
          }} />
        </motion.div>
      </div>

      {/* No health data banner */}
      <AnimatePresence>
        {noHealthData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ position: 'relative', zIndex: 10, overflow: 'hidden' }}
          >
            <div style={{
              margin: '12px 20px 0',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}>
              <AlertCircle size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600, marginBottom: '4px' }}>
                  No Health Data Found
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                  To get personalized health answers, please measure and save your vitals first.
                </p>
              </div>
              <button
                onClick={() => navigate('/health')}
                style={{
                  background: 'rgba(251,191,36,0.15)',
                  border: '1px solid rgba(251,191,36,0.3)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  color: '#fbbf24',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  minHeight: '40px',
                }}
              >
                Go to Health →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Health data quick view — shows when context is health and data exists */}
      {(context === 'health' || context === 'sports') && (() => {
        const { latest, hasData } = getHealthData()
        if (!hasData || !latest) return null
        return (
          <div style={{
            position: 'relative', zIndex: 10,
            margin: '10px 20px 0',
            background: 'rgba(0,240,255,0.04)',
            border: '1px solid rgba(0,240,255,0.1)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Heart size={11} color="#fb7185" />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                {latest.heart_rate} BPM
              </span>
            </div>
            {latest.blood_pressure_systolic > 0 && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                BP {latest.blood_pressure_systolic}/{latest.blood_pressure_diastolic}
              </span>
            )}
            {latest.blood_sugar > 0 && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                Sugar {latest.blood_sugar} mg/dL
              </span>
            )}
            {latest.pulse_ox > 0 && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                SpO2 {latest.pulse_ox}%
              </span>
            )}
            <span style={{ fontSize: '11px', color: 'rgba(0,240,255,0.4)', marginLeft: 'auto' }}>
              ✓ Using your health data
            </span>
          </div>
        )
      })()}

      {/* Messages */}
      <div style={{
        position: 'relative', zIndex: 10,
        flex: 1, overflowY: 'auto', padding: '16px 20px',
      }}>
        {messages.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '100%', textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(138,43,226,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%', background: '#00F0FF',
              }} className="animate-bio-pulse" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginBottom: '4px' }}>
              AETHER VITALIS AI
            </p>
            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px', maxWidth: '260px', lineHeight: 1.6 }}>
              {context === 'health'     && "Ask me anything about your health. I will use your saved vitals to give personalized answers."}
              {context === 'sports'     && "Get personalized exercise guidance based on your health metrics."}
              {context === 'education'  && "Ask any question — I'll explain it clearly with examples."}
              {context === 'general'    && "I can help with health, sports, education, or general questions. Ask me about your health and I will use your saved vitals."}
            </p>
          </div>
        )}

        {messages.map((msg, i) => <ChatBubble key={i} message={msg} />)}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(138,43,226,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Loader2 size={12} color="#00F0FF" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '12px 16px',
              display: 'flex', gap: '4px', alignItems: 'center',
            }}>
              {[0, 150, 300].map(delay => (
                <div key={delay} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  animation: `bounce 1s ${delay}ms infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 20px',
        marginBottom: '64px',
      }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={
              context === 'health'    ? 'Ask about your health...' :
              context === 'sports'    ? 'Ask about exercises...' :
              context === 'education' ? 'Ask any study question...' :
              'Type your message...'
            }
            style={{
              flex: 1, background: 'transparent',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px', padding: '0 16px',
              color: '#FAFAFA', fontSize: '14px',
              height: '48px', outline: 'none',
            }}
          />
          <button type="submit" disabled={loading || !input.trim()}
            style={{
              background: 'rgba(0,240,255,0.1)',
              border: '1px solid rgba(0,240,255,0.2)',
              borderRadius: '12px', padding: '12px',
              color: '#00F0FF', cursor: 'pointer',
              minWidth: '48px', minHeight: '48px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
