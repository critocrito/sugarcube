.PHONY: lint compile

BINDIR=node_modules/.bin
LERNA=$(BINDIR)/lerna
BABEL=$(BINDIR)/babel

ARG=$(filter-out $@,$(MAKECMDGOALS))

setup :
	@npm install
	@$(LERNA) bootstrap

compile :
	@if [ "$(ARG)" = "" ]; then \
		for d in packages/*; do \
			echo "Compiling $$d ..." ; \
			make compile $$(basename $$d) ; \
		done ; \
	else \
		for p in $(ARG); do \
			$(BABEL) -s -D -d packages/$$p/_dist packages/$$p/lib && \
			echo "✓ $$d passed compilation\n" ;\
		done ; \
	fi

docs :
	@:

boilerplate-plugin :
	@:

packages :
	@:

%:
	@:

.DEFAULT :
	@:
