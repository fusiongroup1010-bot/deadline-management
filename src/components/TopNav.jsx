import React from 'react';
import { Bell, Search, Plus, Calendar as CalendarIcon, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';

const TopNav = ({ onMenuClick }) => {
  const today = new Date();
  const { openAddModal } = useEvents();
  const { currentUser } = useAuth();

  return (
    <header className="top-nav" style={{ marginBottom: '24px' }}>
      <button 
        className="sidebar-toggle-main-mobile"
        style={{ display: 'none' }}
        onClick={onMenuClick}
      >
        <Menu size={24} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <div className="soft-panel" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderRadius: 'var(--radius-full)', width: '340px', gap: '12px', background: 'var(--bg-panel)' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Quick Search..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '15px', fontWeight: '500' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontWeight: '600', paddingRight: '12px', borderRight: '1px solid var(--border-light)' }}>
           <CalendarIcon size={18} color="var(--primary-accent)"/>
           <span>{format(today, 'EEEE, MMM dd', { locale: enUS })}</span>
        </div>

        {currentUser?.role !== 'guest' && (
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={openAddModal}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Task</span>
          </button>
        )}
        
        <div style={{ padding: '0 16px', height: '44px', borderRadius: '16px', background: 'var(--pink-pastel)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--pink-accent)', marginLeft: '4px', cursor: 'pointer', boxShadow: 'var(--shadow-soft)', fontSize: '13px' }}>
          {currentUser ? (currentUser.id === 'Guest' ? 'Guest mode' : currentUser.name) : 'Guest'}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
