# MedSync AI: HCP Module (AI-First CRM)

## Project Overview

MedSync AI is a next-generation, AI-first Customer Relationship Management (CRM) system engineered specifically for the life sciences sector. Designed with field representatives in mind, the platform revolutionizes how interactions with Healthcare Professionals (HCPs) are logged, managed, and analyzed.

By integrating a sophisticated LangGraph AI agent powered by Groq's high-speed Large Language Models (`gemma2-9b-it`), MedSync AI bridges the gap between traditional data entry and conversational intelligence. Representatives can seamlessly log structured data through an intuitive UI or leverage natural language processing to extract insights, schedule follow-ups, and summarize notes on the fly. 

This project aims to reduce administrative overhead, enhance data accuracy, and provide actionable insights, ultimately allowing field representatives to focus on building meaningful relationships with HCPs.

---

## Features

- **Dual-Mode Interaction Logging**: Log HCP interactions via a comprehensive structured form or a conversational AI chat interface.
- **Intelligent Entity Extraction**: The LangGraph agent automatically parses natural language inputs to extract key entities such as doctor names, facilities, interaction types, sentiments, and follow-up dates.
- **Smart Follow-up Management**: Seamlessly schedule follow-up dates during interaction logging. The system automatically provisions, updates, or deletes reminders based on real-time data modifications.
- **In-Place Record Editing**: Robust edit capabilities allow users to modify existing interaction logs with full form pre-filling, ensuring data integrity without duplicating records.
- **Voice Dictation & AI Summarization**: Browser-native speech-to-text capabilities coupled with AI summarization to condense lengthy discussion notes into concise, actionable summaries.
- **Notification Center**: A centralized hub to track all upcoming and overdue follow-up reminders with dynamic urgency indicators.
- **Analytics Dashboard & Ledger**: Real-time insights, interactive charts, and a comprehensive, filterable ledger of all past interactions to monitor engagement trends.

---

## Tech Stack

The architecture is designed for performance, scalability, and seamless AI integration.

### Frontend
- **Framework**: React 19, Vite
- **State Management**: Redux Toolkit (Async Thunks)
- **Routing**: React Router v6
- **Styling**: Vanilla CSS, Google Inter Font, Custom Design System
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.11+, FastAPI
- **Database ORM**: SQLAlchemy
- **Database Engine**: SQLite (Default) / MySQL / PostgreSQL ready
- **Data Validation**: Pydantic

### AI & Agentic Framework
- **Agent Orchestration**: LangGraph (StateGraph architecture)
- **LLM Integration**: LangChain
- **Language Models**: Groq (`gemma2-9b-it` as primary, `llama-3.3-70b-versatile` as fallback)

---

## Project Structure

```text
medsync-ai-crm/
├── backend/
│   ├── ai_agent.py          # LangGraph agent orchestration and tools definitions
│   ├── config.py            # Environment configurations and LLM settings
│   ├── crud.py              # Core database CRUD operations
│   ├── database.py          # SQLAlchemy engine and session factory
│   ├── main.py              # FastAPI application and REST endpoints
│   ├── models.py            # Database schema models (Interaction, Reminder)
│   ├── schemas.py           # Pydantic validation schemas
│   └── requirements.txt     # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Modular React components (LogInteraction, Layout, etc.)
│   │   ├── store/           # Redux store and interaction slices
│   │   ├── App.jsx          # Main application routing and dashboard views
│   │   ├── index.css        # Global design system variables and styles
│   │   └── main.jsx         # React application entry point
│   ├── package.json         # Node.js dependencies and scripts
│   └── vite.config.js       # Vite configuration
│
└── README.md                # Project documentation
```

---

## Installation & Setup

Follow these steps to run the MedSync AI platform locally.

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.11 or higher)
- A valid Groq API Key (Obtain from [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone <repository-url>
cd medsync-ai-crm
```

### 2. Backend Setup
Navigate to the backend directory, initialize a virtual environment, and install dependencies.

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

# Install required Python packages
pip install -r requirements.txt

# Environment Configuration
cp .env.example .env
```
*Open the `.env` file and insert your `GROQ_API_KEY`. Modify the `DATABASE_URL` if you wish to use MySQL or PostgreSQL instead of the default SQLite database.*

### 3. Run the Backend Server
```bash
python main.py
```
*The FastAPI server will be available at `http://localhost:8000`. Swagger documentation can be accessed at `http://localhost:8000/docs`.*

### 4. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies.

```bash
cd frontend

# Install Node modules
npm install
```

### 5. Run the Frontend Client
```bash
npm run dev
```
*The React application will be available at `http://localhost:5173`.*

---

## Future Improvements

While MedSync AI delivers a robust foundational CRM, several enhancements are planned for future iterations:

- **Authentication & Authorization**: Implement robust JWT-based user authentication and Role-Based Access Control (RBAC) to differentiate between field reps, managers, and administrators.
- **Advanced Data Visualizations**: Integrate libraries such as Recharts or Chart.js to provide deeper, interactive analytical views within the Dashboard.
- **Offline Capabilities**: Implement Progressive Web App (PWA) features and local caching to allow field reps to log interactions in environments with poor network connectivity.
- **Multi-Modal AI Inputs**: Expand the AI agent's capabilities to process image uploads (e.g., scanning business cards or physical notes) using vision models.
- **Automated Email Integration**: Allow the AI agent to draft and trigger automated follow-up emails to HCPs directly from the CRM interface.
- **Expanded Database Migration Strategy**: Introduce Alembic for seamless database schema migrations across distributed environments.
