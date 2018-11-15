# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.13.2](https://github.com/critocrito/sugarcube/compare/v0.13.1...v0.13.2) (2018-11-15)


### Bug Fixes

* **plugin-youtube:** added missing import ([3314280](https://github.com/critocrito/sugarcube/commit/3314280))





## [0.13.1](https://github.com/critocrito/sugarcube/compare/v0.13.0...v0.13.1) (2018-11-15)


### Bug Fixes

* **plugin-youtube:** more lenient query parsing for videos and errors ([e7fa464](https://github.com/critocrito/sugarcube/commit/e7fa464))





# [0.13.0](https://github.com/critocrito/sugarcube/compare/v0.12.0...v0.13.0) (2018-11-14)


### Bug Fixes

* **core:** supply stats and cache by reference if fits the interface ([06fbba6](https://github.com/critocrito/sugarcube/commit/06fbba6))
* **plugin-googlesheets:** removed unneeded log statement from queries move ([c2878c1](https://github.com/critocrito/sugarcube/commit/c2878c1))
* **plugin-workflow:** treat certain query types special when multiplexing ([0b258d1](https://github.com/critocrito/sugarcube/commit/0b258d1))


### Features

* **plugin-googlesheets:** only move queries that exist in the pipeline ([27af8d0](https://github.com/critocrito/sugarcube/commit/27af8d0))





# [0.12.0](https://github.com/critocrito/sugarcube/compare/v0.11.0...v0.12.0) (2018-11-14)


### Bug Fixes

* **plugin-workflow:** fixed a typo ([445c7b6](https://github.com/critocrito/sugarcube/commit/445c7b6))
* **plugin-youtube:** avoid exception on missing channels ([e9e0582](https://github.com/critocrito/sugarcube/commit/e9e0582))


### Features

* **plugin-googlesheets:** added the sheets_move_queries plugin ([0a9a2d6](https://github.com/critocrito/sugarcube/commit/0a9a2d6))
* **plugin-googlesheets:** extract additional fields from queries ([c33c240](https://github.com/critocrito/sugarcube/commit/c33c240))
* **plugin-googlesheets:** provide a default query type to sheets_query ([6ec1f1b](https://github.com/critocrito/sugarcube/commit/6ec1f1b))
* **plugin-workflow:** added the workflow_multiplex plugin ([ca14cad](https://github.com/critocrito/sugarcube/commit/ca14cad))
* **plugin-youtube:** specify queries alternatively as full URL's ([2ef004f](https://github.com/critocrito/sugarcube/commit/2ef004f))





# [0.10.0](https://github.com/critocrito/sugarcube/compare/v0.9.0...v0.10.0) (2018-10-05)


### Bug Fixes

* Handle media urls better to avoid redownloads. ([861e183](https://github.com/critocrito/sugarcube/commit/861e183)), closes [#33](https://github.com/critocrito/sugarcube/issues/33)
* **plugin-ddg:** Return empty list when no results ([f8d075a](https://github.com/critocrito/sugarcube/commit/f8d075a))
* **plugin-elasticsearch:** Don't export units if the envelope is empty. ([a022378](https://github.com/critocrito/sugarcube/commit/a022378))
* **plugin-elasticsearch:** Strip and unstripify nested values. ([ef1f65b](https://github.com/critocrito/sugarcube/commit/ef1f65b))


### Features

* **cli:** Increase heap size of sugarcube command to 4GB. ([2d9d9b2](https://github.com/critocrito/sugarcube/commit/2d9d9b2)), closes [#9](https://github.com/critocrito/sugarcube/issues/9)
* **core:** Added sToA and aToS value conversions. ([487f984](https://github.com/critocrito/sugarcube/commit/487f984))
* **core:** Concats strings and arrays into an array. ([ac1e2c9](https://github.com/critocrito/sugarcube/commit/ac1e2c9))
* **core:** Keep original fetch date if present. ([4e990b6](https://github.com/critocrito/sugarcube/commit/4e990b6))
* **core:** Store the number of missing arguments on a curried function. ([f3b171a](https://github.com/critocrito/sugarcube/commit/f3b171a))
* **plugin-ddg:** Retry requests with a delay if access is forbidden. ([2f80875](https://github.com/critocrito/sugarcube/commit/2f80875))
* **plugin-ddg:** Set user agent and pick correct href. ([1a43e94](https://github.com/critocrito/sugarcube/commit/1a43e94))
* **plugin-elastic:** Retrieve highlights and score when querying. ([d1aa49b](https://github.com/critocrito/sugarcube/commit/d1aa49b))
* **plugin-elasticsearch:** Added the queryOne operation. ([2753149](https://github.com/critocrito/sugarcube/commit/2753149))
* **plugin-elasticsearch:** Provide custom mappings when creating an index. ([cb62a41](https://github.com/critocrito/sugarcube/commit/cb62a41))
* **plugin-elasticsearch:** Update units on export. ([ed066ae](https://github.com/critocrito/sugarcube/commit/ed066ae))
* **plugin-googlesheets:** Added a sheets_move plugin. ([f39e586](https://github.com/critocrito/sugarcube/commit/f39e586))
* **plugin-googlesheets:** Added deleteRows to the sheets API. ([6c3a2e0](https://github.com/critocrito/sugarcube/commit/6c3a2e0))
* **plugin-googlesheets:** Added getAndRemoveRowsByField to API. ([4e85087](https://github.com/critocrito/sugarcube/commit/4e85087))
* **plugin-googlesheets:** Format the header when exporting or appending. ([a620098](https://github.com/critocrito/sugarcube/commit/a620098))
* **plugin-googlesheets:** Import and move rows based on text equality match. ([bdca13e](https://github.com/critocrito/sugarcube/commit/bdca13e))
* **plugin-googlesheets:** Set data validation for a field by selecting from a list of items. ([5681534](https://github.com/critocrito/sugarcube/commit/5681534))
* **plugin-twitter:** Include the tweet url in the entity. ([3aedfac](https://github.com/critocrito/sugarcube/commit/3aedfac))
* **plugin-twitter:** Limit searches by language or geocode. ([227cc06](https://github.com/critocrito/sugarcube/commit/227cc06))
* **plugin-youtube:** Fetch details for individual videos. ([a493377](https://github.com/critocrito/sugarcube/commit/a493377))
