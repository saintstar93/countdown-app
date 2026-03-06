const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Force CJS resolution for zustand on web to avoid `import.meta` syntax errors.
// Zustand's package exports map the "import" condition to ESM files (.mjs) which
// contain `import.meta.env`, but Metro bundles as a non-module script so this
// causes a parse error. Pointing Metro to the CJS files fixes the issue.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && /^zustand($|\/)/.test(moduleName)) {
      const subpath = moduleName.replace(/^zustand\/?/, '') || 'index';
      const cjsPath = path.resolve(
        __dirname,
        'node_modules/zustand',
        subpath === 'index' ? 'index.js' : `${subpath}.js`
      );
      return { filePath: cjsPath, type: 'sourceFile' };
    }
    if (originalResolveRequest) return originalResolveRequest(context, moduleName, platform);
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
