import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Homepage } from './components/Homepage';
import { Login } from './components/Login';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in on startup
    const savedUser = localStorage.getItem('nayepankh_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('nayepankh_user');
    setUser(null);
  };

  const handleRefreshUser = () => {
    const savedUser = localStorage.getItem('nayepankh_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  return (
    <div className="app-wrapper">
      {view !== 'admin' && (
        <Header
          currentView={view}
          setView={setView}
          user={user}
          onToggleUserModal={() => setUserModalOpen(!userModalOpen)}
        />
      )}

      {view === 'home' && (
        <Homepage
          user={user}
          setView={setView}
          userModalOpen={userModalOpen}
          setUserModalOpen={setUserModalOpen}
          onLogout={handleLogout}
          onRefreshUser={handleRefreshUser}
        />
      )}

      {view === 'login' && (
        <Login
          onLogin={handleLogin}
          setView={setView}
        />
      )}

      {view === 'admin' && (
        <AdminPortal
          onLogout={handleLogout}
          setView={setView}
        />
      )}

      {view !== 'admin' && <Footer setView={setView} />}
      {view !== 'admin' && <ChatbotWidget />}
    </div>
  );
}

export default App;
