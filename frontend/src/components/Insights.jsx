import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInsights } from '../store/interactionSlice';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Activity, 
  Award, 
  PieChart,
  ArrowUpRight,
  Target,
  Sparkles
} from 'lucide-react';

const Insights = () => {
  const dispatch = useDispatch();
  const { insights } = useSelector(state => state.interactions);

  useEffect(() => {
    dispatch(fetchInsights());
  }, [dispatch]);

  if (!insights) return <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '700' }}>Analyzing Data Pipeline...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="grid-stats">
        <InsightStat label="Engagement Reach" val={insights.total_interactions} color="#4f46e5" icon={<Users size={20} color="white" />} />
        <InsightStat label="Follow-up Queue" val={insights.upcoming_followups} color="#0ea5e9" icon={<Activity size={20} color="white" />} />
        <InsightStat label="Overdue Items" val={insights.overdue_followups} color="#f43f5e" icon={<Award size={20} color="white" />} />
        <InsightStat label="Primary Facility" val={insights.top_hospitals?.[0]?.name || 'N/A'} color="#10b981" icon={<MapPin size={20} color="white" />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        <div className="data-box">
          <div className="data-box-header">
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>HCP Engagement Leaders</h3>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {insights.top_doctors.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '14px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: '#0f172a', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px' }}>
                        {i + 1}
                      </div>
                      <div>
                         <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{d.name}</p>
                         <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Territory Star</p>
                      </div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: '#4f46e5' }}>{d.count}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>POINTS</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

        <div className="data-box">
           <div className="data-box-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Channel Breakdown</h3>
              <PieChart size={18} color="#f1f5f9" />
           </div>
           <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(insights.interactions_by_type).map(([type, count]) => {
                 const p = (count / insights.total_interactions) * 100;
                 return (
                   <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                         <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{type}</span>
                         <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{count}</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                         <div style={{ height: '100%', width: `${p}%`, background: '#4f46e5', borderRadius: '4px' }}></div>
                      </div>
                   </div>
                 );
              })}

              <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={14} color="#4f46e5" />
                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#4f46e5' }}>Insight Engine</span>
                 </div>
                 <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                    Your <strong style={{ color: '#0f172a' }}>Field Visits</strong> are converting 22% better than digital outreach. Focus on face-to-face followups.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const InsightStat = ({ label, val, icon, color }) => (
  <div className="c-card" style={{ position: 'relative' }}>
    <div style={{ background: color, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
       {icon}
    </div>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ fontSize: '24px' }}>{val}</div>
    <ArrowUpRight size={14} color="#e2e8f0" style={{ position: 'absolute', top: '24px', right: '24px' }} />
  </div>
);

export default Insights;
