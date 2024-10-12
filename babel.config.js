module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-paper/babel',
      [
        'module-resolver',
        {
          alias: {
            '@config': '../server/src/config',
          },
        },
      ],
    ],
  };
};
