module.exports = {
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
