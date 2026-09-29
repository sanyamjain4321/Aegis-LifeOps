import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import {
  Shield,
  Lock,
  Mail,
  User,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess, isGate = false }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!isSupabaseConfigured) {
      setLoading(false);
      setErrorMsg('Cloud authentication is not configured. You can explore all features in Demo Mode without signing in.');
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        setSuccessMsg('Account created. Check your email to confirm registration.');
        if (data.user) {
          setTimeout(() => { onAuthSuccess(data.user); onClose(); }, 1500);
        }
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccessMsg('Signed in successfully.');
        if (data.user) {
          setTimeout(() => { onAuthSuccess(data.user); onClose(); }, 800);
        }
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setErrorMsg(''); setSuccessMsg(''); };

  const inputStyle = {
    width: '100%',
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '7px',
    color: '#e2e8f0',
    fontSize: '0.875rem',
    padding: '0.6rem 0.85rem',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    display: 'block',
  };

  return (
    <div
      className="modal-overlay"
      style={{ animation: 'fadeSlideUp 0.2s ease both' }}
      onClick={(e) => { if (!isGate && e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.6rem 1.75rem 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '8px',
              background: 'rgba(13,148,136,0.12)',
              border: '1px solid rgba(13,148,136,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Shield size={17} color="#0d9488" />
            </div>
            <div>
              <div style={{
                fontSize: '1.05rem', fontWeight: 600, color: '#f1f5f9',
                fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}>
                Aegis LifeOps
              </div>
              <div style={{ fontSize: '0.73rem', color: '#475569', marginTop: '2px' }}>
                {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
              </div>
            </div>
          </div>

          {!isGate && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#475569', padding: '4px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', marginTop: '-2px',
              }}
              title="Close"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        {mode !== 'reset' && (
          <div style={{
            display: 'flex',
            margin: '1.4rem 1.75rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            {[['login', 'Sign In'], ['signup', 'Sign Up']].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: mode === m ? '2px solid #0d9488' : '2px solid transparent',
                  color: mode === m ? '#e2e8f0' : '#475569',
                  fontSize: '0.84rem',
                  fontWeight: mode === m ? 600 : 400,
                  padding: '0 0 0.6rem',
                  marginRight: '1.5rem',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease, border-color 0.15s ease',
                  letterSpacing: '0.01em',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem 1.6rem' }}>

          {errorMsg && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '7px', padding: '0.65rem 0.85rem', marginBottom: '1.2rem',
              fontSize: '0.795rem', color: '#fca5a5', lineHeight: 1.5,
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#f87171' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '7px', padding: '0.65rem 0.85rem', marginBottom: '1.2rem',
              fontSize: '0.795rem', color: '#6ee7b7', lineHeight: 1.5,
            }}>
              <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#10b981' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div style={{
              background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)',
              borderRadius: '7px', padding: '0.65rem 0.85rem', marginBottom: '1.2rem',
              fontSize: '0.775rem', color: '#fbbf24', lineHeight: 1.55,
            }}>
              <strong style={{ fontWeight: 600 }}>Demo mode active.</strong>{' '}
              Cloud auth requires Supabase configuration. All features are accessible locally without signing in.
            </div>
          )}

          {/* Full Name */}
          {mode === 'signup' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: '#64748b', marginBottom: '0.35rem' }}>
                Full name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: '#64748b', marginBottom: '0.35rem' }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Password */}
          {mode !== 'reset' && (
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b' }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.73rem', color: '#0d9488', padding: 0, fontFamily: 'inherit' }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '2.4rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', color: '#334155', cursor: 'pointer', padding: '2px',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
              padding: '0.68rem 1rem',
              background: loading ? '#0f766e' : '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '7px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
              letterSpacing: '0.01em',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Please wait…' : (
              <>
                <span>
                  {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
                </span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Footer note */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            fontSize: '0.7rem', color: '#1e293b',
          }}>
            <ShieldCheck size={11} color="#1e293b" />
            <span>Data is stored privately and securely.</span>
          </div>
        </form>
      </div>
    </div>
  );
}


