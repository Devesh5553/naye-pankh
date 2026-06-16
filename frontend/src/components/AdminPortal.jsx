import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { API_BASE_URL } from '../config';

const mockDonations = [
  { name: 'Ramesh Kumar', date: '2026-06-15', amount: 15000, method: 'UPI (Paytm)', status: 'Successful', campaignKey: 'edu' },
  { name: 'Shubham Tripathi', date: '2026-06-14', amount: 5000, method: 'NetBanking', status: 'Successful', campaignKey: 'food' },
  { name: 'Priya Agarwal', date: '2026-06-12', amount: 2500, method: 'Credit Card', status: 'Successful', campaignKey: 'hygiene' },
  { name: 'Dr. Vivek Mishra', date: '2026-06-10', amount: 50000, method: 'UPI (GPay)', status: 'Successful', campaignKey: 'edu' },
  { name: 'Ankita Gupta', date: '2026-06-08', amount: 1000, method: 'Debit Card', status: 'Successful', campaignKey: 'hygiene' },
  { name: 'Rajesh Yadav', date: '2026-06-06', amount: 12000, method: 'UPI (PhonePe)', status: 'Successful', campaignKey: 'edu' },
  { name: 'Sunita Sharma', date: '2026-06-05', amount: 3000, method: 'NetBanking', status: 'Pending', campaignKey: 'food' },
  { name: 'Aman Deep', date: '2026-06-04', amount: 7500, method: 'Credit Card', status: 'Successful', campaignKey: 'edu' },
  { name: 'Neha Chaurasia', date: '2026-06-02', amount: 4500, method: 'UPI (GPay)', status: 'Successful', campaignKey: 'food' },
  { name: 'Karan Malhotra', date: '2026-06-01', amount: 8000, method: 'UPI (Paytm)', status: 'Pending', campaignKey: 'edu' }
];

const mockVolunteers = [
  { date: '2026-06-15 11:24', name: 'Amit Trivedi', phone: '9876543210', role: 'Rural Education Mentor', time: 'Weekend Drives', loc: 'On-field (UP)' },
  { date: '2026-06-14 16:40', name: 'Shalini Mishra', phone: '8877665544', role: 'Digital Advocacy Catalyst', time: '3-5 Hours / Week', loc: 'Remote (WFH)' },
  { date: '2026-06-12 10:15', name: 'Kabir Dev', phone: '7766554433', role: 'Grassroots Relief Lead', time: 'Weekend Drives', loc: 'On-field (UP)' },
  { date: '2026-06-10 14:02', name: 'Ritu Jaiswal', phone: '9900887766', role: 'Campaign Operations Coordinator', time: '1-2 Hours / Week', loc: 'Remote (WFH)' }
];

const mockBotLogs = [
  { timestamp: '2026-06-15 14:05', message: 'how to volunteer?', lang: 'EN', keyword: 'volunteer', reply: 'We welcome you to join...' },
  { timestamp: '2026-06-15 12:12', message: 'दान कैसे करें?', lang: 'HI', keyword: 'donate', reply: 'दान करने के लिए...' },
  { timestamp: '2026-06-14 18:22', message: '80G tax exemption details', lang: 'EN', keyword: '80g', reply: 'NayePankh Foundation is...' },
  { timestamp: '2026-06-14 11:55', message: 'रजिस्ट्रेशन नंबर बताएं', lang: 'HI', keyword: 'registration', reply: 'जी हाँ, नयेपंख पूरी तरह...' },
  { timestamp: '2026-06-13 16:30', message: 'what is phone number', lang: 'EN', keyword: 'Unknown', reply: 'I am sorry, I could not...' }
];

