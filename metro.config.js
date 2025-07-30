const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurar para web apenas
config.resolver.platforms = ['web'];

// Resolver módulos nativos para web
config.resolver.alias = {
  'react-native': 'react-native-web',
  '../Utilities/Platform': 'react-native-web/dist/exports/Platform',
  '../Utilities/defineLazyObjectProperty': 'react-native-web/dist/exports/defineLazyObjectProperty',
  './UIManagerProperties': 'react-native-web/dist/exports/UIManagerProperties',
};

// Configurar resolver para web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 