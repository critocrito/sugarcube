const {flow, toPairs, sortBy} = require("lodash/fp");
const fs = require("fs");
const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const {unfold} = require("../packages/plugin-fs");

const inspect = flow([toPairs, sortBy([([, v]) => v])]);
const results = {};

process.on("unhandledRejection", up => {
  throw up;
});

(async () => {
  const files = await unfold("./packages/*/lib/**/*.js");

  files.forEach(({location}) => {
    const text = fs.readFileSync(location).toString();
    const ast = babylon.parse(text, {sourceType: "module"});

    traverse(ast, {
      enter: path => {
        if (
          path.node.type === "ImportDeclaration" &&
          path.node.source.value === "lodash/fp"
        ) {
          path.node.specifiers.forEach(s => {
            const {name} = s.imported;
            results[name] = (results[name] || 0) + 1;
          });
        }
      },
    });
  });

  // eslint-disable-next-line no-console
  console.log(inspect(results));
})();
