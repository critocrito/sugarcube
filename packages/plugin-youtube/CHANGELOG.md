# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.18.0](https://github.com/critocrito/sugarcube/compare/v0.17.0...v0.18.0) (2018-12-11)


### Features

* **plugin-youtube:** set language on videos if available ([99e0c23](https://github.com/critocrito/sugarcube/commit/99e0c23))





# [0.17.0](https://github.com/critocrito/sugarcube/compare/v0.16.0...v0.17.0) (2018-12-01)


### Bug Fixes

* **plugin-youtube:** don't throw on non existing location ([2d3a260](https://github.com/critocrito/sugarcube/commit/2d3a260))
* **plugin-youtube:** rename location field names ([d7cdeb5](https://github.com/critocrito/sugarcube/commit/d7cdeb5))


### Features

* **plugin-youtube:** store recording location when provided ([54e5ac8](https://github.com/critocrito/sugarcube/commit/54e5ac8))





# [0.16.0](https://github.com/critocrito/sugarcube/compare/v0.15.0...v0.16.0) (2018-11-26)


### Bug Fixes

* **plugin-youtube:** treat thumbnails as images ([d6e2077](https://github.com/critocrito/sugarcube/commit/d6e2077))


### Features

* **plugin-youtube:** catch failures for videos and populate the failed stats ([2c5b773](https://github.com/critocrito/sugarcube/commit/2c5b773))





# [0.15.0](https://github.com/critocrito/sugarcube/compare/v0.14.0...v0.15.0) (2018-11-25)


### Bug Fixes

* **plugin-youtube:** handle date ranges correctly when fetching channels ([c7c5930](https://github.com/critocrito/sugarcube/commit/c7c5930))


### Features

* track failed channel queries and youtubedl downloads ([ab2a541](https://github.com/critocrito/sugarcube/commit/ab2a541))
* **plugin-youtube:** properly test for the existence of channels ([59855d6](https://github.com/critocrito/sugarcube/commit/59855d6))





# [0.14.0](https://github.com/critocrito/sugarcube/compare/v0.13.2...v0.14.0) (2018-11-22)


### Bug Fixes

* **plugin-youtube:** flatten video queries when done ([c40581d](https://github.com/critocrito/sugarcube/commit/c40581d))


### Features

* **plugin-youtube:** chunk video downloads in batches of 50 ([82e1fe6](https://github.com/critocrito/sugarcube/commit/82e1fe6))





## [0.13.2](https://github.com/critocrito/sugarcube/compare/v0.13.1...v0.13.2) (2018-11-15)


### Bug Fixes

* **plugin-youtube:** added missing import ([3314280](https://github.com/critocrito/sugarcube/commit/3314280))





## [0.13.1](https://github.com/critocrito/sugarcube/compare/v0.13.0...v0.13.1) (2018-11-15)


### Bug Fixes

* **plugin-youtube:** more lenient query parsing for videos and errors ([e7fa464](https://github.com/critocrito/sugarcube/commit/e7fa464))





# [0.13.0](https://github.com/critocrito/sugarcube/compare/v0.12.0...v0.13.0) (2018-11-14)

**Note:** Version bump only for package @sugarcube/plugin-youtube





# [0.12.0](https://github.com/critocrito/sugarcube/compare/v0.11.0...v0.12.0) (2018-11-14)


### Bug Fixes

* **plugin-youtube:** avoid exception on missing channels ([e9e0582](https://github.com/critocrito/sugarcube/commit/e9e0582))


### Features

* **plugin-youtube:** specify queries alternatively as full URL's ([2ef004f](https://github.com/critocrito/sugarcube/commit/2ef004f))





# [0.10.0](https://github.com/critocrito/sugarcube/compare/v0.9.0...v0.10.0) (2018-10-05)


### Features

* **plugin-youtube:** Fetch details for individual videos. ([a493377](https://github.com/critocrito/sugarcube/commit/a493377))





<a name="0.9.0"></a>
# [0.9.0](https://github.com/critocrito/sugarcube/compare/v0.8.0...v0.9.0) (2018-03-30)




**Note:** Version bump only for package @sugarcube/plugin-youtube

<a name="0.8.0"></a>
# [0.8.0](https://github.com/critocrito/sugarcube/compare/v0.7.0...v0.8.0) (2018-03-03)




**Note:** Version bump only for package @sugarcube/plugin-youtube

<a name="0.7.0"></a>
# [0.7.0](https://github.com/critocrito/sugarcube/compare/v0.6.1...v0.7.0) (2018-02-02)


### Features

* Consistently use _sc_media over _sc_downloads. ([9c92935](https://github.com/critocrito/sugarcube/commit/9c92935))
* **plugin-youtube:** Removed deprecated youtube_download plugin. ([cd9abad](https://github.com/critocrito/sugarcube/commit/cd9abad))
* **plugin-youtube:** Store the link to the video as url type in _sc_media as well. ([18e4f9a](https://github.com/critocrito/sugarcube/commit/18e4f9a))




<a name="0.6.0"></a>
# [0.6.0](https://github.com/critocrito/sugarcube/compare/v0.5.1...v0.6.0) (2018-02-01)


### Features

* **plugin-media:** Added the media_youtubedl plugin. ([d103dcb](https://github.com/critocrito/sugarcube/commit/d103dcb)), closes [#16](https://github.com/critocrito/sugarcube/issues/16)




<a name="0.5.1"></a>
## [0.5.1](https://github.com/critocrito/sugarcube/compare/v0.5.0...v0.5.1) (2018-01-30)




**Note:** Version bump only for package @sugarcube/plugin-youtube

<a name="0.5.0"></a>
# [0.5.0](https://github.com/critocrito/sugarcube/compare/v0.4.0...v0.5.0) (2018-01-30)




**Note:** Version bump only for package @sugarcube/plugin-youtube

<a name="0.4.0"></a>
# [0.4.0](https://github.com/critocrito/sugarcube/compare/v0.3.0...v0.4.0) (2018-01-12)




**Note:** Version bump only for package @sugarcube/plugin-youtube

<a name="0.3.0"></a>
# [0.3.0](https://github.com/critocrito/sugarcube/compare/v0.1.0...v0.3.0) (2017-12-05)


### Bug Fixes

* Fixed the plugins that got broken by removing bluebird. ([73a9603](https://github.com/critocrito/sugarcube/commit/73a9603))




<a name="0.2.1"></a>
## [0.2.1](https://github.com/critocrito/sugarcube/compare/v0.2.0...v0.2.1) (2017-10-22)




**Note:** Version bump only for package @sugarcube/plugin-youtube

<a name="0.2.0"></a>
# [0.2.0](https://github.com/critocrito/sugarcube/compare/v0.1.0...v0.2.0) (2017-10-22)




**Note:** Version bump only for package @sugarcube/plugin-youtube

<a name="0.1.0"></a>
# [0.1.0](https://github.com/critocrito/sugarcube/compare/v0.0.0...v0.1.0) (2017-10-08)


### Features

* Imported Youtube plugin. ([958734a](https://github.com/critocrito/sugarcube/commit/958734a))
