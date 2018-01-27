#!/bin/bash

docker stop consul1 consul2 &>/dev/null

OPTIONS='-dev -client 0.0.0.0'

docker run -d --rm -v ${PWD}/acl-config.json:/consul/config/acl-config.json:ro --name=consul1 -p 8501:8500 consul agent $OPTIONS
docker run -d --rm -v ${PWD}/acl-config.json:/consul/config/acl-config.json:ro --name=consul2 -p 8502:8500 consul agent $OPTIONS
