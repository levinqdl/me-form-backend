module.exports = {
  presets: ['@babel/env', '@babel/preset-react', '@babel/typescript'],
  plugins: ['@babel/proposal-class-properties'],
  env: {
    test: {
      presets: [
        [
          '@babel/env',
          {
            targets: {
              node: 8,
            },
          },
        ],
      ],
    },
  },
}
