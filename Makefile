SERVICENAME = racoon-bank
BASENAME = swingdevelopment/$(SERVICENAME)
SHA1 = $(shell git rev-parse HEAD)
TAG = $(TAG_PREFIX)_$(SHA1)

.PHONY: build test push auth_gcr tag_gcr push_gcr deploy_gcr deploy_swarm

all: build

build:
	docker build -t $(BASENAME):$(TAG) -f Dockerfile .

test:
	docker run $(DOCKER_RUN_TEST_PARAMS) $(BASENAME):$(TAG) npm run coverage

push:
	docker push $(BASENAME):$(TAG)

