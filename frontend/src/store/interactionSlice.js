import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchInteractions',
  async () => {
    const response = await axios.get(`${API_URL}/interactions`);
    return response.data;
  }
);

export const logInteraction = createAsyncThunk(
  'interactions/logInteraction',
  async (interactionData) => {
    const response = await axios.post(`${API_URL}/interactions`, interactionData);
    return response.data;
  }
);

export const editInteraction = createAsyncThunk(
  'interactions/editInteraction',
  async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/edit/${id}`, data);
    return response.data;
  }
);

export const deleteInteraction = createAsyncThunk(
  'interactions/deleteInteraction',
  async (id) => {
    await axios.delete(`${API_URL}/interactions/${id}`);
    return id;
  }
);

export const fetchInsights = createAsyncThunk(
  'interactions/fetchInsights',
  async () => {
    const response = await axios.get(`${API_URL}/insights`);
    return response.data;
  }
);

export const fetchReminders = createAsyncThunk(
  'interactions/fetchReminders',
  async () => {
    const response = await axios.get(`${API_URL}/reminders`);
    return response.data;
  }
);

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async () => {
    const response = await axios.get(`${API_URL}/profile`);
    return response.data;
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data) => {
    const response = await axios.put(`${API_URL}/profile`, data);
    return response.data;
  }
);

const interactionSlice = createSlice({
  name: 'interactions',
  initialState: {
    list: [],
    reminders: [],
    insights: null,
    loading: false,
    error: null,
    searchQuery: '',
    userProfile: null,
    notifications: {
      items: [],
      unreadCount: 0
    }
  },
  reducers: {
    updateFormData: (state, action) => {
      // Logic to sync form from chat can be handled here or in component
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.items.unshift(action.payload);
      state.notifications.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.notifications.unreadCount = 0;
    },
    // ONLY generates notifications for interactions that have a follow_up_date set.
    // Normal log interactions (without follow-up) will NEVER trigger a notification.
    checkUpcomingFollowups: (state) => {
      const today = new Date();

      state.list.forEach(item => {
        // Skip items that have NO follow-up date — no notification for normal logs
        if (!item.follow_up_date) return;

        const fDate = new Date(item.follow_up_date);
        const diffTime = fDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Only notify if follow-up is within the next 2 days (or overdue)
        if (diffDays >= -1 && diffDays <= 2) {
          const notifId = `followup-${item.id}`;
          // Prevent duplicate notifications
          if (!state.notifications.items.find(n => n.id === notifId)) {
            const label = diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : `in ${diffDays} day(s)`;
            state.notifications.items.unshift({
              id: notifId,
              type: 'reminder',
              title: `Follow-up ${label}`,
              message: `Follow-up with ${item.doctor_name} is scheduled for ${new Date(item.follow_up_date).toLocaleDateString()}`,
              time: new Date().toISOString()
            });
            state.notifications.unreadCount += 1;
          }
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      // logInteraction.fulfilled: ONLY adds the entry to the list.
      // Does NOT generate any notification — notifications come exclusively
      // from checkUpcomingFollowups / fetchReminders for follow-up items.
      .addCase(logInteraction.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(editInteraction.fulfilled, (state, action) => {
        const index = state.list.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteInteraction.fulfilled, (state, action) => {
        state.list = state.list.filter(i => i.id !== action.payload);
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.insights = action.payload;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.reminders = action.payload;
        // Sync ONLY pending follow-up reminders to notifications
        // Normal interactions without follow-up dates do NOT generate reminders on backend
        action.payload.forEach(rem => {
          if (rem.status === 'pending') {
            const notifId = `rem-db-${rem.id}`;
            if (!state.notifications.items.find(n => n.id === notifId)) {
              state.notifications.items.unshift({
                id: notifId,
                type: 'reminder',
                title: 'Upcoming Follow-up Reminder',
                message: `Follow-up with ${rem.doctor_name || 'HCP'} scheduled for ${new Date(rem.reminder_date).toLocaleDateString()}`,
                time: rem.created_at
              });
              state.notifications.unreadCount += 1;
            }
          }
        });
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
      });
  },
});

export const { updateFormData, setSearchQuery, addNotification, clearNotifications, checkUpcomingFollowups } = interactionSlice.actions;
export default interactionSlice.reducer;
