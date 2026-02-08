from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application configuration settings"""
    
    # OpenAI Configuration
    openai_api_key: str
    embedding_model: str = "text-embedding-3-small"
    llm_model: str = "gpt-4-turbo-preview"
    llm_temperature: float = 0.0
    
    # RAG Configuration
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_results: int = 4
    
    # Server Configuration
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Database Paths
    vector_db_path: str = "./chroma_db"
    upload_dir: str = "./uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create directories if they don't exist
        os.makedirs(self.vector_db_path, exist_ok=True)
        os.makedirs(self.upload_dir, exist_ok=True)

# Global settings instance
settings = Settings()
