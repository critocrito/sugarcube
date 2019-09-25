# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.27.2](https://github.com/critocrito/sugarcube/compare/v0.27.1...v0.27.2) (2019-09-25)


### Bug Fixes

* **plugin-elasticsearch:** supply index to bulk call ([27c8777](https://github.com/critocrito/sugarcube/commit/27c8777))





## [0.27.1](https://github.com/critocrito/sugarcube/compare/v0.27.0...v0.27.1) (2019-09-22)

**Note:** Version bump only for package sugarcube





# [0.27.0](https://github.com/critocrito/sugarcube/compare/v0.26.1...v0.27.0) (2019-09-22)


### Bug Fixes

* **plugin-googlesheets:** trim whitespace from queries to move ([f5640f6](https://github.com/critocrito/sugarcube/commit/f5640f6))
* **plugin-media:** count existing videos ([fcde080](https://github.com/critocrito/sugarcube/commit/fcde080))
* **plugin-media:** handle missing locations when generating mosaics ([0da1a81](https://github.com/critocrito/sugarcube/commit/0da1a81))
* fail gracefully if google sheet doesn't exist ([abeb49f](https://github.com/critocrito/sugarcube/commit/abeb49f))


### Features

* introduce an instrumentation API and extract the cli logger to an instrument ([c68fc9e](https://github.com/critocrito/sugarcube/commit/c68fc9e))
* **core:** extract the failure logging into the stats instrument ([d91a0e2](https://github.com/critocrito/sugarcube/commit/d91a0e2))
* reworked stats instrumentation and store metrics in StatsD ([ca1997b](https://github.com/critocrito/sugarcube/commit/ca1997b))
* **plugin-csv:** export failures using the csv_failures_file instrument ([d60ecb4](https://github.com/critocrito/sugarcube/commit/d60ecb4))
* **plugin-elasticsearch:** support ES6 and ES7 ([20bf2b1](https://github.com/critocrito/sugarcube/commit/20bf2b1)), closes [#3](https://github.com/critocrito/sugarcube/issues/3) [#4](https://github.com/critocrito/sugarcube/issues/4)
* **plugin-twitter:** log tweets counter ([e2cd4e9](https://github.com/critocrito/sugarcube/commit/e2cd4e9))





## [0.26.1](https://github.com/critocrito/sugarcube/compare/v0.26.0...v0.26.1) (2019-07-16)


### Bug Fixes

* delay between youtubedl invocations ([e623469](https://github.com/critocrito/sugarcube/commit/e623469))





# [0.26.0](https://github.com/critocrito/sugarcube/compare/v0.25.1...v0.26.0) (2019-07-15)


### Features

* balance youtube-dl over one or more source ip addresses ([1cf42ce](https://github.com/critocrito/sugarcube/commit/1cf42ce))
* configure a random delay between youtubedl invocations ([a0c42cc](https://github.com/critocrito/sugarcube/commit/a0c42cc))





## [0.25.1](https://github.com/critocrito/sugarcube/compare/v0.25.0...v0.25.1) (2019-06-18)


### Bug Fixes

* minor improvements to docs generation ([62d2e99](https://github.com/critocrito/sugarcube/commit/62d2e99))
* **plugin-http:** accept old image locations based on filenames ([ce32cb8](https://github.com/critocrito/sugarcube/commit/ce32cb8))





# [0.25.0](https://github.com/critocrito/sugarcube/compare/v0.24.0...v0.25.0) (2019-06-17)


### Bug Fixes

* **plugin-fs:** synced package lock file ([937744b](https://github.com/critocrito/sugarcube/commit/937744b))


### Features

* **plugin-csv:** add a label to the exported failed stats file name ([b7d3280](https://github.com/critocrito/sugarcube/commit/b7d3280))
* **plugin-fs:** populate media from a file location ([21de55f](https://github.com/critocrito/sugarcube/commit/21de55f))
* **plugin-media:** add media_import_file plugin ([b9e5dee](https://github.com/critocrito/sugarcube/commit/b9e5dee))
* **plugin-media:** allow to bind youtubedl to a source ip address ([b30cacd](https://github.com/critocrito/sugarcube/commit/b30cacd))





# [0.24.0](https://github.com/critocrito/sugarcube/compare/v0.23.0...v0.24.0) (2019-04-25)


### Bug Fixes

* **plugin-media:** respect the mosaic_parallel option ([9da966f](https://github.com/critocrito/sugarcube/commit/9da966f))


### Features

* **plugin-media:** add the mosaic plugin ([2695d56](https://github.com/critocrito/sugarcube/commit/2695d56))
* **plugin-workflow:** add omit plugin ([1a6baa8](https://github.com/critocrito/sugarcube/commit/1a6baa8))
* **plugin-workflow:** add pick plugin ([00cba66](https://github.com/critocrito/sugarcube/commit/00cba66))
* **utils:** use a runCmd utility for calling host commands ([3c5fd8f](https://github.com/critocrito/sugarcube/commit/3c5fd8f))





# [0.23.0](https://github.com/critocrito/sugarcube/compare/v0.22.0...v0.23.0) (2019-01-28)


### Bug Fixes

* **plugin-elasticsearch:** log query as JSON on import ([e15029a](https://github.com/critocrito/sugarcube/commit/e15029a))
* **plugin-mail:** avoid exception on missing stat.duration field ([9712e01](https://github.com/critocrito/sugarcube/commit/9712e01))
* **plugin-twitter:** parse twitter users starting with a number as screen names ([c29e2b8](https://github.com/critocrito/sugarcube/commit/c29e2b8))


### Features

* **plugin-twitter:** add plugin to fetch individual tweets ([352eaa5](https://github.com/critocrito/sugarcube/commit/352eaa5))
* **plugin-twitter:** allow full urls as tweet query ([a9f8246](https://github.com/critocrito/sugarcube/commit/a9f8246))
* **plugin-twitter:** parse twitter users from full url's ([3ae4c23](https://github.com/critocrito/sugarcube/commit/3ae4c23))





# [0.22.0](https://github.com/critocrito/sugarcube/compare/v0.21.0...v0.22.0) (2019-01-22)


### Bug Fixes

* **plugin-elasticsearch:** use supplement instead of complement left in the logs ([c998c32](https://github.com/critocrito/sugarcube/commit/c998c32))
* **plugin-mongodb:** remove superfluous spaces in a log message ([8eb6396](https://github.com/critocrito/sugarcube/commit/8eb6396))


### Features

* **plugin-workflow:** add plugin to merge fields from queries into a unit ([c54cdb2](https://github.com/critocrito/sugarcube/commit/c54cdb2))
* **plugin-youtube:** merge query into the video unit ([7b11a51](https://github.com/critocrito/sugarcube/commit/7b11a51))





# [0.21.0](https://github.com/critocrito/sugarcube/compare/v0.20.1...v0.21.0) (2019-01-20)


### Bug Fixes

* **plugin-googlesheets:** only apply import filters when provided ([a6bb047](https://github.com/critocrito/sugarcube/commit/a6bb047))
* **plugin-googlesheets:** treat empty strings as null on import ([03ced54](https://github.com/critocrito/sugarcube/commit/03ced54))
* **plugin-mail:** validate inputs to be arrays ([936a69b](https://github.com/critocrito/sugarcube/commit/936a69b))
* **plugin-media:** change counter debug log when downloading videos ([bbbbbcb](https://github.com/critocrito/sugarcube/commit/bbbbbcb))


### Features

* **plugin-googlesheets:** create auxiliary sheets when exporting to a spreadsheet ([b44eba4](https://github.com/critocrito/sugarcube/commit/b44eba4))





## [0.20.1](https://github.com/critocrito/sugarcube/compare/v0.20.0...v0.20.1) (2019-01-02)


### Bug Fixes

* **core:** avoid a stack overflow when updating state a lot ([f9bd78d](https://github.com/critocrito/sugarcube/commit/f9bd78d))
* **plugin-mail:** log mail progress in a safe way ([26d9f33](https://github.com/critocrito/sugarcube/commit/26d9f33))
* **plugin-mail:** prevent exceptions when sending mails ([9d4b8d1](https://github.com/critocrito/sugarcube/commit/9d4b8d1))





# [0.20.0](https://github.com/critocrito/sugarcube/compare/v0.19.3...v0.20.0) (2018-12-21)


### Features

* **plugin-media:** force a video download even if it already exists ([00705e3](https://github.com/critocrito/sugarcube/commit/00705e3))





## [0.19.3](https://github.com/critocrito/sugarcube/compare/v0.19.2...v0.19.3) (2018-12-21)


### Bug Fixes

* **plugin-media:** handle youtubedl exiting on failure ([239c126](https://github.com/critocrito/sugarcube/commit/239c126))





## [0.19.2](https://github.com/critocrito/sugarcube/compare/v0.19.1...v0.19.2) (2018-12-19)

**Note:** Version bump only for package sugarcube





## [0.19.1](https://github.com/critocrito/sugarcube/compare/v0.19.0...v0.19.1) (2018-12-13)


### Bug Fixes

* **plugin-mail:** send failed stats to more than one recipient ([cad4089](https://github.com/critocrito/sugarcube/commit/cad4089))





# [0.19.0](https://github.com/critocrito/sugarcube/compare/v0.18.0...v0.19.0) (2018-12-13)


### Bug Fixes

* **plugin-media:** remove development artifact ([ec6f39e](https://github.com/critocrito/sugarcube/commit/ec6f39e))


### Features

* **plugin-csv:** add the csv_export_failed plugin ([48e7ebe](https://github.com/critocrito/sugarcube/commit/48e7ebe))
* **plugin-mail:** attach the failed stats csv file if available ([216370b](https://github.com/critocrito/sugarcube/commit/216370b))
* **plugin-media:** add a plugin to check the vailability of videos ([131bc15](https://github.com/critocrito/sugarcube/commit/131bc15))





# [0.18.0](https://github.com/critocrito/sugarcube/compare/v0.17.0...v0.18.0) (2018-12-11)


### Features

* **plugin-mail:** print the number of failures in the error report ([f5e188c](https://github.com/critocrito/sugarcube/commit/f5e188c))
* **plugin-twitter:** set language on tweets if available ([cf49a74](https://github.com/critocrito/sugarcube/commit/cf49a74))
* **plugin-youtube:** set language on videos if available ([99e0c23](https://github.com/critocrito/sugarcube/commit/99e0c23))





# [0.17.0](https://github.com/critocrito/sugarcube/compare/v0.16.0...v0.17.0) (2018-12-01)


### Bug Fixes

* **core:** temp fix for failing unit test when concatenating ([1bf4580](https://github.com/critocrito/sugarcube/commit/1bf4580))
* **plugin-youtube:** don't throw on non existing location ([2d3a260](https://github.com/critocrito/sugarcube/commit/2d3a260))
* **plugin-youtube:** rename location field names ([d7cdeb5](https://github.com/critocrito/sugarcube/commit/d7cdeb5))


### Features

* **core:** make _sc_locations a fixed field ([9d23eef](https://github.com/critocrito/sugarcube/commit/9d23eef))
* **plugin-elasticsearch:** added the reindex plugin ([288aef6](https://github.com/critocrito/sugarcube/commit/288aef6))
* **plugin-elasticsearch:** create an alias for a numbered index ([31f3f34](https://github.com/critocrito/sugarcube/commit/31f3f34))
* **plugin-elasticsearch:** properly handle custom mappings and fixes ([710f762](https://github.com/critocrito/sugarcube/commit/710f762))
* **plugin-elasticsearch:** set locations mapping ([d201869](https://github.com/critocrito/sugarcube/commit/d201869))
* **plugin-elasticsearch:** use the scroll API for imports ([7f8cd1f](https://github.com/critocrito/sugarcube/commit/7f8cd1f))
* **plugin-twitter:** store coordinates location ([46b9def](https://github.com/critocrito/sugarcube/commit/46b9def))
* **plugin-youtube:** store recording location when provided ([54e5ac8](https://github.com/critocrito/sugarcube/commit/54e5ac8))


### Performance Improvements

* **core:** improved pipeline runner and data concatenation ([0d840b2](https://github.com/critocrito/sugarcube/commit/0d840b2))
* **plugin-elasticsearch:** improved import/export ([999174c](https://github.com/critocrito/sugarcube/commit/999174c))





# [0.16.0](https://github.com/critocrito/sugarcube/compare/v0.15.0...v0.16.0) (2018-11-26)


### Bug Fixes

* **plugin-elasticsearch:** make sure to always create the index before accessing it ([41727d1](https://github.com/critocrito/sugarcube/commit/41727d1))
* **plugin-twitter:** edited log output for feeds ([6dda5a0](https://github.com/critocrito/sugarcube/commit/6dda5a0))
* **plugin-youtube:** treat thumbnails as images ([d6e2077](https://github.com/critocrito/sugarcube/commit/d6e2077))


### Features

* **cli:** print the memory limit in debug mode ([02f4337](https://github.com/critocrito/sugarcube/commit/02f4337))
* **plugin-facebook:** catch failures for api pages and populate the failed stats ([a922914](https://github.com/critocrito/sugarcube/commit/a922914))
* **plugin-googlesheets:** support last access fields when fetching queries ([eadaf13](https://github.com/critocrito/sugarcube/commit/eadaf13))
* **plugin-http:** catch failures for http downloads and populate the failed stats ([c7f541a](https://github.com/critocrito/sugarcube/commit/c7f541a))
* **plugin-mail:** include the pipeline name in the failed stats subject ([58a9273](https://github.com/critocrito/sugarcube/commit/58a9273))
* **plugin-youtube:** catch failures for videos and populate the failed stats ([2c5b773](https://github.com/critocrito/sugarcube/commit/2c5b773))
* cleaning up failed downloads for media_youtubedl and http_get ([2e8d14f](https://github.com/critocrito/sugarcube/commit/2e8d14f))





# [0.15.0](https://github.com/critocrito/sugarcube/compare/v0.14.0...v0.15.0) (2018-11-25)


### Bug Fixes

* **core:** chain updates of state correctly ([cce3dbd](https://github.com/critocrito/sugarcube/commit/cce3dbd))
* **plugin-youtube:** handle date ranges correctly when fetching channels ([c7c5930](https://github.com/critocrito/sugarcube/commit/c7c5930))


### Features

* **cli:** set a human friendly name for a pipeline ([9ed7ae0](https://github.com/critocrito/sugarcube/commit/9ed7ae0))
* instrument the pipeline and deliver a mail report ([6018451](https://github.com/critocrito/sugarcube/commit/6018451))
* track failed channel queries and youtubedl downloads ([ab2a541](https://github.com/critocrito/sugarcube/commit/ab2a541))
* **cli:** include the project name in the pipeline config ([f7f1228](https://github.com/critocrito/sugarcube/commit/f7f1228))
* **core:** added instrumentation to the pipeline run ([5019fe2](https://github.com/critocrito/sugarcube/commit/5019fe2))
* **plugin-elasticsearch:** added instrumentation to the complement plugins ([a263c7c](https://github.com/critocrito/sugarcube/commit/a263c7c))
* **plugin-elasticsearch:** added the supplement plugin alias ([cd0069d](https://github.com/critocrito/sugarcube/commit/cd0069d))
* **plugin-mail:** email failed stats ([0dd699f](https://github.com/critocrito/sugarcube/commit/0dd699f))
* **plugin-mail:** mail a report of the pipeline run ([a7d1e95](https://github.com/critocrito/sugarcube/commit/a7d1e95))
* **plugin-twitter:** track failed twitter users when fetching timelines ([f8a0d94](https://github.com/critocrito/sugarcube/commit/f8a0d94))
* **plugin-youtube:** properly test for the existence of channels ([59855d6](https://github.com/critocrito/sugarcube/commit/59855d6))





# [0.14.0](https://github.com/critocrito/sugarcube/compare/v0.13.2...v0.14.0) (2018-11-22)


### Bug Fixes

* **plugin-youtube:** flatten video queries when done ([c40581d](https://github.com/critocrito/sugarcube/commit/c40581d))


### Features

* **plugin-media:** run youtube-dl in parallel ([6bac8e4](https://github.com/critocrito/sugarcube/commit/6bac8e4))
* **plugin-youtube:** chunk video downloads in batches of 50 ([82e1fe6](https://github.com/critocrito/sugarcube/commit/82e1fe6))





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
