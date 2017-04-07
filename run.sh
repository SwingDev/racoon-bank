#!/bin/bash
set -e

function cleanup {
  ./down.sh
}
cleanup
trap cleanup EXIT

./up.sh
./logs.sh