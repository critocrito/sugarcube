#! /usr/bin/env node

/* eslint no-console: off */
const {flow, toPairs, sortBy} = require("lodash/fp");
const fs = require("fs");
const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const {unfold} = require("../packages/plugin-fs");

const yargs = require("yargs")
  .usage("Usage: $0 <dependency> [--report|-r]")
  .example("./scripts/$0 [-r] dashp", "Print a report for the use of dashp.")
  .alias("r", "report")
  .describe("r", "Print a details usage report.")
  .boolean("r")
  .help("h")
  .alias("h", "help")
  .version("0.0.0");

const dependency = yargs.argv._[0];

if (!dependency) {
  yargs.parse(["-h"]);
  process.exit(1);
}

if (yargs.argv.report) console.log("-r, --report not yet implemented");

const inspect = flow([toPairs, sortBy([([, v]) => v])]);
const results = {};

process.on("unhandledRejection", up => {
  throw up;
});

(async () => {
  let paths = "./packages/*/lib/**/*.js";
  if (/scripts/.test(process.cwd())) paths = `.${paths}`;

  const files = await unfold(paths);

  files.forEach(({location}) => {
    const text = fs.readFileSync(location).toString();
    const ast = babylon.parse(text, {sourceType: "module"});

    traverse(ast, {
      enter: path => {
        if (
          path.node.type === "ImportDeclaration" &&
          path.node.source.value === dependency
        ) {
          path.node.specifiers.forEach(s => {
            const {name} = s.local;
            results[name] = (results[name] || 0) + 1;
          });
        }
      },
    });
  });

  console.log(inspect(results));
})();
