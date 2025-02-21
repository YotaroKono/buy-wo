.PHONY: check
check:
	npx @biomejs/biome check --write

.PHONY: no-c
no-c:
	docker compose build --no-cache

.PHONY: exec
exec:
	docker exec -it web_front /bin/bash