import React, { createContext, useState, useContext, useEffect } from 'react';

/* ── Category palette ── */
export const CATEGORY_MAP = {
  rd: { name: 'R&D',            color: '#ffe5b4', text: '#d98a41', accent: '#f97316' },
  qc: { name: 'QC',             color: '#fbcfe8', text: '#d96875', accent: '#ec4899' },
  mm: { name: 'Media Marketing', color: '#bbf7d0', text: '#5fb078', accent: '#22c55e' },
  hy: { name: 'HY Evolution',   color: '#bfdbfe', text: '#5a9bd4', accent: '#3b82f6' },
};

/* ── Unified initial data (shared by Calendar, Planner, Dashboard) ── */
const initialItems = [
  // Meetings
  { id: 'i1',  title: 'Weekly Briefing',        type: 'meeting', categoryId: 'hy', priority: 'high',   status: 'todo',        dueDate: '2026-03-24', dueTime: '09:00', duration: 1   },
  { id: 'i2',  title: 'TechCorp Partner Meet',  type: 'meeting', categoryId: 'mm', priority: 'high',   status: 'in-progress', dueDate: '2026-03-20', dueTime: '14:30', duration: 1.5 },
  { id: 'i3',  title: 'Project Team 3 Sync',    type: 'meeting', categoryId: 'mm', priority: 'medium', status: 'todo',        dueDate: '2026-03-19', dueTime: '09:00', duration: 2   },
  { id: 'i4',  title: 'Team Building Q2',       type: 'meeting', categoryId: 'rd', priority: 'low',    status: 'in-progress', dueDate: '2026-03-21', dueTime: '11:00', duration: 3   },
  { id: 'i5',  title: 'Marketing Strategy Meet',type: 'meeting', categoryId: 'mm', priority: 'low',    status: 'done',        dueDate: '2026-03-17', dueTime: '10:00', duration: 1   },
  { id: 'i6',  title: 'Outing with friends',    type: 'meeting', categoryId: 'mm', priority: 'low',    status: 'done',        dueDate: '2026-03-20', dueTime: '09:00', duration: 4   },
  // Tasks
  { id: 'i7',  title: 'DB System Design',       type: 'task',    categoryId: 'rd', priority: 'medium', status: 'in-progress', dueDate: '2026-03-21', dueTime: '14:00', duration: 2   },
  { id: 'i8',  title: 'Frontend Code Review',   type: 'task',    categoryId: 'hy', priority: 'low',    status: 'todo',        dueDate: '2026-03-25', dueTime: '10:00', duration: 1.5 },
  { id: 'i9',  title: 'Design new UI file',     type: 'task',    categoryId: 'rd', priority: 'high',   status: 'todo',        dueDate: '2026-03-19', dueTime: '14:00', duration: 3.5 },
  { id: 'i10', title: 'Edit Tiktok Video',      type: 'task',    categoryId: 'qc', priority: 'medium', status: 'in-progress', dueDate: '2026-03-20', dueTime: '17:00', duration: 1.5 },
  { id: 'i11', title: 'Brain Dump Idea Q2',     type: 'task',    categoryId: 'qc', priority: 'low',    status: 'todo',        dueDate: '2026-03-22', dueTime: '16:30', duration: 2   },
  { id: 'i12', title: 'Advanced Design Course', type: 'task',    categoryId: 'hy', priority: 'medium', status: 'in-progress', dueDate: '2026-03-19', dueTime: '14:00', duration: 3   },
  { id: 'i13', title: 'Study Vocab',            type: 'task',    categoryId: 'hy', priority: 'low',    status: 'todo',        dueDate: '2026-03-21', dueTime: '17:30', duration: 1.5 },
  { id: 'i14', title: 'Grocery Shopping',       type: 'task',    categoryId: 'mm', priority: 'low',    status: 'todo',        dueDate: '2026-03-22', dueTime: '13:00', duration: 3.5 },
  { id: 'i15', title: 'Adjust Paid Ads',        type: 'task',    categoryId: 'mm', priority: 'medium', status: 'in-progress', dueDate: '2026-03-24', dueTime: '10:00', duration: 3   },
  // Reports
  { id: 'i16', title: 'Q1 Sales Report',        type: 'report',  categoryId: 'mm', priority: 'high',   status: 'todo',        dueDate: '2026-03-22', dueTime: '',      duration: 2   },
  { id: 'i17', title: 'Team Performance Review',type: 'report',  categoryId: 'qc', priority: 'medium', status: 'todo',        dueDate: '2026-03-26', dueTime: '',      duration: 1.5 },
  { id: 'i18', title: 'Write API Docs',         type: 'report',  categoryId: 'rd', priority: 'medium', status: 'done',        dueDate: '2026-03-18', dueTime: '',      duration: 1   },
];

