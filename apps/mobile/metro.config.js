const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo support: watch workspace root
config.watchFolders = [workspaceRoot];

// Resolve node_modules from workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Support workspace packages
config.resolver.extraNodeModules = {
  '@parel/db': path.resolve(workspaceRoot, 'packages/db'),
  '@parel/utils': path.resolve(workspaceRoot, 'packages/utils'),
  '@parel/shared': path.resolve(workspaceRoot, 'packages/shared'),
};

module.exports = config;

