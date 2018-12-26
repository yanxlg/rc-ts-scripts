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
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const dirUtil = require("./dirUtil");
const CleanPlugin = require('./clean-css');
const importJson =  require('./sass-import-json');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const HappyPack = require("happypack");
const os =require("os");
const happyThreadPool = HappyPack.ThreadPool({size:os.cpus().length});


const projectConfig=require(paths.appPackageJson);
const proj_name=projectConfig.name;

const assertDir=dirUtil(proj_name);



const publicPath = '/';
const publicUrl = '/'+assertDir;
const env = getClientEnvironment(publicUrl);

module.exports = {
    name:"browser",
    mode:"development",
    devtool: 'cheap-module-source-map',
    entry: {
        "polyfill":["babel-polyfill",require.resolve('./polyfills')],
        'react':["react",'react-dom'],
        'axios':['axios'],
        "bundle":[
            require.resolve('react-dev-utils/webpackHotDevClient'),
            paths.appIndexJs
        ]
    },
    output: {
        pathinfo: true,
        filename: `${assertDir}/business/[name]_[hash:8].js`,
        chunkFilename: `${assertDir}/business/[name].chunk.js`,
        publicPath: publicPath,// 使用相对路径
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    optimization:{
        minimize:false,
        namedModules:true,
        namedChunks:true,
        splitChunks: {
            chunks: 'all',
            minChunks: Infinity,
            cacheGroups: {
                react: {
                    name:"react",
                    minChunks:Infinity,
                    minSize:100,
                    priority: 10
                },
                axios: {
                    name:"axios",
                    minChunks:Infinity,
                    minSize:100,
                    priority: 9
                },
                polyfill: {
                    name:"polyfill",
                    minChunks:Infinity,
                    minSize:100,
                    priority: 8
                },
            }
        }
    },
    resolve: {
        modules: ['node_modules', paths.appNodeModules].concat(
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
            new ModuleScopePlugin(paths.appSrcDirs, [paths.appPackageJson]),
            new TsconfigPathsPlugin({ configFile: paths.appTsConfig }),
        ],
    },
    module: {
        strictExportPresence: true,
        rules: [
              {
                  test: /\.(js|jsx|mjs)$/,
                  enforce: 'pre',
                  loader: require.resolve('source-map-loader'),
                  include: paths.appSrcDirs,// allow outside of src/
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
              /*      {
                        test: /\.(js|jsx|mjs)$/,
                        loader: require.resolve('babel-loader'),
                        options: {
                            // @remove-on-eject-begin
                            babelrc: false,
                            presets: ["env","stage-3","react-app"],
                            // @remove-on-eject-end
                            plugins:paths.plugin
                        },
                    },*/
                    {
                        test: /\.(ts|tsx)$/,
                        use:"happypack/loader?id=tsx",
                    },
          /*          {
                        test: /\.(ts|tsx)$/,
                        use: [{
                            loader: require.resolve('babel-loader'),
                            options: {
                                // @remove-on-eject-begin
                                babelrc: false,
                                presets: ["env","stage-3","react-app"],
                                // @remove-on-eject-end
                                plugins:paths.plugin
                            },
                        },{
                                loader: require.resolve('ts-loader'),
                                options: {
                                    transpileOnly: true,
                                    configFile: paths.appTsConfig
                                },
                            }
                        ],
                    },*/
                    {
                        test: /\.css$/,
                        use: [
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    ident: 'postcss',
                                    sourceMap: true,
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
                    {
                        test: /\.scss$/,
                        use: [
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    ident: 'postcss',
                                    sourceMap: true,
                                    plugins: () => [
                                        require('postcss-flexbugs-fixes'),
                                        autoprefixer({
                                            browsers: [
                                                '>1%',
                                                'last 4 versions',
                                                'Firefox ESR',
                                                'not ie < 9',
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
                                loader:"happypack/loader?id=sass",
                            },
                         /*   {
                                loader: 'sass-loader',
                                options: {
                                    importer: [importJson],
                                    data: '$rootPath: "./src";',
                                    sourceMap:true
                                },
                            },*/
                        ],
                    },
                    {
                        test: /\.less$/,
                        use:[
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    sourceMap: true,
                                    ident: 'postcss',
                                    plugins: () => [
                                        require('postcss-flexbugs-fixes'),
                                        autoprefixer({
                                            browsers: [
                                                '>1%',
                                                'last 4 versions',
                                                'Firefox ESR',
                                                'not ie < 9',
                                            ],
                                            flexbox: 'no-2009',
                                        }),
                                    ],
                                },
                            },
                            {
                                loader:"happypack/loader?id=less",
                            }
                            // require.resolve('less-loader'),
                        ],
                    },
                    {
                        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                        loader: require.resolve('file-loader'),
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
        new HappyPack({
            id:"less",
            loaders: [{
                loader: require.resolve('less-loader'),
                options: { javascriptEnabled: true }
            }],
            threadPool:happyThreadPool,
            verbose:true
        }),
        new HappyPack({
            id:"sass",
            loaders: [{
                loader: require.resolve('sass-loader'),
                options: {
                    importer: [importJson],
                    data: '$rootPath: "./src";',
                    sourceMap:true,
                    javascriptEnabled: true
                }
            }],
            threadPool:happyThreadPool,
            verbose:true
        }),
  /*      new webpack.optimize.CommonsChunkPlugin({
            names:["react","axios","polyfill"],
            filename:`${assertDir}/bundle/[name].[hash:8].js`,
            minChunks: Infinity
        }),*/
        new CopyWebpackPlugin([{
            from:paths.appPublic,
            to:path.join(assertDir),
        }], {
            ignore: [ '*index.html']
        }),
        new CleanPlugin(),
        new HtmlWebpackPlugin({
            title: paths.webName,
            inject: true,
            template: paths.appHtml,
            chunks:["bundle","polyfill","react","axios"],
            chunksSortMode:function(a,b) {
                let index={"polyfill":1,"react":2,"axios":3,"bundle":4},
                    aI=index[a],
                    bI=index[b];
                return aI&&bI?aI-bI:-1;
            }
        }),
        new InterpolateHtmlPlugin(HtmlWebpackPlugin,env.raw),
        new webpack.DefinePlugin(env.stringified),
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin(),
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      /*  new ForkTsCheckerWebpackPlugin({
            async: true,
            watch: paths.appSrc,
            tsconfig: paths.appTsConfig,
            tslint: paths.appTsLint,
        }),*/
    ],
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    performance: {
        hints: false,
    },
};
