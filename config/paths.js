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
const findPkg = require('find-pkg');
const globby = require('globby');

require('colors');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

//判断配置文件是否存在，如果存在则从配置文件读取，否则使用默认

const pathsConfigExist = fs.existsSync(
    path.join(appDirectory, '/config/scripts.json'));


const pathsConfig = pathsConfigExist ? require(
    path.join(appDirectory, '/config/scripts.json')) : {};

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
    const hasSlash = path.endsWith('/');
    if (hasSlash && !needsSlash) {
        return path.substr(path, path.length - 1);
    } else if (!hasSlash && needsSlash) {
        return `${path}/`;
    } else {
        return path;
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
    appSrcDirs:pathsConfig.appSrcDirs?typeof pathsConfig.appSrcDirs === "string"?resolveApp(
        pathsConfig.appSrcDirs):pathsConfig.appSrcDirs.map((srcDir)=>resolveApp(srcDir)):resolveApp('src'),
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

let checkForMonorepo = true;

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
    appSrcDirs:pathsConfig.appSrcDirs?typeof pathsConfig.appSrcDirs === "string"?resolveApp(
        pathsConfig.appSrcDirs):pathsConfig.appSrcDirs.map((srcDir)=>resolveApp(srcDir)):resolveApp('src'),
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

// detect if template should be used, ie. when cwd is react-scripts itself
const useTemplate =
    appDirectory === fs.realpathSync(path.join(__dirname, '..'));

checkForMonorepo = !useTemplate;

if (useTemplate) {
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
        appSrcDirs:pathsConfig.appSrcDirs?typeof pathsConfig.appSrcDirs === "string"?resolveOwn(
            pathsConfig.appSrcDirs):pathsConfig.appSrcDirs.map((srcDir)=>resolveOwn(srcDir)):resolveOwn('template/src'),
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

module.exports.srcPaths = [module.exports.appSrc];

const findPkgs = (rootPath, globPatterns) => {
    const globOpts = {
        cwd: rootPath,
        strict: true,
        absolute: true,
    };
    return globPatterns.reduce(
        (pkgs, pattern) =>
            pkgs.concat(
                globby.sync(path.join(pattern, 'package.json'), globOpts)),
        [],
    ).map(f => path.dirname(path.normalize(f)));
};

const getMonorepoPkgPaths = () => {
    const monoPkgPath = findPkg.sync(path.resolve(appDirectory, '..'));
    if (monoPkgPath) {
        // get monorepo config from yarn workspace
        const pkgPatterns = require(monoPkgPath).workspaces;
        if (pkgPatterns == null) {
            return [];
        }
        const pkgPaths = findPkgs(path.dirname(monoPkgPath), pkgPatterns);
        // only include monorepo pkgs if app itself is included in monorepo
        if (pkgPaths.indexOf(appDirectory) !== -1) {
            return pkgPaths.filter(f => fs.realpathSync(f) !== appDirectory);
        }
    }
    return [];
};

if (checkForMonorepo) {
    // if app is in a monorepo (lerna or yarn workspace), treat other packages in
    // the monorepo as if they are app source
    Array.prototype.push.apply(module.exports.srcPaths, getMonorepoPkgPaths());
}
