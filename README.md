# 🪶 NayePankh Foundation Portal (Prototype)

A comprehensive, bilingual (English & Hindi) digital portal designed for **NayePankh Foundation**—an Uttar Pradesh government-registered NGO (Reg. No: UP/2021/02845612). This platform bridges the gap between donors, volunteers, and administration by providing interactive tools for tax calculations, real-time donation utilization tracking, automated volunteer matching, and an AI-powered conversational assistant.

---

## 🌟 Core Features

### 1. 🇮🇳 Bilingual Interface (English & हिन्दी)
*   Fully localizable homepage, navigation headers, widgets, forms, and alerts.
*   Seamless language toggle in the header, letting users switch immediately between English and Hindi.

### 2. 🧮 Interactive 80G Tax & Impact Calculator
*   **Tax Optimization**: Calculates 50% tax deductions (under Section 80G) and estimates net costs based on standard tax slabs (10%, 20%, or 30%).
*   **Tangible Impact Estimator**: Converts donation amounts into visual metrics representing real-world deliverables:
    *   *Nutritious Meals* (Kanpur Slum Relief @ ₹50/meal)
    *   *Hygiene Kits* (Women Hygiene Relief @ ₹40/kit)
    *   *School Study Kits* (Rural Literacy Drive @ ₹500/kit)
*   **Direct Logging**: Logs simulated donations directly to the user’s account database with one-click submissions.

### 3. 🛡️ Supporter Portal & Live Utilization Tracker
*   Allows donors to sign up, log in, and securely view their contribution histories.
*   **Real-Time Utilization Progress**: For each contribution, donors can view a detailed breakdown including:
    *   Specific project location details.
    *   Detailed target outcome statements.
    *   Unique transaction Receipt ID.
    *   Direct links to download official 80G tax receipt PDFs.
    *   A progress utilization bar (indicating when goods are procured vs. distributed on-field).

### 4. 📝 Volunteer Match Quiz
*   An interactive, multi-step personality and commitment quiz that assesses candidate skills (Teaching, Fieldwork, Creative, or Admin), time commitments, and remote vs. on-field preferences.
*   Instantly matches volunteers to designated roles (e.g., *Rural Education Mentor*, *Grassroots Relief Lead*, *Digital Advocacy Catalyst*).
*   Enables registration with WhatsApp contacts for immediate team onboarding.

### 5. 📊 Trust & Transparency Dashboard
*   Interactive, client-rendered **Chart.js** charts summarizing NGO fund distributions (doughnut chart) and donor contribution growth trends over the years (bar chart).
*   Display of legal trust credentials, certificates, registration numbers, and audit verification statements.

### 6. 🤖 Gemini AI-Powered Assistant Widget
*   Bilingual chatbot assistant that handles general inquiries about NayePankh, registration numbers, tax exemption rules, and volunteer information.
*   Uses the official **Google Gemini API client (`gemini-1.5-flash`)** with a custom system prompt.
*   Robust fallback logic matching Hindi and English keywords in offline/rule-based mode.
*   Features **Text-to-Speech** (read-aloud browser voices) and **Speech-to-Text** (Web Speech API voice inputs).
*   Inquiries are logged securely for administrative oversight.

### 7. 👑 Administrative Dashboard Portal
*   Accessible via dedicated admin credentials.
*   Provides high-level aggregate KPI cards (total raised funds, active volunteer enrollment, average contribution, chatbot queries handled).
*   Dynamic administrative Chart.js layouts showing monthly trends, payment methods, and volunteer role breakdowns.
*   Interactive tables with advanced filters, search, and sorting algorithms (by date, amount, donor loyalty, and aggregate totals).
*   **Actions**:
    *   *Export to CSV* for donation logs and volunteer registrations.
    *   *Chat-to-WhatsApp links* for volunteers (opens pre-filled chat boxes using their registered numbers).
    *   *AI Bot Logs Inspector* to audit AI response performance with history-clearing support.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite | Responsive UI, component-driven architecture |
