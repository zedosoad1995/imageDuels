#!/usr/bin/env bash

docker run -d \
  --name pg \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=im_duels \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql \
  postgres:18-bookworm \
  -c shared_preload_libraries=pg_stat_statements \
  -c pg_stat_statements.track=all \
  -c pg_stat_statements.max=10000

docker exec -it pg psql -U admin -d im_duels -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
