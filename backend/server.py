import os
import json
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Try to load .env manually if it exists
if os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                if "=" in line and not line.strip().startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k.strip()] = v.strip().strip('"').strip("'")
    except Exception as e:
        print(f"Error loading .env file: {e}")

# Try to initialize Gemini API Client
gemini_available = False
client = None

api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if api_key:
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        gemini_available = True
        print("INFO: Gemini API client initialized successfully.")
    except Exception as e:
        print(f"WARNING: Failed to initialize Gemini client: {e}")
else:
    print("WARNING: GEMINI_API_KEY or GOOGLE_API_KEY not found. Running in rule-based fallback mode.")

# System prompt for Gemini AI
SYSTEM_PROMPT = """
You are a helpful bilingual assistant (fluent in English and Hindi) for the NayePankh Foundation, an Uttar Pradesh government registered NGO (Reg. No: UP/2021/02845612).
Your goal is to answer queries about the NGO accurately, politely, and concisely based on the following verified organizational facts.

NGO Facts:
- Registration details: Registered under Section 12A and 80G of the Income Tax Act. 80G Certificate: AAATN1195PF20214.
- Tax exemption: Donors get a 50% tax deduction on all contributions. The official 80G tax receipt will be sent to the donor's WhatsApp within 24 hours of a successful donation.
- Main programs & campaigns:
  1. Rural Literacy Drive (School Kits for education support). Campaign Key: 'edu'.
  2. Community Food Campaign (Free nutritious meals in Kanpur slums). Campaign Key: 'food'.
  3. Women Hygiene Relief (Sanitary pads and kits distribution). Campaign Key: 'hygiene'.
  4. General Community Welfare (clothing drives, winter blankets, general support). Campaign Key: 'general'.
- Location: Active primarily on-field in Uttar Pradesh (Lucknow, Kanpur, and surrounding rural areas).
- Volunteering: Students can take the "Volunteer Match Quiz" on the portal to find roles such as Rural Education Mentor, Grassroots Relief Lead, Digital Advocacy Catalyst, or Campaign Operations Coordinator. Certificates and recommendation letters are provided to volunteers.
- Contact: Official email is info@nayepankh.com.

Guidelines:
- Reply in the language requested by the user. If they write in Hindi, reply in Hindi. If in English, reply in English. If they write in Hinglish, reply in clear, simple Hindi or Hinglish.
- Keep your answers brief, polite, and directly address the user's query.
- If the user asks general questions unrelated to NayePankh or charity, politely guide them back to NayePankh topics.
"""

app = FastAPI(title="NayePankh Foundation Portal API")

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits requests from Vite dev server on any port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Files
USERS_FILE = "users.json"
DONATIONS_FILE = "donations.json"
VOLUNTEERS_FILE = "volunteers.json"
BOT_LOGS_FILE = "bot_logs.json"

# Mock Initial Datasets for Seeding
mock_donations = [
  { "name": "Ramesh Kumar", "date": "2026-06-15", "amount": 15000.0, "method": "UPI (Paytm)", "status": "Successful", "campaignKey": "edu", "email": "ramesh@gmail.com" },
  { "name": "Shubham Tripathi", "date": "2026-06-14", "amount": 5000.0, "method": "NetBanking", "status": "Successful", "campaignKey": "food", "email": "shubham@gmail.com" },
  { "name": "Priya Agarwal", "date": "2026-06-12", "amount": 2500.0, "method": "Credit Card", "status": "Successful", "campaignKey": "hygiene", "email": "priya@gmail.com" },
  { "name": "Dr. Vivek Mishra", "date": "2026-06-10", "amount": 50000.0, "method": "UPI (GPay)", "status": "Successful", "campaignKey": "edu", "email": "vivek@gmail.com" },
  { "name": "Ankita Gupta", "date": "2026-06-08", "amount": 1000.0, "method": "Debit Card", "status": "Successful", "campaignKey": "hygiene", "email": "ankita@gmail.com" },
  { "name": "Rajesh Yadav", "date": "2026-06-06", "amount": 12000.0, "method": "UPI (PhonePe)", "status": "Successful", "campaignKey": "edu", "email": "rajesh@gmail.com" },
  { "name": "Sunita Sharma", "date": "2026-06-05", "amount": 3000.0, "method": "NetBanking", "status": "Pending", "campaignKey": "food", "email": "sunita@gmail.com" },
  { "name": "Aman Deep", "date": "2026-06-04", "amount": 7500.0, "method": "Credit Card", "status": "Successful", "campaignKey": "edu", "email": "aman@gmail.com" },
  { "name": "Neha Chaurasia", "date": "2026-06-02", "amount": 4500.0, "method": "UPI (GPay)", "status": "Successful", "campaignKey": "food", "email": "neha@gmail.com" },
  { "name": "Karan Malhotra", "date": "2026-06-01", "amount": 8000.0, "method": "UPI (Paytm)", "status": "Pending", "campaignKey": "edu", "email": "karan@gmail.com" }
]

