import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    version = Column(String(30), nullable=False, default="v1.0.0")
    description = Column(Text, nullable=True)
    
    # Serialized lists stored as JSON strings for SQLite compatibility
    languages_json = Column(Text, default='["English", "Kannada Native (ಕನ್ನಡ)", "Romanized Kannada", "Kanglish (Code-Mixed)"]')
    categories_json = Column(Text, default='["Cybersecurity safety", "Fraud and scam prevention"]')
    
    validation_status = Column(String(30), default="validated")  # validated, draft
    review_status = Column(String(50), default="Approved")       # Approved, Pending Review, Needs correction
    author = Column(String(100), default="AI Research R2 Core Team")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    @property
    def languages(self):
        try:
            return json.loads(self.languages_json) if self.languages_json else []
        except Exception:
            return []

    @languages.setter
    def languages(self, val):
        self.languages_json = json.dumps(val)

    @property
    def categories(self):
        try:
            return json.loads(self.categories_json) if self.categories_json else []
        except Exception:
            return []

    @categories.setter
    def categories(self, val):
        self.categories_json = json.dumps(val)