| **Charts** | Chart.js | Visualization of donation trends and metrics |
| **Icons & Fonts** | FontAwesome, Google Fonts | Outfit, Poppins, and Noto Sans Devanagari fonts |
| **Styling** | Vanilla CSS | Bespoke typography, responsive grid grids, and custom glassmorphism systems |
| **Backend** | FastAPI (Python) | High-performance asynchronous API endpoints |
| **Server** | Uvicorn | ASGI web server |
| **AI Integration** | `google-genai` SDK | Gemini 1.5 Flash natural language query answering |
| **Database** | JSON Files | Local mock database seed and file-system persistent logs |

---

## 📂 Repository Structure

```text
nayep/
├── backend/                  # FastAPI backend service
│   ├── server.py             # FastAPI server with auth, database managers, and Gemini integration
│   ├── requirements.txt      # Python dependencies list
│   ├── .env                  # Configuration file for API keys (e.g., GEMINI_API_KEY)
│   ├── users.json            # Local persistent JSON database for user profiles
│   ├── donations.json        # Local persistent JSON database for donation records
│   ├── volunteers.json       # Local persistent JSON database for volunteer match signups
│   └── bot_logs.json         # Local persistent JSON database for AI chatbot logs
│
└── frontend/                 # React frontend application
    ├── index.html            # Entrypoint HTML document
    ├── vite.config.js        # Vite build and dev configuration
    ├── package.json          # Node.js dependencies and run scripts
    └── src/
        ├── main.jsx          # React entrypoint
        ├── App.jsx           # Root application component mapping router state
        ├── App.css           # Local component styles
        ├── index.css         # Global design token stylesheets
        ├── config.js         # API URL configuration matching local backend endpoints
        ├── translations.js   # Bilingual translation dictionaries (English & Hindi)
        └── components/
            ├── Header.jsx    # App header with language selector and interactive links
            ├── Footer.jsx    # App footer containing credentials and navigation links
            ├── Login.jsx     # Registration & login flows with form validation
            ├── Homepage.jsx  # Hero, Tax Calculator, Live tracker, and Volunteer Quiz view components
            ├── AdminPortal.jsx # Admin dashboard with KPIs, Chart.js trends, bot logs, and CSV downloader
            ├── ChatbotWidget.jsx # AI chat widget with Web Speech API integration (STT/TTS support)
            └── LanguageContext.jsx # Language toggle context provider
```

---

## ⚙️ Installation & Development Setup

Follow these steps to run both the backend API and frontend Vite dev servers locally on your machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Python](https://www.python.org/) (v3.9+ recommended)

---

### Step 1: Backend Setup (FastAPI)

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment:
   ```powershell
   python -m venv venv
   ```
3. Activate the virtual environment:
   *   **Windows (PowerShell):**
       ```powershell
       .\venv\Scripts\Activate.ps1
       ```
   *   **macOS/Linux:**
       ```bash
       source venv/bin/activate
       ```
4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Create a `.env` file in the `backend/` directory to store your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(If no API key is provided, the chatbot automatically falls back to local rule-based keyword matching.)*
6. Start the FastAPI server:
   ```bash
   python server.py
   ```
   The server will run on `http://127.0.0.1:8000`. You can inspect the interactive Swagger API documentation at `http://127.0.0.1:8000/docs`.

---

### Step 2: Frontend Setup (React & Vite)

1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the address shown in your terminal (usually `http://localhost:5173`).

---

## 🔑 Test Credentials & Accounts

For quick manual testing, you can use the following pre-configured user credentials:

### Standard Supporter Account
*   **Username (Email):** `ramesh@gmail.com`
*   **Password:** `password123`
*   *(Log in with this account to instantly view pre-loaded donation utilization trackings and receipts!)*

### System Administrator Account
*   **Username:** `admin`
*   **Password:** `admin123`
*   *(Log in using these credentials to access the full administrative panel.)*

---

## 📜 Legal & Registration Details
*   **Government Registration Number:** `UP/2021/02845612`
*   **Income Tax Act status:** Registered under Section 12A and 80G.
*   **80G Tax Certificate Number:** `AAATN1195PF20214`
*   **Direct Benefits:** Donors are legally eligible for a **50% direct tax deduction** on all financial contributions.
