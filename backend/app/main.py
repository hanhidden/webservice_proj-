
# app/main.py
from app.api.routes.auth import router as auth_router
from app.api.routes.test_connection import router as test_connection_router
from app.api.routes.users import router as users_router 
from fastapi import FastAPI,Request, HTTPException

from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.victims import router as victim_router
from app.api.routes.case_router import router as case_router

from app.api.routes.incident_report import router as incident_report
from app.api.routes.evidence_route import router as evidence_router


from app.api.routes.case_status_history import router as case_status_history_router
from app.api.routes.analytics_routes import router as analytics_router



app = FastAPI()



MAX_REQUEST_SIZE = 200 * 1024 * 1024  # 200 MB



@app.middleware("http")

async def limit_request_size(request: Request, call_next):

    content_length = request.headers.get('content-length')

    if content_length and int(content_length) > MAX_REQUEST_SIZE:

        raise HTTPException(status_code=413, detail="Request payload too large. Please reduce the size of evidence files.")

    response = await call_next(request)

    return response


# Updated CORS configuration
origins = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",  # Add localhost with 127.0.0.1
    "http://localhost:5174",  # Add common Vite alternative port
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  # Explicitly list all methods
    allow_headers=["*"],
    expose_headers=["*"],  # Add this to expose headers to frontend
)
#new

@app.get("/")
async def root():
    return {"message": "API is running"}


app.include_router(test_connection_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])  # New router
app.include_router(victim_router, prefix="/api/victims", tags=["Victims"])

app.include_router(case_router, prefix="/api/cases", tags=["Cases"])
app.include_router(incident_report, prefix="/api/incident_reports", tags=["Incident Reports"])

app.include_router(evidence_router, prefix="/api/evidence", tags=["Evidence"])
app.include_router(case_status_history_router, prefix="/api/case_status_history", tags=["Case Status History"])

app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])

