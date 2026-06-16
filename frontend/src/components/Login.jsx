import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { API_BASE_URL } from '../config';

export const Login = ({ onLogin, setView }) => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('login');
  const [errorMsg, setErrorMsg] = useState('');

  // Login inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const seedUserDonationsIfEmpty = (name, email) => {
    const allDonations = JSON.parse(localStorage.getItem('nayepankh_admin_donations') || '[]');
    const userDonations = allDonations.filter(d => d.email.toLowerCase() === email.toLowerCase());
    
    if (userDonations.length === 0) {
      const dummyDonations = [
        {
          name: name,
          email: email,
          date: '2026-06-01',
          amount: 7500,
          method: 'UPI (GPay)',
          status: 'Successful',
          campaignKey: 'edu'
        },
        {
          name: name,
          email: email,
          date: '2026-05-15',
          amount: 1800,
          method: 'UPI (Paytm)',
          status: 'Successful',
          campaignKey: 'food'
        }
      ];
      localStorage.setItem('nayepankh_admin_donations', JSON.stringify([...dummyDonations, ...allDonations]));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const userVal = loginUsername.trim();
    const passVal = loginPassword;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userVal, password: passVal })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('err-invalid'));
      }

      const data = await response.json();
      if (userVal.toLowerCase() === 'admin' && passVal === 'admin123') {
        sessionStorage.setItem('nayepankh_admin_login', 'true');
        onLogin({ name: 'System Administrator', role: 'admin' });
        setView('admin');
      } else {
        localStorage.setItem('nayepankh_user', JSON.stringify(data));
        onLogin(data);
        setView('home');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const name = regName.trim();
    const email = regEmail.trim();
    const phone = regPhone.trim();
    const pass = regPassword;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password: pass })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('err-exists'));
      }

      const data = await response.json();
      localStorage.setItem('nayepankh_user', JSON.stringify(data));
      onLogin(data);
      setView('home');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="admin-body">
      <div className="admin-login-wrapper" style={{ padding: '4rem 1rem' }}>
        <div className="card admin-login-card" style={{ padding: '2.5rem', maxWidth: '450px', margin: '0 auto', borderTop: '5px solid var(--primary-color)' }}>
          
          <div className="login-tabs">
            <button className={`login-tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setErrorMsg(''); }}>{t('tab-login')}</button>
            <button className={`login-tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setErrorMsg(''); }}>{t('tab-register')}</button>
          </div>

          {errorMsg && (
            <div id="authError" style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.85rem', textAlign: 'left' }}>
              {errorMsg}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'left' }}>
                {lang === 'hi' ? (
                  <><strong>🔑 प्रोटोटाइप एडमिन लॉगिन:</strong><br />यूज़रनेम: <code>admin</code> | पासवर्ड: <code>admin123</code></>
                ) : (
                  <><strong>🔑 Prototype Admin Login:</strong><br />Username: <code>admin</code> | Password: <code>admin123</code></>
                )}
              </div>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.9rem' }}>{t('label-useremail')}</label>
                <input
                  type="text"
                  className="select-box"
                  style={{ marginTop: '0.4rem' }}
                  placeholder={lang === 'hi' ? 'जैसे: admin या rahul@gmail.com' : 'e.g. admin or rahul@gmail.com'}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
                <label style={{ fontSize: '0.9rem' }}>{t('label-pass')}</label>
                <input
                  type="password"
                  className="select-box"
                  style={{ marginTop: '0.4rem' }}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('btn-login-submit')} &nbsp; <i className="fa-solid fa-arrow-right-to-bracket"></i>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.9rem' }}>{t('label-fullname')}</label>
                <input
                  type="text"
                  className="select-box"
                  style={{ marginTop: '0.4rem' }}
                  placeholder={lang === 'hi' ? 'जैसे: रमेश कुमार' : 'e.g. Ramesh Kumar'}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.9rem' }}>{t('label-email')}</label>
                <input
                  type="email"
                  className="select-box"
                  style={{ marginTop: '0.4rem' }}
                  placeholder="e.g. ramesh@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.9rem' }}>{t('label-whatsapp')}</label>
                <input
                  type="tel"
                  className="select-box"
                  style={{ marginTop: '0.4rem' }}
                  placeholder="e.g. 9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.9rem' }}>{t('label-pass')}</label>
                <input
                  type="password"
                  className="select-box"
                  style={{ marginTop: '0.4rem' }}
                  placeholder={lang === 'hi' ? 'पासवर्ड बनाएं' : 'Create password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('btn-register-submit')} &nbsp; <i className="fa-solid fa-user-plus"></i>
              </button>
            </form>
          )}

          <p style={{ marginTop: '2rem', fontSize: '0.85rem' }}>
            <a href="#home" onClick={(e) => { e.preventDefault(); setView('home'); }} style={{ color: 'var(--text-light)', textDecoration: 'underline' }}>
              {t('back-home')}
            </a>
          </p>

        </div>
      </div>
    </div>
  );
};
