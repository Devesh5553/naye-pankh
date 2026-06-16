import React from 'react';
import { useLanguage } from './LanguageContext';

export const Footer = ({ setView }) => {
  const { t } = useLanguage();

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    setView('home');
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-col">
          <h3>{t('foot-about-title')}</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{t('foot-about-text')}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: '#64748b' }}>{t('foot-reg-details')}</p>
        </div>
        
        <div className="footer-col">
          <h3>{t('foot-nav-title')}</h3>
          <ul className="footer-links">
            <li><a href="#hero" onClick={(e) => handleLinkClick(e, 'hero')}>{t('nav-home')}</a></li>
            <li><a href="#calculator" onClick={(e) => handleLinkClick(e, 'calculator')}>{t('nav-calc')}</a></li>
            <li><a href="#dashboard" onClick={(e) => handleLinkClick(e, 'dashboard')}>{t('nav-dash')}</a></li>
            <li><a href="#volunteer" onClick={(e) => handleLinkClick(e, 'volunteer')}>{t('nav-vol')}</a></li>
            <li><a href="#trust" onClick={(e) => handleLinkClick(e, 'trust')}>{t('nav-trust')}</a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h3>{t('foot-contact-title')}</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><i className="fa-solid fa-envelope" style={{ color: 'var(--primary-color)' }}></i> info@nayepankh.com</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><i className="fa-solid fa-phone" style={{ color: 'var(--primary-color)' }}></i> +91 83185 18265</p>
          <p style={{ fontSize: '0.9rem' }}><i className="fa-solid fa-location-dot" style={{ color: 'var(--primary-color)' }}></i> Kanpur, Uttar Pradesh, India</p>
          
          <div className="social-links">
            <a href="https://www.instagram.com/nayepankhfoundation" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://www.linkedin.com/company/nayepankh" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
            <a href="https://www.facebook.com/nayepankhfoundation" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></a>
            <a href="https://www.youtube.com/@nayepankhfoundation" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>{t('foot-copyright')}</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          <a href="#admin" onClick={(e) => { e.preventDefault(); setView('login'); }} style={{ color: '#64748b', textDecoration: 'underline' }}>
            {t('link-admin-portal')}
          </a>
        </p>
      </div>
    </footer>
  );
};
