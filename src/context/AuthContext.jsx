import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const EMPLOYEES = [
  { id: 'TraRD', name: 'Tra', department: 'R&D', role: 'admin', pass: 'Tra123@' },
  { id: 'ThanhRD', name: 'Thanh', department: 'R&D', role: 'admin', pass: 'fusion2026' },
  { id: 'NgaMedia', name: 'Nga', department: 'Media MKT', role: 'admin', pass: 'Nga345@' },
  { id: 'LAnhMedia', name: 'Lan Anh', department: 'Media MKT', role: 'admin', pass: 'LA123!' },
  { id: 'ThaoMedia', name: 'Thao', department: 'Media MKT', role: 'admin', pass: 'Thao123#' },
  { id: 'TrangMedia', name: 'Trang', department: 'Media MKT', role: 'admin', pass: 'Trang345@' },
  { id: 'NiQC', name: 'Ni', department: 'QC', role: 'admin', pass: 'Ni123' },
  { id: 'HaQC', name: 'Ha', department: 'QC', role: 'admin', pass: 'fusion2026' },
  { id: 'NhungQC', name: 'Nhung', department: 'QC', role: 'admin', pass: 'fusion2026' },
  { id: 'TaiQC', name: 'Tai', department: 'QC', role: 'admin', pass: 'Tai123!' },
  { id: 'LinhQC', name: 'Linh', department: 'QC', role: 'admin', pass: 'Linh123$' },
  { id: 'NinhEvolution', name: 'Ninh', department: 'Evolution', role: 'admin', pass: 'Ninh456' },
  { id: 'MunFD', name: 'Mr Mun', department: 'FD', role: 'admin', pass: 'MunFS123' },
  { id: 'LeeCPO', name: 'Mr Lee', department: 'CPO', role: 'admin', pass: 'LeeFS456' },
  { id: 'vetnam@fusiongroup.vn', name: 'Nam R&D Head', department: 'R&D', role: 'admin', pass: 'tndmltk6211#' },
  { id: 'Guest', name: 'Guest Mode (View Only)', department: 'Guest', role: 'guest' }
];

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('mockUser');
      }
    }
    setLoading(false);
  }, []);

  function login(userId, password = '') {
    return new Promise((resolve, reject) => {
      if (userId.toLowerCase() === 'guest') {
        const guest = EMPLOYEES.find(e => e.id === 'Guest');
        setCurrentUser(guest);
        localStorage.setItem('mockUser', JSON.stringify(guest));
        resolve(guest);
        return;
      }
      
      const user = EMPLOYEES.find(e => e.id.toLowerCase() === userId.toLowerCase());
      if (user && user.pass === password) {
        setCurrentUser(user);
        localStorage.setItem('mockUser', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('Incorrect ID or password!'));
      }
    });
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('mockUser');
    return Promise.resolve();
  }

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
