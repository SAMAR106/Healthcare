import React, { useState, useCallback } from 'react'
import { db } from '../api/storage'
import { invokeLLM } from '../api/claudeClient'
import PulseBackground from '../components/shared/PulseBackground'
import SensorSimulator from '../components/health/SensorSimulator'
import ReadingHistory from '../components/health/ReadingHistory'
import VitalMetric from '../components/shared/VitalMetric'
import GlassCard from '../components/shared/GlassCard'
import { Heart, Activity, Droplets, Wind, FileText, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Health() {
  const [readings, setReadings] = useState(() => db.list('health_readings', 20))
  const [report, setReport] = useState(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  const handleReadingComplete = useCallback((data) => {
    const saved = db.create('health_readings', data)
    setReadings(db.list('health_readings', 20))
  }, [])

  const generateReport = async () => {
    if (readings.length === 0) return
    setGeneratingReport(true)
    const recent = readings.slice(0, 10)
    const avg = (key) => recent.reduce((s, r) => s + (r[key] || 0), 0) / recent.length

    const result = await invokeLLM({
      prompt: `You are a medical AI assistant. Analyze these health metrics and generate a comprehensive health report.
Average Heart Rate: ${avg('heart_rate').toFixed(0)} BPM
Average Blood Pressure: ${avg('blood_pressure_systolic').toFixed(0)}/${avg('blood_pressure_diastolic').toFixed(0)} mmHg
Average Blood Sugar: ${avg('blood_sugar').toFixed(0)} mg/dL
Average SpO2: ${avg('pulse_ox').toFixed(0)}%
Number of readings: ${recent.length}
Provide: 1. A health summary (2-3 sentences) 2. Risk level (low, moderate, or high) 3. Health recommendations (3-5 bullet points) 4. Sport recommendations based on these health metrics`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          risk_level: { type: 'string', enum: ['low', 'moderate', 'high'] },
          recommendations: { type: 'string' },
          sport_recommendations: { type: 'string' },
        },
      },
    })

    const reportData = { ...result, avg_heart_rate: Math.round(avg('heart_rate')), avg_bp_systolic: Math.round(avg('blood_pressure_systolic')), avg_bp_diastolic: Math.round(avg('blood_pressure_diastolic')), avg_blood_sugar: Math.round(avg('blood_sugar')), avg_pulse_ox: Math.round(avg('pulse_ox')) }
    db.create('health_reports', reportData)
    setReport(reportData)
    setGeneratingReport(false)
  }

  const latest = readings[0]
  const riskColor = { low: '#34d399', moderate: '#fbbf24', high: '#fb7185' }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PulseBackground color="red" />
      <div style={{ position: 'relative', zIndex: 10, padding: '32px 20px 0' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Health Monitor</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>AI-powered biometric analysis</p>
        </motion.div>

        <GlassCard glowColor="blue" style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '20px', textAlign: 'center' }}>Bio-Sync Scanner</p>
          <SensorSimulator onReadingComplete={handleReadingComplete} />
        </GlassCard>

        {latest && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <VitalMetric label="Heart Rate" value={latest.heart_rate} unit="bpm" icon={Heart} color="red" trend={latest.heart_rate < 100 && latest.heart_rate > 50 ? 'normal' : 'attention'} />
            <VitalMetric label="SpO2" value={latest.pulse_ox || '--'} unit="%" icon={Wind} color="blue" trend={latest.pulse_ox >= 95 ? 'normal' : 'attention'} />
            <VitalMetric label="Blood Sugar" value={latest.blood_sugar || '--'} unit="mg/dL" icon={Droplets} color="violet" trend={latest.blood_sugar < 140 && latest.blood_sugar > 70 ? 'normal' : 'attention'} />
            <VitalMetric label="Blood Pressure" value={latest.blood_pressure_systolic ? `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}` : '--'} unit="mmHg" icon={Activity} color="green" trend={latest.blood_pressure_systolic < 140 ? 'normal' : 'attention'} />
          </div>
        )}

        {readings.length > 0 && (
          <button onClick={generateReport} disabled={generatingReport}
            style={{ width: '100%', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(138,43,226,0.1))', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#00F0FF', cursor: generatingReport ? 'not-allowed' : 'pointer', fontSize: '14px', minHeight: '48px' }}>
            {generatingReport ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating AI Report...</> : <><FileText size={16} /> Generate Health Report</>}
          </button>
        )}

        {report && (
          <GlassCard glowColor={report.risk_level === 'low' ? 'blue' : 'red'} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText size={16} color="#00F0FF" />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>AI Health Report</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 8px', borderRadius: '50px', background: `${riskColor[report.risk_level]}15`, color: riskColor[report.risk_level] }}>{report.risk_level} risk</span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '16px' }}>{report.summary}</p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Recommendations</p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{report.recommendations}</p>
            </div>
            {report.sport_recommendations && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '16px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Sport Guidance</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{report.sport_recommendations}</p>
              </div>
            )}
          </GlassCard>
        )}

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>Reading History</h2>
          <ReadingHistory readings={readings} />
        </div>
      </div>
    </div>
  )
}