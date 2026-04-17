import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout';
import LogInteraction from './components/LogInteraction';
import Insights from './components/Insights';
import { Toaster, toast } from 'react-hot-toast';
import { fetchInteractions, fetchReminders, fetchInsights, editInteraction, deleteInteraction, fetchProfile, updateProfile, setSearchQuery, checkUpcomingFollowups } from './store/interactionSlice';
import { 
  Users, 
  Target, 
  Activity, 
  Award, 
  Sparkles,
  ArrowRight,
  Plus,
  Settings,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Search,
  Eye,
  FileText,
  Smile,
  Meh,
  Frown,
  BellRing,
  Trash,
  Bell,
  Clock,
  CalendarCheck
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, reminders, insights } = useSelector(state => state.interactions);

  useEffect(() => {
    dispatch(fetchInteractions()).then(() => {
      dispatch(checkUpcomingFollowups());
    });
    dispatch(fetchReminders());
    dispatch(fetchInsights());
    dispatch(fetchProfile());
  }, [dispatch]);

  const upcomingReminders = reminders?.filter(r => r.status === 'pending') || [];

  const [viewingItem, setViewingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleDelete = async (id) => {
    setIsDeleting(id);
    await dispatch(deleteInteraction(id));
    dispatch(fetchInsights());
    setIsDeleting(null);
    setDeleteConfirmId(null);
    toast.success('Interaction deleted successfully');
  };

  // Editing now handled in LogInteraction route

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Daily Performance</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Territory Alpha · Rep Alexander</p>
        </div>
        <button className="btn-p" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/log')}>
          <Plus size={18} />
          New Interaction
        </button>
      </div>

      <div className="grid-stats">
        <StatCard label="Total Interactions" val={insights?.total_interactions || 0} trend="+14% this month" icon={<Users color="#4f46e5" size={20}/>} />
        <StatCard label="Cycle Target" val="88%" trend="Ahead of schedule" icon={<Target color="#0ea5e9" size={20}/>} />
        <StatCard label="Pending Reminders" val={insights?.upcoming_followups || 0} trend="Requires action" icon={<Activity color="#10b981" size={20}/>} />
        <StatCard label="Overdue" val={insights?.overdue_followups || 0} trend="Urgent" icon={<Award color="#f59e0b" size={20}/>} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
        <div className="data-box">
          <div className="data-box-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Recent Interaction Logs</h3>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#4f46e5', cursor: 'pointer' }} onClick={() => navigate('/interactions')}>View Ledger</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>HCP Name</th>
                <th>Facility</th>
                <th>Channel</th>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list && list.length > 0 ? (
                list.slice(0, 5).map((h, i) => (
                  <tr key={h.id || i}>
                    <td className="dr-name">{h.doctor_name}</td>
                    <td style={{ color: '#64748b' }}>{h.hospital}</td>
                    <td>
                      <span className={`badge-v ${h.interaction_type === 'Call' ? 'badge-call' : 'badge-visit'}`}>
                        {h.interaction_type}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {h.interaction_date ? new Date(h.interaction_date).toLocaleDateString() : (h.created_at ? new Date(h.created_at).toLocaleDateString() : 'N/A')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {deleteConfirmId === h.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(h.id)}
                              disabled={isDeleting === h.id}
                              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                            >
                              {isDeleting === h.id ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setViewingItem(h)}
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#64748b', transition: 'all 0.2s' }}
                              title="View"
                            >
                              <Eye size={14} /> View
                            </button>
                            <button
                              onClick={() => navigate('/log', { state: { editItem: h } })}
                              style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#4f46e5', transition: 'all 0.2s' }}
                              title="Edit"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(h.id)}
                              style={{ background: '#fef2f2', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#ef4444', transition: 'all 0.2s' }}
                              title="Delete"
                            >
                              <Trash2 size={14} /> Del
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No interactions logged yet</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
            <button style={{ border: 'none', background: 'none', color: '#94a3b8', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>Load Older Logs</button>
          </div>
        </div>

        {/* Removed AI Intelligence and Pending Tasks */}
      </div>

      {/* View Modal */}
      {viewingItem && (
        <ViewModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={() => { setViewingItem(null); navigate('/log', { state: { editItem: viewingItem } }); }}
        />
      )}
    </div>
  );
};

const StatCard = ({ label, val, trend, icon }) => (
  <div className="c-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
    </div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{val}</div>
    <div className="stat-trend">{trend}</div>
  </div>
);


const ViewModal = ({ item, onClose, onEdit }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }} onClick={onClose}>
      <div className="c-card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '0', background: 'white' }} onClick={e => e.stopPropagation()}>
        
        {/* Header Style */}
        <div style={{ padding: '30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px' }}>
              <FileText color="#4f46e5" size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{item.doctor_name}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Interaction Document · {new Date(item.created_at || new Date()).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Facility</span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{item.facility || item.hospital || 'N/A'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Communication Date</span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{item.interaction_date ? new Date(item.interaction_date).toLocaleString() : 'N/A'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Channel</span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{item.interaction_type}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products Discussed</span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{item.products_discussed || 'None recorded'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Follow-up</span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{item.follow_up_date ? new Date(item.follow_up_date).toLocaleDateString() : 'Unscheduled'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sentiment</span>
              <div style={{ marginTop: '4px', fontSize: '15px', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.sentiment === 'Positive' && <Smile size={18} color="#10b981" />}
                {item.sentiment === 'Neutral' && <Meh size={18} color="#f59e0b" />}
                {item.sentiment === 'Negative' && <Frown size={18} color="#ef4444" />}
                {item.sentiment || 'Neutral'}
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Summary / Key Outcomes</span>
            <div style={{ marginTop: '8px', fontSize: '15px', lineHeight: '1.6', color: '#0f172a', background: '#fef2f2', padding: '16px', borderLeft: '4px solid #ef4444', borderRadius: 'r-8px' }}>
              {item.summary || 'No summary available.'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Raw Interaction Notes</span>
            <div style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.6', color: '#475569', background: '#f8fafc', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
              {item.notes || 'No raw notes provided.'}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: INT-{item.id}</span>
           <button onClick={onEdit} className="btn-p" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#4f46e5' }}>
             <Pencil size={16} /> Edit Document
           </button>
        </div>

      </div>
    </div>
  );
};


const ExistingInteractions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, searchQuery } = useSelector(state => state.interactions);

  // States
  const [viewingItem, setViewingItem] = useState(null);
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [filterHcp, setFilterHcp] = useState('');
  const [filterFacility, setFilterFacility] = useState('');

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  // Editing now handled in LogInteraction route

  const filteredList = list.filter(item => {
    const s = searchQuery.toLowerCase();
    const doc = item.doctor_name?.toLowerCase() || '';
    const hosp = item.hospital?.toLowerCase() || '';
    const prods = item.products_discussed?.toLowerCase() || '';
    const matchesSearch = doc.includes(s) || hosp.includes(s) || prods.includes(s);
    
    const matchesSentiment = sentimentFilter === 'All' || item.sentiment === sentimentFilter;
    const matchesHcp = doc.includes(filterHcp.toLowerCase());
    const matchesFacility = hosp.includes(filterFacility.toLowerCase());
    
    let matchesDate = true;
    if (filterDate) {
      const dateToUse = item.interaction_date || item.created_at;
      if (dateToUse) {
        const itemDate = new Date(dateToUse).toISOString().split('T')[0];
        matchesDate = (itemDate === filterDate);
      } else {
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesSentiment && matchesHcp && matchesFacility && matchesDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Ledger Dashboard</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>All Past Interactions</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '16px' }} />
          <input 
            type="text" 
            placeholder="Global search..." 
            className="form-control" 
            style={{ paddingLeft: '40px', borderRadius: '99px' }} 
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
        </div>
      </div>

      <div className="c-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', padding: '16px 24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Filter By:</span>
        </div>
        
        <input 
          type="date" 
          className="form-control" 
          style={{ width: '160px', padding: '8px 12px', fontSize: '13px' }}
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        
        <select 
          className="form-control" 
          style={{ width: '140px', padding: '8px 12px', fontSize: '13px' }}
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
        >
          <option value="All">All Sentiment</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </select>
        
        <input 
          type="text" 
          placeholder="HCP Name" 
          className="form-control" 
          style={{ width: '160px', padding: '8px 12px', fontSize: '13px' }}
          value={filterHcp}
          onChange={e => setFilterHcp(e.target.value)}
        />
        
        <input 
          type="text" 
          placeholder="Facility" 
          className="form-control" 
          style={{ width: '160px', padding: '8px 12px', fontSize: '13px' }}
          value={filterFacility}
          onChange={e => setFilterFacility(e.target.value)}
        />
        
        {(filterDate || filterHcp || filterFacility || sentimentFilter !== 'All') && (
           <button 
             onClick={() => { setFilterDate(''); setFilterHcp(''); setFilterFacility(''); setSentimentFilter('All'); }}
             style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '8px' }}
           >
             Clear
           </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredList.map(item => (
          <div key={item.id} className="c-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                 <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>{item.doctor_name}</h4>
                 <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{item.facility || item.hospital}</p>
               </div>
               <span className={`badge-v ${item.interaction_type === 'Call' ? 'badge-call' : 'badge-visit'}`}>
                  {item.interaction_type}
               </span>
             </div>
             
             <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', flexGrow: 1 }}>
               {item.summary ? (item.summary.length > 80 ? item.summary.substring(0,80) + '...' : item.summary) : 'No summary available.'}
             </div>

             <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{item.interaction_date ? new Date(item.interaction_date).toLocaleDateString() : (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A')}</span>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setViewingItem(item)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#4f46e5' }}>
                    View
                  </button>
                  <button onClick={() => navigate('/log', { state: { editItem: item } })} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                    Edit
                  </button>
               </div>
             </div>
          </div>
        ))}
      </div>
      
      {filteredList.length === 0 && (
         <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
           No interactions match your search criteria.
         </div>
      )}

      {/* View Modal */}
      {viewingItem && (
        <ViewModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={() => { setViewingItem(null); navigate('/log', { state: { editItem: viewingItem } }); }}
        />
      )}
    </div>
  );
};

const SettingsView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfile } = useSelector(state => state.interactions);
  
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', region: '' });

  useEffect(() => {
    if (userProfile) {
      setForm({ name: userProfile.name, email: userProfile.email, region: userProfile.region });
    }
  }, [userProfile]);

  const handleSave = async () => {
    await dispatch(updateProfile(form));
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="c-card" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px', padding: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={40} color="#94a3b8" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Account Settings</h3>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Manage your rep profile configuration.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', background: '#f8fafc', padding: '30px', borderRadius: '12px' }}>
        <div className="form-group">
          <label>Full Name</label>
          <input className="form-control" disabled={!isEditing} value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ background: isEditing ? 'white' : '#f1f5f9' }} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input className="form-control" disabled={!isEditing} value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ background: isEditing ? 'white' : '#f1f5f9' }} />
        </div>
        <div className="form-group">
          <label>Territory Region</label>
          <input className="form-control" disabled={!isEditing} value={form.region} onChange={e => setForm({...form, region: e.target.value})} style={{ background: isEditing ? 'white' : '#f1f5f9' }} />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input className="form-control" disabled value={userProfile?.role || 'Loading...'} style={{ background: '#f1f5f9' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {isEditing ? (
          <>
            <button className="btn-secondary" onClick={() => {setIsEditing(false); setForm({name: userProfile.name, email: userProfile.email, region: userProfile.region});}}>Cancel</button>
            <button className="btn-p" onClick={handleSave}>Save Changes</button>
          </>
        ) : (
          <button className="btn-p" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { reminders, list, loading } = useSelector(state => state.interactions);

  // Fetch fresh data every time this page mounts — ensures data always appears
  // regardless of navigation path (direct URL or via "View All Notifications" link)
  useEffect(() => {
    dispatch(fetchReminders());
    dispatch(fetchInteractions()).then(() => {
      dispatch(checkUpcomingFollowups());
    });
  }, [dispatch]);

  // Build notifications directly from reminders (follow-up-only records stored in DB)
  // This is the source of truth — avoids dependency on in-memory Redux notifications.items
  const notificationsFromReminders = reminders.map(rem => {
    const followUpDate = rem.reminder_date ? new Date(rem.reminder_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let urgencyLabel = 'Upcoming';
    let urgencyColor = '#0ea5e9';
    let bgColor = '#e0f2fe';
    
    if (followUpDate) {
      const diffDays = Math.ceil((followUpDate - today) / (1000 * 60 * 60 * 24));
      if (rem.status === 'overdue' || diffDays < 0) {
        urgencyLabel = 'Overdue';
        urgencyColor = '#ef4444';
        bgColor = '#fee2e2';
      } else if (diffDays === 0) {
        urgencyLabel = 'Due Today';
        urgencyColor = '#f59e0b';
        bgColor = '#fef3c7';
      } else if (diffDays <= 2) {
        urgencyLabel = `Due in ${diffDays} day(s)`;
        urgencyColor = '#f59e0b';
        bgColor = '#fef3c7';
      }
    }

    return {
      id: rem.id,
      type: 'reminder',
      title: `Follow-up ${urgencyLabel}`,
      hcpName: rem.doctor_name || 'Unknown HCP',
      hospital: rem.hospital || '',
      followUpDate: rem.reminder_date,
      status: rem.status,
      message: `Follow-up with ${rem.doctor_name || 'HCP'} scheduled for ${rem.reminder_date ? new Date(rem.reminder_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}`,
      notes: rem.notes,
      time: rem.created_at || new Date().toISOString(),
      urgencyColor,
      bgColor
    };
  });

  // Sort: overdue first, then by follow-up date ascending
  notificationsFromReminders.sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    return new Date(a.followUpDate) - new Date(b.followUpDate);
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Notification Center</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {notificationsFromReminders.length > 0
              ? `${notificationsFromReminders.length} follow-up reminder${notificationsFromReminders.length !== 1 ? 's' : ''} require your attention`
              : 'Stay updated with your latest follow-up alerts and reminders'}
          </p>
        </div>
        {notificationsFromReminders.length > 0 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ background: '#fee2e2', color: '#ef4444', padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '700' }}>
              {notificationsFromReminders.filter(n => n.status === 'overdue').length} Overdue
            </span>
            <span style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '700' }}>
              {notificationsFromReminders.filter(n => n.status === 'pending').length} Pending
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p>Loading notifications...</p>
        </div>
      )}

      {/* Notification List */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notificationsFromReminders.length === 0 ? (
            <div className="c-card" style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #e2e8f0' }}>
                <Bell size={32} color="#94a3b8" />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>No Notifications Available</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
                Notifications are generated only when a follow-up date is added to an interaction.
              </p>
            </div>
          ) : (
            notificationsFromReminders.map((n) => (
              <div
                key={n.id}
                className="c-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                  borderLeft: `4px solid ${n.urgencyColor}`,
                  transition: 'box-shadow 0.2s'
                }}
              >
                {/* Icon */}
                <div style={{
                  background: n.bgColor,
                  padding: '14px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={24} color={n.urgencyColor} />
                </div>

                {/* Content */}
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                        {n.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>
                        {n.hcpName}
                        {n.hospital ? ` · ${n.hospital}` : ''}
                      </p>
                    </div>
                    <span
                      style={{
                        background: n.bgColor,
                        color: n.urgencyColor,
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        whiteSpace: 'nowrap',
                        marginLeft: '12px'
                      }}
                    >
                      {n.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* Follow-up Date & Message */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', marginBottom: '6px' }}>
                    <CalendarCheck size={14} color={n.urgencyColor} />
                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>{n.message}</p>
                  </div>

                  {n.notes && (
                    <div style={{ marginTop: '8px', marginBottom: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569', whiteSpace: 'pre-wrap', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: '700', display: 'block', marginBottom: '4px', color: '#0f172a' }}>Interaction Notes:</span>
                      {n.notes}
                    </div>
                  )}

                  {/* Created timestamp */}
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                    Created: {n.time ? new Date(n.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};


const App = () => {
  return (
    <Provider store={store}>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#0f172a', color: '#fff', fontSize: '14px', fontWeight: '600' } }} />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogInteraction />} />
            <Route path="/interactions" element={<ExistingInteractions />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;
