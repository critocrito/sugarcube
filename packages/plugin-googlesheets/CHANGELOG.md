# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.17.0](https://github.com/critocrito/sugarcube/compare/v0.16.0...v0.17.0) (2018-12-01)

**Note:** Version bump only for package @sugarcube/plugin-googlesheets





# [0.16.0](https://github.com/critocrito/sugarcube/compare/v0.15.0...v0.16.0) (2018-11-26)


### Features

* **plugin-googlesheets:** support last access fields when fetching queries ([eadaf13](https://github.com/critocrito/sugarcube/commit/eadaf13))





# [0.15.0](https://github.com/critocrito/sugarcube/compare/v0.14.0...v0.15.0) (2018-11-25)

**Note:** Version bump only for package @sugarcube/plugin-googlesheets





# [0.14.0](https://github.com/critocrito/sugarcube/compare/v0.13.2...v0.14.0) (2018-11-22)

**Note:** Version bump only for package @sugarcube/plugin-googlesheets





## [0.13.1](https://github.com/critocrito/sugarcube/compare/v0.13.0...v0.13.1) (2018-11-15)

**Note:** Version bump only for package @sugarcube/plugin-googlesheets





# [0.13.0](https://github.com/critocrito/sugarcube/compare/v0.12.0...v0.13.0) (2018-11-14)


### Bug Fixes

* **plugin-googlesheets:** removed unneeded log statement from queries move ([c2878c1](https://github.com/critocrito/sugarcube/commit/c2878c1))


### Features

* **plugin-googlesheets:** only move queries that exist in the pipeline ([27af8d0](https://github.com/critocrito/sugarcube/commit/27af8d0))





# [0.12.0](https://github.com/critocrito/sugarcube/compare/v0.11.0...v0.12.0) (2018-11-14)


### Features

* **plugin-googlesheets:** added the sheets_move_queries plugin ([0a9a2d6](https://github.com/critocrito/sugarcube/commit/0a9a2d6))
* **plugin-googlesheets:** extract additional fields from queries ([c33c240](https://github.com/critocrito/sugarcube/commit/c33c240))
* **plugin-googlesheets:** provide a default query type to sheets_query ([6ec1f1b](https://github.com/critocrito/sugarcube/commit/6ec1f1b))





# [0.10.0](https://github.com/critocrito/sugarcube/compare/v0.9.0...v0.10.0) (2018-10-05)


### Features

* **plugin-googlesheets:** Added a sheets_move plugin. ([f39e586](https://github.com/critocrito/sugarcube/commit/f39e586))
* **plugin-googlesheets:** Added deleteRows to the sheets API. ([6c3a2e0](https://github.com/critocrito/sugarcube/commit/6c3a2e0))
* **plugin-googlesheets:** Added getAndRemoveRowsByField to API. ([4e85087](https://github.com/critocrito/sugarcube/commit/4e85087))
* **plugin-googlesheets:** Format the header when exporting or appending. ([a620098](https://github.com/critocrito/sugarcube/commit/a620098))
* **plugin-googlesheets:** Import and move rows based on text equality match. ([bdca13e](https://github.com/critocrito/sugarcube/commit/bdca13e))
* **plugin-googlesheets:** Set data validation for a field by selecting from a list of items. ([5681534](https://github.com/critocrito/sugarcube/commit/5681534))





<a name="0.9.0"></a>
# [0.9.0](https://github.com/critocrito/sugarcube/compare/v0.8.0...v0.9.0) (2018-03-30)


### Bug Fixes

* **plugin-googlesheet:** Correctly log the number of existing units when merging. ([b7ed5dc](https://github.com/critocrito/sugarcube/commit/b7ed5dc))
* **plugin-googlesheets:** Adapted the getValues function to the new API. ([24b10c8](https://github.com/critocrito/sugarcube/commit/24b10c8))
* **plugin-googlesheets:** Adapted to new google-auth-client API. ([524f4a5](https://github.com/critocrito/sugarcube/commit/524f4a5))
* **plugin-googlesheets:** Copy template sheets when exporting. ([900c7f6](https://github.com/critocrito/sugarcube/commit/900c7f6)), closes [#28](https://github.com/critocrito/sugarcube/issues/28)
* **plugin-googlesheets:** Fixed typo in plugin name. ([d97ecbd](https://github.com/critocrito/sugarcube/commit/d97ecbd))
* **plugin-googlesheets:** Set shared plugin options on argv. ([a940945](https://github.com/critocrito/sugarcube/commit/a940945))
* **plugin-googlesheets:** Use the string type for plugin options. ([8417e47](https://github.com/critocrito/sugarcube/commit/8417e47))


### Features

* **plugin-googlesheets:** Added the sheets_append plugin. ([5950852](https://github.com/critocrito/sugarcube/commit/5950852))
* **plugin-googlesheets:** Optionally skip export if there is no data in the pipeline. ([455806e](https://github.com/critocrito/sugarcube/commit/455806e))
* **plugin-googlesheets:** Specify id fields when importing data. ([d88b795](https://github.com/critocrito/sugarcube/commit/d88b795))




<a name="0.8.0"></a>
# [0.8.0](https://github.com/critocrito/sugarcube/compare/v0.7.0...v0.8.0) (2018-03-03)




**Note:** Version bump only for package @sugarcube/plugin-googlesheets

<a name="0.5.0"></a>
# [0.5.0](https://github.com/critocrito/sugarcube/compare/v0.4.0...v0.5.0) (2018-01-30)


### Bug Fixes

* **plugin-googlesheets:** Avoid creating unneeded spreadsheets. ([4f98c57](https://github.com/critocrito/sugarcube/commit/4f98c57)), closes [#22](https://github.com/critocrito/sugarcube/issues/22)




<a name="0.4.0"></a>
# [0.4.0](https://github.com/critocrito/sugarcube/compare/v0.3.0...v0.4.0) (2018-01-12)




**Note:** Version bump only for package @sugarcube/plugin-googlesheets

<a name="0.3.0"></a>
# [0.3.0](https://github.com/critocrito/sugarcube/compare/v0.1.0...v0.3.0) (2017-12-05)


### Bug Fixes

* **plugin-googlesheet:** Correctly assert copy configurations in export plugin. ([b1d15c5](https://github.com/critocrito/sugarcube/commit/b1d15c5))
* **plugin-googlesheets:** Changed the config types to string. ([ee11975](https://github.com/critocrito/sugarcube/commit/ee11975))
* **plugin-googlesheets:** Don't assert deprecated project ID configuration. ([d5655ee](https://github.com/critocrito/sugarcube/commit/d5655ee))
* **plugin-googlesheets:** Punctuation type in config assertion. ([807b137](https://github.com/critocrito/sugarcube/commit/807b137))


### Features

* **plugin-googlesheet:** Exporting merges with existing rows on spreadsheet. ([74331f3](https://github.com/critocrito/sugarcube/commit/74331f3))
* **plugin-googlesheets:** Added the sheets_queries plugin. ([7a20965](https://github.com/critocrito/sugarcube/commit/7a20965))
* **plugin-googlesheets:** Assert the credentials and spreadsheet configurations. ([ac2a35a](https://github.com/critocrito/sugarcube/commit/ac2a35a))
* **plugin-googlesheets:** Specify the fields to import from. ([a6248fb](https://github.com/critocrito/sugarcube/commit/a6248fb))
* **plugin-googlesheets:** Specify the sheet to export to. ([1904359](https://github.com/critocrito/sugarcube/commit/1904359))




<a name="0.2.1"></a>
## [0.2.1](https://github.com/critocrito/sugarcube/compare/v0.2.0...v0.2.1) (2017-10-22)




**Note:** Version bump only for package @sugarcube/plugin-googlesheets

<a name="0.2.0"></a>
# [0.2.0](https://github.com/critocrito/sugarcube/compare/v0.1.0...v0.2.0) (2017-10-22)


### Bug Fixes

* **plugin-googlesheet:** Correctly assert copy configurations in export plugin. ([b1d15c5](https://github.com/critocrito/sugarcube/commit/b1d15c5))
* **plugin-googlesheets:** Changed the config types to string. ([ee11975](https://github.com/critocrito/sugarcube/commit/ee11975))
* **plugin-googlesheets:** Don't assert deprecated project ID configuration. ([d5655ee](https://github.com/critocrito/sugarcube/commit/d5655ee))
* **plugin-googlesheets:** Punctuation type in config assertion. ([807b137](https://github.com/critocrito/sugarcube/commit/807b137))


### Features

* **plugin-googlesheet:** Exporting merges with existing rows on spreadsheet. ([74331f3](https://github.com/critocrito/sugarcube/commit/74331f3))
* **plugin-googlesheets:** Added the sheets_queries plugin. ([7a20965](https://github.com/critocrito/sugarcube/commit/7a20965))
* **plugin-googlesheets:** Assert the credentials and spreadsheet configurations. ([ac2a35a](https://github.com/critocrito/sugarcube/commit/ac2a35a))
* **plugin-googlesheets:** Specify the fields to import from. ([a6248fb](https://github.com/critocrito/sugarcube/commit/a6248fb))
* **plugin-googlesheets:** Specify the sheet to export to. ([1904359](https://github.com/critocrito/sugarcube/commit/1904359))




<a name="0.1.0"></a>
# [0.1.0](https://github.com/critocrito/sugarcube/compare/v0.0.0...v0.1.0) (2017-10-08)


### Features

* Imported the Google Sheets plugin. ([7dca3b2](https://github.com/critocrito/sugarcube/commit/7dca3b2))
