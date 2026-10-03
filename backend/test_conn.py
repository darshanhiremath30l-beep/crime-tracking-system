import os
import json
import sys
from dotenv import load_dotenv

load_dotenv()


def main():
    result = {"ok": False, "used": None, "detail": None}

    DATABASE_URL = os.getenv("DATABASE_URL")
    if DATABASE_URL:
        result["used"] = "DATABASE_URL"
        try:
            from sqlalchemy import create_engine, text

            engine = create_engine(DATABASE_URL, future=True)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            result.update({"ok": True, "detail": "Connected using DATABASE_URL"})
            print(json.dumps(result))
            return 0
        except Exception as e:
            result.update({"error": str(e), "detail": "DATABASE_URL connection failed"})
            print(json.dumps(result))
            return 1

    # Try Oracle if Oracle-specific env vars are provided
    ORACLE_USER = os.getenv("ORACLE_USER")
    if ORACLE_USER:
        try:
            import oracledb

            if "ORACLE_CLIENT_LIBDIR" in os.environ:
                oracledb.init_oracle_client(lib_dir=os.environ["ORACLE_CLIENT_LIBDIR"])

            user = ORACLE_USER
            password = os.getenv("ORACLE_PASSWORD", "")
            dsn = os.getenv("ORACLE_DSN") or f"{os.getenv('ORACLE_HOST','localhost')}:{os.getenv('ORACLE_PORT','1521')}/{os.getenv('ORACLE_SERVICE','XE')}"

            conn = oracledb.connect(user=user, password=password, dsn=dsn)
            conn.close()
            result.update({"ok": True, "used": "oracle", "detail": "Oracle connection successful"})
            print(json.dumps(result))
            return 0
        except Exception as e:
            result.update({"error": str(e), "detail": "Oracle connection failed"})
            print(json.dumps(result))
            return 1

    # Fallback to SQLite
    try:
        from sqlalchemy import create_engine, text

        sqlite_url = os.getenv("SQLITE_URL", f"sqlite:///{os.path.join(os.path.dirname(__file__), 'city360.db')}")
        result["used"] = "sqlite"
        result["url"] = sqlite_url
        engine = create_engine(sqlite_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        result.update({"ok": True, "detail": "SQLite connection OK"})
        print(json.dumps(result))
        return 0
    except Exception as e:
        result.update({"error": str(e), "detail": "SQLite connection failed"})
        print(json.dumps(result))
        return 1


if __name__ == "__main__":
    sys.exit(main())
