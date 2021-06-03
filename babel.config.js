module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "12",
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
