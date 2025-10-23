# Human Rights Monitor MIS

## 👥 Team Members

- Noor – Incident Reporting Module
- Hannen – Victim/Witness Database Module
- Eliaa – Case Management
- All: Analytics Module

## 🧠 Tech Stack

- Backend: FastAPI + MongoDB
- Frontend: React.js
- API Docs: Postman Collection

## 🚀 How to Run

1. Clone the repo
   ```bash
   git clone https://github.com/your-repo/human-rights-monitor.git
   cd human-rights-monitor
   ```
   
3. Run MongoDB server
4.Run the Backend
   ```bash
   cd backend
   .\venv\Scripts\activate
   uvicorn app.main:app --reload
   ```
   
5.Run the Frontend
 ```bash
cd frontend
npm install
npm run dev
```

6.Open the App
- Frontend: http://localhost:5173/
- Backend Docs (Swagger UI): http://127.0.0.1:8000/docs

---

## 🎥 Project Demo

<p align="center">
  <a href="https://drive.google.com/file/d/16wWnw67QIzCvsSAte4oDAzdxRYw-nilu/view?usp=sharing" target="_blank">
    <img src="https://upload.wikimedia.org/wikipedia/commons/7/75/YouTube_social_white_squircle_%282017%29.svg" 
         alt="Watch Demo" width="120" />
  </a>
  <br>
  📺 <strong><a href="https://drive.google.com/file/d/16wWnw67QIzCvsSAte4oDAzdxRYw-nilu/view?usp=sharing" target="_blank">
  Watch the Demo Video on Google Drive</a></strong>
</p>

---

## 📦 Modules Overview


### 1️⃣ Case Management System 
**Responsibilities:**
- CRUD operations for human rights cases  
- Search/filter by date, location, and violation type  
- Track case status (e.g., *new*, *under_investigation*, *resolved*)  
- Attach files/documents (PDFs, images, videos)


### 2️⃣ Incident Reporting Module 
**Responsibilities:**
- Develop secure submission forms for violations  
- Support anonymous and authenticated reporting  
- Allow media uploads (photos, videos, documents)  
- Implement geolocation tagging (Google Maps / OpenStreetMap)

### 3️⃣ Victim/Witness Database Module (Haneen)
**Responsibilities:**
- Design secure database for victims/witnesses  
- Role-based access (authorized users only)  
- Risk assessment tracking (low / medium / high)  
- Support pseudonyms for anonymity

### 4️⃣ Data Analysis & Visualization 
**Responsibilities:**
- Create dashboards for trends and analytics  
- Implement charts (bar, pie, map) using Plotly or D3.js  
- Add data filters (date range, region, violation type)  
