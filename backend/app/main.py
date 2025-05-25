# # from fastapi import FastAPI
# # from backend.app.api.routes import case_routes

# # app = FastAPI()

# # app.include_router(case_routes.router)

# from fastapi import FastAPI
# from app.routes import case_routes, test_connection

# app = FastAPI()

# app.include_router(case_routes.router, prefix="/api")
# app.include_router(test_connection.router, prefix="/api")

# app/main.py
from fastapi import FastAPI
# from app.api.routes.test_connection import test_connection

from app.api.routes.test_connection import router as test_connection_router
app = FastAPI()

# app.include_router(test_connection.router, prefix="/api")
app.include_router(test_connection_router, prefix="/api")