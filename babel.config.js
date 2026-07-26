const fs = require('fs');
const path = require('path');

// Ruta canónica del proyecto: resuelve el junction C:\Users\Harsue\trs a la
// ruta real. Metro canonicaliza los archivos fuente, así que los alias deben
// ser canónicos también o la resolución de módulos falla (rutas mezcladas).
const projectRoot = fs.realpathSync(__dirname);
const src = (dir) => path.join(projectRoot, 'src', dir);

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: [projectRoot],
          alias: {
            '@api': src('api'),
            '@features': src('features'),
            '@components': src('components'),
            '@hooks': src('hooks'),
            '@types': src('types'),
            '@app-types': src('types'),
            '@utils': src('utils'),
            '@offline': src('offline'),
            '@theme': src('theme'),
            '@context': src('context'),
            '@navigation': src('navigation')
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
