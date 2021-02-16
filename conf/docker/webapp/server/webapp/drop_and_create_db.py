#!/usr/bin/env python3

import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

db_user = os.environ["CSD_WEBAPP_MAIN_POSTGRES_DB_USER"]
db_name = os.environ["CSD_WEBAPP_MAIN_POSTGRES_DB_NAME"]
db_pwd = os.environ["CSD_WEBAPP_MAIN_POSTGRES_DB_PASSWORD"]
db_host = os.environ["CSD_WEBAPP_SERVER_POSTGRES_HOST"]
db_port = os.environ["CSD_WEBAPP_SERVER_POSTGRES_PORT"]

# --- cancel all connections
try:
    conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_pwd,
        host=db_host,
        port=db_port,
        connect_timeout=3,
    )

    cur = conn.cursor()
    cur.execute(
        """
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = %s;
      """,
        [db_name],
    )
except psycopg2.OperationalError:
    # this exception is expected
    pass

# --- reconnect drop and create db
conn = psycopg2.connect(
    dbname='postgres',
    user=db_user,
    password=db_pwd,
    host=db_host,
    port=db_port,
    connect_timeout=3,
)

conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

print(db_name)
cur.execute(f'DROP DATABASE IF EXISTS "{db_name}";')
conn.commit()
cur.execute(f'CREATE DATABASE "{db_name}";')

print('Drop and create db succeeded')