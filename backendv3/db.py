from mysql.connector import pooling
from flask import current_app


def init_db_pool():
    return pooling.MySQLConnectionPool(
        pool_name="fast_checkin_pool",
        pool_size=20,
        pool_reset_session=True,
        host="localhost",
        user="me",
        password="123",
        database="fast_checkin"
    )


def get_db():
    """Get a connection from the pool. Always use inside a try/finally to ensure it's closed."""
    return current_app.db_pool.get_connection()


def paginate_query(cursor, sql, params, page, per_page):
    """Runs a paginated query and returns data + meta."""
    count_sql = f"SELECT COUNT(*) AS total FROM ({sql}) AS subquery"
    cursor.execute(count_sql, params)
    total = cursor.fetchone()["total"]

    offset = (page - 1) * per_page
    cursor.execute(f"{sql} LIMIT %s OFFSET %s", params + [per_page, offset])
    rows = cursor.fetchall()

    return {
        "data": rows,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": -(-total // per_page),
            "has_next": (page * per_page) < total,
            "has_prev": page > 1
        }
    }