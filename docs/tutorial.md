---
path: "/tutorial"
title: "SugarCube Tutorial"
---
# Ultimately SugarCube

Commands, that can be typed in a shell, have in this tutorial the `$` symbol
as prefix. It stands for your prompt in your terminal. You don't have to write
it when typing your commands. When you read examples like `$ node --version`
you only have to type `node --version`.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Requirements](#requirements)
- [Simply SugarCube](#simply-sugarcube)
- [Intermezzo 1: Using files](#intermezzo-1-using-files)
- [Plugins](#plugins)
- [Intermezzo 2: Examples](#intermezzo-2-examples)
  - [Search for content from The Guardian](#search-for-content-from-the-guardian)
  - [Download videos from Youtube](#download-videos-from-youtube)
  - [Query Twitter and deal with media](#query-twitter-and-deal-with-media)
  - [Read tweets in Telegram](#read-tweets-in-telegram)
- [Advancedly SugarCube](#advancedly-sugarcube)
  - [Use SugarCube on the TOR network](#use-sugarcube-on-the-tor-network)
  - [Best practices](#best-practices)
- [Intermezzo 3: Data](#intermezzo-3-data)
- [TODO: Persist data with MongoDB](#todo-persist-data-with-mongodb)
- [TODO: SugarCube on UNIX](#todo-sugarcube-on-unix)
- [Look at this, look at that ...](#look-at-this-look-at-that-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Requirements

To run `sugarcube` you have to install [NodeJS](https://nodejs.org/en/). The
easiest way to do this, is to use [nvm](https://github.com/creationix/nvm). Node Version Manager (nvm) is a script written to manage multiple active NodeJS versions.
SugarCube works with the latest LTS release of NodeJS or newer. At the time of
this writing the latest LTS release is v8.9.4 named Carbon.

Follow the
[installation instructions](https://github.com/creationix/nvm#install-script) to install nvm. Check in your terminal that 'node' has been installed by entering in the following command:

```
$ node --version
v8.9.4
```
You will also need npm, which is a package manager for NodeJS packages. This will have also been installed when you installed nvm. Check by typing the following in your terminal window:

```
$ npm --version
3.10.8
```

## Simply SugarCube

We start by creating a new SugarCube project. This is nothing more than a
directory with some files. Through the terminal you will create a new directory, in this example we have called it 'sugarcubetest', enter into that directory and add a file to it.

Firtly create a new folder by typing in 'mkdir', shorthand for 'make directories', and your chosen name for this directory:

```
$ mkdir sugarcubetest
```

Next enter into that directory by typing in 'cd', shorthand for change directory, into your terminal:
```
$ cd sugarcubetest
```

Lastly add a file to your new directory by asking your newly installed node package manager to get your node packages started through the 'init' command. Enter in the following:
```
$ npm init -y
```

You should end up with a single file in the `sugarcubetest` directory named
`package.json`. This file is used by to manage versions and dependencies of
SugarCube. Test that this file is there by typing:

```
$ ls
```
This lists all the files in your directory. If your terminal window shows you this response then you are on the right track:

```
$ package.json
```

Next on we install the `sugarcube` command line interface, the DuckDuckGo search
plugin and the tap plugin.  The `ddg_search` plugin queries the search engine DuckDuckGo and the `tap_printf` plugin prints the results, queries and
configuration to the screen. Type in the following command:


```
$ npm install -S @sugarcube/cli @sugarcube/plugin-ddg @sugarcube/plugin-tap
```

If all went fine, you should have a folder named `node_modules`, within your 'sugarcubetest' directory. This 'node_modules' folder should contain `sugarcube` and all it's dependencies.

To check that node_modules is installed, type in the command 'ls' to list the contents of the directory.

Install the 'sugarcube' command by typing into your terminal:

```
$ $(npm bin)/sugarcube -h
```
Note that you will be entering in the dollar symbol ($) for this command. You should see the following in your terminal window:

```
$ $(npm bin)/sugarcube -h
tap_printf: Print the envelope to the screen.
  --tap.limit  Limit the output to <n> data units.                      [number]

Options:
  -p, --plugins  A list of plugins                                      [string]
  -q             Path to JSON queries file
  -Q             Queries in the form: <type>:<term>. Note that spaces
                 have to be escaped, e.g.: twitter_search:Keith\ Johnstone
  -d, --debug    Enable debug logging                                  [boolean]
  -c             Path to JSON config file
  -h, --help     Show help                                             [boolean]
  --version      Show version number                                   [boolean]
```

We will run SugarCube now. We want to make a search on DuckDuckGo for the
term `Keith Johnstone` and print the results on the screen.

```
$ $(npm bin)/sugarcube -Q ddg_search:Keith\ Johnstone -p ddg_search,tap_printf
```

This prints up to 30 search results on the screen.

Using the `-Q` option, we specified a query, the `-p` defines which
plugins should be run. The order of the plugins matters. You can't print
results to the screen, if you haven't fetched any results yet. We run two plugins,
first the `ddg_search` plugin, which queries the search engine, and after that
we run the `tap_printf` plugin, which prints the results, queries and
configuration to the screen.

There is not much more to SugarCube than that.

Some plugins offer configuration options, that allow to control aspects of
their behaviour. If you look at the output of `$(npm bin)/sugarcube -h`, you
will see the `--tap.limit` argument. We can use it to print less results on
the screen.

```
$ $(npm bin)/sugarcube -Q ddg_search:Keith\ Johnstone \
                        -p ddg_search,tap_printf \
                        --tap.limit 1
```

## Intermezzo 1: Using files

As you start to define more complicated data pipelines, the size of the
command will grow. To make life easier, but also to make pipeline runs
repeatable, is it possible, to store configuration in text files. The
format of those files is JSON. The previous example would look like this:

```
$ cat <<EOF > searches.json
{
  "plugins": "ddg_search,tap_printf",
  "tap": {
    "limit": 1
  }
}
EOF
```

Use the `-c` argument to specify the file location:

```
$ $(npm bin)/sugarcube -Q ddg_search:Keith\ Johnstone -c searches.json
```

Options provided by the command line will take precedence over the
configuration file. This allows it to override options for a one off pipeline
run.

```
$ $(npm bin)/sugarcube -Q ddg_search:Keith\ Johnstone -c searches.json --tap.limit 10
```

It is also possible to store queries in files, similar to configuration
options.

```
$ cat <<EOF > queries.json
[{
  "type": "ddg_search",
  "term": "Keith Johnstone"
}]
EOF
```

We can use the `-q` argument to tell SugarCube to look for queries in a file.

```
$ $(npm bin)/sugarcube -q queries.json -c searches.json
```

It is possible to maintain multiple queries and of different type in one
file. Query files like the following are not uncommon:

```
[{
  "type": "ddg_search",
  "term": "Keith Johnstone"
}, {
  "type": "ddg_search",
  "term": "Machinocene"
}, {
  "type": "guardian_search",
  "term": "Aleppo"
}]
```

## Plugins

The list of plugins form a sort of pipeline, in which data is pushed through,
always having the plugin receive the output of the previous plugin. We can
form chains of transformation like this. Each plugin receives the current
version of the data, can add to it or do something with the existing data, and
returns data again.

Using the CSV plugin, we can convert our data to CSV and write it to a
file. Edit your `searches.json` and add another plugin. The file should look
like this:

```
{
  "plugins": "ddg_search,tap_printf,csv_export",
  "tap": {
    "limit": 1
  }
}
```

```
$ npm install -S @sugarcube/plugin-csv
$ $(npm bin)/sugarcube -Q ddg_search:Keith\ Johnstone -c searches.json
```

Our pipeline consists now of three plugins. The `csv_export` plugin
transforms the search results into CSV and writes it to the `out.csv` file in
the same directory, but you can change the file name with the `--csv.filename`
plugin.

To see other configuration options, run `$(npm bin)/sugarcube -h`.

## Intermezzo 2: Examples

### Search for content from The Guardian

The `guardian_content` plugin allows to search the archive of the Guardian. In
order to use this plugin, you have to obtain an API key. Find
instructions [here](https://gitlab.com/sugarcube/@sugarcube/plugin-guardian).

Install the guardian plugin into your project.

```
$ npm install -S @sugarcube/plugin-guardian
```

Lets do a quick search:

```
$ $(npm bin)/sugarcube -Q guardian_search:Aleppo \
                        -p guardian_content,tap_printf \
                        --guardian.key <your API key>
```

### Download videos from Youtube

```
$ npm install -S @sugarcube/plugin-youtube
```

This plugin requires an API key.

TODO: How to get this key?

The `youtube_channel` plugin lists the contents of a channel, a list of
videos. The `youtube_download` plugin uses
[`youtube-dl`](https://rg3.github.io/youtube-dl/) to fetch the videos. Set a
custom download target with the `--youtube.download_dir` option. The default
download target is in `downloads` of the project directory.

```
$ $(npm bin)/sugarcube -Q youtube_channel:UC1NpRGow8m-yrWo0Mqp6DOg \
                        -p youtube_channel,youtube_download \
                        --youtube.api_key <your API key>
```

### Query Twitter and deal with media

In order to use the Twitter plugin, you need four different API keys.

- A consumer secret
- A consumer key
- An access token key
- An access token secret

First create a new Twitter account. Then go to
[apps.twitter.com](https://apps.twitter.com) and log in. Create a new app.

In this example we will use the plugin for twitter, the HTTP plugin to
download images and the media plugin to extract EXIF data.

```
$ npm install -S @sugarcube/plugin-twitter \
                 @sugarcube/plugin-http \
                 @sugarcube/plugin-media
```

```
$ $(npm bin)/sugarcube -Q twitter_user:@jairbolsonaro -Q twitter_query:Jair\ Bolsonaro \
                        -p twitter_search,twitter_feed,http_get,media_exif \
                        --twitter.consumer_key <your key here> \
                        --twitter.consumer_secret <your key here> \
                        --twitter.access_token_key <your key here> \
                        --twitter.access_token_secret <your key here>
```

Or use a config file:

```
{
  "plugins": "twitter_search,twitter_feed,http_get,media_exif",
  "twitter": {
    "consumer_key": "<your key here>",
    "consumer_secret": "<your key here>",
    "access_token_key": "<your key here>",
    "access_token_secret": "<your key here>"
  }
}

```

### Read tweets in Telegram

Start off by installing the Telegram plugin:

```
$ npm install -S @sugarcube/plugin-telegram
```

We will need a bot key and channel ID to use the Telegram
plugin. See [here](https://gitlab.com/sugarcube/@sugarcube/plugin-telegram)
for more information.

The Telegram packages has one plugin, which can send units of data to a chat
channel. It will construct a string out of the fields listed in
`_sc_content_fields`. Using it is quite simple:

```
$  $(npm bin)/sugarcube -Q twitter_user:@jairbolsonaro \
                         -p twitter_feed,telegram_send_message \
                         --twitter.consumer_key <your key here> \
                         --twitter.consumer_secret <your key here> \
                         --twitter.access_token_key <your key here> \
                         --twitter.access_token_secret <your key here> \
                         --telegram.bot_key <your key here> \
                         --telegram.chat_id <your id here>
```

## Advancedly SugarCube

### Use SugarCube on the TOR network

It is possible to anonymize sugarcube using
[torsock](https://github.com/dgoulet/torsocks). But since torsocks prevents
requests to `localhost`, the MongoDB plugin is likely failing. This has to be
worked.

There is a `tor_check` plugin, that allows to test if requests are made over
TOR.

```
npm install -S @sugarcube/plugin-tor
```

```
$ $(npm bin)/sugarcube -p tor_check
$ torsocks $(npm bin)/sugarcube -p tor_check
$ torsocks $(npm bin)/sugarcube -Q guardian_search:Aleppo \
                                 -p tor_check,guardian_content,tap_printf \
                                 --guardian.key <your API key>
$ torsocks $(npm bin)/sugarcube -Q youtube_channel:UC1NpRGow8m-yrWo0Mqp6DOg \
                                 -p tor_check,youtube_channel,youtube_download \
                                 --youtube.api_key <your API key>

```

### Best practices

#### SugarCube projects

The simplest way to start a new project is to use
the
[SugarCube project boilerplate](https://gitlab.com/sugarcube/sugarcube-boilerplate-project).
It provides a scaffold with an initial structure.

```
git clone https://gitlab.com/sugarcube/sugarcube-boilerplate-project dev-project
cd dev-project
rm -rf .git && git init && git add -A && git commit -m "Initial commit"
npm install
$(npm bin)/sugarcube -h
```

#### TODO: Group queries and configs in files

#### TODO: Make pipeline runs repeatable with config files

## Intermezzo 3: Data

SugarCube organizes data as a set of units. A unit is an atomic piece of
data, such as a single tweet or a single article from the guardian. Every
plugin can decide what constitutes an unit. Every plugin receives the complete
set of data at once. SugarCube cares about the form of data, not the
content. This allows to treat Youtube videos and search engine results the
same.

Every unit of data has a set of keys and values. `tweet` and `tweet_time`
would be such keys, and the values are the actual tweet, and the time when the
tweet occurred.

There is a series of extra fields that are added to every unit by
SugarCube. Their keys usually start with `_sc`. These extra fields often
convey an additional semantic meaning in a plugin independent manner. It
allows plugins to operate on data in an independent manner, e.g. `_sc_media`
holds all links, that a data unit might contain. Now any plugin that wants to
operate on links (such as `http_get` or `http_wget`) don't need to know
anything about the specific plugin that generate the data in the first place.

This is an example, how such a unit of data looks like.

```
{
	"_sc_media" : [{
	  "type" : "url",
      "href" : "https://www.theguardian.com/us-news/2016/aug/14/third-party-candidates-johnson-stein-mcmullin-debate-polling-percentage",
      "_sc_id_hash" : "3e4ec721a206f46c1b1d30c958be6355e8f3665fe26ec51302dad565c5449096"
	}],
	"_sc_pubdates" : {
		"fetch" : "2017-03-21T23:22:35.426Z",
		"source" : "2016-08-14T12:00:35Z)
	},
	"_sc_relations" : [{
	  "type" : "url",
      "term" : "https://www.theguardian.com/us-news/2016/aug/14/third-party-candidates-johnson-stein-mcmullin-debate-polling-percentage",
      "_sc_id_hash" : "ed7a6bc7c6694fa4879e4e1f956db03d61fb327ab1a70a9dbe1c5020f8291245"
    }, {
      "type" : "url",
      "term" : "https://content.guardianapis.com/us-news/2016/aug/14/third-party-candidates-johnson-stein-mcmullin-debate-polling-percentage",
      "_sc_id_hash" : "e3895a0e1ce5a3d44f23fc759d34c9da96e859604b30713817c40bb99314d6f1"
	}],
	"_sc_downloads" : [{
	  "type" : "url",
      "term" : "https://www.theguardian.com/us-news/2016/aug/14/third-party-candidates-johnson-stein-mcmullin-debate-polling-percentage",
      "_sc_id_hash" : "172f6d9f96f85f976267f4ceeebd48e9049ee1427ca4b1a7d80026b40ce04211"
    }, {
	  "type" : "json",
      "term" : "https://content.guardianapis.com/us-news/2016/aug/14/third-party-candidates-johnson-stein-mcmullin-debate-polling-percentage",
      "_sc_id_hash" : "eda10207ffe39ce48c4883c2cd982c98275fafa6bddcdd2aa0fb4e9f37baa254"
    }],
	"id" : "us-news/2016/aug/14/third-party-candidates-johnson-stein-mcmullin-debate-polling-percentage",
	"type" : "article",
	"sectionId" : "us-news",
	"sectionName" : "US news",
	"webPublicationDate" : "2016-08-14T12:00:35Z",
	"webTitle" : "Third-party presidential candidates fight for 15% in polls – and a spot in debates",
	"webUrl" : "https://www.theguardian.com/us-news/2016/aug/14/third-party-candidates-johnson-stein-mcmullin-debate-polling-percentage",
	"apiUrl" : "https://content.guardianapis.com/us-news/2016/aug/14/third-party-candidates-johnson-stein-mcmullin-debate-polling-percentage",
	"isHosted" : false,
	"_sc_id_fields" : ["id"],
	"_sc_content_fields" : ["webTitle"],
	"_sc_id_hash" : "7c4e094182ad5369dec90910463c587a50e2c5125b1685c784488c05b2a3f2c8",
	"_sc_content_hash" : "1306025b72901b844a134a9bd7eb9f76d4d4aa3909fddccbb7b131260da71367",
	"_sc_markers" : ["B1QarNJ2x", "S1l0B41nx"]
}

```

The `_sc_id_hash` is the unique identifier of that unit of data. It is a
SHA256 hash sum of the identifying fields of the unit. If SugarCube fetches a
unit of data, it calculates the `_sc_id_hash` and can so determine if a unit
is new or already known.

Similar the `_sc_content_hash` is a hash sum of the content of a unit of
data. This can be the actual tweet, or the contents of an article. If a unit
is already know to SugarCube (same `_sc_id_hash`) but the content changed
(different `_sc_content_hash`), then we have a revision of a unit of data.

Units can form relations. If two separate articles link to the same image,
then that image becomes a relation. If two tweets use the same hashtag, then
that hashtag becomes a relation between those two tweets.

## TODO: Persist data with MongoDB

- `mongodb_store`
- `mongodb_fetch_*`
- `mongodb_query`

## TODO: SugarCube on UNIX

- Use pipes to connect SugarCube to other UNIX tools
- Quiet mode to redirect output on stdout
- pipe csv into awk
- post json data to a web service
- Run pipelines using GNU Parallel

## Look at this, look at that ...

```
$ $(npm bin)/sugarcube -q queries.json
                        -p youtube_channel,twitter_search,twitter_feed,youtube_download,http_get,media_exif,mongodb_store,csv_export,tap_printf \
                        -c config.json
```
