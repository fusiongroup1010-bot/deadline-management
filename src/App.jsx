import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { EventProvider } from './context/EventContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const themeColor = localStorage.getItem('themeColor');
    const bgColor = localStorage.getItem('bgColor');
    const fontFamily = localStorage.getItem('fontFamily');
    const appScale = localStorage.getItem('appScale');

    const root = document.documentElement;
    if (themeColor) {
      root.style.setProperty('--primary-accent', themeColor);
      root.style.setProperty('--primary-pastel', `${themeColor}33`);
    }
    if (bgColor) {
      root.style.setProperty('--bg-main', bgColor);
    }
    if (fontFamily) {
      document.body.style.fontFamily = fontFamily;
    }
    if (appScale) {
      document.body.style.zoom = appScale === '110%' ? '1.1' : (appScale === '90%' ? '0.9' : '1');
    }
  }, []);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main, #0f0f23)',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTop: '4px solid var(--primary-accent, #f97316)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontFamily: 'inherit' }}>
          Đang tải...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-active' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/tasks" element={<TaskBoard />} />
            <Route path="/reports" element={<CalendarView />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <EventProvider>
          <Router>
            <ErrorBoundary>
              <AppContent />
              <TaskModal />
            </ErrorBoundary>
          </Router>
        </EventProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
