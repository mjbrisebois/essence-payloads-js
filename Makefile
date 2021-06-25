#
# Project
#
package-lock.json:	package.json
	touch $@
node_modules:		package-lock.json
	npm install
	touch $@
dist:			node_modules src webpack.config.js
	npm run build
	gzip -kf dist/*.js
	touch $@
build:			node_modules

#
# Testing
#
test:
	make test-unit test-integration
test-debug:
	make test-unit-debug test-integration-debug
test-unit:		build
	npx mocha ./tests/unit
test-unit-debug:	build
	LOG_LEVEL=silly npx mocha ./tests/unit
test-integration:	dist
	npx mocha ./tests/integration
test-integration-debug:	dist
	LOG_LEVEL=silly npx mocha ./tests/integration


#
# Repository
#
clean-remove-chaff:
	@find . -name '*~' -exec rm {} \;
clean-files:		clean-remove-chaff
	git clean -nd
clean-files-force:	clean-remove-chaff
	git clean -fd
clean-files-all:	clean-remove-chaff
	git clean -ndx
clean-files-all-force:	clean-remove-chaff
	git clean -fdx


#
# NPM
#
prepare-package:	dist
preview-package:	clean-files test prepare-package
	npm pack --dry-run .
create-package:		clean-files test prepare-package
	npm pack .
publish-package:	clean-files test prepare-package
	npm publish --access public .
