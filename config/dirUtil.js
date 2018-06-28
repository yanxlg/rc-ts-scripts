/**
 * @disc:$DESC$
 * @type:$TYPE$
 * @dependence:$DEPENDENCE$
 * @author:yanxinaliang
 * @time：2018/6/28 16:34
 */
module.exports = function(packageName){
    let hash = 0;
    if (packageName.length === 0) return hash;
    for (let i = 0; i < packageName.length; i++) {
        const char = packageName.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const hashString=hash.toString();
    if(hashString.indexOf("-")===0||hashString.indexOf("_")===0){
        return "static_"+hashString.substr(1);
    }else{
        return "static_"+hashString;
    }
};