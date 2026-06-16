import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

export const Header = ({ currentView, setView, user, onToggleUserModal }) => {
  const { lang, setLang, t } = useLanguage();
  const [menuActive, setMenuActive] = useState(false);

  const handleNavClick = (targetId) => {
    setMenuActive(false);
    if (currentView !== 'home') {
      setView('home');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header>
      <div className="nav-bar">
        <div className="logo-container" onClick={() => handleNavClick('hero')} style={{ cursor: 'pointer' }}>
          <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=192,h=192,fit=crop,f=png/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="Logo" className="logo-img" />
          <div className="logo-text">NayePankh</div>
        </div>
        
        <ul className={`nav-links ${menuActive ? 'active' : ''}`} id="navLinks">
          <li><a href="#hero" onClick={(e) => { e.preventDefault(); handleNavClick('hero'); }}>{t('nav-home')}</a></li>
          <li><a href="#calculator" onClick={(e) => { e.preventDefault(); handleNavClick('calculator'); }}>{t('nav-calc')}</a></li>
          <li><a href="#dashboard" onClick={(e) => { e.preventDefault(); handleNavClick('dashboard'); }}>{t('nav-dash')}</a></li>
          <li><a href="#volunteer" onClick={(e) => { e.preventDefault(); handleNavClick('volunteer'); }}>{t('nav-vol')}</a></li>
          <li><a href="#trust" onClick={(e) => { e.preventDefault(); handleNavClick('trust'); }}>{t('nav-trust')}</a></li>
          
          {user ? (
            <li id="navUserItem">
              <span className="user-nav-chip" onClick={onToggleUserModal}>
                <i className="fa-solid fa-circle-user"></i> <span>{user.name.split(' ')[0]}</span>
              </span>
            </li>
          ) : (
            <li id="navLoginItem">
              <a href="#login" onClick={(e) => { e.preventDefault(); setView('login'); }}>{t('nav-login')}</a>
            </li>
          )}
        </ul>
        
        <div className="header-actions">
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'hi' ? 'active' : ''}`} onClick={() => setLang('hi')}>हिन्दी</button>
          </div>
          
          <button className="menu-toggle" onClick={() => setMenuActive(!menuActive)} aria-label="Toggle Navigation Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};
