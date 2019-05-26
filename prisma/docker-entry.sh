#!/bin/sh

until nc -z $DB_HOST $DB_PORT; do
    echo "Wating connection established for $DB_HOST:$DB_PORT ..."
    sleep 1
done

exec /app/start.sh "$@"
