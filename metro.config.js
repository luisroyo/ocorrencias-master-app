const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração específica para PWA sem expo-router
config.resolver.platforms = ['web'];
config.resolver.alias = {
  'expo-router': false,
};

// Configurar para não tentar resolver expo-router
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 