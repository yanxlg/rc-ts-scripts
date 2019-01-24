// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


const CleanPlugin = require('./clean-css');
const importJson =  require('./sass-import-json');

const HappyPack = require("happypack");
const os =require("os");
const happyThreadPool = HappyPack.ThreadPool({size:os.cpus().length});



const publicPath = paths.servedPath;
const shouldUseRelativeAssetPaths = publicPath === './';
const shouldUseSourceMap = !!process.env.GENERATE_SOURCEMAP;//是否生成sourceMap

const webpackConfig = require("./webpackConfig");

const assertDir=webpackConfig.assertDir;


const publicUrl = "/"+assertDir;
const env = getClientEnvironment(publicUrl);

if (env.stringified['process.env'].NODE_ENV !== '"production"') {
    throw new Error('Production builds must have NODE_ENV=production.');
}


const cssFilename = `${assertDir}/css/[name].[hash:8].css`;

const extractTextPluginOptions = shouldUseRelativeAssetPaths
    ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
    : {};


module.exports = {
    bail: true,
    mode:"production",
    devtool: shouldUseSourceMap ? 'source-map' : false,
    entry: webpackConfig.entry,
    output: {
        path: paths.appBuild,
        filename: `${assertDir}/bundle/[name].[chunkhash:8].js`,
        chunkFilename: `${assertDir}/bundle/[name].[chunkhash:8].chunk.js`,
        publicPath: publicPath, // 相对路径
        devtoolModuleFilenameTemplate: info =>
            path
            .relative(paths.appSrc, info.absoluteResourcePath)
            .replace(/\\/g, '/'),
    },
    optimization:{
        minimize:true,
        namedModules:true,
        namedChunks:true,
        splitChunks: webpackConfig.cacheGroups?{
            minChunks: Infinity,
            cacheGroups: webpackConfig.cacheGroups
        }:false
    },
    resolve: {
        modules: ['node_modules', paths.appNodeModules].concat(paths.appSrcDirs).concat(
            process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
        ),
        extensions: [' ','.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx','.ts', '.tsx', '.es6'],
        alias: {
            'babel-runtime': path.dirname(
                require.resolve('babel-runtime/package.json')
            ),
            'react-native': 'react-native-web',
        },
        plugins: [
            new ModuleScopePlugin(paths.appSrcDirs, [paths.appPackageJson]), // allow outside of src/
            new TsconfigPathsPlugin({ configFile: paths.appTsConfig }),
        ],
    },
    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.(js|jsx|mjs)$/,
                loader: require.resolve('source-map-loader'),
                enforce: 'pre',
                include: paths.appSrcDirs,  // allow outside of src/
            },
            {
                oneOf: [
                    {
                        test:/\.worker\.js$/,
                        use: { loader: 'worker-loader',options: { name: 'workers/[hash].worker.js',inline: true}}
                    },
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: `${assertDir}/media/[ext]/[name].[hash:8].[ext]`,
                        },
                    },
                    {
                        test: /\S*icon\S*.(svg|eot|ttf|woff)$/,
                        loader: 'file-loader',
                        options: {
                            name: `${assertDir}/icons/[name].[hash:8].[ext]`,
                        },
                    },
                    {
                        test: /.(svg|eot|ttf|woff)$/,
                        loader: 'file-loader',
                        options: {
                            name: `${assertDir}/media/[ext]/[name].[hash:8].[ext]`,
                        },
                    },
                    {
                        test: /\.(js|jsx|mjs)$/,
                        use:"happypack/loader?id=jsx",
                    },
                    {
                        test: /\.(ts|tsx)$/,
                        use:"happypack/loader?id=tsx",
                    },
                    {
                        test: /\.css$/,
                        loader: ExtractTextPlugin.extract(
                            Object.assign(
                                {
                                    fallback: {
                                        loader: require.resolve('style-loader'),
                                        options: {
                                            hmr: false,
                                        },
                                    },
                                    use: [
                                        {
                                            loader: require.resolve('css-loader'),
                                            options: {
                                                importLoaders: 1,
                                                minimize: true,
                                                sourceMap: shouldUseSourceMap,
                                            },
                                        },
                                        {
                                            loader: require.resolve('postcss-loader'),
                                            options: {
                                                sourceMap: false,
                                                // Necessary for external CSS imports to work
                                                // https://github.com/facebookincubator/create-react-app/issues/2677
                                                ident: 'postcss',
                                                plugins: () => [
                                                    require('postcss-flexbugs-fixes'),
                                                    autoprefixer({
                                                        browsers: [
                                                            '>1%',
                                                            'last 4 versions',
                                                            'Firefox ESR',
                                                            'not ie < 9', // React doesn't support IE8 anyway
                                                        ],
                                                        flexbox: 'no-2009',
                                                    }),
                                                ],
                                            },
                                        },
                                    ],
                                },
                                extractTextPluginOptions
                            )
                        ),
                        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
                    },
                    {
                        test: /\.scss$/,
                        use: ExtractTextPlugin.extract(
                            Object.assign(
                                {
                                    fallback: {
                                        loader: require.resolve('style-loader'),
                                        options: {
                                            hmr: false,
                                        },
                                    },
                                    use: [
                                        {
                                            loader: require.resolve('css-loader'),
                                            options: {
                                                importLoaders: 1,
                                                minimize: true,
                                                sourceMap: shouldUseSourceMap,
                                            },
                                        },
                                        {
                                            loader: require.resolve('postcss-loader'),
                                            options: {
                                                sourceMap: false,
                                                // Necessary for external CSS imports to work
                                                // https://github.com/facebookincubator/create-react-app/issues/2677
                                                ident: 'postcss',
                                                plugins: () => [
                                                    require('postcss-flexbugs-fixes'),
                                                    autoprefixer({
                                                        browsers: [
                                                            '>1%',
                                                            'last 4 versions',
                                                            'Firefox ESR',
                                                            'not ie < 9', // React doesn't support IE8 anyway
                                                        ],
                                                        flexbox: 'no-2009',
                                                    }),
                                                ],
                                            },
                                        },
                                        {
                                            loader:'resolve-url-loader',
                                            options:{
                                                debug:false,
                                                absolute:false,
                                            }
                                        },
                                        {
                                            loader: require.resolve('sass-loader'),
                                            options: {
                                                importer: [importJson],
                                                data: '$rootPath: "./src";',
                                                sourceMap:false,
                                                javascriptEnabled: true
                                            }
                                        },
                                    ],
                                },
                                extractTextPluginOptions
                            )),
                    },
                    {
                        test: /\.less$/,
                        use: ExtractTextPlugin.extract(
                            Object.assign(
                                {
                                    fallback: {
                                        loader: require.resolve('style-loader'),
                                        options: {
                                            hmr: false,
                                        },
                                    },
                                    use: [
                                        {
                                            loader: require.resolve('css-loader'),
                                            options: {
                                                importLoaders: 1,
                                                minimize: true,
                                                sourceMap: shouldUseSourceMap,
                                            },
                                        },
                                        {
                                            loader: require.resolve('postcss-loader'),
                                            options: {
                                                sourceMap: false,
                                                // Necessary for external CSS imports to work
                                                // https://github.com/facebookincubator/create-react-app/issues/2677
                                                ident: 'postcss',
                                                plugins: () => [
                                                    require('postcss-flexbugs-fixes'),
                                                    autoprefixer({
                                                        browsers: [
                                                            '>1%',
                                                            'last 4 versions',
                                                            'Firefox ESR',
                                                            'not ie < 9', // React doesn't support IE8 anyway
                                                        ],
                                                        flexbox: 'no-2009',
                                                    }),
                                                ],
                                            },
                                        },
                                        {
                                            loader: require.resolve('less-loader'),
                                            options: { javascriptEnabled: true }
                                        }
                                    ],
                                },
                                extractTextPluginOptions
                            )),
                    },
                    {
                        loader: require.resolve('file-loader'),
                        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                        options: {
                            name: `${assertDir}/media/[ext]/[name].[hash:8].[ext]`,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HappyPack({
            id:"jsx",
            loaders:[{
                loader: 'babel-loader',
                options: {
                    compact:true,
                    // @remove-on-eject-begin
                    babelrc: false,
                    presets: ["env","stage-3","react-app"],
                    cacheDirectory:true,
                    // @remove-on-eject-end
                    plugins:paths.plugin
                },
            }],
            threadPool:happyThreadPool,
            verbose:true
        }),
        new HappyPack({
            id:"tsx",
            loaders: [{
                loader: "babel-loader",
                options: {
                    compact:true,
                    // @remove-on-eject-begin
                    babelrc: false,
                    presets: ["env","stage-3","react-app"],
                    // @remove-on-eject-end
                    plugins:paths.plugin,
                    cacheDirectory:true
                },
            },{
                loader: "ts-loader",
                options: {
                    transpileOnly: true,
                    configFile: paths.appTsConfig,
                    happyPackMode:true
                },
            }],
            threadPool:happyThreadPool,
            verbose:true
        }),
        new CleanPlugin(),
        new HtmlWebpackPlugin({
            title: paths.webName,
            inject: true,
            template: paths.appHtml,
            chunks:webpackConfig.chunks,
            chunksSortMode:function(a,b) {
                let index={"polyfill":1,"react":2,"axios":3,"bundle":4,"index":5},
                    aI=index[a],
                    bI=index[b];
                return aI&&bI?aI-bI:-1;
            }
        }),
        new InterpolateHtmlPlugin(HtmlWebpackPlugin,env.raw),
        new webpack.DefinePlugin(env.stringified),
        // Minify the code.
        new ExtractTextPlugin({
            filename: cssFilename,
        }),
        new ManifestPlugin({
            fileName: `${assertDir}/asset-manifest.json`,
        }),
        new SWPrecacheWebpackPlugin({
            dontCacheBustUrlsMatching: /\.\w{8}\./,
            filename: `${assertDir}/service-worker.js`,
            logger(message) {
                if (message.indexOf('Total precache size is') === 0) {
                    return;
                }
                if (message.indexOf('Skipping static resource') === 0) {
                    return;
                }
                console.log(message);
            },
            minify: true,
            navigateFallback: publicUrl + '/index.html',
            navigateFallbackWhitelist: [/^(?!\/__).*/],
            staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
};
