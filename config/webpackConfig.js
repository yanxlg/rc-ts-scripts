/**
 * @disc:$DESC$
 * @type:$TYPE$
 * @dependence:$DEPENDENCE$
 * @author:yanxinaliang
 * @time：2019/1/3 13:24
 */
const paths = require('./paths');
const packageJson = require(paths.appPackageJson)||{};

const reactProj = packageJson.dependencies&&packageJson.dependencies.hasOwnProperty("react");
const axiosProj = packageJson.dependencies&&packageJson.dependencies.hasOwnProperty("axios");

let entry,cacheGroups,chunks=[];
if(reactProj){
    entry={
        "polyfill":["babel-polyfill"],
        'react':["react",'react-dom'],
        "bundle":[
            process.env.NODE_ENV === 'production'?null:require.resolve('react-dev-utils/webpackHotDevClient'),
            paths.appIndexJs
        ].filter(Boolean)
    };
    cacheGroups={
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
    };
    chunks=["bundle","polyfill","react"];
    if(axiosProj){
        entry.axios=["axios"];
        cacheGroups.axios={
            name:"axios",
            minChunks:Infinity,
            minSize:100,
            priority: 9
        };
        chunks.push("axios");
    }
}else{
    cacheGroups=false;
    entry={
        index:["babel-polyfill",paths.appIndexJs,require.resolve('react-dev-utils/webpackHotDevClient')]
    };// 普通项目
    chunks=["index"];
}


let assertDir="static_"+packageJson.name;

module.exports.entry=entry;
module.exports.cacheGroups=cacheGroups;
module.exports.chunks=chunks;
module.exports.assertDir=assertDir;