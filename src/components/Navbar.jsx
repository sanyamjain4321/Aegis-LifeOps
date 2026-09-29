import React, { useState } from 'react';
import { Shield, LayoutDashboard, ListFilter, Calendar, GitFork, Plus, Inbox, Bell, RotateCcw, Menu, X, User, LogOut, UploadCloud } from 'lucide-react';
import { getDatabaseMode } from '../utils/dbService';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLandingPage,
  onOpenAuthModal,
  onSignOut,
  onImportLocalData,
  onOpenAddModal,
  onOpenSmartInbox,
  onOpenReminders,
  onResetDemo,
  urgentCount = 0
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'obligations', label: 'Obligations', icon: ListFilter },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'dependencies', label: 'Dependencies', icon: GitFork },
  ];

  const dbMode = getDatabaseMode();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); if (onOpenLandingPage) onOpenLandingPage(); else setActiveTab('dashboard'); }}>
            <div className="brand-icon">
              <Shield size={20} color="#ffffff" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.01em', fontFamily: "'Fraunces', serif" }}>Aegis LifeOps</span>
              <span className="brand-badge-pill anim-float-slow">
                <span className="status-dot" />
                {dbMode}
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="nav-actions">
          {/* Smart Inbox Trigger */}
          <button
            className="btn-nav-inbox"
            onClick={onOpenSmartInbox}
            title="Paste any bill or notice snippet to extract draft fields"
          >
            <Inbox size={15} color="#14b8a6" />
            <span className="hide-mobile">Smart Inbox</span>
          </button>

          {/* Add Item */}
          <button className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }} onClick={onOpenAddModal}>
            <Plus size={15} />
            <span className="hide-mobile">Add Item</span>
          </button>

          {/* Alerts Bell */}
          <button
            className="btn-ghost"
            style={{ position: 'relative', color: '#cbd5e1', padding: '0.45rem 0.65rem' }}
            onClick={onOpenReminders}
            title="In-App Urgent Alerts"
          >
            <Bell size={17} />
            {urgentCount > 0 && (
              <span className="bell-badge-count">{urgentCount}</span>
            )}
          </button>

          {/* User Account or Sign In */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn-user-profile"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <User size={15} color="#14b8a6" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  {currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Signed in as:<br />
                    <strong style={{ color: 'var(--text-main)' }}>{currentUser.email}</strong>
                  </div>

                  <button
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', color: 'var(--accent-teal)' }}
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onImportLocalData();
                    }}
                  >
                    <UploadCloud size={14} />
                    <span>Import Local Data</span>
                  </button>

                  <button
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', color: '#cbd5e1' }}
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (window.confirm('Reset demo obligations to seed state?')) onResetDemo();
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Reset Demo Data</span>
                  </button>

                  <button
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', color: '#ef4444' }}
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onSignOut();
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                className="btn-ghost"
                style={{ color: '#ffffff', fontSize: '0.825rem', padding: '0.4rem 0.65rem' }}
                onClick={() => onOpenAuthModal('login')}
              >
                Sign In
              </button>
              <button
                className="btn-secondary"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                onClick={() => onOpenAuthModal('signup')}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="mobile-nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
