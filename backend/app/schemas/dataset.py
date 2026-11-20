from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class DatasetBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    version: str = Field(default="v1.0.0", max_length=30)
    description: Optional[str] = None
    languages: List[str] = Field(
        default_factory=lambda: [
            "English",
            "Kannada Native (ಕನ್ನಡ)",
            "Romanized Kannada",
            "Kanglish (Code-Mixed)"
        ]
    )
    categories: List[str] = Field(
        default_factory=lambda: [
            "Cybersecurity safety",
            "Fraud and scam prevention"
        ]
    )
    validation_status: str = "validated"
    review_status: str = "Approved"
    author: str = "AI Research R2 Core Team"

class DatasetCreate(DatasetBase):
    id: Optional[str] = None

class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    languages: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    validation_status: Optional[str] = None
    review_status: Optional[str] = None
    author: Optional[str] = None

class DatasetResponse(DatasetBase):
    id: str
    test_case_count: int = 0
    testCaseCount: Optional[int] = None
    last_updated: Optional[str] = None
    lastUpdated: Optional[str] = None
    validationStatus: Optional[str] = None
    reviewStatus: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
