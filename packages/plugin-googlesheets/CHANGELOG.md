# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.9.0"></a>
# [0.9.0](https://gitlab.com/sugarcube/sugarcube/compare/v0.8.0...v0.9.0) (2018-03-30)


### Bug Fixes

* **plugin-googlesheet:** Correctly log the number of existing units when merging. ([b7ed5dc](https://gitlab.com/sugarcube/sugarcube/commit/b7ed5dc))
* **plugin-googlesheets:** Adapted the getValues function to the new API. ([24b10c8](https://gitlab.com/sugarcube/sugarcube/commit/24b10c8))
* **plugin-googlesheets:** Adapted to new google-auth-client API. ([524f4a5](https://gitlab.com/sugarcube/sugarcube/commit/524f4a5))
* **plugin-googlesheets:** Copy template sheets when exporting. ([900c7f6](https://gitlab.com/sugarcube/sugarcube/commit/900c7f6)), closes [#28](https://gitlab.com/sugarcube/sugarcube/issues/28)
* **plugin-googlesheets:** Fixed typo in plugin name. ([d97ecbd](https://gitlab.com/sugarcube/sugarcube/commit/d97ecbd))
* **plugin-googlesheets:** Set shared plugin options on argv. ([a940945](https://gitlab.com/sugarcube/sugarcube/commit/a940945))
* **plugin-googlesheets:** Use the string type for plugin options. ([8417e47](https://gitlab.com/sugarcube/sugarcube/commit/8417e47))


### Features

* **plugin-googlesheets:** Added the sheets_append plugin. ([5950852](https://gitlab.com/sugarcube/sugarcube/commit/5950852))
* **plugin-googlesheets:** Optionally skip export if there is no data in the pipeline. ([455806e](https://gitlab.com/sugarcube/sugarcube/commit/455806e))
* **plugin-googlesheets:** Specify id fields when importing data. ([d88b795](https://gitlab.com/sugarcube/sugarcube/commit/d88b795))




<a name="0.8.0"></a>
# [0.8.0](https://gitlab.com/sugarcube/sugarcube/compare/v0.7.0...v0.8.0) (2018-03-03)




**Note:** Version bump only for package @sugarcube/plugin-googlesheets

<a name="0.5.0"></a>
# [0.5.0](https://gitlab.com/sugarcube/sugarcube/compare/v0.4.0...v0.5.0) (2018-01-30)


### Bug Fixes

* **plugin-googlesheets:** Avoid creating unneeded spreadsheets. ([4f98c57](https://gitlab.com/sugarcube/sugarcube/commit/4f98c57)), closes [#22](https://gitlab.com/sugarcube/sugarcube/issues/22)




<a name="0.4.0"></a>
# [0.4.0](https://gitlab.com/sugarcube/sugarcube/compare/v0.3.0...v0.4.0) (2018-01-12)




**Note:** Version bump only for package @sugarcube/plugin-googlesheets

<a name="0.3.0"></a>
# [0.3.0](https://gitlab.com/sugarcube/sugarcube/compare/v0.1.0...v0.3.0) (2017-12-05)


### Bug Fixes

* **plugin-googlesheet:** Correctly assert copy configurations in export plugin. ([b1d15c5](https://gitlab.com/sugarcube/sugarcube/commit/b1d15c5))
* **plugin-googlesheets:** Changed the config types to string. ([ee11975](https://gitlab.com/sugarcube/sugarcube/commit/ee11975))
* **plugin-googlesheets:** Don't assert deprecated project ID configuration. ([d5655ee](https://gitlab.com/sugarcube/sugarcube/commit/d5655ee))
* **plugin-googlesheets:** Punctuation type in config assertion. ([807b137](https://gitlab.com/sugarcube/sugarcube/commit/807b137))


### Features

* **plugin-googlesheet:** Exporting merges with existing rows on spreadsheet. ([74331f3](https://gitlab.com/sugarcube/sugarcube/commit/74331f3))
* **plugin-googlesheets:** Added the sheets_queries plugin. ([7a20965](https://gitlab.com/sugarcube/sugarcube/commit/7a20965))
* **plugin-googlesheets:** Assert the credentials and spreadsheet configurations. ([ac2a35a](https://gitlab.com/sugarcube/sugarcube/commit/ac2a35a))
* **plugin-googlesheets:** Specify the fields to import from. ([a6248fb](https://gitlab.com/sugarcube/sugarcube/commit/a6248fb))
* **plugin-googlesheets:** Specify the sheet to export to. ([1904359](https://gitlab.com/sugarcube/sugarcube/commit/1904359))




<a name="0.2.1"></a>
## [0.2.1](https://gitlab.com/sugarcube/sugarcube/compare/v0.2.0...v0.2.1) (2017-10-22)




**Note:** Version bump only for package @sugarcube/plugin-googlesheets

<a name="0.2.0"></a>
# [0.2.0](https://gitlab.com/sugarcube/sugarcube/compare/v0.1.0...v0.2.0) (2017-10-22)


### Bug Fixes

* **plugin-googlesheet:** Correctly assert copy configurations in export plugin. ([b1d15c5](https://gitlab.com/sugarcube/sugarcube/commit/b1d15c5))
* **plugin-googlesheets:** Changed the config types to string. ([ee11975](https://gitlab.com/sugarcube/sugarcube/commit/ee11975))
* **plugin-googlesheets:** Don't assert deprecated project ID configuration. ([d5655ee](https://gitlab.com/sugarcube/sugarcube/commit/d5655ee))
* **plugin-googlesheets:** Punctuation type in config assertion. ([807b137](https://gitlab.com/sugarcube/sugarcube/commit/807b137))


### Features

* **plugin-googlesheet:** Exporting merges with existing rows on spreadsheet. ([74331f3](https://gitlab.com/sugarcube/sugarcube/commit/74331f3))
* **plugin-googlesheets:** Added the sheets_queries plugin. ([7a20965](https://gitlab.com/sugarcube/sugarcube/commit/7a20965))
* **plugin-googlesheets:** Assert the credentials and spreadsheet configurations. ([ac2a35a](https://gitlab.com/sugarcube/sugarcube/commit/ac2a35a))
* **plugin-googlesheets:** Specify the fields to import from. ([a6248fb](https://gitlab.com/sugarcube/sugarcube/commit/a6248fb))
* **plugin-googlesheets:** Specify the sheet to export to. ([1904359](https://gitlab.com/sugarcube/sugarcube/commit/1904359))




<a name="0.1.0"></a>
# [0.1.0](https://gitlab.com/sugarcube/sugarcube/compare/v0.0.0...v0.1.0) (2017-10-08)


### Features

* Imported the Google Sheets plugin. ([7dca3b2](https://gitlab.com/sugarcube/sugarcube/commit/7dca3b2))
