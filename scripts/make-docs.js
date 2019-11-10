/* eslint import/no-extraneous-dependencies: off */
const fs = require("fs");
const path = require("path");
const {promisify} = require("util");
const markdown = require("remark-parse");
const stringify = require("remark-stringify");
const unified = require("unified");
const find = require("unist-util-find");
const findAfter = require("unist-util-find-after");
const findAllAfter = require("unist-util-find-all-after");
const findAllBetween = require("unist-util-find-all-between");
// The lodash-fp eslint plugin throws a TypeError if I name the import
// toString.
const mdToString = require("mdast-util-to-string");
const u = require("unist-builder");
const {mkdirP} = require("../packages/plugin-fs");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const deprecatedPlugins = [
  "aqicn_station",
  "facebook_api_feed (DEPRECATED)",
  "facebook_api_page (DEPRECATED)",
  "facebook_api_user (DEPRECATED)",
  "google_images",
  "google_reverse_images_file",
  "http_get (DEPRECATED)",
  "instagram_feed",
  "media_exif",
  "mongodb_fetch_relations",
  "mongodb_fetch_revisions",
  "tap_writef",
  "telegram_send_message",
  "tika_export",
  "tika_links",
  "tika_location",
  "tika_parse",
  "tor_check",
  "twitter_followers",
  "twitter_friends",
  "workflow_omit",
  "workflow_pick",
];

const readPackages = target => {
  const listPackages = fs.readdirSync(target).reduce((memo, pkg) => {
    if (pkg.startsWith("plugin")) return memo.concat(pkg);
    return memo;
  }, []);
  return Promise.all(
    listPackages.map(async pkg => {
      const [readme, packageJson] = await Promise.all([
        readFile(path.resolve(target, pkg, "README.md")),
        readFile(path.resolve(target, pkg, "package.json")),
      ]);
      return [readme.toString(), JSON.parse(packageJson.toString())];
    }),
  );
};

const findSectionByName = (tree, name) => {
  const start = find(tree, {
    type: "heading",
    children: [{value: name}],
  });

  const end = findAfter(tree, start, {
    type: "heading",
    depth: start.depth,
  });
  const section =
    end == null
      ? findAllAfter(tree, start)
      : findAllBetween(tree, start, end).slice(1);
  return section;
};

const findSectionByNode = (tree, node) => {
  const end = findAfter(
    tree,
    node,
    nextNode => nextNode.type === "heading" && nextNode.depth <= node.depth,
  );
  const section = findAllBetween(tree, node, end);
  return section.slice(1);
};

const generatePluginDocs = async () => {
  const packages = await readPackages("packages");

  const plugins = packages.reduce((memo, [readme, pkg]) => {
    const tree = unified()
      .use(markdown)
      .parse(readme);

    let installation;
    let pluginHeaders;

    try {
      installation = findSectionByName(tree, "Installation");
      pluginHeaders = findSectionByName(tree, "Plugins");
    } catch (e) {
      return memo;
    }
    const {version, author, homepage, keywords, bugs, license} = pkg;

    return pluginHeaders
      .filter(node => node.type === "heading")
      .reduce((acc, node) => {
        const desc = findSectionByNode(tree, node);
        return acc.concat({
          name: mdToString(node)
            .replace(/plugin/, "")
            .trim(),
          header: node,
          installation: u("root", installation),
          desc: u("root", desc),
          license,
          version,
          author,
          homepage,
          bugs,
          keywords,
        });
      }, memo);
  }, []);

  return Promise.all(
    plugins
      .filter(plugin => !deprecatedPlugins.includes(plugin.name))
      .map(async plugin => {
        const installationText = unified()
          .use(stringify)
          .stringify(plugin.installation);
        const pluginText = unified()
          .use(stringify)
          .stringify(plugin.desc);

        const pathName = `plugins/${plugin.name}`;
        const filePath = path.join("docs", `${pathName}.md`);

        await mkdirP("docs/plugins");

        const file = `---
path: "/${pathName}"
title: "${plugin.name}"
author: "${plugin.author}"
version: "${plugin.version}"
bugs: "${plugin.bugs}"
license: "${plugin.license}"
homepage: "${plugin.homepage}"
tags: [${plugin.keywords.map(k => `"${k}"`).join(",")}]
---
# ${plugin.name} plugin

\`\`\`toc
from-heading: 2
to-heading: 2
\`\`\`

## Installation

${installationText}

## Usage

${pluginText}`;

        // eslint-disable-next-line no-console
        console.log(
          `Generating doc file for plugin ${plugin.name} in ${filePath}`,
        );
        return writeFile(filePath, file);
      }),
  );
};

const generateInstrumentDocs = async () => {
  const packages = await readPackages("packages");

  const instruments = packages.reduce((memo, [readme, pkg]) => {
    const tree = unified()
      .use(markdown)
      .parse(readme);

    let installation;
    let instrumentHeaders;

    try {
      installation = findSectionByName(tree, "Installation");
      instrumentHeaders = findSectionByName(tree, "Instruments");
    } catch (e) {
      return memo;
    }
    const {version, author, homepage, keywords, bugs, license} = pkg;

    return instrumentHeaders
      .filter(node => node.type === "heading")
      .reduce((acc, node) => {
        const desc = findSectionByNode(tree, node);
        return acc.concat({
          name: mdToString(node)
            .replace(/plugin/, "")
            .trim(),
          header: node,
          installation: u("root", installation),
          desc: u("root", desc),
          license,
          version,
          author,
          homepage,
          bugs,
          keywords,
        });
      }, memo);
  }, []);

  return Promise.all(
    instruments.map(async instrument => {
      const installationText = unified()
        .use(stringify)
        .stringify(instrument.installation);
      const instrumentText = unified()
        .use(stringify)
        .stringify(instrument.desc);

      const pathName = `instruments/${instrument.name}`;
      const filePath = path.join("docs", `${pathName}.md`);

      await mkdirP("docs/instruments");

      const file = `---
path: "/${pathName}"
title: "${instrument.name}"
author: "${instrument.author}"
version: "${instrument.version}"
bugs: "${instrument.bugs}"
license: "${instrument.license}"
homepage: "${instrument.homepage}"
tags: [${instrument.keywords.map(k => `"${k}"`).join(",")}]
---
# ${instrument.name} instrument

\`\`\`toc
from-heading: 2
to-heading: 2
\`\`\`

## Installation

${installationText}

## Usage

${instrumentText}`;

      // eslint-disable-next-line no-console
      console.log(
        `Generating doc file for instrument ${instrument.name} in ${filePath}`,
      );
      return writeFile(filePath, file);
    }),
  );
};

(async () => {
  await generatePluginDocs();
  await generateInstrumentDocs();
})();
