# Sugarcube

<p align="center">
  <img src="/logo.png" alt="Sugarcube - Data pipelines for human rights">
</p>

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Build Status](https://travis-ci.org/critocrito/sugarcube.svg?branch=master)](https://travis-ci.org/critocrito/sugarcube) [![Coverage Status](https://coveralls.io/repos/github/critocrito/sugarcube/badge.svg?branch=master)](https://coveralls.io/github/critocrito/sugarcube?branch=master)

## Synopsis

Sugarcube is a framework to fetch, transform and export data. Data processes are described using plugins, which are chained in sequence to model complex data processes.

It is a tool designed to suport journalists, non-profits, academic researchers, human rights organisations and others with investigations using online, publicly-available sources (e.g.tweets, videos, public databases, websites, online databases).

[Learn how to use Sugarcube on your own project](https://sugarcubetools.net/docs/installation).

This code is licensed under the [GPL 3](LICENSE).

## Documentation

All documentation can be found [on the website](https://sugarcubetools.net).

- [About Sugarcube](https://sugarcubetools.net/sugarcube)
- [Installation](https://sugarcubetools.net/docs/installation)
- [Tutorial](https://sugarcubetools.net/docs/tutorial)

## Examples

There are more examples and explanations [on the website](https://sugarcubetools.net). Here is one to get you started.

```shell
sugarcube -p http_import,media_warc,media_screenshot,elastic_export \
          -c config.json \
          -Q http_url:'https://mwatana.org/en/airstrike-on-detention-center/'
```

This example will fetch and extract the contents and meta data of an online article, archive the website as a [Web ARChive](https://en.wikipedia.org/wiki/Web_ARChive), take a screenshot of the website and store the data in an Elasticsearch database.

Data processes, like from the example above, can be codified in order to repeat them. Once a data process has been defined, Sugarcube allows to scale and automate it's operation.

## Testimony

- [Syrian Archive](https://syrianarchive.org/en) uses Sugarcube to archive video evidence of human rights violations in Syria. Further, Sugarcube is used to monitor human rights documentation that is taken down by social media companies. The systems and workflows developed with Syrian Archive are now being expanded to do similar work in Yemen, Sudan and other areas.

- Built using Sugarcube, the [Data Scores](https://data-scores.org/) investigation tool provided evidence and insights for research into how data analytics and data-driven "scoring" were being used in the public sector of the UK to make decisions. This research was conducted by the [Data Justice Lab](https://datajusticelab.org/).

## License

Sugarcube is [licensed under the GPL 3.0](LICENSE).
