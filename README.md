# SugarCube

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Build Status](https://travis-ci.org/critocrito/sugarcube.svg?branch=master)](https://travis-ci.org/critocrito/sugarcube) [![Coverage Status](https://coveralls.io/repos/github/critocrito/sugarcube/badge.svg?branch=master)](https://coveralls.io/github/critocrito/sugarcube?branch=master)

## Synopsis

SugarCube is a framework to fetch, transform and publish data. Data processes
are described using plugins, which are chained in sequence to transform any
sort of data. It is used to support data based investigations.

The best way to get started is the [tutorial](docs/tutorial.md). See the
[glossary](/docs/glossary.md) for an explanation of terms and concepts of
SugarCube. If you want to contribute, please take a look
[here](CONTRIBUTING.md) or write an email. This code is licensed under the
[GPL 3](LICENSE).

## Development

This is a [Lerna](https://lernajs.io/) mono-repo.

To setup the project, run `yarn setup`. This will execute `yarn install` and
`lerna bootstrap`.

To link all packages into the local run `lerna exec yarn install`.

To build all packages run `yarn build`. It's possible to build only
specific packages using `yarn build -- cli core`.

All packages are linted using `yarn lint`. The coding standard is enforced
by [Prettier](https://github.com/prettier/prettier). Run `yarn fix` to
rewrite your code to follow the coding standard.

Run the tests with `yarn test`.

Note: Sometimes a test is failing. This often happens in the tests regarding
the state. This is related to `jsverify`. The error thrown is `TypeError:
str.split is not a function`. It doesn't happen too often though.

When committing to master, follow the [conventional
commits](https://conventionalcommits.org/) guidelines.

To prepare a new release, login first to NPM with `npm adduser
--scope=@sugarcube`. This will write `~/.npmrc`. I usually copy the file into
the project root. In the end my `.npmrc` looks somthing like that:

    access=public
    @sugarcube:registry=https://registry.npmjs.org/
    //registry.npmjs.org/:_authToken=<YOUR AUTH TOKEN>

To actually release a new version, simply run `yarn release`.

To develop the following host dependencies are required when running `yarn setup`.

- Java JDK (7 or 8) for `plugin-tika`.

To install those dependencies run:

- On Archlinux: `pacman -S jdk8-openjdk`
- On Debian: `apt install openjdk-7-jdk`
- Using Homebrew: `brew cask install java`

## Compilation

There is a `compile` run target that compiles all packages. Provide the name
of one or more package names to only compile those.

```sh
yarn compile
yarn compile plugin-tika cli core
```

Using the `watch` target a single package can be watched for file changes that
trigger a compilation.

```sh
yarn watch plugin-tika
```

## Testing

This repository contains an example project, to quickly try pipelines during
development. Use [`yarn`](https://yarnpkg.com/en/) over `npm` to avoid an
error about not found paths. [`jq`](https://stedolan.github.io/jq/) parses the
JSON file to extract all dependencies and outputs them as a text stream. To
set it up with the current development version:

```
yarn setup
cd project
mkdir -p node_modules/.bin
cd node_modules
ln -sf ../../packages @sugarcube
cd .bin
ln -sf ../@sugarcube/cli/bin/sugarcube .
```

The example project provides a `Vagrantfile` as well. It boots a VM with
MongoDB, Elasticsearch and NodeJS installed.

```
cd project
vagrant box add debian/stretch64
vagrant up
```

Test the DB connections:

```
mongo mongodb://localhost:27007
curl -X GET http://localhost:9200/_cluster/health?pretty
```

## Scripts

The `./scripts` folder contains some programs I used in the past. Install all
dependencies.

To use a program run it from the project root.

```
./scripts/count-imports.js dashp
```

- `count-imports.js` :: Count the usage of a dependency in the SuagrCube code
  base. The program takes the name of the dependency as it's arguments and
  prints a count of the imports, e.g. `./scripts/count-imports lodash/fp`. This script is currently not working.
- `make-docs.js` :: Generate the documentation from the different packages and place them in the `docs` directory.
