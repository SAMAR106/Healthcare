import React, { useState } from 'react'
import { db } from '../api/storage'
import { invokeLLM } from '../api/claudeClient'
import PulseBackground from '../components/shared/PulseBackground'
import GlassCard from '../components/shared/GlassCard'
import VitalMetric from '../components/shared/VitalMetric'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Heart, Flame, Zap,
  Loader2, ArrowRight, AlertCircle,
  Clock, CheckCircle
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { id: 'cardio',      label: 'Cardio',      icon: Heart,    color: '#fb7185', bg: 'rgba(251,113,133,0.1)' },
  { id: 'strength',    label: 'Strength',    icon: Dumbbell, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  { id: 'flexibility', label: 'Flexibility', icon: Zap,      color: '#00F0FF', bg: 'rgba(0,240,255,0.1)'  },
  { id: 'hiit',        label: 'HIIT',        icon: Flame,    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
]

// ── Check if reading is within last 10 minutes ─────────────────
const isWithin10Minutes = (reading) => {
  if (!reading) return false
  if (!reading.created_date) return false
  const readingTime = new Date(reading.created_date).getTime()
  const now = Date.now()
  const diffMinutes = (now - readingTime) / 1000 / 60
  return diffMinutes <= 10
}

// ── Get how old the reading is in human readable format ────────
const getReadingAge = (reading) => {
  if (!reading?.created_date) return 'Unknown time'
  const diffMs = Date.now() - new Date(reading.created_date).getTime()
  const diffMinutes = Math.floor(diffMs / 1000 / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1)  return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  if (diffHours < 24)   return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

export default function Sports() {
  const navigate   = useNavigate()
  const [selected, setSelected] = useState(null)
  const [plan, setPlan]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [staleData, setStaleData] = useState(false)
  const [pendingCategory, setPendingCategory] = useState(null)

  const readings    = db.list('health_readings', 5)
  const reports     = db.list('health_reports', 1)
  const latest      = readings[0]
  const latestReport = reports[0]

  const isFresh   = isWithin10Minutes(latest)
  const readingAge = getReadingAge(latest)

  // ── Generate AI plan ────────────────────────────────────────
  const getAIPlan = async (category) => {
    setSelected(category)
    setStaleData(false)
    setPendingCategory(null)
    setLoading(true)
    setPlan(null)

    const healthCtx = latest
      ? `User vitals: HR ${latest.heart_rate} BPM, BP ${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}, Sugar ${latest.blood_sugar} mg/dL, SpO2 ${latest.pulse_ox}%`
      : 'No health data available.'

    const result = await invokeLLM({
      prompt: `You are a professional sports coach. Generate a personalized ${category} workout plan.
${healthCtx}
${latestReport ? `Health Summary: ${latestReport.summary}` : ''}
Include: plan name, difficulty, estimated calories, warmup (3 exercises with duration), main workout (5 exercises with sets/reps/rest), cooldown (3 exercises), safety tips.`,
      response_json_schema: {
        type: 'object',
        properties: {
          plan_name:          { type: 'string' },
          difficulty:         { type: 'string' },
          estimated_calories: { type: 'number' },
          warmup:      { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, duration: { type: 'string' } } } },
          main_workout:{ type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, sets: { type: 'string' }, reps: { type: 'string' }, rest: { type: 'string' } } } },
          cooldown:    { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, duration: { type: 'string' } } } },
          safety_tips: { type: 'string' },
        },
      },
    })

    setPlan(result)
    setLoading(false)
  }

  // ── Handle category tap ─────────────────────────────────────
  const handleCategoryClick = (categoryId) => {
    // No health data at all
    if (!latest) {
      setPendingCategory(categoryId)
      setStaleData('none')
      return
    }

    // Health data is older than 10 minutes
    if (!isFresh) {
      setPendingCategory(categoryId)
      setStaleData('stale')
      return
    }

    // Fresh data — generate immediately
    getAIPlan(categoryId)
  }

  // ── User chooses to use old data anyway ────────────────────
  const useOldDataAnyway = () => {
    if (pendingCategory) {
      getAIPlan(pendingCategory)
    }
  }

  // ── User goes to measure new health data ───────────────────
  const goMeasureHealth = () => {
    navigate('/health')
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PulseBackground color="violet" />
      <div style={{ position: 'relative', zIndex: 10, padding: '32px 20px 0' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Sports Coach</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>AI-powered training tailored to your body</p>
        </motion.div>

        {/* Health data freshness indicator */}
        {latest && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: isFresh
              ? 'rgba(52,211,153,0.06)'
              : 'rgba(251,191,36,0.06)',
            border: `1px solid ${isFresh
              ? 'rgba(52,211,153,0.2)'
              : 'rgba(251,191,36,0.2)'}`,
            borderRadius: '12px', padding: '10px 14px',
            marginBottom: '16px',
          }}>
            {isFresh
              ? <CheckCircle size={14} color="#34d399" style={{ flexShrink: 0 }} />
              : <Clock size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
            }
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '12px', fontWeight: 600,
                color: isFresh ? '#34d399' : '#fbbf24',
              }}>
                {isFresh
                  ? '✓ Fresh health data available'
                  : `⚠ Health data is ${readingAge}`
                }
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                {isFresh
                  ? 'Your latest vitals will be used for recommendations'
                  : 'Measure again for most accurate recommendations'
                }
              </p>
            </div>
            {!isFresh && (
              <button
                onClick={goMeasureHealth}
                style={{
                  background: 'rgba(251,191,36,0.15)',
                  border: '1px solid rgba(251,191,36,0.3)',
                  borderRadius: '8px', padding: '6px 12px',
                  color: '#fbbf24', fontSize: '11px',
                  fontWeight: 600, cursor: 'pointer',
                  flexShrink: 0, whiteSpace: 'nowrap',
                  minHeight: '36px',
                }}>
                Measure Now
              </button>
            )}
          </div>
        )}

        {/* Vitals strip */}
        {latest && (
          <div style={{
            display: 'flex', gap: '12px',
            marginBottom: '24px', overflowX: 'auto',
          }}>
            <VitalMetric label="Heart Rate" value={latest.heart_rate} unit="bpm" icon={Heart} color="red" small />
            <VitalMetric label="Energy" value={latest.blood_sugar || '--'} unit="mg/dL" icon={Flame} color="violet" small />
          </div>
        )}

        {/* Category selector */}
        <h2 style={{
          fontSize: '11px', textTransform: 'uppercase',
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)',
          marginBottom: '16px',
        }}>
          Choose Training Type
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '24px',
        }}>
          {CATEGORIES.map((cat) => (
            <GlassCard key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                padding: '16px', textAlign: 'center',
                border: selected === cat.id
                  ? '1px solid rgba(167,139,250,0.3)'
                  : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
              }}>
              <div style={{
                padding: '12px', borderRadius: '12px',
                background: cat.bg, margin: '0 auto 8px',
                width: 'fit-content',
              }}>
                <cat.icon size={24} color={cat.color} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                {cat.label}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* ── STALE DATA WARNING POPUP ── */}
        <AnimatePresence>
          {staleData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: '20px' }}
            >
              <GlassCard style={{
                border: '1px solid rgba(251,191,36,0.3)',
                background: 'rgba(251,191,36,0.05)',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  {staleData === 'none'
                    ? <AlertCircle size={20} color="#fb7185" style={{ flexShrink: 0, marginTop: '2px' }} />
                    : <Clock size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  }
                  <div>
                    <p style={{
                      fontSize: '14px', fontWeight: 700,
                      color: staleData === 'none' ? '#fb7185' : '#fbbf24',
                      marginBottom: '6px',
                    }}>
                      {staleData === 'none'
                        ? 'No Health Data Found'
                        : `Health Data is ${readingAge}`
                      }
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.6,
                    }}>
                      {staleData === 'none'
                        ? 'For accurate sport recommendations, please measure your current health vitals first. Your heart rate, BP and SpO2 help the AI create the safest workout plan for you.'
                        : `Your health data was recorded ${readingAge}. For the most accurate and safe workout recommendation, please measure your current vitals. Data older than 10 minutes may not reflect your current condition.`
                      }
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  {/* Primary — go measure */}
                  <button
                    onClick={goMeasureHealth}
                    style={{
                      width: '100%',
                      background: 'rgba(0,240,255,0.1)',
                      border: '1px solid rgba(0,240,255,0.25)',
                      borderRadius: '12px', padding: '14px',
                      color: '#00F0FF', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 700,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      minHeight: '48px',
                    }}>
                    <Heart size={16} />
                    Measure Health Now →
                  </button>

                  {/* Secondary — use old data anyway (only if data exists) */}
                  {staleData === 'stale' && (
                    <button
                      onClick={useOldDataAnyway}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', padding: '12px',
                        color: 'rgba(255,255,255,0.35)',
                        cursor: 'pointer', fontSize: '13px',
                        minHeight: '44px',
                      }}>
                      Continue with old data anyway
                    </button>
                  )}

                  {/* Cancel */}
                  <button
                    onClick={() => { setStaleData(false); setPendingCategory(null); setSelected(null) }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.2)',
                      cursor: 'pointer', fontSize: '12px',
                      minHeight: '36px',
                    }}>
                    Cancel
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <GlassCard glowColor="violet" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Loader2 size={32} color="#a78bfa"
              style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
              Generating your personalized plan...
            </p>
          </GlassCard>
        )}

        {/* Plan output */}
        {plan && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard glowColor="violet" style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: '16px',
              }}>
                <div>
                  <h3 style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>
                    {plan.plan_name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                    {plan.difficulty}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} color="#fbbf24" />
                  <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 600 }}>
                    {plan.estimated_calories} cal
                  </span>
                </div>
              </div>

              {[
                { label: 'Warm-up',      color: '#00F0FF', items: plan.warmup,        isMain: false },
                { label: 'Main Workout', color: '#a78bfa', items: plan.main_workout,  isMain: true  },
                { label: 'Cool-down',    color: '#34d399', items: plan.cooldown,       isMain: false },
              ].map((section) => (
                <div key={section.label} style={{ marginBottom: '16px' }}>
                  <p style={{
                    fontSize: '10px', textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: `${section.color}99`,
                    marginBottom: '8px',
                  }}>
                    {section.label}
                  </p>
                  {section.items?.map((ex, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        {ex.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                        {section.isMain
                          ? `${ex.sets} × ${ex.reps} | Rest ${ex.rest}`
                          : ex.duration
                        }
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {plan.safety_tips && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <p style={{
                    fontSize: '10px', textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'rgba(251,113,133,0.6)',
                    marginBottom: '8px',
                  }}>
                    Safety Tips
                  </p>
                  <p style={{
                    fontSize: '12px', color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.7, whiteSpace: 'pre-line',
                  }}>
                    {plan.safety_tips}
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Chat link */}
        <GlassCard glowColor="blue" style={{ marginBottom: '32px' }}>
          <Link to="/chat?context=sports"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Ask AI Coach</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Get personalized sport advice</p>
            </div>
            <ArrowRight size={20} color="#00F0FF" />
          </Link>
        </GlassCard>

      </div>
    </div>
  )
}
