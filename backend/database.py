import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

try:
    import oracledb
    if "ORACLE_CLIENT_LIBDIR" in os.environ:
        oracledb.init_oracle_client(lib_dir=os.environ["ORACLE_CLIENT_LIBDIR"])
except ImportError:
    oracledb = None

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

USER = os.getenv("ORACLE_USER", "system")
PASSWORD = os.getenv("ORACLE_PASSWORD", "oracle")
HOST = os.getenv("ORACLE_HOST", "localhost")
PORT = os.getenv("ORACLE_PORT", "1521")
SERVICE = os.getenv("ORACLE_SERVICE", "XE")

def _create_engine(url: str):
    return create_engine(url, echo=False, future=True)

engine = None
if DATABASE_URL:
    try:
        engine = _create_engine(DATABASE_URL)
        with engine.connect() as conn:
            pass
    except Exception as exc:
        logging.warning("DATABASE_URL unavailable or invalid: %s", exc)
        engine = None

if engine is None and oracledb is not None:
    oracle_url = f"oracle+oracledb://{USER}:{PASSWORD}@{HOST}:{PORT}/?service_name={SERVICE}"
    try:
        engine = _create_engine(oracle_url)
        with engine.connect() as conn:
            pass
    except Exception as exc:
        logging.warning("Oracle DB unavailable or unsupported: %s", exc)
        engine = None

if engine is None:
    logging.info("Using local SQLite database crime_dev.db for development.")
    sqlite_url = os.getenv("SQLITE_URL", "sqlite:///./crime_dev.db")
    engine = _create_engine(sqlite_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
