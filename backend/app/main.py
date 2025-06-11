# # app/main.py
from app.api.routes.auth import router as auth_router
from app.api.routes.test_connection import router as test_connection_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.victims import router as victim_router
from app.api.routes.case_router import router as case_router
from app.api.routes.report_router import router as report_router



app = FastAPI()

origins = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",
    "http://localhost:5173",  
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)


app.include_router(test_connection_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth",tags=["Auth"])
app.include_router(victim_router, prefix="/api/victims", tags=["Victims"])
app.include_router(case_router, prefix="/api/cases", tags=["Cases"])
app.include_router(report_router, prefix="/api/incident_reports", tags=["Incident Reports"])



