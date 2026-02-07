const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .sqlite as a recognized asset extension so require() resolves it
config.resolver.assetExts.push('sqlite', 'db');

module.exports = config;
