const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .cjs files if needed
config.resolver.sourceExts.push('cjs');

// Ensure proper asset resolution
config.resolver.assetExts.push(
  // Add any additional asset extensions if needed
  'bin'
);

module.exports = config;
