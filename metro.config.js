const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para web sem expo-router
config.resolver.platforms = ['web', 'ios', 'android'];

module.exports = config; 