mock_volunteers = [
  { "date": "2026-06-15 11:24", "name": "Amit Trivedi", "phone": "9876543210", "role": "Rural Education Mentor", "time": "Weekend Drives", "loc": "On-field (UP)" },
  { "date": "2026-06-14 16:40", "name": "Shalini Mishra", "phone": "8877665544", "role": "Digital Advocacy Catalyst", "time": "3-5 Hours / Week", "loc": "Remote (WFH)" },
  { "date": "2026-06-12 10:15", "name": "Kabir Dev", "phone": "7766554433", "role": "Grassroots Relief Lead", "time": "Weekend Drives", "loc": "On-field (UP)" },
  { "date": "2026-06-10 14:02", "name": "Ritu Jaiswal", "phone": "9900887766", "role": "Campaign Operations Coordinator", "time": "1-2 Hours / Week", "loc": "Remote (WFH)" }
]

mock_bot_logs = [
  { "timestamp": "2026-06-15 14:05", "message": "how to volunteer?", "lang": "EN", "keyword": "volunteer", "reply": "We welcome you to join..." },
  { "timestamp": "2026-06-15 12:12", "message": "दान कैसे करें?", "lang": "HI", "keyword": "donate", "reply": "दान करने के लिए..." },
  { "timestamp": "2026-06-14 18:22", "message": "80G tax exemption details", "lang": "EN", "keyword": "80g", "reply": "NayePankh Foundation is..." },
  { "timestamp": "2026-06-14 11:55", "message": "रजिस्ट्रेशन नंबर बताएं", "lang": "HI", "keyword": "registration", "reply": "जी हाँ, नयेपंख पूरी तरह..." },
  { "timestamp": "2026-06-13 16:30", "message": "what is phone number", "lang": "EN", "keyword": "Unknown", "reply": "I am sorry, I could not..." }
]

mock_users = [
  { "name": "Ramesh Kumar", "email": "ramesh@gmail.com", "phone": "9876543210", "password": "password123" }
]

# Database Access Helpers
def load_json(filepath: str, default_data=[]) -> list:
    if not os.path.exists(filepath):
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(default_data, f, ensure_ascii=False, indent=2)
        return default_data
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default_data

def save_json(filepath: str, data: list):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Startup Seeding
@app.on_event("startup")
def startup_seeding():
    load_json(USERS_FILE, mock_users)
    load_json(DONATIONS_FILE, mock_donations)
    load_json(VOLUNTEERS_FILE, mock_volunteers)
    load_json(BOT_LOGS_FILE, mock_bot_logs)

# Pydantic Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class DonationRequest(BaseModel):
    name: str
    email: str
    amount: float
    method: str
    status: str = "Successful"
    campaignKey: str

class VolunteerRequest(BaseModel):
    name: str
    phone: str
    role: str
    time: str
    loc: str

class ChatbotRequest(BaseModel):
    message: str
    lang: str

# ----------------- AUTH ENDPOINTS -----------------
@app.post("/api/auth/register")
def register_user(req: RegisterRequest):
    users = load_json(USERS_FILE)
    if any(u.get("email").lower() == req.email.lower() for u in users):
        raise HTTPException(status_code=400, detail="This email is already registered!")
    
    new_user = {
        "name": req.name,
        "email": req.email,
        "phone": req.phone,
        "password": req.password
    }
    users.append(new_user)
    save_json(USERS_FILE, users)

    # Seed 2 mock donations for this new user so they can view tracking instantly
    donations = load_json(DONATIONS_FILE)
    dummy_donations = [
      { "name": req.name, "date": "2026-06-01", "amount": 7500.0, "method": "UPI (GPay)", "status": "Successful", "campaignKey": "edu", "email": req.email },
      { "name": req.name, "date": "2026-05-15", "amount": 1800.0, "method": "UPI (Paytm)", "status": "Successful", "campaignKey": "food", "email": req.email }
    ]
    save_json(DONATIONS_FILE, dummy_donations + donations)

    return new_user

