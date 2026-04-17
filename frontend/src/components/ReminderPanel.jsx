import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReminders } from '../store/interactionSlice';
import { Clock, AlertCircle, Calendar as CalendarIcon, CheckCircle2, ChevronRight, User } from 'lucide-react';

const ReminderPanel = () => {
  const dispatch = useDispatch();
  const { reminders } = useSelector(state => state.interactions);

  useEffect(() => {
    dispatch(fetchReminders());
  }, [dispatch]);

  const overdue = reminders.filter(r => r.status === 'overdue');
  const upcoming = reminders.filter(r => r.status === 'pending');

  return (
    <aside className="space-y-6 animate-fade-in w-full">
      {/* Overdue Section */}
      {overdue.length > 0 && (
        <section className="bg-red-50/80 dark:bg-red-500/10 rounded-2xl p-5 border border-red-100 dark:border-red-500/20">
          <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            <h3 className="font-semibold text-xs uppercase tracking-widest">Attention Required</h3>
          </div>
          <div className="space-y-3">
            {overdue.map(reminder => (
              <div key={reminder.id} className="bg-white dark:bg-black/20 p-4 rounded-xl shadow-sm border border-red-50 dark:border-red-500/10 flex items-center justify-between group">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-[14px]">{reminder.doctor_name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="text-red-400" />
                    <span className="text-xs font-semibold text-red-500 dark:text-red-400">Due {reminder.reminder_date}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-red-300 dark:text-red-500 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      <section className="glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-outfit font-semibold text-slate-900 dark:text-white text-lg">Next Tasks</h3>
          <span className="bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[11px] font-bold px-2.5 py-1 rounded-md">
            {upcoming.length} Total
          </span>
        </div>
        
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <div className="py-10 bg-slate-50/50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 border-dashed text-center">
              <CheckCircle2 className="mx-auto text-emerald-400/50 mb-3" size={32} />
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Awaiting Schedule</p>
            </div>
          ) : (
            upcoming.map(reminder => (
              <div key={reminder.id} className="group p-4 bg-white/60 dark:bg-black/20 rounded-xl hover:border-primary-200 dark:hover:border-primary-500/30 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-500/20 dark:group-hover:text-primary-400 transition-colors">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight truncate">{reminder.doctor_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{reminder.hospital}</p>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {reminder.reminder_date.split('-').slice(1).join('/')}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Analytics Mini Card */}
      <div className="glass-panel !bg-slate-900 dark:!bg-black relative overflow-hidden group p-6">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-600 rounded-full blur-[70px] group-hover:scale-110 transition-transform duration-1000 opacity-60" />
        <div className="relative z-10">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Weekly Goal</p>
          <div className="flex items-end justify-between">
            <h4 className="text-4xl font-outfit font-bold text-white leading-none">82<span className="text-base text-primary-400 ml-1">%</span></h4>
            <div className="text-right">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">On Track</p>
              <div className="flex gap-1.5 mt-1">
                 {[1,1,1,1,0].map((b,i) => <div key={i} className={`w-3 h-1.5 rounded-full ${b ? 'bg-primary-500' : 'bg-slate-700'}`} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ReminderPanel;
