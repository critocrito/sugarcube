# SugarCube

[![pipeline status](https://gitlab.com/sugarcube/sugarcube/badges/master/pipeline.svg)](https://gitlab.com/sugarcube/sugarcube/commits/master)

SugarCube is a framework to fetch, transform and publish data. Data processes
are described using plugins, which are chained in sequence to transform any
sort of data. It is used to support data based investigations.

The best way to get started is the [tutorial](docs/tutorial.md). If you want
to contribute, please take a look [here](CONTRIBUTING.md) or write an
email. This code is licensed under the [GPL 3](LICENSE).

## Development

This is a [Lerna](https://lernajs.io/) mono-repo.

To setup the project, run `npm run setup`. This will execute `npm install` and
`lerna bootstrap`.

To link all packages into the local run `lerna exec npm install`.

To build all packages run `npm run build`. It's possible to build only
specific packages using `npm run build -- cli core`.

All packages are linted using `npm run lint`. The coding standard is enforced
by [Prettier](https://github.com/prettier/prettier). Run `npm run fix` to
rewrite your code to follow the coding standard.

Run the tests with `npm run test`.

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

To actually release a new version, simply run `npm run release`.

To develop the following host dependencies are required when running `npm run setup`.

- Java JDK (7 or 8) for `plugin-tika`.

To install those dependencies run:

- On Archlinux: `pacman -S jdk8-openjdk`
- On Debian: `apt install openjdk-7-jdk`
- Using Homebrew: `brew cask install java`

## Compilation

There is a `compile` run target that compiles all packages. Provide the name
of one or more package names to only compile those.

```sh
npm run compile
npm run compile plugin-tika cli core
```

Using the `watch` target a single package can be watched for file changes that
trigger a compilation.

```sh
npm run watch plugin-tika
```

## Testing

This repository contains an example project, to quickly try pipelines during
development. Use [`yarn`](https://yarnpkg.com/en/) over `npm` to avoid an
error about not found paths. [`jq`](https://stedolan.github.io/jq/) parses the
JSON file to extract all dependencies and outputs them as a text stream. To
set it up with the current development version:

```
npm run setup
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

```
cd scripts
npm i
```

To use a program run it from the project root.

```
./scripts/count-imports.js dashp
```

- `count-imports.js` :: Count the usage of a dependency in the SuagrCube code
  base. The program takes the name of the dependency as it's arguments and
  prints a count of the imports, e.g. `./scripts/count-imports lodash/fp`.
