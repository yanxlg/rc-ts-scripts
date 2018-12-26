// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const pathsConfigExist = fs.existsSync(
    path.join(appDirectory, '/config/scripts.json'));


const pathsConfig = pathsConfigExist ? require(
    path.join(appDirectory, '/config/scripts.json')) : {};



const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(inputPath, needsSlash) {
    const hasSlash = inputPath.endsWith('/');
    if (hasSlash && !needsSlash) {
        return inputPath.substr(0, inputPath.length - 1);
    } else if (!hasSlash && needsSlash) {
        return `${inputPath}/`;
    } else {
        return inputPath;
    }
}

const getPublicUrl = appPackageJson =>
    envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
    const publicUrl = getPublicUrl(appPackageJson);
    const servedUrl =
        envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
    return ensureSlash(servedUrl, true);
}

const moduleFileExtensions = [
    'web.mjs',
    'mjs',
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
    const extension = moduleFileExtensions.find(extension =>
        fs.existsSync(resolveFn(`${filePath}.${extension}`))
    );
    
    if (extension) {
        return resolveFn(`${filePath}.${extension}`);
    }
    
    return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
    dotenv: resolveApp(pathsConfig.dotenv || '.env'),
    appPath: resolveApp(pathsConfig.appPath || '.'),
    appBuild: resolveApp(pathsConfig.appBuild || 'build'),
    appPublic: resolveApp(pathsConfig.appPublic || 'public'),
    appHtml: resolveApp(pathsConfig.appHtml || 'public/index.html'),
    appIndexJs: resolveApp(pathsConfig.appIndexJs || 'src/index.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appSrcDirs:pathsConfig.appSrcDirs ? typeof pathsConfig.appSrcDirs === "string"?resolveApp(
        pathsConfig.appSrcDirs):pathsConfig.appSrcDirs.map((appSrc)=>resolveApp(appSrc)) : resolveApp('src'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveApp('src/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    appTsConfig: resolveApp('tsconfig.json'),
    appTsProdConfig: resolveApp('tsconfig.prod.json'),
    appTsLint: resolveApp('tslint.json'),
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json')),
    webName: pathsConfig.webName || 'react',
    excludes: pathsConfig.excludes ? typeof pathsConfig.excludes === "string"?resolveApp(
        pathsConfig.excludes):pathsConfig.excludes.map((exclude)=>resolveApp(exclude)) : null,
    plugin:pathsConfig.plugin||null
};

// @remove-on-eject-begin
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

// config before eject: we're in ./node_modules/react-scripts/config/
module.exports = {
    dotenv: resolveApp(pathsConfig.dotenv || '.env'),
    appPath: resolveApp(pathsConfig.appPath || '.'),
    appBuild: resolveApp(pathsConfig.appBuild || 'build'),
    appPublic: resolveApp(pathsConfig.appPublic || 'public'),
    appHtml: resolveApp(pathsConfig.appHtml || 'public/index.html'),
    appIndexJs: resolveApp(pathsConfig.appIndexJs || 'src/index.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appSrcDirs:pathsConfig.appSrcDirs ? typeof pathsConfig.appSrcDirs === "string"?resolveApp(
        pathsConfig.appSrcDirs):pathsConfig.appSrcDirs.map((appSrc)=>resolveApp(appSrc)) : resolveApp('src'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveApp('src/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    appTsConfig: resolveApp('tsconfig.json'),
    appTsProdConfig: resolveApp('tsconfig.prod.json'),
    appTsTestConfig: resolveApp('tsconfig.test.json'),
    appTsLint: resolveApp('tslint.json'),
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json')),
    // These properties only exist before ejecting:
    ownPath: resolveOwn(pathsConfig.ownPath || '.'),
    ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
    webName: pathsConfig.webName || 'react',
    excludes: pathsConfig.excludes ? typeof pathsConfig.excludes === "string"?resolveApp(
        pathsConfig.excludes):pathsConfig.excludes.map((exclude)=>resolveApp(exclude)) : null,
    plugin:pathsConfig.plugin||null
};

const ownPackageJson = require('../package.json');
const reactScriptsPath = resolveApp(`node_modules/${ownPackageJson.name}`);
const reactScriptsLinked =
    fs.existsSync(reactScriptsPath) &&
    fs.lstatSync(reactScriptsPath).isSymbolicLink();

// config before publish: we're in ./packages/react-scripts/config/
if (
    !reactScriptsLinked &&
    __dirname.indexOf(path.join('packages', 'react-scripts', 'config')) !== -1
) {
    module.exports = {
        dotenv: resolveOwn(`template/${pathsConfig.dotenv || '.env'}`),
        appPath: resolveApp(pathsConfig.appPath || '.'),
        appBuild: resolveOwn(`../../${pathsConfig.appBuild || 'build'}`),
        appPublic: resolveOwn(`template/${pathsConfig.appPublic || 'public'}`),
        appHtml: resolveOwn(
            `template/${pathsConfig.appHtml || 'public/index.html'}`),
        appIndexJs: resolveOwn(
            `template/${pathsConfig.appIndexJs || 'src/index.js'}`),
        appPackageJson: resolveOwn('package.json'),
        appSrc: resolveOwn('template/src'),
        appSrcDirs:pathsConfig.appSrcDirs ? typeof pathsConfig.appSrcDirs === "string"?resolveOwn(
            pathsConfig.appSrcDirs):pathsConfig.appSrcDirs.map((appSrc)=>resolveOwn(appSrc)) : resolveOwn('template/src'),
        yarnLockFile: resolveOwn('template/yarn.lock'),
        testsSetup: resolveOwn('template/src/setupTests.js'),
        appNodeModules: resolveOwn('node_modules'),
        appTsConfig: resolveOwn('template/tsconfig.json'),
        appTsProdConfig: resolveOwn('template/tsconfig.prod.json'),
        appTsLint: resolveOwn('template/tslint.json'),
        appTsTestConfig: resolveOwn('template/tsconfig.test.json'),
        publicUrl: getPublicUrl(resolveOwn('package.json')),
        servedPath: getServedPath(resolveOwn('package.json')),
        // These properties only exist before ejecting:
        ownPath: resolveOwn(pathsConfig.ownPath || '.'),
        ownNodeModules: resolveOwn('node_modules'),
        webName: pathsConfig.webName || 'react',
        excludes: pathsConfig.excludes ? typeof pathsConfig.excludes === "string"?resolveApp(
            pathsConfig.excludes):pathsConfig.excludes.map((exclude)=>resolveApp(exclude)) : null,
        plugin:pathsConfig.plugin||null
    };
}
// @remove-on-eject-end

module.exports.moduleFileExtensions = moduleFileExtensions;