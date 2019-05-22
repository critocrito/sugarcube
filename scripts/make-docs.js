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
const toString = require("mdast-util-to-string");
const u = require("unist-builder");

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const readPackages = (target) => {
  const listPackages = fs.readdirSync(target).reduce((memo, pkg) => {
    if (pkg.startsWith("plugin")) return memo.concat(pkg);
    return memo;
  }, []);
  return Promise.all(
    listPackages.map(async (pkg) => {
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
  const section = end == null
    ? findAllAfter(tree, start)
    : findAllBetween(tree, start, end).slice(1);
  return section;
}

const findSectionByNode = (tree, node) => {
  const end = findAfter(tree, node, (nextNode) =>
    nextNode.type === "heading" && nextNode.depth <= node.depth);
  const section = findAllBetween(tree, node, end);
  return section.slice(1);
}

const generatePluginDocs = async () => {
  const packages = await readPackages("packages");

  const plugins = packages.reduce((memo, [readme, pkg]) => {
    const tree = unified()
      .use(markdown)
      .parse(readme);

    const installation = findSectionByName(tree, "Installation");
    const pluginHeaders = findSectionByName(tree, "Plugins");
    const {version, author, homepage, keywords, bugs, license} = pkg;

    return pluginHeaders
      .filter((node) => node.type === "heading")
      .reduce((acc, node) => {
        const desc = findSectionByNode(tree, node);
        return acc.concat({
          name: (toString(node)).replace(/plugin/, "").trim(),
          header: node,
          installation: u("root", installation),
          desc: u("root", desc),
          license: u("root", license),
          version,
          author,
          homepage,
          bugs,
          keywords,
          license,
        });
      }, memo);
  }, []);

  return Promise.all(
    plugins.map((plugin) => {
      const installationText = unified().use(stringify).stringify(plugin.installation);;
      const pluginText = unified().use(stringify).stringify(plugin.desc);

      const pathName = `plugins/${plugin.name}`;
      const filePath = path.join("docs", `${pathName}.md`);

      const file = `---
path: "/${pathName}"
title: "${plugin.name} plugin"
author: "${plugin.author}"
version: "${plugin.version}"
bugs: "${plugin.bugs}"
license: "${plugin.license}"
homepage: "${plugin.homepage}"
tags: [${plugin.keywords.map((k) => `"${k}"`).join(",")}]
---

### Installation
${installationText}

### Usage
${pluginText}`;

      console.log(`Generating doc file for ${plugin.name} in ${filePath}`);
      return writeFile(filePath, file);
    }),
  );
};

(async () => await generatePluginDocs())();
