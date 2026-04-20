import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReload = () => {
    // Clear any potentially corrupted state
    try {
      localStorage.removeItem('local_changes');
    } catch (e) {}
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f1629 100%)',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          padding: '24px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '48px 40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
          }}>
            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '2px solid rgba(249, 115, 22, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '36px',
            }}>
              ⚠️
            </div>

            {/* Title */}
            <h2 style={{
              color: '#fff',
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              Ứng dụng gặp lỗi
            </h2>

            {/* Message */}
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '8px',
            }}>
              Trang bị lỗi và không thể hiển thị. Hãy thử tải lại để khôi phục.
            </p>

            {/* Error details */}
            {this.state.error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '28px',
                textAlign: 'left',
              }}>
                <p style={{
                  color: 'rgba(252, 165, 165, 0.9)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Primary: Reload */}
              <button
                onClick={this.handleReload}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #f97316, #ef4444)',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(249,115,22,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.35)';
                }}
              >
                🔄 Tải lại trang
              </button>

              {/* Secondary: Try recover */}
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 28px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '14px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                Thử khôi phục không tải lại
              </button>
            </div>

            <p style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '12px',
              marginTop: '24px',
            }}>
              Deadline Management © 2026
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
