import React from 'react'
import ReactMarkdown from 'react-markdown'

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(138,43,226,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00F0FF' }} />
        </div>
      )}
      <div style={{ maxWidth: '85%', borderRadius: '16px', padding: '12px 16px', background: isUser ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', border: isUser ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        {isUser
          ? <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>{message.content}</p>
          : <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}><ReactMarkdown>{message.content}</ReactMarkdown></div>
        }
      </div>
    </div>
  )
}