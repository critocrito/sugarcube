---
path: "/glossary"
title: "SugarCube Glossary"
---

# Glossary

## unit

Any individual point of data is called a unit, e.g. a Tweet is a single unit or a Youtube video is a single unit. Each unit has a *type* the specifies what kind of data this unit represents, e.g. *youtube_channel* or *twitter_feed*. One or more units form the data set that SugarCube operates on during a run.

## query

Queries are used to inform SugarCube where to retrieve units, e.g. a Twitter user timeline is a query or the location of a CSV file is a query. Different plugins act on different queries and decide to do something with it, e.g. fetching the Tweets for a Twitter user timeline.

## envelope

Units and queries are grouped together in an envelope. Every use of SugarCube produces an envelope in the end.

## plugin

Functionality in SugarCube is collected in a variety of plugins. Each plugin is responsible to provide one type of feature. Plugins are responsible to fetch data from different sources, transform them and export them again, e.g. by storing data in a database. Some plugins operate just on queries, e.g. to expand a path to a directory that is provided as a query into one query for every file that this directory contains.

See the [list of available plugins](/plugins) for details on functionality provided.

## pipeline

Complex data processes are created by combining different plugins into a pipeline. Each plugin is executed one after another in a sequence. Every plugin receives an envelope and returns an envelope again that the next plugin can use.

## instrument

While plugins are used to create complex data process in form of pipelines, instruments are responsible operate an meta data of the pipeline and to react to events emitted at different stages of the pipeline run. This meta data are failures during a plugin, statistics about units fetched, etc. Instruments hook into the lifecycle of a pipeline and can are used for logging, storing metrics about the performance of a SugarCube pipeline or writing failure statistics to a CSV file.

Read more about [events](/events) to understand how instruments can hook into a pipeline run.

## runner

Once a pipeline is configured, the runner is responsible to execute the pipeline. Most commonly one uses the `sugarcube` command line program to run pipelines. But other forms of runners are possible as well.