import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const loadMergedState = (fbData) => {
    const fallbackFbStr = localStorage.getItem('last_known_fb_data');
    let baseData = fbData;
    
    if (!baseData && fallbackFbStr) {
        try {
            baseData = JSON.parse(fallbackFbStr);
        } catch(e) {
            baseData = [];
        }
    } else if (!baseData) {
        baseData = [];
    } else {
        localStorage.setItem('last_known_fb_data', JSON.stringify(fbData));
    }

    const localStr = localStorage.getItem('local_changes');
    let localChanges = {};
    if (localStr) {
        try {
            localChanges = JSON.parse(localStr);
        } catch(e) {}
    }
    
    const dataMap = {};
    baseData.forEach(i => dataMap[i.id] = i);
    
    Object.keys(localChanges).forEach(id => {
      const change = localChanges[id];
      if (change === null) delete dataMap[id];
      else dataMap[id] = change;
    });
    
    return Object.values(dataMap);
  };

  const [items, setItems] = useState(() => loadMergedState(null)); // Initialize robustly!
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const { currentUser } = useAuth();

  const saveChangeLocal = (id, objOrNull) => {
    const localStr = localStorage.getItem('local_changes');
    const localChanges = localStr ? JSON.parse(localStr) : {};
    localChanges[id] = objOrNull;
    localStorage.setItem('local_changes', JSON.stringify(localChanges));
    
    setItems(prev => {
      if (objOrNull === null) return prev.filter(i => i.id !== id);
      if (prev.find(i => i.id === id)) return prev.map(i => i.id === id ? objOrNull : i);
      return [...prev, objOrNull];
    });
  };

  const clearChangeLocal = (id) => {
    const localStr = localStorage.getItem('local_changes');
    const localChanges = localStr ? JSON.parse(localStr) : {};
    if (id in localChanges) {
      delete localChanges[id];
      localStorage.setItem('local_changes', JSON.stringify(localChanges));
    }
  };

  const syncPendingChangesToCloud = () => {
    const localStr = localStorage.getItem('local_changes');
    if (!localStr) return;
    let localChanges = {};
    try {
        localChanges = JSON.parse(localStr);
    } catch(e) { return; }
    const keys = Object.keys(localChanges);
    if (keys.length === 0) return;

    keys.forEach(id => {
      const change = localChanges[id];
      // Optimistically remove from local queue to prevent loops
      clearChangeLocal(id);
      
      if (change === null) {
        deleteDoc(doc(db, 'deadline_items', id)).catch(e => saveChangeLocal(id, null));
      } else {
        setDoc(doc(db, 'deadline_items', id), change, { merge: true }).catch(e => saveChangeLocal(id, change));
      }
    });
  };

  // Sync with Firestore
  useEffect(() => {
    const q = query(collection(db, 'deadline_items'), orderBy('dueDate', 'asc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fbData = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setItems(loadMergedState(fbData));
        syncPendingChangesToCloud(); // <-- Automatically push offline data to cloud!
      },
      (error) => {
        console.warn("Firestore sync failed. Offline mode active.", error);
        setItems(loadMergedState(null));
      }
    );
    return () => unsubscribe();
  }, []);

  /* ── CRUD (Firestore with robust local overrides) ── */
  const addEvent = async (item) => {
    const newId = `item-${Date.now()}`;
    const newItem = { ...item, id: newId };
    saveChangeLocal(newId, newItem);
    setIsModalOpen(false);
    try { 
      await setDoc(doc(db, 'deadline_items', newId), newItem); 
      clearChangeLocal(newId);
    } catch (e) { console.warn(e); }
  };

  const updateEvent = async (updated) => {
    saveChangeLocal(updated.id, updated);
    setIsModalOpen(false);
    setCurrentEvent(null);
    try { 
      await setDoc(doc(db, 'deadline_items', updated.id), updated, { merge: true }); 
      clearChangeLocal(updated.id);
    } catch (e) { console.warn(e); }
  };

  const deleteEvent = async (id) => {
    saveChangeLocal(id, null);
    setIsModalOpen(false);
    setCurrentEvent(null);
    try { 
      await deleteDoc(doc(db, 'deadline_items', id)); 
      clearChangeLocal(id);
    } catch (e) { console.warn(e); }
  };

  const changeStatus = async (id, status) => {
    setItems((prev) => {
      const target = prev.find(i => i.id === id);
      if (!target) return prev;
      const upd = { 
        ...target, status, 
        updatedBy: currentUser ? currentUser.name : 'Unknown', 
        updatedAt: new Date().toISOString() 
      };
      
      // Async save to pending queue
      Promise.resolve().then(() => {
        const localStr = localStorage.getItem('local_changes');
        const localChanges = localStr ? JSON.parse(localStr) : {};
        localChanges[id] = upd;
        localStorage.setItem('local_changes', JSON.stringify(localChanges));
      });
      
      setDoc(doc(db, 'deadline_items', id), upd, { merge: true })
        .then(() => clearChangeLocal(id))
        .catch(console.warn);

      return prev.map(i => i.id === id ? upd : i);
    });
  };

  /* ── Modal triggers ── */
  const openAddModal = () => { setCurrentEvent(null); setIsModalOpen(true); };
  const openEditModal = (item) => { setCurrentEvent(item); setIsModalOpen(true); };

  /* ── Derived: "events" for Calendar (items with dueTime, shown on calendar grid) ── */
  const events = items; // CalendarView will filter/compute day dynamically

  /* ── Notifications ── */
  const [notifiedIds, setNotifiedIds] = useState(new Set());

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      items.forEach(item => {
        if (item.status === 'done' || !item.dueDate || !item.dueTime || item.dueDate !== todayStr) return;
        if (notifiedIds.has(item.id)) return;

        const [h, m] = item.dueTime.split(':').map(Number);
        const dueTime = new Date();
        dueTime.setHours(h, m, 0, 0);

        const diffMinutes = (dueTime.getTime() - now.getTime()) / 60000;

        // Notify if it's within 15 minutes
        if (diffMinutes > 0 && diffMinutes <= 15) {
          const typeLabel = item.type === 'meeting' ? '📅 Meeting' : item.type === 'report' ? '📊 Report' : '✅ Task';
          new Notification(`${typeLabel} soon: ${item.title}`, {
            body: `Starting at ${item.dueTime} (in ${Math.round(diffMinutes)} mins)`,
            icon: '/fusion-logo.png' // Fallback to provided logo if available
          });
          setNotifiedIds(prev => new Set([...prev, item.id]));
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000); 
    checkNotifications(); // check immediately
    return () => clearInterval(interval);
  }, [items, notifiedIds]);

  return (
    <EventContext.Provider value={{
      items,           // unified list (use in Planner/Dashboard)
      events,          // alias (Calendar uses this)
      addEvent, updateEvent, deleteEvent, changeStatus,
      isModalOpen, setIsModalOpen,
      currentEvent,
      openAddModal, openEditModal,
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
