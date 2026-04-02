import React, { useState } from 'react'
import { invokeLLM } from '../api/claudeClient'
import PulseBackground from '../components/shared/PulseBackground'
import GlassCard from '../components/shared/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Search, BookOpen, Loader2,
  Download, ArrowRight, Brain, Atom,
  Calculator, Globe, Code, Palette, AlertCircle,
  FileText, Video, Book, GitBranch, ExternalLink,
  Target, Lightbulb, Zap, HelpCircle, CheckCircle, Flame
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

const SUBJECTS = [
  { id: 'math', label: 'Mathematics', icon: Calculator, color: '#00F0FF' },
  { id: 'science', label: 'Science', icon: Atom, color: '#34d399' },
  { id: 'coding', label: 'Programming', icon: Code, color: '#a78bfa' },
  { id: 'history', label: 'History', icon: Globe, color: '#fbbf24' },
  { id: 'arts', label: 'Arts', icon: Palette, color: '#fb7185' },
  { id: 'general', label: 'General', icon: Brain, color: 'rgba(255,255,255,0.6)' },
]

const DOWNLOAD_TYPES = {
  pdf: { label: 'PDF', color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)', icon: FileText },
  youtube: { label: 'YouTube', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', icon: Video },
  course: { label: 'Course', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', icon: GraduationCap },
  wikipedia: { label: 'Wikipedia', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', icon: Book },
  github: { label: 'GitHub', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', icon: GitBranch },
}

export default function Education() {
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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

IMPORTANT: Respond ONLY with valid JSON. You MUST escape all newlines as \\n within strings. Do NOT output raw newlines inside JSON string values:

{
  "description": "Clear and direct overview of the topic (150-250 words). Focus ONLY on explaining what it is and why it matters. Do NOT include course details, practice questions, study tips, or learning objectives here. Use heavy Markdown formatting, bold keywords, and short paragraphs.",
  "course_details": "Brief outline of a potential course or learning path. STRICT LIMIT: Keep it concise, maximum 4-5 short bullet points. MUST use heavy Markdown.",
  "git_details": "Details about how this relates to Git, version control, or code repository commands/workflows. MUST use heavy Markdown with code blocks.",
  "search_details": ["Search term 1", "Related topic 2", "Industry trend 3"],
  "resources": [
    {"title": "Documentation or Guide", "description": "Short reasoning", "url": "https://example.com/link"}
  ],
  "practice_questions": [
    {"q": "Engaging question 1?", "a": "Detailed answer with Markdown formatting"},
    {"q": "Technical question 2?", "a": "Detailed answer with Markdown formatting"}
  ]
}

QUALITY REQUIREMENTS:
✓ ONLY output the requested 6 JSON keys. Do NOT generate extra headings like 'Study Tips', 'Common Mistakes', or 'Learning Objectives' inside the description!
✓ All fields must be written in a highly engaging, beginner-friendly, and accessible way.
✓ Tone: Warm, encouraging, enthusiastic, and highly readable.
✓ Formatting: NEVER write large walls of text. Break everything into short, punchy paragraphs (1-3 sentences max). Use Markdown (bolding, lists, emojis) aggressively to make the content highly readable and visually spectacular.`

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
          description: typeof raw === 'string' ? raw : 'Could not format response properly. Try again.',
          course_details: '', git_details: '', search_details: [], practice_questions: [], resources: []
        }
      }

      parsed.description = parsed.description || parsed.explanation || 'No description available.'
      parsed.course_details = parsed.course_details || ''
      parsed.git_details = parsed.git_details || ''
      parsed.search_details = Array.isArray(parsed.search_details) ? parsed.search_details : []
      parsed.practice_questions = Array.isArray(parsed.practice_questions) ? parsed.practice_questions : []
      parsed.resources = Array.isArray(parsed.resources) ? parsed.resources : []


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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Explanation */}
              <GlassCard glowColor="blue" style={{ position: 'relative', overflow: 'hidden', padding: '32px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #00F0FF, #3b82f6)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 240, 255, 0.1)' }}>
                    <BookOpen size={24} color="#00F0FF" />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Detailed Description</h2>
                </div>
                <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.85, fontWeight: 400, letterSpacing: '0.01em' }}>
                  <ReactMarkdown>{result.description}</ReactMarkdown>
                </div>
              </GlassCard>

              {/* Course Details */}
              {result.course_details && (
                <GlassCard style={{ padding: '24px', borderTop: '2px solid rgba(52, 211, 153, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <GraduationCap size={20} color="#34d399" />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>Course Details & Path</h3>
                  </div>
                  <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.85, '& pre': { background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }, '& code': { color: '#fbcfe8' } }}>
                    <ReactMarkdown>{result.course_details}</ReactMarkdown>
                  </div>
                </GlassCard>
              )}

              {/* Git Details */}
              {result.git_details && (
                <GlassCard style={{ padding: '24px', borderTop: '2px solid rgba(167, 139, 250, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <GitBranch size={20} color="#a78bfa" />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>Git & Version Control Context</h3>
                  </div>
                  <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.85, '& pre': { background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }, '& code': { color: '#fbcfe8' } }}>
                    <ReactMarkdown>{result.git_details}</ReactMarkdown>
                  </div>
                </GlassCard>
              )}

              {/* Search Details */}
              {result.search_details?.length > 0 && (
                <GlassCard style={{ padding: '24px', borderTop: '2px solid rgba(251, 191, 36, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Search size={18} color="#fbbf24" />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Related Search Details</h3>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {result.search_details.map((c, i) => (
                      <span key={i} style={{
                          padding: '8px 16px', borderRadius: '50px',
                          background: 'rgba(251, 191, 36, 0.1)',
                          border: '1px solid rgba(251, 191, 36, 0.2)',
                          color: '#fef3c7', fontSize: '13px', fontWeight: 500,
                        }}>
                        <Search size={12} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} />
                        {c}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Practice Questions */}
              {result.practice_questions?.length > 0 && (
                <GlassCard style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderTop: '2px solid rgba(236, 72, 153, 0.3)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #ec4899, #8b5cf6)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingLeft: '16px' }}>
                    <HelpCircle size={20} color="#ec4899" />
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>Practice Questions</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '16px' }}>
                    {result.practice_questions.map((pq, i) => (
                      <details key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <summary style={{ fontSize: '15px', color: '#fbcfe8', fontWeight: 600, listStyle: 'none', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Q{i + 1}</span>
                          <span style={{ flex: 1, marginTop: '1px' }}>{pq.q}</span>
                        </summary>
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingLeft: '44px' }}>
                          <div style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                            <strong style={{ color: '#ec4899', display: 'block', marginBottom: '8px' }}>Answer: </strong>
                            <ReactMarkdown>{pq.a}</ReactMarkdown>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Resources */}
              {result.resources?.length > 0 && (
                <GlassCard glowColor="blue" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <ExternalLink size={18} color="#00F0FF" />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Recommended Resources</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,240,255,0.05)'; e.currentTarget.style.border = '1px solid rgba(0,240,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '10px', borderRadius: '50%' }}>
                          <ExternalLink size={16} color="#00F0FF" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '4px' }}>{r.title}</p>
                          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{r.description}</p>
                        </div>
                        <ArrowRight size={18} color="rgba(255,255,255,0.2)" />
                      </a>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Downloads Section */}
              {result.downloads?.length > 0 && (
                <GlassCard glowColor="violet" style={{ padding: '32px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(167,139,250,0.1)', boxShadow: '0 4px 12px rgba(167,139,250,0.1)' }}>
                      <Download size={24} color="#a78bfa" />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>Free Downloads & Media</h2>
                      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Curated PDFs, Videos, and Interactive Content</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {result.downloads.map((dl, i) => {
                      const tc = DOWNLOAD_TYPES[dl.type] || DOWNLOAD_TYPES.wikipedia
                      const Icon = tc.icon
                      return (
                        <motion.a key={i} href={dl.url} target="_blank" rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '16px',
                            padding: '20px', borderRadius: '16px',
                            background: tc.bg, border: `1px solid ${tc.border}`,
                            textDecoration: 'none', transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 16px ${tc.bg}` }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                        >
                          <div style={{ padding: '12px', borderRadius: '12px', background: `${tc.color}25`, flexShrink: 0 }}>
                            <Icon size={20} color={tc.color} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>{dl.title}</p>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '10px' }}>{dl.description}</p>
                            <span style={{
                              fontSize: '10px', padding: '4px 10px', borderRadius: '50px',
                              background: `${tc.color}15`, color: tc.color,
                              textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700,
                            }}>
                              {tc.label} {dl.source ? `· ${dl.source}` : ''}
                            </span>
                          </div>
                        </motion.a>
                      )
                    })}
                  </div>
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