@app.post("/api/auth/login")
def login_user(req: LoginRequest):
    # Admin Credentials Check
    if req.username.lower() == 'admin' and req.password == 'admin123':
        return {"name": "System Administrator", "email": "admin@nayepankh.com", "role": "admin"}

    users = load_json(USERS_FILE)
    matched = next((u for u in users if (u.get("email").lower() == req.username.lower() or u.get("name") == req.username) and u.get("password") == req.password), None)
    
    if matched:
        # Guarantee mock donations are seeded if login is successful (fallback verification)
        donations = load_json(DONATIONS_FILE)
        user_donations = [d for d in donations if d.get("email", "").lower() == matched.get("email").lower()]
        if not user_donations:
            dummy_donations = [
              { "name": matched["name"], "date": "2026-06-01", "amount": 7500.0, "method": "UPI (GPay)", "status": "Successful", "campaignKey": "edu", "email": matched["email"] },
              { "name": matched["name"], "date": "2026-05-15", "amount": 1800.0, "method": "UPI (Paytm)", "status": "Successful", "campaignKey": "food", "email": matched["email"] }
            ]
            save_json(DONATIONS_FILE, dummy_donations + donations)
        return matched

    raise HTTPException(status_code=401, detail="Invalid username or password.")

# ----------------- DONATIONS ENDPOINTS -----------------
@app.get("/api/donations")
def get_donations(
    sort: str = "date-new",
    status: str = "all",
    search: str = ""
):
    donations = load_json(DONATIONS_FILE)
    
    # Filter by Status
    if status != "all":
        donations = [d for d in donations if d.get("status") == status]
        
    # Filter by Search Text
    if search:
        s_lower = search.lower()
        campaign_names = {
            "edu": "rural literacy school kits target",
            "food": "community food kanpur slums target",
            "hygiene": "women hygiene sanitary pads target",
            "general": "general community welfare target"
        }
        filtered = []
        for d in donations:
            name = d.get("name", "").lower()
            method = d.get("method", "").lower()
            camp_key = d.get("campaignKey", "general")
            camp_text = campaign_names.get(camp_key, "")
            if s_lower in name or s_lower in method or s_lower in camp_text:
                filtered.append(d)
        donations = filtered

    # Sort
    if sort == "date-new":
        donations.sort(key=lambda x: x.get("date", ""), reverse=True)
    elif sort == "date-old":
        donations.sort(key=lambda x: x.get("date", ""))
    elif sort == "amount-high":
        donations.sort(key=lambda x: x.get("amount", 0.0), reverse=True)
    elif sort == "amount-low":
        donations.sort(key=lambda x: x.get("amount", 0.0))
    elif sort == "freq-high":
        freq_map = {}
        for d in donations:
            key = d.get("name", "").lower().strip()
            freq_map[key] = freq_map.get(key, 0) + 1
        donations.sort(key=lambda x: (freq_map.get(x.get("name", "").lower().strip(), 0), x.get("date", "")), reverse=True)
    elif sort == "total-high":
        total_map = {}
        for d in donations:
            key = d.get("name", "").lower().strip()
            total_map[key] = total_map.get(key, 0) + d.get("amount", 0.0)
        donations.sort(key=lambda x: (total_map.get(x.get("name", "").lower().strip(), 0.0), x.get("date", "")), reverse=True)

    return donations

@app.get("/api/donations/user")
def get_user_donations(email: str):
    donations = load_json(DONATIONS_FILE)
    return [d for d in donations if d.get("email", "").lower() == email.lower()]

@app.post("/api/donations")
def create_donation(req: DonationRequest):
    donations = load_json(DONATIONS_FILE)
    new_donation = {
        "name": req.name,
        "email": req.email,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "amount": req.amount,
        "method": req.method,
        "status": req.status,
        "campaignKey": req.campaignKey
    }
    donations.insert(0, new_donation)
    save_json(DONATIONS_FILE, donations)
    return new_donation

