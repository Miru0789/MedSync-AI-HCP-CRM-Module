import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Clock, 
  Users, 
  Mic, 
  Plus, 
  FileText, 
  Package, 
  Check, 
  Sparkles,
  Save,
  Send,
  Loader2,
  Trash2,
  Bot,
  Pencil
} from 'lucide-react';
import { logInteraction, editInteraction, fetchInteractions, fetchInsights } from '../store/interactionSlice';
import { toast } from 'react-hot-toast';

const LogInteraction = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const editItem = location.state?.editItem || null;
  const isEditMode = Boolean(editItem);

  // Local datetime string for default communication date
  const getLocalDatetimeString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
  };

  // -- State --
  const [formData, setFormData] = useState({
    doctor_name: '',
    facility: '',
    interaction_type: 'Visit',
    interaction_date: getLocalDatetimeString(),
    follow_up_date: '',
    attendees: [],
    topics_discussed: '',
    materials: [],
    samples: [],
    sentiment: 'Neutral',
    outcomes: '',
    follow_up_actions: ''
  });

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (editItem) {
      // Parse notes back into fields best-effort
      const notes = editItem.notes || '';
      const topicsMatch = notes.match(/Topics:\n([\s\S]*?)(?:\n\nOutcomes:|$)/m);
      const outcomesMatch = notes.match(/Outcomes:\n([\s\S]*?)(?:\n\nFollow-ups:|$)/m);
      const followupsMatch = notes.match(/Follow-ups:\n([\s\S]*?)$/m);

      // Format interaction_date for datetime-local input
      let commDate = getLocalDatetimeString();
      if (editItem.interaction_date) {
        const d = new Date(editItem.interaction_date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        commDate = d.toISOString().slice(0, 16);
      }

      setFormData({
        doctor_name: editItem.doctor_name || '',
        facility: editItem.facility || editItem.hospital || '',
        interaction_type: editItem.interaction_type || 'Visit',
        interaction_date: commDate,
        follow_up_date: editItem.follow_up_date || '',
        attendees: [],
        topics_discussed: topicsMatch ? topicsMatch[1].trim() : (editItem.notes || ''),
        materials: [],
        samples: [],
        sentiment: editItem.sentiment || 'Neutral',
        outcomes: outcomesMatch ? outcomesMatch[1].trim() : '',
        follow_up_actions: followupsMatch ? followupsMatch[1].trim() : ''
      });
    }
  }, [editItem]);

  // UI inputs
  const [newAttendee, setNewAttendee] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newSample, setNewSample] = useState({ name: '', qty: 1 });
  
  // Flags
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -- Handlers --
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addAttendee = (e) => {
    if (e.key === 'Enter' && newAttendee.trim()) {
      e.preventDefault();
      setFormData({ ...formData, attendees: [...formData.attendees, newAttendee.trim()] });
      setNewAttendee('');
    }
  };

  const removeAttendee = (idx) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter((_, i) => i !== idx)
    });
  };

  const addMaterial = (e) => {
    e.preventDefault();
    if (newMaterial.trim()) {
      setFormData({ ...formData, materials: [...formData.materials, newMaterial.trim()] });
      setNewMaterial('');
    }
  };

  const removeMaterial = (idx) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== idx)
    });
  };

  const addSample = (e) => {
    e.preventDefault();
    if (newSample.name.trim() && newSample.qty > 0) {
      setFormData({ ...formData, samples: [...formData.samples, { ...newSample }] });
      setNewSample({ name: '', qty: 1 });
    }
  };

  const removeSample = (idx) => {
    setFormData({
      ...formData,
      samples: formData.samples.filter((_, i) => i !== idx)
    });
  };

  const handleSummarize = () => {
    if (!hasConsent) return toast.error('Consent required to process voice notes.');
    setIsSummarizing(true);
    // Mock AI analysis
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        topics_discussed: prev.topics_discussed + (prev.topics_discussed ? '\n' : '') + 'AI Insight: Focused on clinical trial data. Requested more samples.'
      }));
      setIsSummarizing(false);
      toast.success('AI Summary Generated');
    }, 1200);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
    } else {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return toast.error('Speech recognition not supported in this browser.');
      }
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setFormData(prev => ({ ...prev, topics_discussed: transcript }));
      };
      rec.onstart = () => {
        setIsRecording(true);
        toast.success('Listening...');
      };
      rec.onend = () => setIsRecording(false);
      rec.onerror = (e) => {
        console.error(e);
        toast.error('Voice input error');
        setIsRecording(false);
      };
      rec.start();
      setRecognition(rec);
    }
  };

  const aiSuggestions = {
    Visit: ['Drop off requested heart disease literature', 'Schedule follow-up visit in 2 weeks', 'Check sample inventory'],
    Call: ['Email additional clinical trial data', 'Follow up via text in 3 days'],
    Meeting: ['Send meeting minutes and slide deck', 'Arrange follow-up with KOL'],
    Webinar: ['Send webinar recording link', 'Email feedback survey']
  };

  const currentSuggestions = aiSuggestions[formData.interaction_type] || aiSuggestions['Visit'];

  const handleSubmit = async (isDraft = false) => {
    if (!formData.doctor_name) {
      return alert('HCP Name is required.');
    }

    isDraft ? setIsSavingDraft(true) : setIsSubmitting(true);

    // Use user-selected communication date, fall back to now
    const commDate = formData.interaction_date
      ? new Date(formData.interaction_date).toISOString()
      : new Date().toISOString();

    const combinedNotes = `Communication Date: ${new Date(commDate).toLocaleString()}
Attendees: ${formData.attendees.join(', ')}
Materials: ${formData.materials.join(', ')}
Sentiment: ${formData.sentiment}

Topics:
${formData.topics_discussed}

Outcomes:
${formData.outcomes}

Follow-ups:
${formData.follow_up_actions}`.trim();

    const payload = {
      doctor_name: formData.doctor_name,
      facility: formData.facility,
      hospital: formData.facility,
      interaction_type: formData.interaction_type,
      notes: combinedNotes,
      summary: formData.topics_discussed.substring(0, 50),
      products_discussed: formData.samples.map(s => `${s.qty}x ${s.name}`).join(', '),
      sentiment: formData.sentiment,
      interaction_date: commDate,
      follow_up_date: formData.follow_up_date || null
    };

    try {
      if (isEditMode) {
        await dispatch(editInteraction({ id: editItem.id, data: payload })).unwrap();
        toast.success('Interaction updated successfully!');
      } else {
        await dispatch(logInteraction(payload)).unwrap();
        toast.success('Interaction logged successfully!');
      }
      await Promise.all([
        dispatch(fetchInteractions()).unwrap(),
        dispatch(fetchInsights()).unwrap()
      ]);
      isDraft ? setIsSavingDraft(false) : setIsSubmitting(false);
      navigate('/');
    } catch (e) {
      toast.error(isEditMode ? 'Failed to update interaction.' : 'Failed to log interaction.');
      isDraft ? setIsSavingDraft(false) : setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '30px', maxWidth: '1200px', margin: '0 auto', alignItems: 'start', paddingBottom: '60px' }}>
      <div className="c-card" style={{ padding: '0', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '30px', background: isEditMode ? '#fef3c7' : '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: isEditMode ? '#f59e0b' : '#4f46e5', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isEditMode ? <Pencil color="white" size={22} /> : <FileText color="white" size={24} />}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
              {isEditMode ? `Editing: ${editItem.doctor_name}` : 'Log Structured Interaction'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {isEditMode ? `Record ID: INT-${editItem.id} · Changes will update the existing record.` : 'Complete the form below to record details of your HCP engagement.'}
            </p>
          </div>
        </div>

        <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Basics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>HCP Name <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-wrapper">
                <User size={16} color="#94a3b8" className="input-icon" />
                <input 
                  type="text" 
                  name="doctor_name"
                  list="doctors-list"
                  value={formData.doctor_name}
                  onChange={handleChange}
                  placeholder="Seach HCP..." 
                  className="form-control"
                />
                <datalist id="doctors-list">
                  <option value="Dr. Elena Gilbert" />
                  <option value="Dr. Stefan Salvatore" />
                  <option value="Dr. Bonnie Bennett" />
                  <option value="Dr. Alaric Saltzman" />
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label>Facility <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-wrapper">
                <Users size={16} color="#94a3b8" className="input-icon" />
                <input 
                  type="text" 
                  name="facility"
                  value={formData.facility}
                  onChange={handleChange}
                  placeholder="City Hospital, Lab, etc." 
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Interaction Type</label>
              <select name="interaction_type" value={formData.interaction_type} onChange={handleChange} className="form-control" style={{ paddingLeft: '16px' }}>
                <option value="Visit">In-Person Visit</option>
                <option value="Call">Phone Call</option>
                <option value="Meeting">Meeting / Presentation</option>
                <option value="Webinar">Webinar</option>
              </select>
            </div>

            {/* Communication Date */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} color="#94a3b8" /> Communication Date
              </label>
              <div className="input-wrapper">
                <Calendar size={16} color="#94a3b8" className="input-icon" />
                <input
                  type="datetime-local"
                  name="interaction_date"
                  value={formData.interaction_date}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>Auto-filled with current time. Edit if this interaction occurred at a different time.</p>
            </div>
          </div>

          {/* Attendees */}
          <div className="form-group">
            <label>Attendees</label>
            <div className="input-wrapper">
              <Users size={16} color="#94a3b8" className="input-icon" />
              <input 
                type="text" 
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                onKeyDown={addAttendee}
                placeholder="Type name and press Enter..." 
                className="form-control"
              />
            </div>
            {formData.attendees.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {formData.attendees.map((att, i) => (
                  <span key={i} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                    {att}
                    <button onClick={() => removeAttendee(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94a3b8' }}><Trash2 size={14} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

          {/* Topics Discussed & Voice Note */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '20px' }}>
            <div className="form-group">
              <label>Topics Discussed</label>
              <textarea 
                name="topics_discussed"
                value={formData.topics_discussed}
                onChange={handleChange}
                rows={6}
                placeholder="Core takeaways, questions asked, insights..."
                className="form-control"
                style={{ paddingLeft: '16px', resize: 'vertical' }}
              />
            </div>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Mic size={16} color="#4f46e5" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Voice Dictation</h4>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Record a voice note and let AI auto-extract topics.</p>
              
              <button 
                type="button"
                onClick={toggleRecording}
                style={{ 
                  background: isRecording ? '#ef4444' : '#fff', 
                  color: isRecording ? '#fff' : '#0f172a',
                  border: '1px solid',
                  borderColor: isRecording ? '#ef4444' : '#cbd5e1',
                  padding: '10px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: isRecording ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'
                }}
              >
                {isRecording ? <div className="recording-dot" style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div> : <Mic size={14} />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: '#64748b', cursor: 'pointer', marginBottom: '16px' }}>
                <input type="checkbox" checked={hasConsent} onChange={(e) => setHasConsent(e.target.checked)} style={{ marginTop: '2px' }} />
                Patient/HCP consent received for voice processing
              </label>

              <button 
                type="button" 
                onClick={handleSummarize}
                disabled={isSummarizing || !hasConsent || isRecording}
                className="btn-p" 
                style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center', padding: '10px', opacity: (!hasConsent || isRecording) ? 0.5 : 1 }}
              >
                {isSummarizing ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                {isSummarizing ? 'Processing...' : 'Summarize'}
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

          {/* Materials & Samples */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#94a3b8" /> Materials Shared
              </h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  value={newMaterial}
                  onChange={e => setNewMaterial(e.target.value)}
                  placeholder="Ex: HeartCare Brochure..." 
                  className="form-control" 
                  style={{ paddingLeft: '16px' }}
                />
                <button type="button" onClick={addMaterial} className="btn-secondary">Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.materials.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontWeight: '500' }}>{m}</span>
                    <button type="button" onClick={() => removeMaterial(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} color="#94a3b8" /> Samples Distributed
              </h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  value={newSample.name}
                  onChange={e => setNewSample({...newSample, name: e.target.value})}
                  placeholder="Product name" 
                  className="form-control" 
                  style={{ paddingLeft: '16px', flex: 2 }}
                />
                <input 
                  type="number" 
                  value={newSample.qty}
                  onChange={e => setNewSample({...newSample, qty: parseInt(e.target.value) || 1})}
                  min="1"
                  className="form-control" 
                  style={{ paddingLeft: '16px', flex: 1 }}
                />
                <button type="button" onClick={addSample} className="btn-secondary">Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {formData.samples.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontWeight: '500' }}>{s.qty}x {s.name}</span>
                    <button type="button" onClick={() => removeSample(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sentiment */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Overall Sentiment</label>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Positive', 'Neutral', 'Negative'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', background: formData.sentiment === s ? '#e0e7ff' : '#f8fafc', padding: '10px 20px', borderRadius: '30px', border: '1px solid', borderColor: formData.sentiment === s ? '#818cf8' : '#e2e8f0', fontWeight: '600', color: formData.sentiment === s ? '#3730a3' : '#475569', transition: 'all 0.2s' }}>
                  <input 
                    type="radio" 
                    name="sentiment" 
                    value={s} 
                    checked={formData.sentiment === s} 
                    onChange={handleChange} 
                    style={{ margin: 0 }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

          {/* Outcomes & Follow-ups */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div className="form-group">
              <label>Outcomes / Agreements</label>
              <textarea 
                name="outcomes"
                value={formData.outcomes}
                onChange={handleChange}
                rows={4}
                placeholder="Key agreements reached..."
                className="form-control"
                style={{ paddingLeft: '16px', resize: 'vertical' }}
              />
            </div>
            <div className="form-group">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Next Follow-up Date</label>
                <div className="input-wrapper">
                  <Calendar size={16} color="#94a3b8" className="input-icon" />
                  <input type="date" name="follow_up_date" value={formData.follow_up_date} onChange={handleChange} className="form-control" />
                </div>
              </div>

              <label>Follow-up Actions</label>
              <textarea 
                name="follow_up_actions"
                value={formData.follow_up_actions}
                onChange={handleChange}
                rows={4}
                placeholder="Next steps, tasks..."
                className="form-control"
                style={{ paddingLeft: '16px', resize: 'vertical' }}
              />
              
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Sparkles size={14} color="#818cf8" />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase' }}>AI Suggested Follow-ups</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentSuggestions.map((sug, i) => (
                    <button 
                      key={i} 
                      type="button"
                      onClick={() => setFormData({...formData, follow_up_actions: (formData.follow_up_actions ? formData.follow_up_actions + '\n' : '') + sug})}
                      style={{ textAlign: 'left', padding: '10px 14px', background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.1)', borderRadius: '8px', fontSize: '12px', color: '#4f46e5', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(79, 70, 229, 0.1)'}
                      onMouseOut={e=>e.currentTarget.style.background='rgba(79, 70, 229, 0.05)'}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ background: isEditMode ? '#fef3c7' : '#f8fafc', padding: '24px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ padding: '12px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEditMode && (
              <button 
                onClick={() => handleSubmit(true)} 
                disabled={isSubmitting || isSavingDraft}
                style={{ padding: '12px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '700', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isSavingDraft ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </button>
            )}
            <button 
              onClick={() => handleSubmit(false)} 
              disabled={isSubmitting || isSavingDraft}
              className="btn-p" 
              style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '8px', background: isEditMode ? '#f59e0b' : undefined }}
            >
              {isSubmitting ? <Loader2 size={16} className="spin" /> : isEditMode ? <Check size={16} /> : <Send size={16} />}
              {isSubmitting ? (isEditMode ? 'Saving...' : 'Submitting...') : isEditMode ? 'Save Changes' : 'Submit Log'}
            </button>
          </div>
        </div>

      </div>

      {/* Right Side AI Panel */}
      <AIInteractionLogPanel onLog={(parsedData) => setFormData(prev => ({ ...prev, ...parsedData }))} />

    </div>
  );
};

const AIInteractionLogPanel = ({ onLog }) => {
  const [input, setInput] = useState('');

  const handleLog = () => {
    if (!input.trim()) return;

    let parsedData = {};
    const text = input.trim();
    const lowerInput = text.toLowerCase();

    // Interaction Type
    if (/\b(met|meeting)\b/.test(lowerInput)) parsedData.interaction_type = 'Meeting';
    else if (/\b(call|phoned)\b/.test(lowerInput)) parsedData.interaction_type = 'Call';
    else if (/\b(visit)\b/.test(lowerInput)) parsedData.interaction_type = 'Visit';
    else if (/\b(webinar)\b/.test(lowerInput)) parsedData.interaction_type = 'Webinar';

    // Sentiment
    if (/\b(positive|good|interested)\b/.test(lowerInput)) {
      parsedData.sentiment = 'Positive';
    } else if (/\b(negative|not interested|bad)\b/.test(lowerInput)) {
      parsedData.sentiment = 'Negative';
    } else if (/\b(neutral)\b/.test(lowerInput)) {
      parsedData.sentiment = 'Neutral';
    }

    // HCP Name
    const drMatch = text.match(/Dr\.?\s+([A-Za-z]+(\s[A-Za-z]+)?)/i);
    if (drMatch) {
      const rawName = drMatch[1].split(',')[0].trim();
      parsedData.doctor_name = `Dr. ${rawName}`;
    }

    // Outcomes
    const outcomeMatch = text.match(/\b(?:outcome|agreed to|result)\s*:?\s*(.*)$/i);
    if (outcomeMatch) {
      parsedData.outcomes = outcomeMatch[1];
    }

    // Topics Discussed
    parsedData.topics_discussed = text;

    onLog(parsedData);
    setInput('');
  };

  return (
    <div className="c-card" style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <div style={{ background: '#e0e7ff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} color="#4f46e5" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>AI Assistant</h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Log Interaction</p>
        </div>
      </div>
      
      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
        Describe the interaction naturally. AI will extract and auto-fill the form fields.
      </p>

      <textarea 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g., Met Dr. Kumar, discussed new product, positive response..."
        className="form-control"
        rows={6}
        style={{ resize: 'vertical', fontSize: '13px' }}
      />

      <button 
        onClick={handleLog}
        disabled={!input.trim()}
        className="btn-p"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', opacity: !input.trim() ? 0.5 : 1, pointerEvents: !input.trim() ? 'none' : 'auto', transition: 'all 0.2s' }}
      >
        <Sparkles size={16} /> Auto-Fill Form
      </button>
    </div>
  );
};

export default LogInteraction;
