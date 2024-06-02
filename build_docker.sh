#!/bin/bash

docker build -t lara-places . -f docker/Dockerfile.prod
docker tag lara-places:latest 315501325515.dkr.ecr.ca-central-1.amazonaws.com/lara-places:latest
docker push 315501325515.dkr.ecr.ca-central-1.amazonaws.com/lara-places:latest

