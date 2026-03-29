import React, { useState } from 'react'
import { invokeLLM } from '../api/claudeClient'
import PulseBackground from '../components/shared/PulseBackground'
import GlassCard from '../components/shared/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Search, BookOpen, Loader2,
  Download, ArrowRight, Brain, Atom,
  Calculator, Globe, Code, Palette, AlertCircle,
  FileText, Video, Book, GitBranch, ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

const SUBJECTS = [
  { id: 'math',    label: 'Mathematics', icon: Calculator, color: '#00F0FF' },
  { id: 'science', label: 'Science',     icon: Atom,       color: '#34d399' },
  { id: 'coding',  label: 'Programming', icon: Code,       color: '#a78bfa' },
  { id: 'history', label: 'History',     icon: Globe,      color: '#fbbf24' },
  { id: 'arts',    label: 'Arts',        icon: Palette,    color: '#fb7185' },
  { id: 'general', label: 'General',     icon: Brain,      color: 'rgba(255,255,255,0.6)' },
]

const DOWNLOAD_TYPES = {
  pdf:       { label: 'PDF',       color: '#fb7185', bg: 'rgba(251,113,133,0.1)',  border: 'rgba(251,113,133,0.2)',  icon: FileText   },
  youtube:   { label: 'YouTube',   color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.2)',  icon: Video      },
  course:    { label: 'Course',    color: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.2)',   icon: GraduationCap },
  wikipedia: { label: 'Wikipedia', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', icon: Book       },
  github:    { label: 'GitHub',    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', icon: GitBranch  },
}

export default function Education() {
  const [query, setQuery]     = useState('')
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)

  const formatMultiline = (text) => {
    if (!text) return null
    const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    if (lines.length <= 1) {
      return <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>{text}</p>
    }

    const numbered = lines.every((line) => /^\d+\.\s+/.test(line))
    if (numbered) {
      return (
        <ol style={{ paddingLeft: '18px', margin: 0, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
          {lines.map((line, index) => (
            <li key={index} style={{ marginBottom: '10px', fontSize: '14px' }}>{line.replace(/^\d+\.\s+/, '')}</li>
          ))}
        </ol>
      )
    }

    return (
      <ul style={{ paddingLeft: '18px', margin: 0, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
        {lines.map((line, index) => (
          <li key={index} style={{ marginBottom: '10px', fontSize: '14px' }}>{line}</li>
        ))}
      </ul>
    )
  }

  const askQuestion = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const prompt = `You are an expert educator and subject matter specialist. Create COMPREHENSIVE educational content.

Subject: ${subject || 'General'} | User Question: "${query}"

IMPORTANT: Respond ONLY with valid JSON (no markdown, code blocks, or explanatory text):

{
  "learning_objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "explanation": "Comprehensive, detailed explanation (400-500 words). Include: definition, historical context, scientific/academic background, practical applications, real-world significance, industry relevance",
  "key_concepts": ["Concept 1 with detailed context", "Concept 2 with definition", "Concept 3", "Concept 4", "Concept 5"],
  "detailed_breakdown": [
    {"section": "Introduction", "content": "Background and why this matters"},
    {"section": "Core Concepts", "content": "Deep dive into main ideas"},
    {"section": "Applications", "content": "Real-world uses and examples"}
  ],
  "examples": [
    {"title": "Example 1", "description": "Real-world practical example with details"},
    {"title": "Example 2", "description": "Industry/academic application"},
    {"title": "Example 3", "description": "Case study with outcomes"}
  ],
  "common_mistakes": [
    "Common misunderstanding 1 - why it's wrong",
    "Frequent error 2 - how to avoid it",
    "Misconception 3 - correct understanding"
  ],
  "practice_questions": [
    {"q": "Question 1", "a": "Answer with explanation"},
    {"q": "Question 2", "a": "Answer with explanation"},
    {"q": "Question 3", "a": "Answer with explanation"}
  ],
  "study_tips": "Provide 5+ specific, actionable study strategies including: active recall techniques, spaced repetition schedule, practice methods, memory aids, resources, and recommended learning timeline",
  "summary": "Concise summary (100-150 words) covering key takeaways",
  "resources": [
    {"title": "Educational Platform", "description": "Detailed description of content", "url": "https://www.example.com"},
    {"title": "Video Resource", "description": "What it teaches", "url": "https://www.youtube.com"},
    {"title": "Research Material", "description": "Academic source", "url": "https://www.example.com"}
  ],
  "downloads": [
    {"title": "Study Notes PDF", "description": "Complete notes with diagrams", "url": "https://example.com/notes.pdf", "type": "pdf", "source": "Educational Resource"},
    {"title": "Tutorial Video", "description": "Visual step-by-step guide", "url": "https://www.youtube.com/search?q=${query}", "type": "youtube", "source": "YouTube"}
  ]
}

QUALITY REQUIREMENTS:
✓ Explanation: University-level, thorough, with multiple perspectives
✓ Learning objectives: Specific, measurable outcomes
✓ Concepts: 5 with meaningful depth
✓ Examples: Specific, detailed, diverse applications
✓ Common mistakes: Real misconceptions with corrections
✓ Practice questions: 3 questions with full explanations
✓ Study tips: 5+ actionable strategies with timeline
✓ Summary: Concise recap of essentials
✓ All content must be substantive and academic-quality
✓ Use professional language and proper terminology`

      const raw = await invokeLLM({ prompt })

      let parsed = null

      if (typeof raw === 'object' && raw !== null && !raw.error) {
        parsed = raw
      } else if (typeof raw === 'string') {
        try {
          const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
          parsed = JSON.parse(cleaned)
        } catch {
          const match = raw.match(/\{[\s\S]*\}/)
          if (match) {
            try { parsed = JSON.parse(match[0]) } catch { parsed = null }
          }
        }
      }

      if (!parsed || parsed.error) {
        parsed = {
          explanation: typeof raw === 'string' ? raw : (raw?.summary || 'Could not get a response. Please try again.'),
          learning_objectives: [], key_concepts: [], examples: [], common_mistakes: [], 
          practice_questions: [], study_tips: '', summary: '', resources: [], downloads: [],
          detailed_breakdown: []
        }
      }

      parsed.explanation  = parsed.explanation  || 'No explanation available.'
      parsed.learning_objectives = Array.isArray(parsed.learning_objectives) ? parsed.learning_objectives : []
      parsed.key_concepts = Array.isArray(parsed.key_concepts) ? parsed.key_concepts : []
      parsed.examples     = Array.isArray(parsed.examples)     ? parsed.examples     : []
      parsed.common_mistakes = Array.isArray(parsed.common_mistakes) ? parsed.common_mistakes : []
      parsed.practice_questions = Array.isArray(parsed.practice_questions) ? parsed.practice_questions : []
      parsed.detailed_breakdown = Array.isArray(parsed.detailed_breakdown) ? parsed.detailed_breakdown : []
      parsed.summary = parsed.summary || ''
      parsed.study_tips   = parsed.study_tips   || ''
      parsed.resources    = Array.isArray(parsed.resources)    ? parsed.resources    : []
      parsed.downloads    = Array.isArray(parsed.downloads)    ? parsed.downloads    : []

      setResult(parsed)

    } catch (err) {
      console.error('Education error:', err)
      setError('Something went wrong. Please check your connection and try again.')
    }

    setLoading(false)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PulseBackground color="violet" />
      <div style={{ position: 'relative', zIndex: 10, padding: '32px 20px 0' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Education Hub</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>AI-powered learning for every topic</p>
        </motion.div>

        {/* Subject selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          {SUBJECTS.map((s) => (
            <button key={s.id} onClick={() => setSubject(s.id === subject ? null : s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', borderRadius: '12px',
                border: subject === s.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                background: subject === s.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                color: subject === s.id ? s.color : 'rgba(255,255,255,0.4)',
                fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '48px',
              }}>
              <s.icon size={14} />{s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={askQuestion} style={{ marginBottom: '24px' }}>
          <GlassCard glowColor="blue" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any question — e.g. What is photosynthesis?"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#FAFAFA', fontSize: '14px', height: '48px', padding: '0 8px',
                }} />
              <button type="submit" disabled={loading || !query.trim()}
                style={{
                  background: loading || !query.trim() ? 'rgba(255,255,255,0.04)' : 'rgba(0,240,255,0.1)',
                  border: '1px solid rgba(0,240,255,0.2)', borderRadius: '10px', padding: '12px',
                  color: '#00F0FF', cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                  minWidth: '48px', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
              </button>
            </div>
          </GlassCard>
        </form>

        {/* Loading */}
        {loading && (
          <GlassCard glowColor="violet" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Loader2 size={32} color="#a78bfa" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Preparing your learning materials...</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>This may take a few seconds</p>
          </GlassCard>
        )}

        {/* Error */}
        {error && !loading && (
          <GlassCard style={{ marginBottom: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="#fb7185" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', color: '#fb7185', fontWeight: 600 }}>Error</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{error}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Explanation */}
              <GlassCard glowColor="blue" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <BookOpen size={16} color="#00F0FF" />
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>Explanation</span>
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  <ReactMarkdown>{result.explanation}</ReactMarkdown>
                </div>
              </GlassCard>

              {/* Learning Objectives */}
              {result.learning_objectives?.length > 0 && (
                <GlassCard style={{ marginBottom: '16px', borderLeft: '3px solid #00F0FF' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,240,255,0.7)', marginBottom: '12px', fontWeight: 700 }}>📚 Learning Objectives</p>
                  {result.learning_objectives.map((obj, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', padding: '10px', background: 'rgba(0,240,255,0.05)', borderRadius: '8px' }}>
                      <span style={{ color: '#00F0FF', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{obj}</p>
                    </div>
                  ))}
                </GlassCard>
              )}

              {/* Common Mistakes & Tips */}
              {result.common_mistakes?.length > 0 && (
                <GlassCard style={{ marginBottom: '16px', borderLeft: '3px solid #fb7185' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(251,113,133,0.7)', marginBottom: '12px', fontWeight: 700 }}>⚠️ Common Mistakes</p>
                  {result.common_mistakes.map((mistake, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', padding: '10px', background: 'rgba(251,113,133,0.05)', borderRadius: '8px', borderLeft: '2px solid #fb7185' }}>
                      <span style={{ color: '#fb7185', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>!</span>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{mistake}</p>
                    </div>
                  ))}
                </GlassCard>
              )}

              {/* Practice Questions */}
              {result.practice_questions?.length > 0 && (
                <GlassCard style={{ marginBottom: '16px', borderLeft: '3px solid #34d399' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,211,153,0.7)', marginBottom: '12px', fontWeight: 700 }}>❓ Practice Questions</p>
                  {result.practice_questions.map((pq, i) => (
                    <details key={i} style={{ marginBottom: '10px', padding: '10px', background: 'rgba(52,211,153,0.05)', borderRadius: '8px', borderLeft: '2px solid #34d399', cursor: 'pointer' }}>
                      <summary style={{ fontSize: '13px', color: '#34d399', fontWeight: 600, listStyle: 'none' }}>
                        <span style={{ marginRight: '10px' }}>Q{i + 1}:</span>{pq.q}
                      </summary>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '10px', paddingLeft: '12px', borderLeft: '2px solid rgba(52,211,153,0.3)' }}>{pq.a}</p>
                    </details>
                  ))}
                </GlassCard>
              )}

              {/* Summary */}
              {result.summary && (
                <GlassCard style={{ marginBottom: '16px', background: 'linear-gradient(135deg, rgba(251,191,36,0.05), rgba(167,139,250,0.05))', borderLeft: '3px solid #fbbf24' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(251,191,36,0.7)', marginBottom: '12px', fontWeight: 700 }}>📝 Summary</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>{result.summary}</p>
                </GlassCard>
              )}

              {/* Key Concepts */}
              {result.key_concepts?.length > 0 && (
                <GlassCard style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(167,139,250,0.6)', marginBottom: '12px' }}>Key Concepts</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.key_concepts.map((c, i) => (
                      <span key={i} style={{ padding: '6px 12px', borderRadius: '50px', background: 'rgba(167,139,250,0.1)', color: '#c4b5fd', fontSize: '12px' }}>{c}</span>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Detailed Breakdown */}
              {result.detailed_breakdown?.length > 0 && (
                <GlassCard style={{ marginBottom: '16px', borderLeft: '3px solid rgba(0,240,255,0.8)' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,240,255,0.6)', marginBottom: '12px' }}>Detailed Breakdown</p>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {result.detailed_breakdown.map((item, index) => (
                      <div key={index} style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>{item.section}</p>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: 0 }}>{item.content}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Examples */}
              {result.examples?.length > 0 && (
                <GlassCard style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,211,153,0.6)', marginBottom: '12px' }}>Examples</p>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {result.examples.map((ex, i) => {
                      const title = ex?.title || `Example ${i + 1}`
                      const description = ex?.description || (typeof ex === 'string' ? ex : '')
                      return (
                        <div key={i} style={{ display: 'flex', gap: '14px', padding: '14px', borderRadius: '14px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                          <div style={{ minWidth: '32px', minHeight: '32px', borderRadius: '12px', background: 'rgba(52,211,153,0.15)', color: '#34d399', fontWeight: 700, display: 'grid', placeItems: 'center' }}>{i + 1}</div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '6px' }}>{title}</p>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: 0 }}>{description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </GlassCard>
              )}

              {/* Study Tips */}
              {result.study_tips && (
                <GlassCard style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(251,191,36,0.6)', marginBottom: '12px' }}>Study Tips</p>
                  {formatMultiline(result.study_tips)}
                </GlassCard>
              )}

              {/* Resources */}
              {result.resources?.length > 0 && (
                <GlassCard glowColor="blue" style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,240,255,0.6)', marginBottom: '12px' }}>Resources</p>
                  {result.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      <Download size={16} color="#00F0FF" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{r.title}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{r.description}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(0,240,255,0.5)', marginTop: '4px' }}>{r.url}</p>
                      </div>
                      <ArrowRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    </a>
                  ))}
                </GlassCard>
              )}

              {/* ── FREE DOWNLOADS — NEW SECTION ── */}
              {result.downloads?.length > 0 && (
                <GlassCard glowColor="violet" style={{ marginBottom: '32px' }}>

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(167,139,250,0.1)' }}>
                      <Download size={16} color="#a78bfa" />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Free Downloads</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>PDFs · Videos · Courses · Wikipedia · GitHub</p>
                    </div>
                  </div>

                  {/* Type legend */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {Object.entries(DOWNLOAD_TYPES).map(([key, val]) => (
                      <span key={key} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '4px 10px', borderRadius: '50px',
                        background: val.bg, border: `1px solid ${val.border}`,
                        fontSize: '10px', color: val.color,
                      }}>
                        <val.icon size={10} />{val.label}
                      </span>
                    ))}
                  </div>

                  {/* Download items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {result.downloads.map((dl, i) => {
                      const tc = DOWNLOAD_TYPES[dl.type] || DOWNLOAD_TYPES.wikipedia
                      const Icon = tc.icon
                      return (
                        <motion.a key={i} href={dl.url} target="_blank" rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '12px',
                            padding: '14px', borderRadius: '14px',
                            background: tc.bg, border: `1px solid ${tc.border}`,
                            textDecoration: 'none', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.filter = 'brightness(1.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.filter = 'brightness(1)' }}
                        >
                          <div style={{ padding: '10px', borderRadius: '10px', background: `${tc.color}20`, flexShrink: 0 }}>
                            <Icon size={18} color={tc.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{dl.title}</p>
                              <span style={{
                                fontSize: '9px', padding: '2px 8px', borderRadius: '50px',
                                background: `${tc.color}20`, color: tc.color,
                                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, flexShrink: 0,
                              }}>
                                {tc.label}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '6px' }}>{dl.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {dl.source && (
                                <span style={{ fontSize: '10px', color: tc.color, background: `${tc.color}15`, padding: '2px 8px', borderRadius: '50px', fontWeight: 600 }}>
                                  {dl.source}
                                </span>
                              )}
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                {dl.url}
                              </span>
                            </div>
                          </div>
                          <ExternalLink size={15} color={tc.color} style={{ flexShrink: 0, marginTop: '4px', opacity: 0.6 }} />
                        </motion.a>
                      )
                    })}
                  </div>

                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '14px', lineHeight: 1.6 }}>
                    ℹ All links open in a new tab. PDF links are freely available documents.
                  </p>
                </GlassCard>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <GraduationCap size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>Select a subject and ask any question</p>
            <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px', marginTop: '8px' }}>e.g. "Explain Newton's laws" or "How does Python work?"</p>
          </div>
        )}

        {/* Chat link */}
        <GlassCard glowColor="violet" style={{ marginBottom: '32px' }}>
          <Link to="/chat?context=education" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Ask AI Tutor</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Continue learning in chat</p>
            </div>
            <ArrowRight size={20} color="#a78bfa" />
          </Link>
        </GlassCard>

      </div>
    </div>
  )
}