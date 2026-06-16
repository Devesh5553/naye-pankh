import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import Chart from 'chart.js/auto';

export const Homepage = ({ user, setView, userModalOpen, setUserModalOpen, onLogout, onRefreshUser }) => {
  const { lang, t } = useLanguage();

  /* ==================== CALCULATOR STATE ==================== */
  const [donationAmount, setDonationAmount] = useState(5000);
  const [taxSlab, setTaxSlab] = useState(0.20);

  const deductible = donationAmount * 0.5;
  const taxSavings = deductible * taxSlab;
  const netCost = donationAmount - taxSavings;

  const mealsCount = Math.floor(donationAmount / 50);
  const padsCount = Math.floor(donationAmount / 40);
  const kitsCount = Math.floor(donationAmount / 500);

  const handleConfirmDonation = async () => {
    if (!user) {
      alert(lang === 'hi'
        ? 'दान करने और रसीद पाने के लिए कृपया पहले लॉगिन करें।'
        : 'Please login first to log a donation and receive tax benefits.');
      setView('login');
      return;
    }

    let campKey = 'hygiene';
    if (donationAmount >= 5000) {
      campKey = 'edu';
    } else if (donationAmount >= 2000) {
      campKey = 'food';
    }

    const newDonation = {
      name: user.name,
      email: user.email,
      amount: donationAmount,
      method: 'UPI (Portal Session)',
      status: 'Successful',
      campaignKey: campKey
    };

    try {
      const response = await fetch('http://localhost:8000/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonation)
      });
      if (response.ok) {
        alert(lang === 'hi'
          ? `धन्यवाद! ₹${donationAmount.toLocaleString('en-IN')} का दान सफलतापूर्वक प्राप्त हुआ। आपकी रसीद जल्द भेजी जाएगी।`
          : `Thank you! Your donation of ₹${donationAmount.toLocaleString('en-IN')} was logged successfully. Your 80G tax receipt will be sent shortly.`);
        onRefreshUser();
        setUserModalOpen(true); // Open modal to show receipt
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ==================== CHARTS RENDERING ==================== */
  const allocationCanvasRef = useRef(null);
  const growthCanvasRef = useRef(null);
  const allocationChartRef = useRef(null);
  const growthChartRef = useRef(null);

  useEffect(() => {
    // Allocation Donut
    if (allocationCanvasRef.current) {
      if (allocationChartRef.current) allocationChartRef.current.destroy();
      allocationChartRef.current = new Chart(allocationCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: [
            t('chart-alloc-food'),
            t('chart-alloc-sanitary'),
            t('chart-alloc-edu'),
            t('chart-alloc-admin'),
            t('chart-alloc-events')
          ],
          datasets: [{
            data: [45, 25, 15, 10, 5],
            backgroundColor: ['#ea580c', '#16a34a', '#2563eb', '#64748b', '#fb923c'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  family: 'Poppins, Noto Sans Devanagari'
                }
              }
            }
          }
        }
      });
    }

    // Growth Bar
    if (growthCanvasRef.current) {
      if (growthChartRef.current) growthChartRef.current.destroy();
      growthChartRef.current = new Chart(growthCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
          datasets: [{
            label: t('chart-growth-label'),
            data: [25000, 60000, 110000, 150000, 185000, 210000],
            backgroundColor: '#ea580c',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value.toLocaleString('en-IN');
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (allocationChartRef.current) allocationChartRef.current.destroy();
      if (growthChartRef.current) growthChartRef.current.destroy();
    };
  }, [lang]);

  /* ==================== VOLUNTEER QUIZ STATE ==================== */
  const [quizStep, setQuizStep] = useState(1);
  const [quizSkill, setQuizSkill] = useState('teaching');
  const [quizTime, setQuizTime] = useState('2hrs');
  const [quizLoc, setQuizLoc] = useState('up');

  // Quiz Results Info
  const [recRoleBadge, setRecRoleBadge] = useState('');
  const [recRoleDesc, setRecRoleDesc] = useState('');
  const [vName, setVName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [quizSignedUp, setQuizSignedUp] = useState(false);

  const handleCalculateMatch = () => {
    let roleKey = 'role-teach-title';
    let descKey = 'role-teach-desc';

    if (quizSkill === 'teaching') {
      roleKey = 'role-teach-title';
      descKey = 'role-teach-desc';
    } else if (quizSkill === 'fieldwork') {
      roleKey = 'role-field-title';
      descKey = 'role-field-desc';
    } else if (quizSkill === 'creative') {
      roleKey = 'role-creative-title';
      descKey = 'role-creative-desc';
    } else if (quizSkill === 'admin') {
      roleKey = 'role-admin-title';
      descKey = 'role-admin-desc';
    }

    setRecRoleBadge(t(roleKey));
    setRecRoleDesc(t(descKey));
    setQuizStep(4); // Show results
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();

    const timeText = quizTime === '2hrs' ? '1-2 Hours / Week' : quizTime === '5hrs' ? '3-5 Hours / Week' : quizTime === 'weekend' ? 'Weekend Drives' : 'Flexible';
    const locText = quizLoc === 'up' ? 'On-field (UP)' : 'Remote (WFH)';

    const newVolunteer = {
      name: vName,
      phone: vPhone,
      role: recRoleBadge,
      time: timeText,
      loc: locText
    };

    try {
      const response = await fetch('http://localhost:8000/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVolunteer)
      });
      if (response.ok) {
        setQuizSignedUp(true);
        onRefreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestartQuiz = () => {
    setVName('');
    setVPhone('');
    setQuizSignedUp(false);
    setQuizStep(1);
  };

  /* ==================== SUPPORTER PORTAL MODAL LIST ==================== */
  const [userDonations, setUserDonations] = useState([]);
  const [matchedRole, setMatchedRole] = useState('');
  const [activeAccordionId, setActiveAccordionId] = useState(null);

  // Load modal data when open
  useEffect(() => {
    if (!user) return;
    
    // Fetch User Donations
    fetch(`http://localhost:8000/api/donations/user?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => setUserDonations(data))
      .catch(err => console.error(err));

    // Fetch Volunteers to find matched role
    fetch('http://localhost:8000/api/volunteers')
      .then(res => res.json())
      .then(volList => {
        const matchedVol = volList.find(v => v.phone === user.phone || v.name === user.name);
        if (matchedVol) {
          setMatchedRole(matchedVol.role);
        } else {
          setMatchedRole(t('role-unregistered'));
        }
      })
      .catch(err => console.error(err));
  }, [user, userModalOpen, lang]);

  return (
    <>
      {/* ==================== HERO SECTION ==================== */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <h1>{t('hero-heading')}</h1>
          <p>{t('hero-subheading')}</p>
          
          <div className="hero-ctas">
            <a href="#calculator" className="btn btn-primary btn-lg" onClick={(e) => { e.preventDefault(); document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' }); }}>
              <i className="fa-solid fa-heart"></i> {t('hero-cta-donate')}
            </a>
            <a href="#volunteer" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'white' }} onClick={(e) => { e.preventDefault(); document.getElementById('volunteer').scrollIntoView({ behavior: 'smooth' }); }}>
              <i className="fa-solid fa-users"></i> {t('hero-cta-volunteer')}
            </a>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">2 Lakh+</span>
              <span className="stat-label">{t('stat-lives')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">80G & 12A</span>
              <span className="stat-label">{t('stat-reg')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">{t('stat-trans')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CALCULATOR SECTION ==================== */}
      <section className="container" id="calculator">
        <h2 className="section-title">{t('title-calc')}</h2>
        
        <div className="calc-grid">
          <div className="card calc-inputs">
            <div className="form-group">
              <label>{t('label-donation')}</label>
              <input type="range" min="500" max="100000" step="500" value={donationAmount} onChange={(e) => setDonationAmount(parseFloat(e.target.value))} />
              <div className="donation-display">₹ {donationAmount.toLocaleString('en-IN')}</div>
              <div className="range-values">
                <span>₹ 500</span>
                <span>₹ 1,00,000</span>
              </div>
            </div>
            
            <div className="form-group">
              <label>{t('label-slab')}</label>
              <select className="select-box" value={taxSlab} onChange={(e) => setTaxSlab(parseFloat(e.target.value))}>
                <option value="0.10">{t('slab-10')}</option>
                <option value="0.20">{t('slab-20')}</option>
                <option value="0.30">{t('slab-30')}</option>
              </select>
            </div>
            
            <div style={{ backgroundColor: 'var(--info-bg)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', borderLeft: '4px solid var(--info-color)' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--info-color)', fontWeight: 500 }}>{t('tax-tip')}</p>
            </div>
          </div>
          
          <div className="card calc-results" style={{ borderTop: '5px solid var(--primary-color)' }}>
            <h3>{t('title-savings')}</h3>
            
            <div className="result-box">
              <div className="result-row">
                <span className="result-label">{t('res-exempt')}</span>
                <span className="result-value">₹ {deductible.toLocaleString('en-IN')}</span>
              </div>
              <div className="result-row">
                <span className="result-label">{t('res-saved')}</span>
                <span className="result-value" style={{ color: 'var(--success-color)' }}>₹ {taxSavings.toLocaleString('en-IN')}</span>
              </div>
              <div className="result-row" style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span className="result-label" style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{t('res-netcost')}</span>
                <span className="result-value highlight">₹ {netCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <h3>{t('title-impact-estimate')}</h3>
            <div className="impact-breakdown">
              <div className="impact-card">
                <div className="impact-icon"><i className="fa-solid fa-bowl-food"></i></div>
                <span className="impact-number">{mealsCount.toLocaleString('en-IN')}</span>
                <span className="impact-label">{t('impact-meals-label')}</span>
              </div>
              <div className="impact-card">
                <div className="impact-icon"><i className="fa-solid fa-hand-holding-heart"></i></div>
                <span className="impact-number">{padsCount.toLocaleString('en-IN')}</span>
                <span className="impact-label">{t('impact-pads-label')}</span>
              </div>
              <div className="impact-card">
                <div className="impact-icon"><i className="fa-solid fa-graduation-cap"></i></div>
                <span className="impact-number">{kitsCount.toLocaleString('en-IN')}</span>
                <span className="impact-label">{t('impact-kits-label')}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleConfirmDonation}>{t('btn-donate-submit')}</button>
          </div>
        </div>
      </section>

      {/* ==================== TRANSPARENCY DASHBOARD ==================== */}
      <section style={{ backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" id="dashboard">
          <h2 className="section-title">{t('title-dash')}</h2>
          
          <div className="dashboard-grid">
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('title-chart-allocation')}</h3>
              <div className="chart-wrapper">
                <canvas ref={allocationCanvasRef}></canvas>
              </div>
              <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{t('allocation-caption')}</p>
            </div>
            
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('title-chart-growth')}</h3>
              <div className="chart-wrapper">
                <canvas ref={growthCanvasRef}></canvas>
              </div>
              <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{t('growth-caption')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== VOLUNTEER QUIZ ==================== */}
      <section className="container" id="volunteer">
        <h2 className="section-title">{t('title-quiz-sec')}</h2>
        
        <div className="card quiz-container">
          <div className="quiz-progress">
            <div className="progress-bar" style={{ width: `${(quizStep / 3) * 100}%` }}></div>
          </div>
          
          {/* STEP 1: SKILLS */}
          {quizStep === 1 && (
            <div className="quiz-step active">
              <h3 className="quiz-title">{t('quiz-q1')}</h3>
              <div className="options-grid">
                <div className="quiz-option">
                  <input type="radio" name="skill" id="skillTeach" value="teaching" checked={quizSkill === 'teaching'} onChange={() => setQuizSkill('teaching')} />
                  <label htmlFor="skillTeach" className="quiz-option-label">
                    <i className="fa-solid fa-book-open"></i>
                    <span>{t('opt-teaching')}</span>
                  </label>
                </div>
                <div className="quiz-option">
                  <input type="radio" name="skill" id="skillField" value="fieldwork" checked={quizSkill === 'fieldwork'} onChange={() => setQuizSkill('fieldwork')} />
                  <label htmlFor="skillField" className="quiz-option-label">
                    <i className="fa-solid fa-truck-ramp-box"></i>
                    <span>{t('opt-fieldwork')}</span>
                  </label>
                </div>
                <div className="quiz-option">
                  <input type="radio" name="skill" id="skillSocial" value="creative" checked={quizSkill === 'creative'} onChange={() => setQuizSkill('creative')} />
                  <label htmlFor="skillSocial" className="quiz-option-label">
                    <i className="fa-solid fa-hashtag"></i>
                    <span>{t('opt-creative')}</span>
                  </label>
                </div>
                <div className="quiz-option">
                  <input type="radio" name="skill" id="skillAdmin" value="admin" checked={quizSkill === 'admin'} onChange={() => setQuizSkill('admin')} />
                  <label htmlFor="skillAdmin" className="quiz-option-label">
                    <i className="fa-solid fa-briefcase"></i>
                    <span>{t('opt-admin')}</span>
                  </label>
                </div>
              </div>
              <div className="quiz-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setQuizStep(2)}>{t('quiz-next')} &nbsp; <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          )}
          
          {/* STEP 2: TIME */}
          {quizStep === 2 && (
            <div className="quiz-step active">
              <h3 className="quiz-title">{t('quiz-q2')}</h3>
              <div className="options-grid">
                <div className="quiz-option">
                  <input type="radio" name="time" id="timeLow" value="2hrs" checked={quizTime === '2hrs'} onChange={() => setQuizTime('2hrs')} />
                  <label htmlFor="timeLow" className="quiz-option-label">
                    <i className="fa-regular fa-clock"></i>
                    <span>{t('opt-2hrs')}</span>
                  </label>
                </div>
                <div className="quiz-option">
                  <input type="radio" name="time" id="timeMid" value="5hrs" checked={quizTime === '5hrs'} onChange={() => setQuizTime('5hrs')} />
                  <label htmlFor="timeMid" className="quiz-option-label">
                    <i className="fa-solid fa-hourglass-half"></i>
                    <span>{t('opt-5hrs')}</span>
                  </label>
                </div>
                <div className="quiz-option">
                  <input type="radio" name="time" id="timeWeekend" value="weekend" checked={quizTime === 'weekend'} onChange={() => setQuizTime('weekend')} />
                  <label htmlFor="timeWeekend" className="quiz-option-label">
                    <i className="fa-solid fa-calendar-day"></i>
                    <span>{t('opt-weekend')}</span>
                  </label>
                </div>
                <div className="quiz-option">
                  <input type="radio" name="time" id="timeFull" value="any" checked={quizTime === 'any'} onChange={() => setQuizTime('any')} />
                  <label htmlFor="timeFull" className="quiz-option-label">
                    <i className="fa-solid fa-bolt"></i>
                    <span>{t('opt-anytime')}</span>
                  </label>
                </div>
              </div>
              <div className="quiz-actions">
                <button className="btn btn-outline" onClick={() => setQuizStep(1)}><i className="fa-solid fa-arrow-left"></i> {t('quiz-back')}</button>
                <button className="btn btn-primary" onClick={() => setQuizStep(3)}>{t('quiz-next')} &nbsp; <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          )}
          
          {/* STEP 3: LOCATION */}
          {quizStep === 3 && (
            <div className="quiz-step active">
              <h3 className="quiz-title">{t('quiz-q3')}</h3>
              <div className="options-grid">
                <div className="quiz-option">
                  <input type="radio" name="loc" id="locUP" value="up" checked={quizLoc === 'up'} onChange={() => setQuizLoc('up')} />
                  <label htmlFor="locUP" className="quiz-option-label">
                    <i className="fa-solid fa-map-location-dot"></i>
                    <span>{t('opt-up')}</span>
                  </label>
                </div>
                <div className="quiz-option">
                  <input type="radio" name="loc" id="locRemote" value="remote" checked={quizLoc === 'remote'} onChange={() => setQuizLoc('remote')} />
                  <label htmlFor="locRemote" className="quiz-option-label">
                    <i className="fa-solid fa-laptop-house"></i>
                    <span>{t('opt-remote')}</span>
                  </label>
                </div>
              </div>
              <div className="quiz-actions">
                <button className="btn btn-outline" onClick={() => setQuizStep(2)}><i className="fa-solid fa-arrow-left"></i> {t('quiz-back')}</button>
                <button className="btn btn-success" onClick={handleCalculateMatch}>{t('quiz-submit')} &nbsp; <i className="fa-solid fa-square-poll-vertical"></i></button>
              </div>
            </div>
          )}
          
          {/* STEP 4: RESULT */}
          {quizStep === 4 && (
            <div className="quiz-step active">
              <div className="quiz-result">
                <i className="fa-solid fa-circle-check" style={{ fontSize: '3.5rem', color: 'var(--success-color)', marginBottom: '1.5rem' }}></i>
                <h3>{t('quiz-match-found')}</h3>
                <span className="result-badge">{recRoleBadge}</span>
                <p style={{ marginBottom: '2rem' }}>{recRoleDesc}</p>
                
                <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-alt)' }}>
                  <h4 style={{ marginBottom: '1rem' }}>{t('quiz-signup-title')}</h4>
                  
                  {!quizSignedUp ? (
                    <form onSubmit={handleQuizSubmit}>
                      <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.9rem' }}>{t('form-name')}</label>
                        <input type="text" required className="select-box" placeholder="e.g. Ramesh Kumar" value={vName} onChange={(e) => setVName(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.9rem' }}>{t('form-phone')}</label>
                        <input type="tel" required className="select-box" placeholder="e.g. 9876543210" value={vPhone} onChange={(e) => setVPhone(e.target.value)} />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('form-submit')}</button>
                    </form>
                  ) : (
                    <div style={{ color: 'var(--success-color)', fontWeight: 600, marginTop: '1rem' }}>
                      {t('signup-success')}
                    </div>
                  )}
                </div>
                
                <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={handleRestartQuiz}>{t('quiz-restart')}</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==================== AFFILIATION TRUST SECTION ==================== */}
      <section style={{ backgroundColor: 'var(--bg-alt)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }} id="trust">
        <div className="container">
          <h2 className="section-title">{t('title-trust')}</h2>
          
          <div className="trust-grid">
            <div className="card trust-card">
              <div className="trust-icon"><i className="fa-solid fa-award"></i></div>
              <h3>{t('trust-reg-title')}</h3>
              <p>{t('trust-reg-desc')}</p>
            </div>
            <div className="card trust-card">
              <div className="trust-icon"><i className="fa-solid fa-file-invoice-dollar"></i></div>
              <h3>{t('trust-80g-title')}</h3>
              <p>{t('trust-80g-desc')}</p>
            </div>
            <div className="card trust-card">
              <div className="trust-icon"><i className="fa-solid fa-shield-check"></i></div>
              <h3>{t('trust-12a-title')}</h3>
              <p>{t('trust-12a-desc')}</p>
            </div>
            <div className="card trust-card">
              <div className="trust-icon"><i className="fa-solid fa-chart-line-up"></i></div>
              <h3>{t('trust-audit-title')}</h3>
              <p>{t('trust-audit-desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== USER ACCOUNT MODAL OVERLAY ==================== */}
      {user && userModalOpen && (
        <div className="user-modal active" id="userModal">
          <div className="user-modal-card">
            <button className="user-modal-close" onClick={() => setUserModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <i className="fa-solid fa-circle-user" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
              <h3 style={{ marginTop: '0.5rem' }}>{t('title-user-profile')}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{t('sub-user-profile')}</p>
            </div>

            <div className="user-profile-details">
              <div className="user-detail-item">
                <h5>{t('prof-name')}</h5>
                <p>{user.name}</p>
              </div>
              <div className="user-detail-item">
                <h5>{t('prof-email')}</h5>
                <p>{user.email}</p>
              </div>
              <div className="user-detail-item">
                <h5>{t('prof-whatsapp')}</h5>
                <p>{user.phone}</p>
              </div>
              <div className="user-detail-item">
                <h5>{t('prof-role')}</h5>
                <p>{matchedRole || t('role-unregistered')}</p>
              </div>
            </div>

            <h4 style={{ marginBottom: '0.75rem', textAlign: 'left' }}>{t('title-user-donations')}</h4>
            
            <div className="user-donations-list">
              {userDonations.length > 0 ? (
                userDonations.map((d, idx) => {
                  const campKey = d.campaignKey || 'general';
                  const campaignName = t(`camp-${campKey}`);
                  const receiptId = `NP-${d.date.replace(/-/g, '')}-${d.amount}-${idx + 101}`;
                  
                  let progress = 100;
                  let statusText = lang === 'hi' ? '100% उपयोग किया गया' : '100% Fully Utilized';
                  let locationText = lang === 'hi' ? 'कानपुर देहात, उत्तर प्रदेश' : 'Kanpur Dehat, Uttar Pradesh';
                  let outcomeText = '';

                  if (campKey === 'edu') {
                    progress = 100;
                    statusText = lang === 'hi' ? '100% आवंटित व वितरित' : '100% Distributed';
                    locationText = lang === 'hi' ? 'प्राथमिक विद्यालय, ब्लॉक 3, लखनऊ' : 'Primary School, Block 3, Lucknow';
                    outcomeText = lang === 'hi'
                      ? `आपके ₹${d.amount.toLocaleString('en-IN')} के दान से ${Math.floor(d.amount / 500)} बच्चों को स्कूल बैग, किताबें और स्टेशनरी सामग्री वितरित की गई।`
                      : `Your donation of ₹${d.amount.toLocaleString('en-IN')} sponsored study kits (bags, books, pencils) for ${Math.floor(d.amount / 500)} rural students.`;
                  } else if (campKey === 'food') {
                    progress = 90;
                    statusText = lang === 'hi' ? '90% भोजन वितरण पूर्ण' : '90% Distributed';
                    locationText = lang === 'hi' ? 'कानपुर स्लम एरिया पॉकेट्स' : 'Kanpur Slum Outreach Areas';
                    outcomeText = lang === 'hi'
                      ? `आपके ₹${d.amount.toLocaleString('en-IN')} के दान से ${Math.floor(d.amount / 50)} जरूरतमंद लोगों को ताजा गरम भोजन परोसा गया।`
                      : `Your donation of ₹${d.amount.toLocaleString('en-IN')} provided freshly cooked nutritious meals to ${Math.floor(d.amount / 50)} underprivileged people.`;
                  } else if (campKey === 'hygiene') {
                    progress = 95;
                    statusText = lang === 'hi' ? '95% वितरित (सक्रिय अभियान)' : '95% Distributed (Active Campaign)';
                    locationText = lang === 'hi' ? 'उन्नाव ग्रामीण कन्या विद्यालय' : 'Unnao Rural Girls High Schools';
                    outcomeText = lang === 'hi'
                      ? `आपके ₹${d.amount.toLocaleString('en-IN')} के दान से ग्रामीण छात्राओं के बीच ${Math.floor(d.amount / 40)} हाइजीन किट (सेनेटरी पैड) बांटे गए।`
                      : `Your donation of ₹${d.amount.toLocaleString('en-IN')} funded ${Math.floor(d.amount / 40)} sanitary hygiene packs for rural school girls.`;
                  } else {
                    progress = 100;
                    statusText = lang === 'hi' ? '100% उपयोग किया गया' : '100% Fully Deployed';
                    locationText = lang === 'hi' ? 'उत्तर प्रदेश ग्रामीण कल्याण अभियान' : 'UP Rural Welfare Camps';
                    outcomeText = lang === 'hi'
                      ? `सामान्य राहत कोष के माध्यम से यह राशि गरीब परिवारों में सर्दियों के कपड़े, कम्बल और दवा वितरण में उपयोग की गई।`
                      : `Funds deployed to general welfare drives including distribution of winter blankets, clothes, and emergency medicines.`;
                  }

                  const toggleId = `acc-${idx}`;
                  const isAccordionActive = activeAccordionId === toggleId;

                  return (
                    <div key={idx} className="user-donation-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem', padding: '0.75rem', marginBottom: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-light)' }}>{d.date}</span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary-color)', marginTop: '0.1rem' }}>
                            ₹ {d.amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <span className="badge" style={{ backgroundColor: progress === 100 ? 'var(--success-bg)' : '#fef3c7', color: progress === 100 ? 'var(--success-color)' : '#b45309', fontSize: '0.75rem', textTransform: 'none', borderRadius: '4px' }}>
                          {statusText}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600, marginTop: '0.1rem' }}>
                        <i className="fa-solid fa-circle-info"></i> {t('allocated-to')} {campaignName}
                      </div>

                      <button
                        onClick={() => setActiveAccordionId(isAccordionActive ? null : toggleId)}
                        className="btn-util-toggle"
                        style={{ background: 'none', border: 'none', padding: '0.25rem 0', fontSize: '0.8rem', color: 'var(--info-color)', fontWeight: 600, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', minHeight: 'auto', width: 'max-content' }}
                      >
                        <span className="toggle-text">{isAccordionActive ? t('btn-hide-utilization-details') : t('btn-view-utilization-details')}</span>
                        <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem', transition: 'transform 0.2s', transform: isAccordionActive ? 'rotate(180deg)' : 'rotate(0deg)' }}></i>
                      </button>

                      {isAccordionActive && (
                        <div className="utilization-details" style={{ display: 'flex', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-dark)', flexDirection: 'column', gap: '0.4rem' }}>
                          <div>
                            <strong style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.7rem', display: 'block' }}>{t('util-project')}</strong>
                            <span style={{ fontWeight: 500 }}><i className="fa-solid fa-location-dot" style={{ color: '#ef4444', marginRight: '0.25rem' }}></i> {locationText}</span>
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.7rem', display: 'block' }}>{t('util-impact')}</strong>
                            <span style={{ fontWeight: 500 }}><i className="fa-solid fa-seedling" style={{ color: 'var(--success-color)', marginRight: '0.25rem' }}></i> {outcomeText}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', backgroundColor: 'var(--bg-alt)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            <div>
                              <strong style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>{t('util-receipt-id')}</strong>
                              <code style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: 700 }}>{receiptId}</code>
                            </div>
                            <a href="#" onClick={(e) => { e.preventDefault(); alert(lang === 'hi' ? 'आपकी 80G टैक्स रसीद (PDF) डाउनलोड हो रही है...' : 'Downloading your official 80G tax receipt PDF...'); }} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
                              <i className="fa-solid fa-file-pdf"></i> Receipt
                            </a>
                          </div>
                          
                          <div style={{ marginTop: '0.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.15rem', color: 'var(--text-light)' }}>
                              <span>{t('util-progress')}</span>
                              <span>{progress}%</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--success-color)', borderRadius: '4px' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                  {t('no-donations-yet')}
                </p>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => { onLogout(); setUserModalOpen(false); }}>{t('btn-logout')}</button>
              <a href="#calculator" className="btn btn-primary" style={{ flex: 1 }} onClick={(e) => { e.preventDefault(); setUserModalOpen(false); document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' }); }}>{t('btn-calc-nav')}</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
