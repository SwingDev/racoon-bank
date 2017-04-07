#!/bin/bash
docker-compose -f docker-compose.yml logs --tail 100 --follow "$@"
