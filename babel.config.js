module.exports = {
  plugins: [
    "@babel/plugin-proposal-async-generator-functions",
    "syntax-trailing-function-commas",
    "@babel/plugin-proposal-object-rest-spread",
  ],
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "8",
        },
      },
    ],
  ],
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current",
            },
          },
        ],
      ],
      plugins: ["istanbul"],
    },
  },
};
