#!/bin/bash

docker stop consul1 consul2 &>/dev/null

docker run -d --rm --name=consul1 -p 8501:8500 consul agent -dev -client 0.0.0.0
docker run -d --rm --name=consul2 -p 8502:8500 consul agent -dev -client 0.0.0.0

