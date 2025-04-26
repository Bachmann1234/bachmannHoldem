const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude test files from the bundle
config.resolver.blockList = [
  /.*\.test\.ts$/,
  /.*\.test\.tsx$/,
  /.*\.spec\.ts$/,
  /.*\.spec\.tsx$/,
];

module.exports = config; 