export const AdminPortal = ({ onLogout, setView }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Loaded database arrays
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [botLogs, setBotLogs] = useState([]);

  // Search & Filter state
  const [donationSearch, setDonationSearch] = useState('');
  const [donationFilter, setDonationFilter] = useState('all');
  const [donationSort, setDonationSort] = useState('date-new');

  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [volunteerSort, setVolunteerSort] = useState('date-new');

  const [botSearch, setBotSearch] = useState('');

  // Canvas Refs
  const trendCanvasRef = useRef(null);
  const paymentCanvasRef = useRef(null);
  const rolesCanvasRef = useRef(null);

  // Chart Instance Refs
  const trendChartRef = useRef(null);
  const paymentChartRef = useRef(null);
  const rolesChartRef = useRef(null);

  // Authenticate session and fetch bot logs on mount / activeTab change
  useEffect(() => {
    const isAdmin = sessionStorage.getItem('nayepankh_admin_login');
    if (isAdmin !== 'true') {
      setView('login');
      return;
    }

    fetch(`${API_BASE_URL}/api/botlogs`)
      .then(res => res.json())
      .then(data => setBotLogs(data))
      .catch(err => console.error(err));
  }, [setView, activeTab]);

  // Fetch Donations when sort/filter criteria change
  useEffect(() => {
    const isAdmin = sessionStorage.getItem('nayepankh_admin_login');
    if (isAdmin !== 'true') return;

    fetch(`${API_BASE_URL}/api/donations?sort=${donationSort}&status=${donationFilter}&search=${encodeURIComponent(donationSearch)}`)
      .then(res => res.json())
      .then(data => setDonations(data))
      .catch(err => console.error(err));
  }, [donationSort, donationFilter, donationSearch]);

  // Fetch Volunteers when sort/filter criteria change
  useEffect(() => {
    const isAdmin = sessionStorage.getItem('nayepankh_admin_login');
    if (isAdmin !== 'true') return;

    fetch(`${API_BASE_URL}/api/volunteers?sort=${volunteerSort}&search=${encodeURIComponent(volunteerSearch)}`)
      .then(res => res.json())
      .then(data => setVolunteers(data))
      .catch(err => console.error(err));
  }, [volunteerSort, volunteerSearch]);

  // Handle overview charts rendering
  useEffect(() => {
    if (activeTab !== 'overview' || donations.length === 0) return;

    // Line Chart
    if (trendCanvasRef.current) {
      if (trendChartRef.current) trendChartRef.current.destroy();
      trendChartRef.current = new Chart(trendCanvasRef.current, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Donations (₹)',
            data: [45000, 60000, 85000, 110000, 145000, 195000],
            borderColor: '#ea580c',
            backgroundColor: 'rgba(234, 88, 12, 0.05)',
            fill: true,
            tension: 0.3,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    // Pie Chart
    if (paymentCanvasRef.current) {
      if (paymentChartRef.current) paymentChartRef.current.destroy();
      const methodsMap = {};
      donations.forEach(d => {
        const cat = d.method.startsWith('UPI') ? 'UPI Payment' : d.method;
        methodsMap[cat] = (methodsMap[cat] || 0) + 1;
      });

      paymentChartRef.current = new Chart(paymentCanvasRef.current, {
        type: 'pie',
        data: {
          labels: Object.keys(methodsMap),
          datasets: [{
            data: Object.values(methodsMap),
            backgroundColor: ['#ea580c', '#16a34a', '#2563eb', '#64748b', '#fb923c', '#cbd5e1']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    }

    // Bar Chart
    if (rolesCanvasRef.current) {
      if (rolesChartRef.current) rolesChartRef.current.destroy();
      const rolesMap = {
        'Rural Education Mentor': 0,
        'Grassroots Relief Lead': 0,
        'Digital Advocacy Catalyst': 0,
        'Campaign Operations Coordinator': 0
      };

      volunteers.forEach(v => {
        let r = v.role;
        if (r.includes('Mentor') || r.includes('मार्गदर्शक')) r = 'Rural Education Mentor';
        else if (r.includes('Relief') || r.includes('नायक')) r = 'Grassroots Relief Lead';
        else if (r.includes('Advocacy') || r.includes('दूत')) r = 'Digital Advocacy Catalyst';
        else if (r.includes('Operations') || r.includes('प्रबंधन')) r = 'Campaign Operations Coordinator';
        rolesMap[r] = (rolesMap[r] || 0) + 1;
      });

      rolesChartRef.current = new Chart(rolesCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['Education Mentor', 'Relief Drives', 'Digital Creator', 'Operations Admin'],
          datasets: [{
            label: 'Volunteers Count',
            data: Object.values(rolesMap),
            backgroundColor: '#2563eb',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }

    return () => {
      if (trendChartRef.current) trendChartRef.current.destroy();
      if (paymentChartRef.current) paymentChartRef.current.destroy();
      if (rolesChartRef.current) rolesChartRef.current.destroy();
    };
  }, [activeTab, donations, volunteers]);

  // Aggregate Metrics
  const successfulDonations = donations.filter(d => d.status === 'Successful');
  const totalRaised = successfulDonations.reduce((sum, d) => sum + d.amount, 0);
  const avgDonation = successfulDonations.length > 0 ? (totalRaised / successfulDonations.length) : 0;

  // sorting controllers
  const getSortedDonations = () => donations;
  const getSortedVolunteers = () => volunteers;

  const getFilteredBotLogs = () => {
    return botLogs.filter(log => {
      const query = botSearch.toLowerCase();
      return log.message.toLowerCase().includes(query) || log.reply.toLowerCase().includes(query) || log.keyword.toLowerCase().includes(query);
    });
  };

  // CSV Exporters
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDonationsToCSV = () => {
    let csv = 'Donor Name,Date,Amount,80G Deductible,Tax Savings,Net Cost,Payment Method,Status\n';
    donations.forEach(d => {
      const deductible = d.amount * 0.5;
      const savings = deductible * 0.2;
      const net = d.amount - savings;
      csv += `"${d.name}","${d.date}",${d.amount},${deductible},${savings},${net},"${d.method}","${d.status}"\n`;
    });
    downloadCSV(csv, 'nayepankh_donations.csv');
  };

  const exportVolunteersToCSV = () => {
    let csv = 'Date,Full Name,WhatsApp,Matched Role,Time Commitment,Location Preference\n';
    volunteers.forEach(v => {
      csv += `"${v.date}","${v.name}","${v.phone}","${v.role}","${v.time}","${v.loc}"\n`;
    });
    downloadCSV(csv, 'nayepankh_volunteers.csv');
  };

  const handleClearBotLogs = async () => {
    if (window.confirm('Are you sure you want to clear the logs history?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/botlogs/clear`, {
          method: 'POST'
        });
        if (response.ok) {
          const res = await fetch(`${API_BASE_URL}/api/botlogs`);
          const data = await res.json();
          setBotLogs(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('nayepankh_admin_login');
    onLogout();
    setView('login');
  };

  const campaignNames = {
    edu: 'Rural Literacy (School Kits)',
    food: 'Community Food (Kanpur Slums)',
    hygiene: 'Women Hygiene (Sanitary Pads)',
    general: 'General Community Welfare'
  };

  return (
    <div className="admin-container" id="adminPanel" style={{ display: 'flex' }}>
      
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=192,h=192,fit=crop,f=png/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="Logo" style={{ height: '30px', borderRadius: '50%' }} />
          <span>NayePankh Admin</span>
        </div>
        
        <ul className="admin-menu">
          <li className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <i className="fa-solid fa-chart-pie"></i> Overview & Charts
          </li>
          <li className={`admin-menu-item ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>
            <i className="fa-solid fa-hand-holding-dollar"></i> Donations Log
          </li>
          <li className={`admin-menu-item ${activeTab === 'volunteers' ? 'active' : ''}`} onClick={() => setActiveTab('volunteers')}>
            <i className="fa-solid fa-users"></i> Volunteers List
          </li>
          <li className={`admin-menu-item ${activeTab === 'botlogs' ? 'active' : ''}`} onClick={() => setActiveTab('botlogs')}>
            <i className="fa-solid fa-clipboard-list"></i> AI Chatbot Logs
          </li>
        </ul>
        
        <div style={{ marginTop: 'auto', padding: '0 2rem' }}>
          <button className="btn btn-outline" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleAdminLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>
              {activeTab === 'overview' && 'Overview & Performance Metrics'}
              {activeTab === 'donations' && 'Donation Transactions Database'}
              {activeTab === 'volunteers' && 'Volunteering Applications'}
              {activeTab === 'botlogs' && 'AI Chatbot Inquiries Logs'}
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>Welcome back, System Administrator</p>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', padding: '0.5rem 1rem', borderRadius: '50px' }}>
            <i className="fa-solid fa-circle-check"></i> System Connected
          </div>
        </header>

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="admin-panel-tab active">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-info">
                  <h4>Total Donations</h4>
                  <span className="metric-number">₹ {totalRaised.toLocaleString('en-IN')}</span>
                </div>
                <div className="metric-icon"><i class="fa-solid fa-coins"></i></div>
              </div>
              <div className="metric-card">
                <div className="metric-info">
                  <h4>Active Volunteers</h4>
                  <span className="metric-number">{volunteers.length}</span>
                </div>
                <div className="metric-icon"><i class="fa-solid fa-user-plus"></i></div>
              </div>
              <div className="metric-card">
                <div className="metric-info">
                  <h4>Average Contribution</h4>
                  <span className="metric-number">₹ {Math.round(avgDonation).toLocaleString('en-IN')}</span>
                </div>
                <div className="metric-icon"><i class="fa-solid fa-chart-line"></i></div>
              </div>
              <div className="metric-card">
                <div className="metric-info">
                  <h4>AI Queries Handled</h4>
                  <span className="metric-number">{botLogs.length}</span>
                </div>
                <div className="metric-icon"><i class="fa-solid fa-message"></i></div>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                  <i className="fa-solid fa-chart-line" style={{ color: 'var(--primary-color)' }}></i> Monthly Donation Trends (Past 6 Months)
                </h3>
                <div className="chart-wrapper">
                  <canvas ref={trendCanvasRef}></canvas>
                </div>
              </div>
              
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                  <i className="fa-solid fa-circle-notch" style={{ color: 'var(--primary-color)' }}></i> Donation Methods Distribution
                </h3>
                <div className="chart-wrapper">
                  <canvas ref={paymentCanvasRef}></canvas>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                <i className="fa-solid fa-users-viewfinder" style={{ color: 'var(--primary-color)' }}></i> Volunteer Enrolments by Recommendation Fit Role
              </h3>
              <div className="chart-wrapper" style={{ height: '250px' }}>
                <canvas ref={rolesCanvasRef}></canvas>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: DONATIONS DATABASE ==================== */}
        {activeTab === 'donations' && (
          <div className="admin-panel-tab active">
            <div className="admin-card-header">
              <h3 style={{ fontSize: '1.25rem' }}>Donation Transactions Database</h3>
              <button className="btn btn-success" onClick={exportDonationsToCSV}><i className="fa-solid fa-download"></i> Export as CSV</button>
            </div>
            
            <div className="admin-table-filters">
              <input
                type="text"
                className="select-box search-input"
                placeholder="Search by name, slab, status..."
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
              />
              <select className="select-box" style={{ maxWidth: '180px' }} value={donationFilter} onChange={(e) => setDonationFilter(e.target.value)}>
                <option value="all">All Transactions</option>
                <option value="Successful">Successful</option>
                <option value="Pending">Pending</option>
              </select>
              <select className="select-box" style={{ maxWidth: '240px' }} value={donationSort} onChange={(e) => setDonationSort(e.target.value)}>
                <option value="date-new">Sort: Date (Newest first)</option>
                <option value="date-old">Sort: Date (Oldest first)</option>
                <option value="amount-high">Sort: Amount (High to Low)</option>
                <option value="amount-low">Sort: Amount (Low to High)</option>
                <option value="freq-high">Sort: Donor Loyalty (Most Frequent)</option>
                <option value="total-high">Sort: Donor Aggregate (Highest Total)</option>
              </select>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Date</th>
                    <th>Amount (₹)</th>
                    <th>80G Deductible (50%)</th>
                    <th>Tax Saved</th>
                    <th>Actual Net Cost</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedDonations().map((d, i) => {
                    const deductible = d.amount * 0.5;
                    const taxSaved = deductible * 0.20;
                    const netCost = d.amount - taxSaved;
                    const targetText = campaignNames[d.campaignKey || 'general'] || 'General Welfare';

                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>
                          {d.name}
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600, marginTop: '0.15rem' }}>
                            <i className="fa-solid fa-circle-info"></i> Target: {targetText}
                          </div>
                        </td>
                        <td>{d.date}</td>
                        <td style={{ fontWeight: 700 }}>₹ {d.amount.toLocaleString('en-IN')}</td>
                        <td>₹ {deductible.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 600 }}>₹ {taxSaved.toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 700 }}>₹ {netCost.toLocaleString('en-IN')}</td>
                        <td>{d.method}</td>
                        <td>
                          <span className={`status-indicator ${d.status === 'Successful' ? 'status-success' : 'status-pending'}`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: VOLUNTEERS Applications ==================== */}
        {activeTab === 'volunteers' && (
          <div className="admin-panel-tab active">
            <div className="admin-card-header">
              <h3 style={{ fontSize: '1.25rem' }}>Volunteer Registrations (Live Submissions Link)</h3>
              <button className="btn btn-success" onClick={exportVolunteersToCSV}><i className="fa-solid fa-download"></i> Export as CSV</button>
            </div>
            
            <div className="admin-table-filters">
              <input
                type="text"
                className="select-box search-input"
                placeholder="Search by Name, Role, Location..."
                value={volunteerSearch}
                onChange={(e) => setVolunteerSearch(e.target.value)}
              />
              <select className="select-box" style={{ maxWidth: '240px' }} value={volunteerSort} onChange={(e) => setVolunteerSort(e.target.value)}>
                <option value="date-new">Sort: Application Date (Newest)</option>
                <option value="date-old">Sort: Application Date (Oldest)</option>
                <option value="name-asc">Sort: Full Name (A to Z)</option>
                <option value="commit-high">Sort: Commitment (High to Low)</option>
              </select>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Full Name</th>
                    <th>WhatsApp Contact</th>
                    <th>Recommended Role</th>
                    <th>Commitment Time</th>
                    <th>Location Pref</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedVolunteers().map((v, i) => {
                    const cleanPhone = v.phone.replace(/\D/g, '');
                    return (
                      <tr key={i}>
                        <td>{v.date}</td>
                        <td style={{ fontWeight: 600 }}>{v.name}</td>
                        <td>
                          <a href={`https://wa.me/91${cleanPhone}`} target="_blank" rel="noreferrer" style={{ color: 'var(--success-color)', fontWeight: 600 }} aria-label="WhatsApp chat">
                            <i className="fa-brands fa-whatsapp"></i> {v.phone}
                          </a>
                        </td>
                        <td><span className="badge badge-info">{v.role}</span></td>
                        <td>{v.time}</td>
                        <td>{v.loc}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: BOT LOGS ==================== */}
        {activeTab === 'botlogs' && (
          <div className="admin-panel-tab active">
            <div className="admin-card-header">
              <h3 style={{ fontSize: '1.25rem' }}>Chatbot Live Interaction Logs</h3>
              <button className="btn btn-outline" onClick={handleClearBotLogs} style={{ borderColor: '#ef4444', color: '#ef4444' }}><i className="fa-solid fa-trash-can"></i> Clear Logs</button>
            </div>
            
            <div className="admin-table-filters">
              <input
                type="text"
                className="select-box search-input"
                placeholder="Search user message..."
                value={botSearch}
                onChange={(e) => setBotSearch(e.target.value)}
              />
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User Inquiry Message</th>
                    <th>Inquiry Language</th>
                    <th>Matched Keyword</th>
                    <th>AI Bot Response</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredBotLogs().map((log, i) => (
                    <tr key={i}>
                      <td>{log.timestamp}</td>
                      <td style={{ fontWeight: 600 }}>{log.message}</td>
                      <td><span className="badge" style={{ backgroundColor: '#e2e8f0', color: 'var(--text-dark)' }}>{log.lang}</span></td>
                      <td><code>{log.keyword}</code></td>
                      <td><div className="bot-log-bubble">{log.reply}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
