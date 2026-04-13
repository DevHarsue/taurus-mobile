module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@api': './src/api',
            '@features': './src/features',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@types': './src/types',
            '@app-types': './src/types',
            '@utils': './src/utils',
            '@theme': './src/theme',
            '@context': './src/context',
            '@navigation': './src/navigation'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};