#!/usr/bin/env sh


postgres_ready() {
python << END
import sys

import psycopg2

try:
    psycopg2.connect(
        dbname="${CSD_WEBAPP_MAIN_POSTGRES_DB_NAME}",
        user="${CSD_WEBAPP_MAIN_POSTGRES_DB_USER}",
        password="${CSD_WEBAPP_MAIN_POSTGRES_DB_PASSWORD}",
        host="${CSD_WEBAPP_SERVER_POSTGRES_HOST}",
        port="${CSD_WEBAPP_SERVER_POSTGRES_PORT}",
        connect_timeout=3,
    )
except psycopg2.OperationalError:
    sys.exit(1)
sys.exit(0)

END
}

#check postgres status
postgres_ready
POSGRES_READY_RETURN_CODE=$?
if [ "POSGRES_READY_RETURN_CODE" -eq "1" ]; then
  echo "Postgres DB is not ready!"
  exit 1
else
   echo "Postgres DB is available!"
fi