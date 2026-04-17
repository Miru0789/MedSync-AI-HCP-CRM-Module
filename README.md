#  MedSync AI: HCP Module (AI-First CRM)
##  Project Overview
**MedSync AI** is a next-generation, AI-first Customer Relationship Management (CRM) platform designed specifically for the life sciences and pharmaceutical domain. It empowers field representatives to efficiently log, manage, and analyze interactions with Healthcare Professionals (HCPs).

By integrating a **LangGraph-powered AI agent** with Groq’s high-performance LLMs (`gemma2-9b-it`), the platform transforms traditional data entry into an intelligent, conversational workflow. Users can either input structured data through an intuitive UI or leverage natural language to automatically extract insights, generate summaries, and schedule follow-ups.

The system significantly reduces administrative effort, improves data accuracy, and enables actionable decision-making—allowing representatives to focus on building meaningful HCP relationships.
##  Features
* **Dual-Mode Interaction Logging**
  Log interactions via a structured form or conversational AI interface.

* **Intelligent Entity Extraction**
  Automatically extracts doctor names, facilities, interaction types, sentiments, and follow-up dates from natural language input.

* **Smart Follow-up Management**
  Dynamically creates, updates, and removes reminders based on interaction data.
* **In-Place Record Editing**
  Edit existing logs with pre-filled forms to maintain data consistency without duplication.
* **Voice Dictation & AI Summarization**
  Convert speech to text and generate concise summaries from detailed notes.
* **Notification Center**
  Centralized view of upcoming and overdue follow-ups with urgency indicators.
* **Analytics Dashboard & Ledger**
  Real-time insights, charts, and a filterable interaction history ledger.
##  Tech Stack
### Frontend
* **Framework**: React 19 + Vite
* **State Management**: Redux Toolkit (Async Thunks)
* **Routing**: React Router v6
* **Styling**: Vanilla CSS, Inter Font, Custom Design System
* **Icons**: Lucide React
### Backend
* **Framework**: FastAPI (Python 3.11+)
* **ORM**: SQLAlchemy
* **Database**: SQLite (default), MySQL / PostgreSQL (configurable)
* **Validation**: Pydantic
### 🤖 AI & Agent Framework
* **Agent Orchestration**: LangGraph (StateGraph architecture)
* **LLM Integration**: LangChain
* **Models**:
  * Primary: `gemma2-9b-it` (Groq)
  * Fallback: `llama-3.3-70b-versatile`
##  Installation & Setup
### Prerequisites
* Node.js (v18+)
* Python (v3.11+)
* Groq API Key
### Backend Setup
cd backend

python -m venv venv

# Activate environment
venv\Scripts\activate     # Windows
# source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

cp .env.example .env

 Add your `GROQ_API_KEY` inside `.env`
### Run Backend
python main.py

* API: [http://localhost:8000](http://localhost:8000)
* Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
###  Frontend Setup

cd frontend
npm install
### Run Frontend

npm run dev

* App: [http://localhost:5173](http://localhost:5173)

##  Output Screenshot
<img width="1920" height="1080" alt="Screenshot (531)" src="https://github.com/user-attachments/assets/95d7ab33-360c-405b-b3ac-6ca251b1db64" />
<img width="1920" height="1080" alt="Screenshot (532)" src="https://github.com/user-attachments/assets/64ba9fed-281b-4ec6-b833-02cec02f69d5" />
<img width="1920" height="1080" alt="Screenshot (533)" src="https://github.com/user-attachments/assets/1c521ae5-1e36-44f8-ab63-dd2dfaceac2a" />
<img width="1920" height="1080" alt="Screenshot (534)" src="https://github.com/user-attachments/assets/745fdbbf-2563-4e24-b0f5-9288d5fa2216" />
<img width="1920" height="1080" alt="Screenshot (535)" src="https://github.com/user-attachments/assets/c16f1fe5-b055-4fa8-bf8e-cf65fa1f3976" />
<img width="1920" height="1080" alt="Screenshot (536)" src="https://github.com/user-attachments/assets/ee74f12c-ca73-4a5b-8ed0-408d0d38479a" />
<img width="1920" height="1080" alt="Screenshot (537)" src="https://github.com/user-attachments/assets/48ed5463-0a4f-4844-9879-f59e2d9103bd" />
<img width="1920" height="1080" alt="Screenshot (538)" src="https://github.com/user-attachments/assets/9891de41-a0ae-4576-ba05-be9945733cbc" />






##  Conclusion
MedSync AI represents a shift toward **AI-native CRM systems**, combining structured workflows with conversational intelligence. It enhances productivity, improves data quality, and delivers actionable insights—making it a powerful tool for modern healthcare field operations.