# ----------------- VOLUNTEERS ENDPOINTS -----------------
@app.get("/api/volunteers")
def get_volunteers(
    sort: str = "date-new",
    search: str = ""
):
    volunteers = load_json(VOLUNTEERS_FILE)
    
    # Filter search
    if search:
        s_lower = search.lower()
        volunteers = [
            v for v in volunteers 
            if s_lower in v.get("name", "").lower() 
            or s_lower in v.get("role", "").lower() 
            or s_lower in v.get("loc", "").lower()
        ]
        
    def get_commitment_value(time_str):
        if not time_str:
            return 1
        s = time_str.lower()
        if '5' in s or 'weekend' in s or 'शनि' in s or 'सप्ताह' in s:
            return 3
        if '2' in s or 'घंटे' in s:
            return 2
        return 1

    # Sort
    if sort == "date-new":
        volunteers.sort(key=lambda x: x.get("date", ""), reverse=True)
    elif sort == "date-old":
        volunteers.sort(key=lambda x: x.get("date", ""))
    elif sort == "name-asc":
        volunteers.sort(key=lambda x: x.get("name", "").lower())
    elif sort == "commit-high":
        volunteers.sort(key=lambda x: (get_commitment_value(x.get("time", "")), x.get("date", "")), reverse=True)
        
    return volunteers

@app.post("/api/volunteers")
def create_volunteer(req: VolunteerRequest):
    volunteers = load_json(VOLUNTEERS_FILE)
    new_volunteer = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "name": req.name,
        "phone": req.phone,
        "role": req.role,
        "time": req.time,
        "loc": req.loc
    }
    volunteers.insert(0, new_volunteer)
    save_json(VOLUNTEERS_FILE, volunteers)
    return new_volunteer

# ----------------- CHATBOT ENDPOINTS -----------------
faq_answers = {
    "en": [
        {
            "keywords": ["80g", "tax", "deduct", "exempt", "save", "receipt"],
            "response": "NayePankh Foundation is 80G & 12A registered under UP Govt guidelines. Any donation you make is eligible for a 50% direct tax deduction. Once you complete your donation, our team will WhatsApp your official 80G tax receipt within 24 hours. You can claim it during tax filing!"
        },
        {
            "keywords": ["volunteer", "join", "work", "help", "recru", "team"],
            "response": "We welcome you to join our student organization! You can take our \"Volunteer Match Quiz\" on this page to find a custom role suitable for your skills (teaching, design, or fieldwork). We provide letters of recommendation and volunteer certificates!"
        },
        {
            "keywords": ["certificate", "registration", "regis", "number", "govt", "legal", "trust"],
            "response": "Yes, NayePankh is fully transparent. UP Govt Registration number: UP/2021/02845612. 12A Status: Registered. 80G Status: AAATN1195PF20214. All our transactions undergo annual audits reported to the state."
        },
        {
            "keywords": ["donate", "money", "pay", "bank", "upi", "gpay", "phonepe"],
            "response": "To donate, use our Donation Slider to estimate your impact, then click \"Donate Now\". You can securely contribute via UPI (Paytm/GooglePay), Credit Card, or direct Bank Transfer. Write to info@nayepankh.com for receipt tracking."
        }
    ],
    "hi": [
        {
            "keywords": ["80g", "टैक्स", "बचत", "छूट", "रसीद", "इनकम टैक्स"],
            "response": "नयेपंख फाउंडेशन यूपी सरकार के तहत 80G और 12A पंजीकृत है। आपके द्वारा किए गए सभी दानों पर 50% प्रत्यक्ष आयकर (Income Tax) छूट मिलती है। दान पूरा होने के बाद, हमारी टीम 24 घंटे में आपको व्हाट्सएप पर रसीद भेज देगी।"
        },
        {
            "keywords": ["स्वयंसेवक", "मदद", "काम", "जुड़ना", "भर्ती", "टीम"],
            "response": "हम आपका टीम में स्वागत करते हैं! आप इस पृष्ठ पर दिए गए \"स्वयंसेवक क्विज़\" को भरकर अपने कौशल (जैसे बच्चों को पढ़ाना, सोशल मीडिया, या भोजन वितरण) के अनुसार सही भूमिका चुन सकते हैं। हम काम पूरा होने पर प्रमाण पत्र भी देते हैं!"
        },
        {
            "keywords": ["प्रमाण पत्र", "रजिस्ट्रेशन", "पंजीकरण", "संख्या", "सरकारी", "ट्रस्ट"],
            "response": "जी हाँ, नयेपंख पूरी तरह वैध है। यूपी सरकारी पंजीकरण संख्या: UP/2021/02845612 है। हमारा 12A दर्जा पंजीकृत है और 80G नंबर: AAATN1195PF20214 है। हमारी वित्तीय रिपोर्टों की हर वर्ष स्वतंत्र ऑडिट की जाती है।"
        },
        {
            "keywords": ["दान", "पैसे", "पेमेंट", "बैंक", "यूपीआई", "गूगल पे", "जीपे"],
            "response": "दान करने के लिए, आप दान कैलकुलेटर से अपना प्रभाव देख सकते हैं, फिर \"अभी दान करें\" बटन दबाएं। आप यूपीआई (Paytm, Google Pay), डेबिट/क्रेडिट कार्ड, या सीधे बैंक ट्रांसफर के जरिए दान कर सकते हैं।"
        }
    ]
}

