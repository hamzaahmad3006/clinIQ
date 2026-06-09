from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.patients import router as patients_router
from routes.audit_logs import router as audit_logs_router
from routes.break_glass import router as break_glass_router
from routes.brief import router as brief_router
from routes.rounds import router as rounds_router
from routes.config import router as config_router
from routes.llm import router as llm_router

app = FastAPI(
    title="ClinIQ Backend API",
    description="AI-Powered Clinical Information Aggregation System",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients_router)
app.include_router(audit_logs_router)
app.include_router(break_glass_router)
app.include_router(brief_router)
app.include_router(rounds_router)
app.include_router(config_router)
app.include_router(llm_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "ClinIQ Backend", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
