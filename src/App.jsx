import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardView from './components/DashboardView';
import ObligationList from './components/ObligationList';
import CalendarTimelineView from './components/CalendarTimelineView';
import DependencyGraphView from './components/DependencyGraphView';
import SmartInboxModal from './components/SmartInboxModal';
import ObligationFormModal from './components/ObligationFormModal';
import ProofModal from './components/ProofModal';
import RemindersDrawer from './components/RemindersDrawer';
import AuthModal from './components/AuthModal';
import InternalAmbientBackdrop from './components/InternalAmbientBackdrop';

import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import { fetchUserObligations, saveUserObligation, deleteUserObligation, updateUserObligationStatus, importLocalStorageDataToSupabase } from './utils/dbService';
import { resetDemoData } from './utils/storage';
import { calculatePriorityScore } from './utils/priorityCalculator';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [obligations, setObligations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  // Landing page is the home/marketing page shown before signing in
  const [showLandingPage, setShowLandingPage] = useState(true);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingObligation, setEditingObligation] = useState(null);
  const [isSmartInboxOpen, setIsSmartInboxOpen] = useState(false);
  const [proofObligation, setProofObligation] = useState(null);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // If user is not signed in, open auth modal instead of doing the action
  const requireAuth = (action, mode = 'login') => {
    if (!currentUser) {
      setAuthInitialMode(mode);
      setIsAuthModalOpen(true);
      return;
    }
    action();
  };

  // Auth listener
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const user = session?.user ?? null;
        setCurrentUser(user);
        setAuthLoading(false);
        if (user) setShowLandingPage(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user ?? null;
        setCurrentUser(user);
        setAuthLoading(false);
        if (user) setShowLandingPage(false);
        if (!user) setShowLandingPage(true);
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Load data when user is set
  const loadData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchUserObligations(currentUser?.id);
      setObligations(data);
    } catch (err) {
      console.error('Error loading obligations:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    loadData();
    const handleStorageUpdate = () => loadData();
    window.addEventListener('aegis-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('aegis-storage-update', handleStorageUpdate);
  }, [currentUser]);

  const urgentCount = obligations.filter(o => {
    if (o.status === 'Completed') return false;
    const p = calculatePriorityScore(o, obligations);
    return p.daysRemaining <= 3;
  }).length;

  const handleSaveObligation = async (item) => {
    try {
      await saveUserObligation(item, currentUser?.id);
      await loadData();
      showToast(item.id ? 'Obligation updated.' : 'Obligation saved.');
    } catch (err) {
      showToast(err.message || 'Error saving obligation', 'error');
    }
  };

  const handleDeleteObligation = async (id) => {
    try {
      await deleteUserObligation(id, currentUser?.id);
      await loadData();
      showToast('Obligation removed.');
    } catch (err) {
      showToast('Error deleting obligation', 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus, proof = null) => {
    try {
      await updateUserObligationStatus(id, newStatus, proof, currentUser?.id);
      await loadData();
      showToast(`Status updated to "${newStatus}".`);
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const handleResetDemo = () => {
    resetDemoData();
    loadData();
    showToast('Demo data reset.');
  };

  const handleSaveSmartInboxDraft = async (draft) => {
    await handleSaveObligation(draft);
    setActiveTab('obligations');
  };

  const handleImportLocalData = async () => {
    if (!currentUser) return;
    const result = await importLocalStorageDataToSupabase(currentUser.id);
    if (result.success) {
      await loadData();
      showToast(result.message);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setObligations([]);
    setShowLandingPage(true);
    showToast('Signed out.');
  };

  const openAuthModal = (mode) => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Auth loading screen
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#080b11',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={20} color="#0d9488" />
        </div>
        <div style={{ color: '#475569', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif" }}>
          Loading&hellip;
        </div>
      </div>
    );
  }

  // Landing page — visible to everyone, but all app actions require auth
  if (showLandingPage || !currentUser) {
    return (
      <div className="app-container">
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => requireAuth(() => {
            setActiveTab(tab);
            setShowLandingPage(false);
          })}
          currentUser={currentUser}
          onOpenAuthModal={openAuthModal}
          onSignOut={handleSignOut}
          onImportLocalData={handleImportLocalData}
          onOpenAddModal={() => requireAuth(() => {
            setShowLandingPage(false);
            setEditingObligation(null);
            setIsAddModalOpen(true);
          })}
          onOpenSmartInbox={() => requireAuth(() => {
            setShowLandingPage(false);
            setIsSmartInboxOpen(true);
          })}
          onOpenReminders={() => requireAuth(() => setIsRemindersOpen(true))}
          onResetDemo={handleResetDemo}
          urgentCount={urgentCount}
        />

        <LandingPage
          onOpenLogin={() => openAuthModal('login')}
          onOpenSignup={() => openAuthModal('signup')}
          onDemoExplore={() => requireAuth(() => setShowLandingPage(false))}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authInitialMode}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            setShowLandingPage(false);
            loadData();
            showToast(`Welcome, ${user.user_metadata?.full_name || user.email}!`);
          }}
        />
      </div>
    );
  }

  // Authenticated app
  return (
    <div className="app-container">
      <InternalAmbientBackdrop />

      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          border: toast.type === 'error' ? '1px solid #fca5a5' : '1px solid #6ee7b7',
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center',
          gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLandingPage={() => setShowLandingPage(true)}
        onOpenAuthModal={openAuthModal}
        onSignOut={handleSignOut}
        onImportLocalData={handleImportLocalData}
        onOpenAddModal={() => { setEditingObligation(null); setIsAddModalOpen(true); }}
        onOpenSmartInbox={() => setIsSmartInboxOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
        onResetDemo={handleResetDemo}
        urgentCount={urgentCount}
      />

      <main className="main-content">
        {loadingData ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#94a3b8' }}>Loading your data&hellip;</div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                obligations={obligations}
                onNavigateToObligations={() => setActiveTab('obligations')}
                onOpenProofModal={(ob) => setProofObligation(ob)}
                onOpenSmartInbox={() => setIsSmartInboxOpen(true)}
                onOpenAddModal={() => { setEditingObligation(null); setIsAddModalOpen(true); }}
              />
            )}
            {activeTab === 'obligations' && (
              <ObligationList
                obligations={obligations}
                onOpenAddModal={() => { setEditingObligation(null); setIsAddModalOpen(true); }}
                onOpenEditModal={(ob) => { setEditingObligation(ob); setIsAddModalOpen(true); }}
                onOpenProofModal={(ob) => setProofObligation(ob)}
                onOpenSmartInbox={() => setIsSmartInboxOpen(true)}
                onDeleteObligation={handleDeleteObligation}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarTimelineView
                obligations={obligations}
                onOpenProofModal={(ob) => setProofObligation(ob)}
              />
            )}
            {activeTab === 'dependencies' && (
              <DependencyGraphView
                obligations={obligations}
                onOpenProofModal={(ob) => setProofObligation(ob)}
              />
            )}
          </>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          setShowLandingPage(false);
          loadData();
          showToast(`Welcome back, ${user.user_metadata?.full_name || user.email}!`);
        }}
      />

      <SmartInboxModal
        isOpen={isSmartInboxOpen}
        onClose={() => setIsSmartInboxOpen(false)}
        onSaveDraft={handleSaveSmartInboxDraft}
        obligations={obligations}
      />

      <ObligationFormModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingObligation(null); }}
        onSave={handleSaveObligation}
        editingObligation={editingObligation}
        obligations={obligations}
      />

      <ProofModal
        isOpen={!!proofObligation}
        onClose={() => setProofObligation(null)}
        obligation={proofObligation}
        obligations={obligations}
        onSaveProof={(id, status, proofData) => handleUpdateStatus(id, status, proofData)}
      />

      <RemindersDrawer
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        obligations={obligations}
        onOpenProofModal={(ob) => setProofObligation(ob)}
      />
    </div>
  );
}