@app.post("/api/chatbot/query")
def chatbot_query(req: ChatbotRequest):
    reply = None
    matched_key = "Gemini AI"
    detected_lang = "en"
    
    # Check if user message contains Devanagari characters (Hindi script)
    has_devanagari = any('\u0900' <= c <= '\u097F' for c in req.message)
    hindi_keywords = ["dan", "paisa", "rupay", "madad", "kaam", "judna", "bharti", "tax", "rasid", "choot", "bachat"]
    is_hindi_msg = has_devanagari or any(kw in req.message.lower() for kw in hindi_keywords)
    detected_lang = "hi" if is_hindi_msg else "en"

    if gemini_available:
        try:
            from google.genai import types
            prompt = f"User inquiry: {req.message}\nRespond in the same language or style (e.g. Hindi, English, Hinglish) in which the user asked the question."
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.7,
                ),
            )
            if response and response.text:
                reply = response.text.strip()
                # Update detected_lang based on Gemini response text
                if any('\u0900' <= c <= '\u097F' for c in reply):
                    detected_lang = "hi"
                else:
                    detected_lang = "en"
        except Exception as e:
            print(f"Error calling Gemini API: {e}. Falling back to rule-based logic.")
            
    # Fallback to rule-based keyword matching if Gemini is not available or failed
    if not reply:
        clean_msg = req.message.lower().strip()
        matched_key = "Unknown"
        langs_to_check = [detected_lang] + (["en"] if detected_lang == "hi" else ["hi"])
        
        for l in langs_to_check:
            for rule in faq_answers[l]:
                for key in rule["keywords"]:
                    if key in clean_msg:
                        reply = rule["response"]
                        matched_key = key
                        detected_lang = l
                        break
                if reply:
                    break
            if reply:
                break
                
        if not reply:
            if detected_lang == "hi":
                reply = "क्षमा करें, मैं इसे समझ नहीं पाया। आप मुझसे निम्नलिखित विषयों पर पूछ सकते हैं:\n1. 80G टैक्स बचत कैसे मिलती है?\n2. स्वयंसेवक (Volunteer) कैसे बनें?\n3. सरकारी पंजीकरण प्रमाणपत्र देखना।\n4. दान कैसे करें?"
            else:
                reply = "I am sorry, I could not capture that key. Try asking me about:\n1. 80G Tax Exemption\n2. How to volunteer & join\n3. NGO Govt Registration number\n4. Donation methods"

    # Log query
    bot_logs = load_json(BOT_LOGS_FILE)
    new_log = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "message": req.message,
        "lang": detected_lang.upper(),
        "keyword": matched_key,
        "reply": reply[:60] + "..." if len(reply) > 60 else reply
    }
    bot_logs.insert(0, new_log)
    save_json(BOT_LOGS_FILE, bot_logs)

    return {"reply": reply}

@app.get("/api/botlogs")
def get_bot_logs():
    return load_json(BOT_LOGS_FILE)

@app.post("/api/botlogs/clear")
def clear_bot_logs():
    save_json(BOT_LOGS_FILE, mock_bot_logs)
    return {"status": "Success"}

# ----------------- ANALYTICS ENDPOINTS -----------------
@app.get("/api/analytics/summary")
def get_analytics_summary():
    donations = load_json(DONATIONS_FILE)
    volunteers = load_json(VOLUNTEERS_FILE)
    bot_logs = load_json(BOT_LOGS_FILE)

    successful = [d for d in donations if d.get("status") == "Successful"]
    total_raised = sum(d.get("amount", 0.0) for d in successful)
    avg_donation = total_raised / len(successful) if successful else 0.0

    return {
        "totalRaised": total_raised,
        "avgDonation": avg_donation,
        "volunteersCount": len(volunteers),
        "queriesCount": len(bot_logs)
    }

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
