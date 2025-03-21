.PHONY: check
check:
	npx @biomejs/biome check --write

.PHONY: lint
lint:
	npx @biomejs/biome lint

.PHONY: format
format:
	npx @biomejs/biome format --write

.PHONY: no-c
no-c:
	docker compose build --no-cache

.PHONY: exec
exec:
	docker exec -it web_front /bin/bash