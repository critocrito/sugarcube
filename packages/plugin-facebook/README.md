# `@sugarcube/plugin-facebook`

Query the Facebook
[GraphAPI](https://developers.facebook.com/docs/graph-api). It requires you to
register your app.

- Login to your Facebook account.
- Register as a Facebook [developer](https://developer.facebook.com).
- Register yourself an [app](https://developers.facebook.com/apps/).

You'll need the `app_id` and the `app_secret`.

- [Plugins](#plugins)
- [Development](#development)

## Plugins

### `facebook_api_user`

Fetch data about a user. It uses `facebook_user` as query type.

    sugarcube -Q facebook_user:<user_id> \
               -p facebook_api_user \
               --facebook.app_id <app_id> \
               --facebook.app_secret <app_secret>

You need the `userid`, the username won't work. To get it:

- Browse to the Facebook page of that user.
- Right-click and *view source*.
- Use `CTRL-f` to search through the source and search for
  `user.php?id=`. This is your user id.

**Configuration**

- **facebook.app_id**
- **facebook.app_secret**

### `facebook_api_page`

Fetch data about a Facebook page. It uses `facebook_page` as query type.

    sugarcube -Q facebook_page:<page_name> \
               -p facebook_api_page \
               --facebook.app_id <app_id> \
               --facebook.app_secret <app_secret>

**Configuration**

- **facebook.app_id**
- **facebook.app_secret**

## Development

This scaffolding builds a CommonJS module that runs on NodeJS.

There are the following `npm` scripts:

-   `watch` - Run a watcher for the tests.
-   `test` - Run all specs in `test/`.
-   `lint-docs` - Lint the [JSDoc](http://usejsdoc.org) docstrings using
    [Documentation](https://github.com/documentationjs/documentation).
-   `lint-src` - Use [ESLint](https://eslint.org/) and
    [Prettier](https://github.com/prettier/prettier) to enforce the coding
    style.
-   `lint` - Run `lint-docs` and `lint-src`.
-   `fix` - Automatically fix linting errors in the JavaScript code.
-   `clean` - Remove all compiled bundles.
-   `docs` - Build the API docs using
    [Documentation](https://github.com/documentationjs/documentation).
-   `compile` - Compile the ES6 sources using [Babel](https://babeljs.io/) using
    [rollup](https://rollupjs.org/). Runs the `clean` target before compilation.
-   `build` - Build the whole bundle. This lints, tests, documents and compiles
    the while package.
-   `check` - Test that ESLint and Prettier are in alignment.
-   `publish` - Publish to the [NPM repository](https://www.npmjs.com/).
-   `release` - Make a new release using [Conventional
    Commits](https://conventionalcommits.org/).
