#!/usr/bin/env bash

docker run -d \
  --name pg \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=im_duels \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql \
  postgres:18-bookworm
