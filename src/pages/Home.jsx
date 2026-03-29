import React from 'react'
import { db } from '../api/storage'
import PulseBackground from '../components/shared/PulseBackground'
import HeroSection from '../components/home/HeroSection'
import FeatureCards from '../components/home/FeatureCards'
import GlassCard from '../components/shared/GlassCard'
import VitalMetric from '../components/shared/VitalMetric'
import { Heart, Activity, Droplets, Wind } from 'lucide-react'

export default function Home() {
  const readings = db.list('health_readings', 1)
  const latest = readings[0]

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PulseBackground color="cyan" />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <HeroSection />

        {latest && (
          <div style={{ padding: '0 20px', marginTop: '-32px' }}>
            <GlassCard glowColor="blue" style={{ padding: '12px' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Latest Readings</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <VitalMetric label="Heart Rate" value={latest.heart_rate} unit="bpm" icon={Heart} color="red" small />
                <VitalMetric label="SpO2" value={latest.pulse_ox || '--'} unit="%" icon={Wind} color="blue" small />
                <VitalMetric label="Blood Sugar" value={latest.blood_sugar || '--'} unit="mg/dL" icon={Droplets} color="violet" small />
                <VitalMetric label="BP" value={latest.blood_pressure_systolic ? `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}` : '--'} unit="mmHg" icon={Activity} color="green" small />
              </div>
            </GlassCard>
          </div>
        )}

        <FeatureCards />

        <div style={{ padding: '0 20px 32px' }}>
          <GlassCard glowColor="violet">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa' }} className="animate-bio-pulse" />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>Circadian Insight</span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Your cognitive focus peaks between{' '}
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>9:00 AM – 11:30 AM</span> based on typical patterns.
              Lock in your study sessions during this window for maximum retention.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}