import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Mic, ChevronDown, CheckCircle, Info, Clock, X, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotifications } from '../store/interactionSlice';

const pageData = {
  '/': { title: 'Territory Overview', sub: 'Performance Dashboard' },
  '/log': { title: 'Log Interaction', sub: 'HCP Visit Logging' },
  '/insights': { title: 'Analytics & Insights', sub: 'Market Intelligence' },
};

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const current = pageData[location.pathname] || { title: 'MedSync AI', sub: 'HCP CRM' };
  const [isListening, setIsListening] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const { notifications } = useSelector(state => state.interactions);
  const { items, unreadCount } = notifications;

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{current.title}</h1>
            <p>{current.sub}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) dispatch(clearNotifications()); }}>
              <Bell size={22} color="#64748b" />
              {unreadCount > 0 && (
                <div style={{ 
                  position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', 
                  color: 'white', fontSize: '10px', fontWeight: '800', 
                  width: '18px', height: '18px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white' 
                }}>
                  {unreadCount}
                </div>
              )}

              {showNotifs && (
                <div style={{ 
                  position: 'absolute', top: '40px', right: '0', background: 'white', 
                  width: '320px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                  zIndex: 1000, border: '1px solid #f1f5f9', padding: '0'
                }} onClick={e => e.stopPropagation()}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Notifications</h4>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowNotifs(false)}><X size={16} /></button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {items.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>No new notifications</div>
                    ) : (
                      items.slice(0, 5).map((n, i) => (
                        <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '12px' }}>
                          <div style={{ 
                            background: n.type === 'reminder' ? '#fef2f2' : '#f0f9ff', 
                            padding: '8px', borderRadius: '8px', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {n.type === 'reminder' ? <Clock size={16} color="#ef4444" /> : <Info size={16} color="#0ea5e9" />}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{n.title}</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link 
                    to="/notifications" 
                    onClick={() => setShowNotifs(false)}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '14px', fontSize: '13px', fontWeight: '600', color: '#4f46e5',
                      textDecoration: 'none', background: '#f8fafc', borderTop: '1px solid #f1f5f9',
                      borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px'
                    }}
                  >
                    View All Notifications <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => navigate('/settings')}
            >
               <img 
                 src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander&backgroundColor=b6e3f4" 
                 style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #e2e8f0' }}
                 alt="p"
               />
               <div style={{ display: 'none' }}>
                 <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Alexander Rep</p>
                 <ChevronDown size={14} color="#94a3b8" />
               </div>
            </div>
          </div>
        </header>

        <main className="page-container">
          {children}
        </main>
      </div>

      <button 
        className={`voice-fab ${isListening ? 'voice-listening' : ''}`}
        onClick={() => setIsListening(!isListening)}
      >
        <Mic size={24} />
      </button>
    </div>
  );
};

export default Layout;
