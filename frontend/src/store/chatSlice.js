import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async (message) => {
    const response = await axios.post(`${API_URL}/chat`, { message });
    return response.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [
      { sender: 'ai', text: 'Hello! How can I help you today? You can log an interaction, ask for insights, or manage your schedule.' }
    ],
    isTyping: false,
    error: null,
    lastExtractedData: null,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearExtractedData: (state) => {
      state.lastExtractedData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isTyping = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        state.messages.push({ sender: 'ai', text: action.payload.reply });
        if (action.payload.extracted_data) {
          state.lastExtractedData = action.payload.extracted_data;
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.error.message;
        state.messages.push({ sender: 'ai', text: 'Sorry, I encountered an error processing your request.' });
      });
  },
});

export const { addMessage, clearExtractedData } = chatSlice.actions;
export default chatSlice.reducer;
