# Contributing to SugarCube

Contributions are always welcome and appreciated. Before contributing please
[search the issue tracker](https://gitlab.com/groups/sugarcube/issues); your
issue may have already been discussed or fixed in `master`. To contribute,
[fork](https://gitlab.com/help/gitlab-basics/fork-project.md) the repository,
commit your changes and [send a merge
request](https://gitlab.com/help/gitlab-basics/add-merge-request.md).

When discussing a bug or a feature:

- Be friendly and patient.
- Be welcoming.
- Be considerate.
- Be respectful.
- Be careful in the words that you choose.
- When we disagree, try to understand why.

## Feature Requests

Feature requests should be submitted in the [issue
tracker](https://gitlab.com/groups/sugarcube/issues), with a description of
the expected behavior and use case. If you want to add a new feature, please
[send a merge
request](https://gitlab.com/help/gitlab-basics/add-merge-request.md) that
implements the new feature. In order to avoid a rejection, discuss the feature
before any implementation work.

- New features to core must have a unit test.
- Re-implementations of existing features must pass the existing unit tests
  and implement an accompanying benchmark. Each benchmark must have
  implementations that do the same thing and compare performance and compare
  performance under different types of workloads.

## Merge Requests

All packages of the SugarCube project are released under the
[GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html) license. This means any
contributions are released under the same terms.

- Use two spaces for indentation. No tabs.
- The preferred coding style is enforced using [ESLint](http://eslint.org/).
  The final code of any contribution has to lint without warnings.
- Please use single-line comments to annotate significant additions, and
  [JSDoc-style](http://usejsdoc.org/) comments for functions.

## Plugin Developments

You are free to develop plugins for SugarCube as you wish. See the [developers
guide](https://gitlab.com/sugarcube/tree/master/docs/developers-guide). If a
plugin already exists, that does something similar, consider to contribute to
this plugin instead of creating a new one. To include your plugin into the
SugarCube distribution, you have to apply the same coding and contribution
guidelines, and repository ownership has to migrate to the `sugarcube` group
on [Gitlab](https://gitlab.com/sugarcube).
