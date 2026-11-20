from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.test_cases import router as test_cases_router
from app.api.v1.evaluate import router as evaluate_router
from app.api.v1.experiments import router as experiments_router
from app.api.v1.guard import router as guard_router
from app.api.v1.reports import router as reports_router
from app.api.v1.models import router as models_router
from app.api.v1.metrics import router as metrics_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(models_router)
api_router.include_router(datasets_router)
api_router.include_router(test_cases_router)
api_router.include_router(evaluate_router)
api_router.include_router(experiments_router)
api_router.include_router(guard_router)
api_router.include_router(reports_router)
api_router.include_router(metrics_router)
