import React from 'react';
import { Sparkles, Calendar, Clock, CheckCircle, ArrowRight, AlertTriangle, Users, FileText, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEvents, CATEGORY_MAP } from '../context/EventContext';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

const today = () => new Date().toISOString().split('T')[0];

const TYPE_CONFIG = {
  meeting: { label: 'Meeting', icon: Users,    color: '#7c3aed', bg: '#f3e8ff' },
  task:    { label: 'Task',    icon: Tag,      color: '#0891b2', bg: '#e0f2fe' },
  report:  { label: 'Report',  icon: FileText, color: '#d97706', bg: '#fef3c7' },
};

const formatDate = (d, end) => {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  const startStr = format(dt, 'EEE, MMM d', { locale: enUS });
  if (!end || end === d) {
    const diff = Math.ceil((dt - new Date()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return `${Math.abs(diff)}d overdue (${startStr})`;
    return startStr;
  }
  const dtEnd = new Date(end + 'T00:00:00');
  return `${startStr} - ${format(dtEnd, 'MMM d', { locale: enUS })}`;
};

const Dashboard = () => {
  const { items: allItems, openEditModal } = useEvents();
  const tday = today();

  // Current Week Filter (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0(Sun) - 6(Sat)
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const startOfWk = new Date(now);
  startOfWk.setDate(now.getDate() + diffToMon);
  startOfWk.setHours(0,0,0,0);
  
  const endOfWk = new Date(startOfWk);
  endOfWk.setDate(startOfWk.getDate() + 6);
  endOfWk.setHours(23,59,59,999);

  const items = allItems.filter(item => {
    const d1 = new Date(item.dueDate + 'T00:00:00');
    const d2 = new Date((item.endDate || item.dueDate) + 'T23:59:59');
    // Overlap with [startOfWk, endOfWk]
    return d1 <= endOfWk && startOfWk <= d2;
  });

  /* ── Stats ── */
  const dueToday   = items.filter(t => t.status !== 'done' && t.dueDate === tday);
  const completed  = items.filter(t => t.status === 'done');
  const inProgress = items.filter(t => t.status === 'in-progress');
  const overdue    = items.filter(t => {
    if (t.status === 'done') return false;
    const due = new Date(`${t.dueDate}${t.dueTime ? 'T' + t.dueTime : 'T23:59'}`);
    return due < new Date();
  });

  /* ── Today's items (all types) sorted by time ── */
  const todayItems = items
    .filter(t => t.status !== 'done' && t.dueDate === tday)
    .sort((a, b) => (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59'));

  /* ── Upcoming deadlines (next 7 days, not today, not done) ── */
  const upcoming = items
    .filter(t => t.status !== 'done' && t.dueDate > tday)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  /* ── Color for each category ── */
  const getCatColor = (catId) => CATEGORY_MAP[catId]?.accent || '#888';

  const todayFormatted = format(new Date(), 'EEEE, MMMM d', { locale: enUS });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Greeting banner */}
      <div className="soft-panel animate-fade-in" style={{
        background: 'linear-gradient(135deg, #f1e0ff 0%, #d8b4fe 100%)',
        padding: '32px', borderRadius: 'var(--radius-lg)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: 'none', boxShadow: '0 12px 30px rgba(224,195,252,0.4)'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary-accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Good morning! <Sparkles size={22} color="var(--primary-accent)" />
          </h1>
          <p style={{ color: '#8855b3', fontSize: '15px', fontWeight: '600' }}>
            Week: {format(startOfWk, 'dd MMM')} - {format(endOfWk, 'dd MMM')} · {dueToday.length > 0 ? `${dueToday.length} item${dueToday.length>1?'s':''} due today` : 'No tasks due today'}{overdue.length > 0 ? ` · ${overdue.length} overdue` : ''}
          </p>
        </div>
        <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calendar size={54} color="var(--primary-accent)" strokeWidth={1.5} style={{ opacity: 0.8 }} />
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
        {[
          { label: 'Due Today',   value: dueToday.length,   sub: 'tasks/meetings', icon: Clock,        accentColor: '#ec4899', bgColor: 'var(--pink-pastel)' },
          { label: 'In Progress', value: inProgress.length, sub: 'ongoing',         icon: ArrowRight,   accentColor: '#0891b2', bgColor: '#e0f2fe' },
          { label: 'Completed',   value: completed.length,  sub: 'total done',      icon: CheckCircle,  accentColor: '#16a34a', bgColor: '#dcfce7' },
          { label: 'Overdue',     value: overdue.length,    sub: 'need attention',  icon: AlertTriangle,accentColor: '#ef4444', bgColor: '#fee2e2' },
        ].map(({ label, value, sub, icon: Icon, accentColor, bgColor }) => (
          <Link 
            key={label} 
            to="/tasks" 
            className="soft-panel kpi-card" 
            style={{ 
              padding: '20px', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              textDecoration: 'none', 
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {value} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{sub}</span>
              </h2>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's tasks + Upcoming timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
        
        {/* Today's items */}
        <div className="soft-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Today's Schedule</h3>
            <Link to="/tasks" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ width: 'auto', padding: '6px 12px', color: 'var(--primary-accent)', fontSize: '13px' }}>
                View Board <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {todayItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>
              🎉 Nothing due today! Enjoy your day.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayItems.map(item => {
                const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.task;
                const catColor = getCatColor(item.categoryId);
                const TypeIcon = typeCfg.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => openEditModal(item)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel-hover)'}
                  >
                    <div style={{ width: '10px', height: '44px', background: catColor, borderRadius: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: typeCfg.color, background: typeCfg.bg, borderRadius: '6px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <TypeIcon size={10} /> {typeCfg.label}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>{CATEGORY_MAP[item.categoryId]?.name}</span>
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>{item.title}</h4>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', background: 'var(--bg-panel)', padding: '6px 12px', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-soft)', flexShrink: 0 }}>
                      {(() => {
                        if (!item.dueTime) return 'All day';
                        if (!item.duration) return item.dueTime;
                        const [h, m] = item.dueTime.split(':').map(Number);
                        const endNum = (h + m / 60) + item.duration;
                        const h2 = Math.floor(endNum) % 24;
                        const m2 = Math.round((endNum - Math.floor(endNum)) * 60);
                        return `${item.dueTime} - ${h2.toString().padStart(2, '0')}:${m2.toString().padStart(2, '0')}`;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming timeline */}
        <div className="soft-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Upcoming</h3>
            <Link to="/calendar" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ width: 'auto', padding: '6px 12px', color: 'var(--blue-accent)', fontSize: '13px' }}>
                Calendar <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>Nothing upcoming 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '16px', width: '2px', background: 'var(--border-light)', zIndex: 0 }} />
              {upcoming.map(item => {
                const catColor = getCatColor(item.categoryId);
                const isOv = item.dueDate < tday;
                return (
                  <div key={item.id} onClick={() => openEditModal(item)} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1, cursor: 'pointer' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: isOv ? '#fee2e2' : `${catColor}20`, border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOv ? '#ef4444' : catColor }} />
                    </div>
                    <div style={{ paddingTop: '6px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '3px', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>{item.title}</h4>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: isOv ? '#ef4444' : 'var(--text-secondary)' }}>
                        {formatDate(item.dueDate, item.endDate)}{item.dueTime ? ` · ${item.dueTime}` : ''} · {CATEGORY_MAP[item.categoryId]?.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: 'var(--text-muted)', opacity: 0.5 }}>
        v1.1 (Updated: Wrapping Fix)
      </div>
    </div>
  );
};

export default Dashboard;
