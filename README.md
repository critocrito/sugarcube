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

When committing to master, follow the [conventional
commits](https://conventionalcommits.org/) guidelines.

To prepare a new release, login first to NPM with `npm adduser
--scope=@sugarcube`. This will write `~/.npmrc`. I usually copy the file into
the project root. In the end my `.npmrc` looks somthing like that:

    access=public
    @sugarcube:registry=https://registry.npmjs.org/
    //registry.npmjs.org/:_authToken=<YOUR AUTH TOKEN>

To actually release a new version, simply run `npm run release`.
