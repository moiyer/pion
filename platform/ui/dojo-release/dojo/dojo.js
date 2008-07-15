/*
	Copyright (c) 2004-2008, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/book/dojo-book-0-9/introduction/licensing
*/

/*
	This is a compiled version of Dojo, built for deployment and not for
	development. To get an editable version, please visit:

		http://dojotoolkit.org

	for documentation and information on getting the source.
*/

(function(){
var _1=null;
if((_1||(typeof djConfig!="undefined"&&djConfig.scopeMap))&&(typeof window!="undefined")){
var _2="",_3="",_4="",_5={},_6={};
_1=_1||djConfig.scopeMap;
for(var i=0;i<_1.length;i++){
var _8=_1[i];
_2+="var "+_8[0]+" = {}; "+_8[1]+" = "+_8[0]+";"+_8[1]+"._scopeName = '"+_8[1]+"';";
_3+=(i==0?"":",")+_8[0];
_4+=(i==0?"":",")+_8[1];
_5[_8[0]]=_8[1];
_6[_8[1]]=_8[0];
}
eval(_2+"dojo._scopeArgs = ["+_4+"];");
dojo._scopePrefixArgs=_3;
dojo._scopePrefix="(function("+_3+"){";
dojo._scopeSuffix="})("+_4+")";
dojo._scopeMap=_5;
dojo._scopeMapRev=_6;
}
(function(){
if(!this["console"]){
this.console={log:function(){
}};
}
var cn=["assert","count","debug","dir","dirxml","error","group","groupEnd","info","profile","profileEnd","time","timeEnd","trace","warn","log"];
var i=0,tn;
while((tn=cn[i++])){
if(!console[tn]){
(function(){
var _c=tn+"";
console[_c]=function(){
var a=Array.apply({},arguments);
a.unshift(_c+":");
console.log(a.join(" "));
};
})();
}
}
if(typeof dojo=="undefined"){
this.dojo={_scopeName:"dojo",_scopePrefix:"",_scopePrefixArgs:"",_scopeSuffix:"",_scopeMap:{},_scopeMapRev:{}};
}
var d=dojo;
if(typeof dijit=="undefined"){
this.dijit={_scopeName:"dijit"};
}
if(typeof dojox=="undefined"){
this.dojox={_scopeName:"dojox"};
}
if(!d._scopeArgs){
d._scopeArgs=[dojo,dijit,dojox];
}
d.global=this;
d.config={isDebug:false,debugAtAllCosts:false};
if(typeof djConfig!="undefined"){
for(var _f in djConfig){
d.config[_f]=djConfig[_f];
}
}
var _10=["Browser","Rhino","Spidermonkey","Mobile"];
var t;
while((t=_10.shift())){
d["is"+t]=false;
}
dojo.locale=d.config.locale;
var rev="$Rev: 13707 $".match(/\d+/);
dojo.version={major:0,minor:0,patch:0,flag:"dev",revision:rev?+rev[0]:999999,toString:function(){
with(d.version){
return major+"."+minor+"."+patch+flag+" ("+revision+")";
}
}};
if(typeof OpenAjax!="undefined"){
OpenAjax.hub.registerLibrary(dojo._scopeName,"http://dojotoolkit.org",d.version.toString());
}
dojo._mixin=function(obj,_14){
var _15={};
for(var x in _14){
if(_15[x]===undefined||_15[x]!=_14[x]){
obj[x]=_14[x];
}
}
if(d["isIE"]&&_14){
var p=_14.toString;
if(typeof p=="function"&&p!=obj.toString&&p!=_15.toString&&p!="\nfunction toString() {\n    [native code]\n}\n"){
obj.toString=_14.toString;
}
}
return obj;
};
dojo.mixin=function(obj,_19){
for(var i=1,l=arguments.length;i<l;i++){
d._mixin(obj,arguments[i]);
}
return obj;
};
dojo._getProp=function(_1c,_1d,_1e){
var obj=_1e||d.global;
for(var i=0,p;obj&&(p=_1c[i]);i++){
if(i==0&&this._scopeMap[p]){
p=this._scopeMap[p];
}
obj=(p in obj?obj[p]:(_1d?obj[p]={}:undefined));
}
return obj;
};
dojo.setObject=function(_22,_23,_24){
var _25=_22.split("."),p=_25.pop(),obj=d._getProp(_25,true,_24);
return obj&&p?(obj[p]=_23):undefined;
};
dojo.getObject=function(_28,_29,_2a){
return d._getProp(_28.split("."),_29,_2a);
};
dojo.exists=function(_2b,obj){
return !!d.getObject(_2b,false,obj);
};
dojo["eval"]=function(_2d){
return d.global.eval?d.global.eval(_2d):eval(_2d);
};
d.deprecated=d.experimental=function(){
};
})();
(function(){
var d=dojo;
d.mixin(d,{_loadedModules:{},_inFlightCount:0,_hasResource:{},_modulePrefixes:{dojo:{name:"dojo",value:"."},doh:{name:"doh",value:"../util/doh"},tests:{name:"tests",value:"tests"}},_moduleHasPrefix:function(_2f){
var mp=this._modulePrefixes;
return !!(mp[_2f]&&mp[_2f].value);
},_getModulePrefix:function(_31){
var mp=this._modulePrefixes;
if(this._moduleHasPrefix(_31)){
return mp[_31].value;
}
return _31;
},_loadedUrls:[],_postLoad:false,_loaders:[],_unloaders:[],_loadNotifying:false});
dojo._loadPath=function(_33,_34,cb){
var uri=((_33.charAt(0)=="/"||_33.match(/^\w+:/))?"":this.baseUrl)+_33;
try{
return !_34?this._loadUri(uri,cb):this._loadUriAndCheck(uri,_34,cb);
}
catch(e){
console.error(e);
return false;
}
};
dojo._loadUri=function(uri,cb){
if(this._loadedUrls[uri]){
return true;
}
var _39=this._getText(uri,true);
if(!_39){
return false;
}
this._loadedUrls[uri]=true;
this._loadedUrls.push(uri);
if(cb){
_39="("+_39+")";
}else{
_39=this._scopePrefix+_39+this._scopeSuffix;
}
if(d.isMoz){
_39+="\r\n//@ sourceURL="+uri;
}
var _3a=d["eval"](_39);
if(cb){
cb(_3a);
}
return true;
};
dojo._loadUriAndCheck=function(uri,_3c,cb){
var ok=false;
try{
ok=this._loadUri(uri,cb);
}
catch(e){
console.error("failed loading "+uri+" with error: "+e);
}
return !!(ok&&this._loadedModules[_3c]);
};
dojo.loaded=function(){
this._loadNotifying=true;
this._postLoad=true;
var mll=d._loaders;
this._loaders=[];
for(var x=0;x<mll.length;x++){
try{
mll[x]();
}
catch(e){
throw e;
console.error("dojo.addOnLoad callback failed: "+e,e);
}
}
this._loadNotifying=false;
if(d._postLoad&&d._inFlightCount==0&&mll.length){
d._callLoaded();
}
};
dojo.unloaded=function(){
var mll=this._unloaders;
while(mll.length){
(mll.pop())();
}
};
var _42=function(arr,obj,fn){
if(!fn){
arr.push(obj);
}else{
if(fn){
var _46=(typeof fn=="string")?obj[fn]:fn;
arr.push(function(){
_46.call(obj);
});
}
}
};
dojo.addOnLoad=function(obj,_48){
_42(d._loaders,obj,_48);
if(d._postLoad&&d._inFlightCount==0&&!d._loadNotifying){
d._callLoaded();
}
};
dojo.addOnUnload=function(obj,_4a){
_42(d._unloaders,obj,_4a);
};
dojo._modulesLoaded=function(){
if(d._postLoad){
return;
}
if(d._inFlightCount>0){
console.warn("files still in flight!");
return;
}
d._callLoaded();
};
dojo._callLoaded=function(){
if(typeof setTimeout=="object"||(dojo.config.useXDomain&&d.isOpera)){
if(dojo.isAIR){
setTimeout(function(){
dojo.loaded();
},0);
}else{
setTimeout(dojo._scopeName+".loaded();",0);
}
}else{
d.loaded();
}
};
dojo._getModuleSymbols=function(_4b){
var _4c=_4b.split(".");
for(var i=_4c.length;i>0;i--){
var _4e=_4c.slice(0,i).join(".");
if((i==1)&&!this._moduleHasPrefix(_4e)){
_4c[0]="../"+_4c[0];
}else{
var _4f=this._getModulePrefix(_4e);
if(_4f!=_4e){
_4c.splice(0,i,_4f);
break;
}
}
}
return _4c;
};
dojo._global_omit_module_check=false;
dojo._loadModule=dojo.require=function(_50,_51){
_51=this._global_omit_module_check||_51;
var _52=this._loadedModules[_50];
if(_52){
return _52;
}
var _53=this._getModuleSymbols(_50).join("/")+".js";
var _54=(!_51)?_50:null;
var ok=this._loadPath(_53,_54);
if(!ok&&!_51){
throw new Error("Could not load '"+_50+"'; last tried '"+_53+"'");
}
if(!_51&&!this._isXDomain){
_52=this._loadedModules[_50];
if(!_52){
throw new Error("symbol '"+_50+"' is not defined after loading '"+_53+"'");
}
}
return _52;
};
dojo.provide=function(_56){
_56=_56+"";
return (d._loadedModules[_56]=d.getObject(_56,true));
};
dojo.platformRequire=function(_57){
var _58=_57.common||[];
var _59=_58.concat(_57[d._name]||_57["default"]||[]);
for(var x=0;x<_59.length;x++){
var _5b=_59[x];
if(_5b.constructor==Array){
d._loadModule.apply(d,_5b);
}else{
d._loadModule(_5b);
}
}
};
dojo.requireIf=function(_5c,_5d){
if(_5c===true){
var _5e=[];
for(var i=1;i<arguments.length;i++){
_5e.push(arguments[i]);
}
d.require.apply(d,_5e);
}
};
dojo.requireAfterIf=d.requireIf;
dojo.registerModulePath=function(_60,_61){
d._modulePrefixes[_60]={name:_60,value:_61};
};
dojo.requireLocalization=function(_62,_63,_64,_65){
d.require("dojo.i18n");
d.i18n._requireLocalization.apply(d.hostenv,arguments);
};
var ore=new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$");
var ire=new RegExp("^((([^:]+:)?([^@]+))@)?([^:]*)(:([0-9]+))?$");
dojo._Url=function(){
var n=null;
var _a=arguments;
var uri=[_a[0]];
for(var i=1;i<_a.length;i++){
if(!_a[i]){
continue;
}
var _6c=new d._Url(_a[i]+"");
var _6d=new d._Url(uri[0]+"");
if(_6c.path==""&&!_6c.scheme&&!_6c.authority&&!_6c.query){
if(_6c.fragment!=n){
_6d.fragment=_6c.fragment;
}
_6c=_6d;
}else{
if(!_6c.scheme){
_6c.scheme=_6d.scheme;
if(!_6c.authority){
_6c.authority=_6d.authority;
if(_6c.path.charAt(0)!="/"){
var _6e=_6d.path.substring(0,_6d.path.lastIndexOf("/")+1)+_6c.path;
var _6f=_6e.split("/");
for(var j=0;j<_6f.length;j++){
if(_6f[j]=="."){
if(j==_6f.length-1){
_6f[j]="";
}else{
_6f.splice(j,1);
j--;
}
}else{
if(j>0&&!(j==1&&_6f[0]=="")&&_6f[j]==".."&&_6f[j-1]!=".."){
if(j==(_6f.length-1)){
_6f.splice(j,1);
_6f[j-1]="";
}else{
_6f.splice(j-1,2);
j-=2;
}
}
}
}
_6c.path=_6f.join("/");
}
}
}
}
uri=[];
if(_6c.scheme){
uri.push(_6c.scheme,":");
}
if(_6c.authority){
uri.push("//",_6c.authority);
}
uri.push(_6c.path);
if(_6c.query){
uri.push("?",_6c.query);
}
if(_6c.fragment){
uri.push("#",_6c.fragment);
}
}
this.uri=uri.join("");
var r=this.uri.match(ore);
this.scheme=r[2]||(r[1]?"":n);
this.authority=r[4]||(r[3]?"":n);
this.path=r[5];
this.query=r[7]||(r[6]?"":n);
this.fragment=r[9]||(r[8]?"":n);
if(this.authority!=n){
r=this.authority.match(ire);
this.user=r[3]||n;
this.password=r[4]||n;
this.host=r[5];
this.port=r[7]||n;
}
};
dojo._Url.prototype.toString=function(){
return this.uri;
};
dojo.moduleUrl=function(_72,url){
var loc=d._getModuleSymbols(_72).join("/");
if(!loc){
return null;
}
if(loc.lastIndexOf("/")!=loc.length-1){
loc+="/";
}
var _75=loc.indexOf(":");
if(loc.charAt(0)!="/"&&(_75==-1||_75>loc.indexOf("/"))){
loc=d.baseUrl+loc;
}
return new d._Url(loc,url);
};
})();
if(typeof window!="undefined"){
dojo.isBrowser=true;
dojo._name="browser";
(function(){
var d=dojo;
if(document&&document.getElementsByTagName){
var _77=document.getElementsByTagName("script");
var _78=/dojo(\.xd)?\.js(\W|$)/i;
for(var i=0;i<_77.length;i++){
var src=_77[i].getAttribute("src");
if(!src){
continue;
}
var m=src.match(_78);
if(m){
if(!d.config.baseUrl){
d.config.baseUrl=src.substring(0,m.index);
}
var cfg=_77[i].getAttribute("djConfig");
if(cfg){
var _7d=eval("({ "+cfg+" })");
for(var x in _7d){
dojo.config[x]=_7d[x];
}
}
break;
}
}
}
d.baseUrl=d.config.baseUrl;
var n=navigator;
var dua=n.userAgent;
var dav=n.appVersion;
var tv=parseFloat(dav);
d.isOpera=(dua.indexOf("Opera")>=0)?tv:0;
var idx=Math.max(dav.indexOf("WebKit"),dav.indexOf("Safari"),0);
if(idx){
d.isSafari=parseFloat(dav.split("Version/")[1])||((parseFloat(dav.substr(idx+7))>=419.3)?3:2)||2;
}
d.isAIR=(dua.indexOf("AdobeAIR")>=0)?1:0;
d.isKhtml=(dav.indexOf("Konqueror")>=0||d.isSafari)?tv:0;
d.isMozilla=d.isMoz=(dua.indexOf("Gecko")>=0&&!d.isKhtml)?tv:0;
d.isFF=d.isIE=0;
if(d.isMoz){
d.isFF=parseFloat(dua.split("Firefox/")[1])||0;
}
if(document.all&&!d.isOpera){
d.isIE=parseFloat(dav.split("MSIE ")[1])||0;
}
if(dojo.isIE&&window.location.protocol==="file:"){
dojo.config.ieForceActiveXXhr=true;
}
var cm=document.compatMode;
d.isQuirks=cm=="BackCompat"||cm=="QuirksMode"||d.isIE<6;
d.locale=dojo.config.locale||(d.isIE?n.userLanguage:n.language).toLowerCase();
d._XMLHTTP_PROGIDS=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"];
d._xhrObj=function(){
var _85=null;
var _86=null;
if(!dojo.isIE||!dojo.config.ieForceActiveXXhr){
try{
_85=new XMLHttpRequest();
}
catch(e){
}
}
if(!_85){
for(var i=0;i<3;++i){
var _88=d._XMLHTTP_PROGIDS[i];
try{
_85=new ActiveXObject(_88);
}
catch(e){
_86=e;
}
if(_85){
d._XMLHTTP_PROGIDS=[_88];
break;
}
}
}
if(!_85){
throw new Error("XMLHTTP not available: "+_86);
}
return _85;
};
d._isDocumentOk=function(_89){
var _8a=_89.status||0;
return (_8a>=200&&_8a<300)||_8a==304||_8a==1223||(!_8a&&(location.protocol=="file:"||location.protocol=="chrome:"));
};
var _8b=window.location+"";
var _8c=document.getElementsByTagName("base");
var _8d=(_8c&&_8c.length>0);
d._getText=function(uri,_8f){
var _90=this._xhrObj();
if(!_8d&&dojo._Url){
uri=(new dojo._Url(_8b,uri)).toString();
}
if(d.config.cacheBust){
uri+=(uri.indexOf("?")==-1?"?":"&")+String(d.config.cacheBust).replace(/\W+/g,"");
}
_90.open("GET",uri,false);
try{
_90.send(null);
if(!d._isDocumentOk(_90)){
var err=Error("Unable to load "+uri+" status:"+_90.status);
err.status=_90.status;
err.responseText=_90.responseText;
throw err;
}
}
catch(e){
if(_8f){
return null;
}
throw e;
}
return _90.responseText;
};
})();
dojo._initFired=false;
dojo._loadInit=function(e){
dojo._initFired=true;
var _93=(e&&e.type)?e.type.toLowerCase():"load";
if(arguments.callee.initialized||(_93!="domcontentloaded"&&_93!="load")){
return;
}
arguments.callee.initialized=true;
if("_khtmlTimer" in dojo){
clearInterval(dojo._khtmlTimer);
delete dojo._khtmlTimer;
}
if(dojo._inFlightCount==0){
dojo._modulesLoaded();
}
};
dojo._fakeLoadInit=function(){
dojo._loadInit({type:"load"});
};
if(!dojo.config.afterOnLoad){
if(document.addEventListener){
if(dojo.isOpera||dojo.isFF>=3||(dojo.isMoz&&dojo.config.enableMozDomContentLoaded===true)){
document.addEventListener("DOMContentLoaded",dojo._loadInit,null);
}
window.addEventListener("load",dojo._loadInit,null);
}
if(dojo.isAIR){
window.addEventListener("load",dojo._loadInit,null);
}else{
if(/(WebKit|khtml)/i.test(navigator.userAgent)){
dojo._khtmlTimer=setInterval(function(){
if(/loaded|complete/.test(document.readyState)){
dojo._loadInit();
}
},10);
}
}
}
(function(){
var _w=window;
var _95=function(_96,fp){
var _98=_w[_96]||function(){
};
_w[_96]=function(){
fp.apply(_w,arguments);
_98.apply(_w,arguments);
};
};
if(dojo.isIE){
if(!dojo.config.afterOnLoad){
document.write("<scr"+"ipt defer src=\"//:\" "+"onreadystatechange=\"if(this.readyState=='complete'){"+dojo._scopeName+"._loadInit();}\">"+"</scr"+"ipt>");
}
var _99=true;
_95("onbeforeunload",function(){
_w.setTimeout(function(){
_99=false;
},0);
});
_95("onunload",function(){
if(_99){
dojo.unloaded();
}
});
try{
document.namespaces.add("v","urn:schemas-microsoft-com:vml");
document.createStyleSheet().addRule("v\\:*","behavior:url(#default#VML)");
}
catch(e){
}
}else{
_95("onbeforeunload",function(){
dojo.unloaded();
});
}
})();
}
(function(){
var mp=dojo.config["modulePaths"];
if(mp){
for(var _9b in mp){
dojo.registerModulePath(_9b,mp[_9b]);
}
}
})();
if(dojo.config.isDebug){
dojo.require("dojo._firebug.firebug");
}
if(dojo.config.debugAtAllCosts){
dojo.config.useXDomain=true;
dojo.require("dojo._base._loader.loader_xd");
dojo.require("dojo._base._loader.loader_debug");
dojo.require("dojo.i18n");
}
if(!dojo._hasResource["dojo._base.lang"]){
dojo._hasResource["dojo._base.lang"]=true;
dojo.provide("dojo._base.lang");
dojo.isString=function(it){
return !!arguments.length&&it!=null&&(typeof it=="string"||it instanceof String);
};
dojo.isArray=function(it){
return it&&(it instanceof Array||typeof it=="array");
};
dojo.isFunction=(function(){
var _9e=function(it){
return it&&(typeof it=="function"||it instanceof Function);
};
return dojo.isSafari?function(it){
if(typeof it=="function"&&it=="[object NodeList]"){
return false;
}
return _9e(it);
}:_9e;
})();
dojo.isObject=function(it){
return it!==undefined&&(it===null||typeof it=="object"||dojo.isArray(it)||dojo.isFunction(it));
};
dojo.isArrayLike=function(it){
var d=dojo;
return it&&it!==undefined&&!d.isString(it)&&!d.isFunction(it)&&!(it.tagName&&it.tagName.toLowerCase()=="form")&&(d.isArray(it)||isFinite(it.length));
};
dojo.isAlien=function(it){
return it&&!dojo.isFunction(it)&&/\{\s*\[native code\]\s*\}/.test(String(it));
};
dojo.extend=function(_a5,_a6){
for(var i=1,l=arguments.length;i<l;i++){
dojo._mixin(_a5.prototype,arguments[i]);
}
return _a5;
};
dojo._hitchArgs=function(_a9,_aa){
var pre=dojo._toArray(arguments,2);
var _ac=dojo.isString(_aa);
return function(){
var _ad=dojo._toArray(arguments);
var f=_ac?(_a9||dojo.global)[_aa]:_aa;
return f&&f.apply(_a9||this,pre.concat(_ad));
};
};
dojo.hitch=function(_af,_b0){
if(arguments.length>2){
return dojo._hitchArgs.apply(dojo,arguments);
}
if(!_b0){
_b0=_af;
_af=null;
}
if(dojo.isString(_b0)){
_af=_af||dojo.global;
if(!_af[_b0]){
throw (["dojo.hitch: scope[\"",_b0,"\"] is null (scope=\"",_af,"\")"].join(""));
}
return function(){
return _af[_b0].apply(_af,arguments||[]);
};
}
return !_af?_b0:function(){
return _b0.apply(_af,arguments||[]);
};
};
dojo.delegate=dojo._delegate=function(obj,_b2){
function TMP(){
};
TMP.prototype=obj;
var tmp=new TMP();
if(_b2){
dojo.mixin(tmp,_b2);
}
return tmp;
};
dojo.partial=function(_b4){
var arr=[null];
return dojo.hitch.apply(dojo,arr.concat(dojo._toArray(arguments)));
};
dojo._toArray=function(obj,_b7,_b8){
var arr=_b8||[];
for(var x=_b7||0;x<obj.length;x++){
arr.push(obj[x]);
}
return arr;
};
dojo.clone=function(o){
if(!o){
return o;
}
if(dojo.isArray(o)){
var r=[];
for(var i=0;i<o.length;++i){
r.push(dojo.clone(o[i]));
}
return r;
}
if(!dojo.isObject(o)){
return o;
}
if(o.nodeType&&o.cloneNode){
return o.cloneNode(true);
}
if(o instanceof Date){
return new Date(o.getTime());
}
var r=new o.constructor();
for(var i in o){
if(!(i in r)||r[i]!=o[i]){
r[i]=dojo.clone(o[i]);
}
}
return r;
};
dojo.trim=function(str){
return str.replace(/^\s\s*/,"").replace(/\s\s*$/,"");
};
}
if(!dojo._hasResource["dojo._base.declare"]){
dojo._hasResource["dojo._base.declare"]=true;
dojo.provide("dojo._base.declare");
dojo.declare=function(_bf,_c0,_c1){
var dd=arguments.callee,_c3;
if(dojo.isArray(_c0)){
_c3=_c0;
_c0=_c3.shift();
}
if(_c3){
dojo.forEach(_c3,function(m){
if(!m){
throw (_bf+": mixin #"+i+" is null");
}
_c0=dd._delegate(_c0,m);
});
}
var _c5=(_c1||0).constructor,_c6=dd._delegate(_c0),fn;
for(var i in _c1){
if(dojo.isFunction(fn=_c1[i])&&!0[i]){
fn.nom=i;
}
}
dojo.extend(_c6,{declaredClass:_bf,_constructor:_c5,preamble:null},_c1||0);
_c6.prototype.constructor=_c6;
return dojo.setObject(_bf,_c6);
};
dojo.mixin(dojo.declare,{_delegate:function(_c9,_ca){
var bp=(_c9||0).prototype,mp=(_ca||0).prototype;
var _cd=dojo.declare._makeCtor();
dojo.mixin(_cd,{superclass:bp,mixin:mp,extend:dojo.declare._extend});
if(_c9){
_cd.prototype=dojo._delegate(bp);
}
dojo.extend(_cd,dojo.declare._core,mp||0,{_constructor:null,preamble:null});
_cd.prototype.constructor=_cd;
_cd.prototype.declaredClass=(bp||0).declaredClass+"_"+(mp||0).declaredClass;
return _cd;
},_extend:function(_ce){
for(var i in _ce){
if(dojo.isFunction(fn=_ce[i])&&!0[i]){
fn.nom=i;
}
}
dojo.extend(this,_ce);
},_makeCtor:function(){
return function(){
this._construct(arguments);
};
},_core:{_construct:function(_d0){
var c=_d0.callee,s=c.superclass,ct=s&&s.constructor,m=c.mixin,mct=m&&m.constructor,a=_d0,ii,fn;
if(a[0]){
if(((fn=a[0].preamble))){
a=fn.apply(this,a)||a;
}
}
if((fn=c.prototype.preamble)){
a=fn.apply(this,a)||a;
}
if(ct&&ct.apply){
ct.apply(this,a);
}
if(mct&&mct.apply){
mct.apply(this,a);
}
if((ii=c.prototype._constructor)){
ii.apply(this,_d0);
}
if(this.constructor.prototype==c.prototype&&(ct=this.postscript)){
ct.apply(this,_d0);
}
},_findMixin:function(_d9){
var c=this.constructor,p,m;
while(c){
p=c.superclass;
m=c.mixin;
if(m==_d9||(m instanceof _d9.constructor)){
return p;
}
if(m&&(m=m._findMixin(_d9))){
return m;
}
c=p&&p.constructor;
}
},_findMethod:function(_dd,_de,_df,has){
var p=_df,c,m,f;
do{
c=p.constructor;
m=c.mixin;
if(m&&(m=this._findMethod(_dd,_de,m,has))){
return m;
}
if((f=p[_dd])&&(has==(f==_de))){
return p;
}
p=c.superclass;
}while(p);
return !has&&(p=this._findMixin(_df))&&this._findMethod(_dd,_de,p,has);
},inherited:function(_e5,_e6,_e7){
var a=arguments;
if(!dojo.isString(a[0])){
_e7=_e6;
_e6=_e5;
_e5=_e6.callee.nom;
}
a=_e7||_e6;
var c=_e6.callee,p=this.constructor.prototype,fn,mp;
if(this[_e5]!=c||p[_e5]==c){
mp=this._findMethod(_e5,c,p,true);
if(!mp){
throw (this.declaredClass+": inherited method \""+_e5+"\" mismatch");
}
p=this._findMethod(_e5,c,mp,false);
}
fn=p&&p[_e5];
if(!fn){
throw (mp.declaredClass+": inherited method \""+_e5+"\" not found");
}
return fn.apply(this,a);
}}});
}
if(!dojo._hasResource["dojo._base.connect"]){
dojo._hasResource["dojo._base.connect"]=true;
dojo.provide("dojo._base.connect");
dojo._listener={getDispatcher:function(){
return function(){
var ap=Array.prototype,c=arguments.callee,ls=c._listeners,t=c.target;
var r=t&&t.apply(this,arguments);
for(var i in ls){
if(!(i in ap)){
ls[i].apply(this,arguments);
}
}
return r;
};
},add:function(_f3,_f4,_f5){
_f3=_f3||dojo.global;
var f=_f3[_f4];
if(!f||!f._listeners){
var d=dojo._listener.getDispatcher();
d.target=f;
d._listeners=[];
f=_f3[_f4]=d;
}
return f._listeners.push(_f5);
},remove:function(_f8,_f9,_fa){
var f=(_f8||dojo.global)[_f9];
if(f&&f._listeners&&_fa--){
delete f._listeners[_fa];
}
}};
dojo.connect=function(obj,_fd,_fe,_ff,_100){
var a=arguments,args=[],i=0;
args.push(dojo.isString(a[0])?null:a[i++],a[i++]);
var a1=a[i+1];
args.push(dojo.isString(a1)||dojo.isFunction(a1)?a[i++]:null,a[i++]);
for(var l=a.length;i<l;i++){
args.push(a[i]);
}
return dojo._connect.apply(this,args);
};
dojo._connect=function(obj,_106,_107,_108){
var l=dojo._listener,h=l.add(obj,_106,dojo.hitch(_107,_108));
return [obj,_106,h,l];
};
dojo.disconnect=function(_10b){
if(_10b&&_10b[0]!==undefined){
dojo._disconnect.apply(this,_10b);
delete _10b[0];
}
};
dojo._disconnect=function(obj,_10d,_10e,_10f){
_10f.remove(obj,_10d,_10e);
};
dojo._topics={};
dojo.subscribe=function(_110,_111,_112){
return [_110,dojo._listener.add(dojo._topics,_110,dojo.hitch(_111,_112))];
};
dojo.unsubscribe=function(_113){
if(_113){
dojo._listener.remove(dojo._topics,_113[0],_113[1]);
}
};
dojo.publish=function(_114,args){
var f=dojo._topics[_114];
if(f){
f.apply(this,args||[]);
}
};
dojo.connectPublisher=function(_117,obj,_119){
var pf=function(){
dojo.publish(_117,arguments);
};
return (_119)?dojo.connect(obj,_119,pf):dojo.connect(obj,pf);
};
}
if(!dojo._hasResource["dojo._base.Deferred"]){
dojo._hasResource["dojo._base.Deferred"]=true;
dojo.provide("dojo._base.Deferred");
dojo.Deferred=function(_11b){
this.chain=[];
this.id=this._nextId();
this.fired=-1;
this.paused=0;
this.results=[null,null];
this.canceller=_11b;
this.silentlyCancelled=false;
};
dojo.extend(dojo.Deferred,{_nextId:(function(){
var n=1;
return function(){
return n++;
};
})(),cancel:function(){
var err;
if(this.fired==-1){
if(this.canceller){
err=this.canceller(this);
}else{
this.silentlyCancelled=true;
}
if(this.fired==-1){
if(!(err instanceof Error)){
var res=err;
err=new Error("Deferred Cancelled");
err.dojoType="cancel";
err.cancelResult=res;
}
this.errback(err);
}
}else{
if((this.fired==0)&&(this.results[0] instanceof dojo.Deferred)){
this.results[0].cancel();
}
}
},_resback:function(res){
this.fired=((res instanceof Error)?1:0);
this.results[this.fired]=res;
this._fire();
},_check:function(){
if(this.fired!=-1){
if(!this.silentlyCancelled){
throw new Error("already called!");
}
this.silentlyCancelled=false;
return;
}
},callback:function(res){
this._check();
this._resback(res);
},errback:function(res){
this._check();
if(!(res instanceof Error)){
res=new Error(res);
}
this._resback(res);
},addBoth:function(cb,cbfn){
var _124=dojo.hitch.apply(dojo,arguments);
return this.addCallbacks(_124,_124);
},addCallback:function(cb,cbfn){
return this.addCallbacks(dojo.hitch.apply(dojo,arguments));
},addErrback:function(cb,cbfn){
return this.addCallbacks(null,dojo.hitch.apply(dojo,arguments));
},addCallbacks:function(cb,eb){
this.chain.push([cb,eb]);
if(this.fired>=0){
this._fire();
}
return this;
},_fire:function(){
var _12b=this.chain;
var _12c=this.fired;
var res=this.results[_12c];
var self=this;
var cb=null;
while((_12b.length>0)&&(this.paused==0)){
var f=_12b.shift()[_12c];
if(!f){
continue;
}
try{
res=f(res);
_12c=((res instanceof Error)?1:0);
if(res instanceof dojo.Deferred){
cb=function(res){
self._resback(res);
self.paused--;
if((self.paused==0)&&(self.fired>=0)){
self._fire();
}
};
this.paused++;
}
}
catch(err){
console.debug(err);
_12c=1;
res=err;
}
}
this.fired=_12c;
this.results[_12c]=res;
if((cb)&&(this.paused)){
res.addBoth(cb);
}
}});
}
if(!dojo._hasResource["dojo._base.json"]){
dojo._hasResource["dojo._base.json"]=true;
dojo.provide("dojo._base.json");
dojo.fromJson=function(json){
return eval("("+json+")");
};
dojo._escapeString=function(str){
return ("\""+str.replace(/(["\\])/g,"\\$1")+"\"").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r");
};
dojo.toJsonIndentStr="\t";
dojo.toJson=function(it,_135,_136){
if(it===undefined){
return "undefined";
}
var _137=typeof it;
if(_137=="number"||_137=="boolean"){
return it+"";
}
if(it===null){
return "null";
}
if(dojo.isString(it)){
return dojo._escapeString(it);
}
if(it.nodeType&&it.cloneNode){
return "";
}
var _138=arguments.callee;
var _139;
_136=_136||"";
var _13a=_135?_136+dojo.toJsonIndentStr:"";
if(typeof it.__json__=="function"){
_139=it.__json__();
if(it!==_139){
return _138(_139,_135,_13a);
}
}
if(typeof it.json=="function"){
_139=it.json();
if(it!==_139){
return _138(_139,_135,_13a);
}
}
var sep=_135?" ":"";
var _13c=_135?"\n":"";
if(dojo.isArray(it)){
var res=dojo.map(it,function(obj){
var val=_138(obj,_135,_13a);
if(typeof val!="string"){
val="undefined";
}
return _13c+_13a+val;
});
return "["+res.join(","+sep)+_13c+_136+"]";
}
if(_137=="function"){
return null;
}
var _140=[];
for(var key in it){
var _142;
if(typeof key=="number"){
_142="\""+key+"\"";
}else{
if(typeof key=="string"){
_142=dojo._escapeString(key);
}else{
continue;
}
}
val=_138(it[key],_135,_13a);
if(typeof val!="string"){
continue;
}
_140.push(_13c+_13a+_142+":"+sep+val);
}
return "{"+_140.join(","+sep)+_13c+_136+"}";
};
}
if(!dojo._hasResource["dojo._base.array"]){
dojo._hasResource["dojo._base.array"]=true;
dojo.provide("dojo._base.array");
(function(){
var _143=function(arr,obj,cb){
return [dojo.isString(arr)?arr.split(""):arr,obj||dojo.global,dojo.isString(cb)?new Function("item","index","array",cb):cb];
};
dojo.mixin(dojo,{indexOf:function(_147,_148,_149,_14a){
var step=1,end=_147.length||0,i=0;
if(_14a){
i=end-1;
step=end=-1;
}
if(_149!=undefined){
i=_149;
}
if((_14a&&i>end)||i<end){
for(;i!=end;i+=step){
if(_147[i]==_148){
return i;
}
}
}
return -1;
},lastIndexOf:function(_14d,_14e,_14f){
return dojo.indexOf(_14d,_14e,_14f,true);
},forEach:function(arr,_151,_152){
if(!arr||!arr.length){
return;
}
var _p=_143(arr,_152,_151);
arr=_p[0];
for(var i=0,l=_p[0].length;i<l;i++){
_p[2].call(_p[1],arr[i],i,arr);
}
},_everyOrSome:function(_156,arr,_158,_159){
var _p=_143(arr,_159,_158);
arr=_p[0];
for(var i=0,l=arr.length;i<l;i++){
var _15d=!!_p[2].call(_p[1],arr[i],i,arr);
if(_156^_15d){
return _15d;
}
}
return _156;
},every:function(arr,_15f,_160){
return this._everyOrSome(true,arr,_15f,_160);
},some:function(arr,_162,_163){
return this._everyOrSome(false,arr,_162,_163);
},map:function(arr,_165,_166){
var _p=_143(arr,_166,_165);
arr=_p[0];
var _168=(arguments[3]?(new arguments[3]()):[]);
for(var i=0;i<arr.length;++i){
_168.push(_p[2].call(_p[1],arr[i],i,arr));
}
return _168;
},filter:function(arr,_16b,_16c){
var _p=_143(arr,_16c,_16b);
arr=_p[0];
var _16e=[];
for(var i=0;i<arr.length;i++){
if(_p[2].call(_p[1],arr[i],i,arr)){
_16e.push(arr[i]);
}
}
return _16e;
}});
})();
}
if(!dojo._hasResource["dojo._base.Color"]){
dojo._hasResource["dojo._base.Color"]=true;
dojo.provide("dojo._base.Color");
dojo.Color=function(_170){
if(_170){
this.setColor(_170);
}
};
dojo.Color.named={black:[0,0,0],silver:[192,192,192],gray:[128,128,128],white:[255,255,255],maroon:[128,0,0],red:[255,0,0],purple:[128,0,128],fuchsia:[255,0,255],green:[0,128,0],lime:[0,255,0],olive:[128,128,0],yellow:[255,255,0],navy:[0,0,128],blue:[0,0,255],teal:[0,128,128],aqua:[0,255,255]};
dojo.extend(dojo.Color,{r:255,g:255,b:255,a:1,_set:function(r,g,b,a){
var t=this;
t.r=r;
t.g=g;
t.b=b;
t.a=a;
},setColor:function(_176){
var d=dojo;
if(d.isString(_176)){
d.colorFromString(_176,this);
}else{
if(d.isArray(_176)){
d.colorFromArray(_176,this);
}else{
this._set(_176.r,_176.g,_176.b,_176.a);
if(!(_176 instanceof d.Color)){
this.sanitize();
}
}
}
return this;
},sanitize:function(){
return this;
},toRgb:function(){
var t=this;
return [t.r,t.g,t.b];
},toRgba:function(){
var t=this;
return [t.r,t.g,t.b,t.a];
},toHex:function(){
var arr=dojo.map(["r","g","b"],function(x){
var s=this[x].toString(16);
return s.length<2?"0"+s:s;
},this);
return "#"+arr.join("");
},toCss:function(_17d){
var t=this,rgb=t.r+", "+t.g+", "+t.b;
return (_17d?"rgba("+rgb+", "+t.a:"rgb("+rgb)+")";
},toString:function(){
return this.toCss(true);
}});
dojo.blendColors=function(_180,end,_182,obj){
var d=dojo,t=obj||new dojo.Color();
d.forEach(["r","g","b","a"],function(x){
t[x]=_180[x]+(end[x]-_180[x])*_182;
if(x!="a"){
t[x]=Math.round(t[x]);
}
});
return t.sanitize();
};
dojo.colorFromRgb=function(_187,obj){
var m=_187.toLowerCase().match(/^rgba?\(([\s\.,0-9]+)\)/);
return m&&dojo.colorFromArray(m[1].split(/\s*,\s*/),obj);
};
dojo.colorFromHex=function(_18a,obj){
var d=dojo,t=obj||new d.Color(),bits=(_18a.length==4)?4:8,mask=(1<<bits)-1;
_18a=Number("0x"+_18a.substr(1));
if(isNaN(_18a)){
return null;
}
d.forEach(["b","g","r"],function(x){
var c=_18a&mask;
_18a>>=bits;
t[x]=bits==4?17*c:c;
});
t.a=1;
return t;
};
dojo.colorFromArray=function(a,obj){
var t=obj||new dojo.Color();
t._set(Number(a[0]),Number(a[1]),Number(a[2]),Number(a[3]));
if(isNaN(t.a)){
t.a=1;
}
return t.sanitize();
};
dojo.colorFromString=function(str,obj){
var a=dojo.Color.named[str];
return a&&dojo.colorFromArray(a,obj)||dojo.colorFromRgb(str,obj)||dojo.colorFromHex(str,obj);
};
}
if(!dojo._hasResource["dojo._base"]){
dojo._hasResource["dojo._base"]=true;
dojo.provide("dojo._base");
}
if(!dojo._hasResource["dojo._base.window"]){
dojo._hasResource["dojo._base.window"]=true;
dojo.provide("dojo._base.window");
dojo._gearsObject=function(){
var _198;
var _199;
var _19a=dojo.getObject("google.gears");
if(_19a){
return _19a;
}
if(typeof GearsFactory!="undefined"){
_198=new GearsFactory();
}else{
if(dojo.isIE){
try{
_198=new ActiveXObject("Gears.Factory");
}
catch(e){
}
}else{
if(navigator.mimeTypes["application/x-googlegears"]){
_198=document.createElement("object");
_198.setAttribute("type","application/x-googlegears");
_198.setAttribute("width",0);
_198.setAttribute("height",0);
_198.style.display="none";
document.documentElement.appendChild(_198);
}
}
}
if(!_198){
return null;
}
dojo.setObject("google.gears.factory",_198);
return dojo.getObject("google.gears");
};
dojo.isGears=(!!dojo._gearsObject())||0;
dojo.doc=window["document"]||null;
dojo.body=function(){
return dojo.doc.body||dojo.doc.getElementsByTagName("body")[0];
};
dojo.setContext=function(_19b,_19c){
dojo.global=_19b;
dojo.doc=_19c;
};
dojo._fireCallback=function(_19d,_19e,_19f){
if(_19e&&dojo.isString(_19d)){
_19d=_19e[_19d];
}
return _19d.apply(_19e,_19f||[]);
};
dojo.withGlobal=function(_1a0,_1a1,_1a2,_1a3){
var rval;
var _1a5=dojo.global;
var _1a6=dojo.doc;
try{
dojo.setContext(_1a0,_1a0.document);
rval=dojo._fireCallback(_1a1,_1a2,_1a3);
}
finally{
dojo.setContext(_1a5,_1a6);
}
return rval;
};
dojo.withDoc=function(_1a7,_1a8,_1a9,_1aa){
var rval;
var _1ac=dojo.doc;
try{
dojo.doc=_1a7;
rval=dojo._fireCallback(_1a8,_1a9,_1aa);
}
finally{
dojo.doc=_1ac;
}
return rval;
};
}
if(!dojo._hasResource["dojo._base.event"]){
dojo._hasResource["dojo._base.event"]=true;
dojo.provide("dojo._base.event");
(function(){
var del=(dojo._event_listener={add:function(node,name,fp){
if(!node){
return;
}
name=del._normalizeEventName(name);
fp=del._fixCallback(name,fp);
var _1b1=name;
if(!dojo.isIE&&(name=="mouseenter"||name=="mouseleave")){
var ofp=fp;
name=(name=="mouseenter")?"mouseover":"mouseout";
fp=function(e){
if(!dojo.isDescendant(e.relatedTarget,node)){
return ofp.call(this,e);
}
};
}
node.addEventListener(name,fp,false);
return fp;
},remove:function(node,_1b5,_1b6){
if(node){
node.removeEventListener(del._normalizeEventName(_1b5),_1b6,false);
}
},_normalizeEventName:function(name){
return name.slice(0,2)=="on"?name.slice(2):name;
},_fixCallback:function(name,fp){
return name!="keypress"?fp:function(e){
return fp.call(this,del._fixEvent(e,this));
};
},_fixEvent:function(evt,_1bc){
switch(evt.type){
case "keypress":
del._setKeyChar(evt);
break;
}
return evt;
},_setKeyChar:function(evt){
evt.keyChar=evt.charCode?String.fromCharCode(evt.charCode):"";
}});
dojo.fixEvent=function(evt,_1bf){
return del._fixEvent(evt,_1bf);
};
dojo.stopEvent=function(evt){
evt.preventDefault();
evt.stopPropagation();
};
var _1c1=dojo._listener;
dojo._connect=function(obj,_1c3,_1c4,_1c5,_1c6){
var _1c7=obj&&(obj.nodeType||obj.attachEvent||obj.addEventListener);
var lid=!_1c7?0:(!_1c6?1:2),l=[dojo._listener,del,_1c1][lid];
var h=l.add(obj,_1c3,dojo.hitch(_1c4,_1c5));
return [obj,_1c3,h,lid];
};
dojo._disconnect=function(obj,_1cc,_1cd,_1ce){
([dojo._listener,del,_1c1][_1ce]).remove(obj,_1cc,_1cd);
};
dojo.keys={BACKSPACE:8,TAB:9,CLEAR:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE:19,CAPS_LOCK:20,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,INSERT:45,DELETE:46,HELP:47,LEFT_WINDOW:91,RIGHT_WINDOW:92,SELECT:93,NUMPAD_0:96,NUMPAD_1:97,NUMPAD_2:98,NUMPAD_3:99,NUMPAD_4:100,NUMPAD_5:101,NUMPAD_6:102,NUMPAD_7:103,NUMPAD_8:104,NUMPAD_9:105,NUMPAD_MULTIPLY:106,NUMPAD_PLUS:107,NUMPAD_ENTER:108,NUMPAD_MINUS:109,NUMPAD_PERIOD:110,NUMPAD_DIVIDE:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,F13:124,F14:125,F15:126,NUM_LOCK:144,SCROLL_LOCK:145};
if(dojo.isIE){
var _1cf=function(e,code){
try{
return (e.keyCode=code);
}
catch(e){
return 0;
}
};
var iel=dojo._listener;
if(!dojo.config._allow_leaks){
_1c1=iel=dojo._ie_listener={handlers:[],add:function(_1d3,_1d4,_1d5){
_1d3=_1d3||dojo.global;
var f=_1d3[_1d4];
if(!f||!f._listeners){
var d=dojo._getIeDispatcher();
d.target=f&&(ieh.push(f)-1);
d._listeners=[];
f=_1d3[_1d4]=d;
}
return f._listeners.push(ieh.push(_1d5)-1);
},remove:function(_1d9,_1da,_1db){
var f=(_1d9||dojo.global)[_1da],l=f&&f._listeners;
if(f&&l&&_1db--){
delete ieh[l[_1db]];
delete l[_1db];
}
}};
var ieh=iel.handlers;
}
dojo.mixin(del,{add:function(node,_1df,fp){
if(!node){
return;
}
_1df=del._normalizeEventName(_1df);
if(_1df=="onkeypress"){
var kd=node.onkeydown;
if(!kd||!kd._listeners||!kd._stealthKeydownHandle){
var h=del.add(node,"onkeydown",del._stealthKeyDown);
kd=node.onkeydown;
kd._stealthKeydownHandle=h;
kd._stealthKeydownRefs=1;
}else{
kd._stealthKeydownRefs++;
}
}
return iel.add(node,_1df,del._fixCallback(fp));
},remove:function(node,_1e4,_1e5){
_1e4=del._normalizeEventName(_1e4);
iel.remove(node,_1e4,_1e5);
if(_1e4=="onkeypress"){
var kd=node.onkeydown;
if(--kd._stealthKeydownRefs<=0){
iel.remove(node,"onkeydown",kd._stealthKeydownHandle);
delete kd._stealthKeydownHandle;
}
}
},_normalizeEventName:function(_1e7){
return _1e7.slice(0,2)!="on"?"on"+_1e7:_1e7;
},_nop:function(){
},_fixEvent:function(evt,_1e9){
if(!evt){
var w=_1e9&&(_1e9.ownerDocument||_1e9.document||_1e9).parentWindow||window;
evt=w.event;
}
if(!evt){
return (evt);
}
evt.target=evt.srcElement;
evt.currentTarget=(_1e9||evt.srcElement);
evt.layerX=evt.offsetX;
evt.layerY=evt.offsetY;
var se=evt.srcElement,doc=(se&&se.ownerDocument)||document;
var _1ed=((dojo.isIE<6)||(doc["compatMode"]=="BackCompat"))?doc.body:doc.documentElement;
var _1ee=dojo._getIeDocumentElementOffset();
evt.pageX=evt.clientX+dojo._fixIeBiDiScrollLeft(_1ed.scrollLeft||0)-_1ee.x;
evt.pageY=evt.clientY+(_1ed.scrollTop||0)-_1ee.y;
if(evt.type=="mouseover"){
evt.relatedTarget=evt.fromElement;
}
if(evt.type=="mouseout"){
evt.relatedTarget=evt.toElement;
}
evt.stopPropagation=del._stopPropagation;
evt.preventDefault=del._preventDefault;
return del._fixKeys(evt);
},_fixKeys:function(evt){
switch(evt.type){
case "keypress":
var c=("charCode" in evt?evt.charCode:evt.keyCode);
if(c==10){
c=0;
evt.keyCode=13;
}else{
if(c==13||c==27){
c=0;
}else{
if(c==3){
c=99;
}
}
}
evt.charCode=c;
del._setKeyChar(evt);
break;
}
return evt;
},_punctMap:{106:42,111:47,186:59,187:43,188:44,189:45,190:46,191:47,192:96,219:91,220:92,221:93,222:39},_stealthKeyDown:function(evt){
var kp=evt.currentTarget.onkeypress;
if(!kp||!kp._listeners){
return;
}
var k=evt.keyCode;
var _1f4=(k!=13)&&(k!=32)&&(k!=27)&&(k<48||k>90)&&(k<96||k>111)&&(k<186||k>192)&&(k<219||k>222);
if(_1f4||evt.ctrlKey){
var c=_1f4?0:k;
if(evt.ctrlKey){
if(k==3||k==13){
return;
}else{
if(c>95&&c<106){
c-=48;
}else{
if((!evt.shiftKey)&&(c>=65&&c<=90)){
c+=32;
}else{
c=del._punctMap[c]||c;
}
}
}
}
var faux=del._synthesizeEvent(evt,{type:"keypress",faux:true,charCode:c});
kp.call(evt.currentTarget,faux);
evt.cancelBubble=faux.cancelBubble;
evt.returnValue=faux.returnValue;
_1cf(evt,faux.keyCode);
}
},_stopPropagation:function(){
this.cancelBubble=true;
},_preventDefault:function(){
this.bubbledKeyCode=this.keyCode;
if(this.ctrlKey){
_1cf(this,0);
}
this.returnValue=false;
}});
dojo.stopEvent=function(evt){
evt=evt||window.event;
del._stopPropagation.call(evt);
del._preventDefault.call(evt);
};
}
del._synthesizeEvent=function(evt,_1f9){
var faux=dojo.mixin({},evt,_1f9);
del._setKeyChar(faux);
faux.preventDefault=function(){
evt.preventDefault();
};
faux.stopPropagation=function(){
evt.stopPropagation();
};
return faux;
};
if(dojo.isOpera){
dojo.mixin(del,{_fixEvent:function(evt,_1fc){
switch(evt.type){
case "keypress":
var c=evt.which;
if(c==3){
c=99;
}
c=((c<41)&&(!evt.shiftKey)?0:c);
if((evt.ctrlKey)&&(!evt.shiftKey)&&(c>=65)&&(c<=90)){
c+=32;
}
return del._synthesizeEvent(evt,{charCode:c});
}
return evt;
}});
}
if(dojo.isSafari){
dojo.mixin(del,{_fixEvent:function(evt,_1ff){
switch(evt.type){
case "keypress":
var c=evt.charCode,s=evt.shiftKey,k=evt.keyCode;
k=k||_203[evt.keyIdentifier]||0;
if(evt.keyIdentifier=="Enter"){
c=0;
}else{
if((evt.ctrlKey)&&(c>0)&&(c<27)){
c+=96;
}else{
if(c==dojo.keys.SHIFT_TAB){
c=dojo.keys.TAB;
s=true;
}else{
c=(c>=32&&c<63232?c:0);
}
}
}
return del._synthesizeEvent(evt,{charCode:c,shiftKey:s,keyCode:k});
}
return evt;
}});
dojo.mixin(dojo.keys,{SHIFT_TAB:25,UP_ARROW:63232,DOWN_ARROW:63233,LEFT_ARROW:63234,RIGHT_ARROW:63235,F1:63236,F2:63237,F3:63238,F4:63239,F5:63240,F6:63241,F7:63242,F8:63243,F9:63244,F10:63245,F11:63246,F12:63247,PAUSE:63250,DELETE:63272,HOME:63273,END:63275,PAGE_UP:63276,PAGE_DOWN:63277,INSERT:63302,PRINT_SCREEN:63248,SCROLL_LOCK:63249,NUM_LOCK:63289});
var dk=dojo.keys,_203={"Up":dk.UP_ARROW,"Down":dk.DOWN_ARROW,"Left":dk.LEFT_ARROW,"Right":dk.RIGHT_ARROW,"PageUp":dk.PAGE_UP,"PageDown":dk.PAGE_DOWN};
}
})();
if(dojo.isIE){
dojo._ieDispatcher=function(args,_206){
var ap=Array.prototype,h=dojo._ie_listener.handlers,c=args.callee,ls=c._listeners,t=h[c.target];
var r=t&&t.apply(_206,args);
for(var i in ls){
if(!(i in ap)){
h[ls[i]].apply(_206,args);
}
}
return r;
};
dojo._getIeDispatcher=function(){
return new Function(dojo._scopeName+"._ieDispatcher(arguments, this)");
};
dojo._event_listener._fixCallback=function(fp){
var f=dojo._event_listener._fixEvent;
return function(e){
return fp.call(this,f(e,this));
};
};
}
}
if(!dojo._hasResource["dojo._base.html"]){
dojo._hasResource["dojo._base.html"]=true;
dojo.provide("dojo._base.html");
try{
document.execCommand("BackgroundImageCache",false,true);
}
catch(e){
}
if(dojo.isIE||dojo.isOpera){
dojo.byId=function(id,doc){
if(dojo.isString(id)){
var _d=doc||dojo.doc;
var te=_d.getElementById(id);
if(te&&te.attributes.id.value==id){
return te;
}else{
var eles=_d.all[id];
if(!eles||!eles.length){
return eles;
}
var i=0;
while((te=eles[i++])){
if(te.attributes.id.value==id){
return te;
}
}
}
}else{
return id;
}
};
}else{
dojo.byId=function(id,doc){
return dojo.isString(id)?(doc||dojo.doc).getElementById(id):id;
};
}
(function(){
var d=dojo;
var _21a=null;
dojo.addOnUnload(function(){
_21a=null;
});
dojo._destroyElement=function(node){
node=d.byId(node);
try{
if(!_21a){
_21a=document.createElement("div");
}
_21a.appendChild(node.parentNode?node.parentNode.removeChild(node):node);
_21a.innerHTML="";
}
catch(e){
}
};
dojo.isDescendant=function(node,_21d){
try{
node=d.byId(node);
_21d=d.byId(_21d);
while(node){
if(node===_21d){
return true;
}
node=node.parentNode;
}
}
catch(e){
}
return false;
};
dojo.setSelectable=function(node,_21f){
node=d.byId(node);
if(d.isMozilla){
node.style.MozUserSelect=_21f?"":"none";
}else{
if(d.isKhtml){
node.style.KhtmlUserSelect=_21f?"auto":"none";
}else{
if(d.isIE){
node.unselectable=_21f?"":"on";
d.query("*",node).forEach(function(_220){
_220.unselectable=_21f?"":"on";
});
}
}
}
};
var _221=function(node,ref){
ref.parentNode.insertBefore(node,ref);
return true;
};
var _224=function(node,ref){
var pn=ref.parentNode;
if(ref==pn.lastChild){
pn.appendChild(node);
}else{
return _221(node,ref.nextSibling);
}
return true;
};
dojo.place=function(node,_229,_22a){
if(!node||!_229||_22a===undefined){
return false;
}
node=d.byId(node);
_229=d.byId(_229);
if(typeof _22a=="number"){
var cn=_229.childNodes;
if((_22a==0&&cn.length==0)||cn.length==_22a){
_229.appendChild(node);
return true;
}
if(_22a==0){
return _221(node,_229.firstChild);
}
return _224(node,cn[_22a-1]);
}
switch(_22a.toLowerCase()){
case "before":
return _221(node,_229);
case "after":
return _224(node,_229);
case "first":
if(_229.firstChild){
return _221(node,_229.firstChild);
}
default:
_229.appendChild(node);
return true;
}
};
dojo.boxModel="content-box";
if(d.isIE){
var _dcm=document.compatMode;
d.boxModel=_dcm=="BackCompat"||_dcm=="QuirksMode"||d.isIE<6?"border-box":"content-box";
}
var gcs,dv=document.defaultView;
if(d.isSafari){
gcs=function(node){
var s=dv.getComputedStyle(node,null);
if(!s&&node.style){
node.style.display="";
s=dv.getComputedStyle(node,null);
}
return s||{};
};
}else{
if(d.isIE){
gcs=function(node){
return node.currentStyle;
};
}else{
gcs=function(node){
return dv.getComputedStyle(node,null);
};
}
}
dojo.getComputedStyle=gcs;
if(!d.isIE){
dojo._toPixelValue=function(_233,_234){
return parseFloat(_234)||0;
};
}else{
dojo._toPixelValue=function(_235,_236){
if(!_236){
return 0;
}
if(_236=="medium"){
return 4;
}
if(_236.slice&&(_236.slice(-2)=="px")){
return parseFloat(_236);
}
with(_235){
var _237=style.left;
var _238=runtimeStyle.left;
runtimeStyle.left=currentStyle.left;
try{
style.left=_236;
_236=style.pixelLeft;
}
catch(e){
_236=0;
}
style.left=_237;
runtimeStyle.left=_238;
}
return _236;
};
}
var px=d._toPixelValue;
dojo._getOpacity=d.isIE?function(node){
try{
return node.filters.alpha.opacity/100;
}
catch(e){
return 1;
}
}:function(node){
return gcs(node).opacity;
};
dojo._setOpacity=d.isIE?function(node,_23d){
if(_23d==1){
var _23e=/FILTER:[^;]*;?/i;
node.style.cssText=node.style.cssText.replace(_23e,"");
if(node.nodeName.toLowerCase()=="tr"){
d.query("> td",node).forEach(function(i){
i.style.cssText=i.style.cssText.replace(_23e,"");
});
}
}else{
var o="Alpha(Opacity="+_23d*100+")";
node.style.filter=o;
}
if(node.nodeName.toLowerCase()=="tr"){
d.query("> td",node).forEach(function(i){
i.style.filter=o;
});
}
return _23d;
}:function(node,_243){
return node.style.opacity=_243;
};
var _244={left:true,top:true};
var _245=/margin|padding|width|height|max|min|offset/;
var _246=function(node,type,_249){
type=type.toLowerCase();
if(d.isIE&&_249=="auto"){
if(type=="height"){
return node.offsetHeight;
}
if(type=="width"){
return node.offsetWidth;
}
}
if(!(type in _244)){
_244[type]=_245.test(type);
}
return _244[type]?px(node,_249):_249;
};
var _24a=d.isIE?"styleFloat":"cssFloat";
var _24b={"cssFloat":_24a,"styleFloat":_24a,"float":_24a};
dojo.style=function(node,_24d,_24e){
var n=d.byId(node),args=arguments.length,op=(_24d=="opacity");
_24d=_24b[_24d]||_24d;
if(args==3){
return op?d._setOpacity(n,_24e):n.style[_24d]=_24e;
}
if(args==2&&op){
return d._getOpacity(n);
}
var s=gcs(n);
if(args==2&&!d.isString(_24d)){
for(var x in _24d){
d.style(node,x,_24d[x]);
}
return s;
}
return (args==1)?s:_246(n,_24d,s[_24d]);
};
dojo._getPadExtents=function(n,_255){
var s=_255||gcs(n),l=px(n,s.paddingLeft),t=px(n,s.paddingTop);
return {l:l,t:t,w:l+px(n,s.paddingRight),h:t+px(n,s.paddingBottom)};
};
dojo._getBorderExtents=function(n,_25a){
var ne="none",s=_25a||gcs(n),bl=(s.borderLeftStyle!=ne?px(n,s.borderLeftWidth):0),bt=(s.borderTopStyle!=ne?px(n,s.borderTopWidth):0);
return {l:bl,t:bt,w:bl+(s.borderRightStyle!=ne?px(n,s.borderRightWidth):0),h:bt+(s.borderBottomStyle!=ne?px(n,s.borderBottomWidth):0)};
};
dojo._getPadBorderExtents=function(n,_260){
var s=_260||gcs(n),p=d._getPadExtents(n,s),b=d._getBorderExtents(n,s);
return {l:p.l+b.l,t:p.t+b.t,w:p.w+b.w,h:p.h+b.h};
};
dojo._getMarginExtents=function(n,_265){
var s=_265||gcs(n),l=px(n,s.marginLeft),t=px(n,s.marginTop),r=px(n,s.marginRight),b=px(n,s.marginBottom);
if(d.isSafari&&(s.position!="absolute")){
r=l;
}
return {l:l,t:t,w:l+r,h:t+b};
};
dojo._getMarginBox=function(node,_26c){
var s=_26c||gcs(node),me=d._getMarginExtents(node,s);
var l=node.offsetLeft-me.l,t=node.offsetTop-me.t;
if(d.isMoz){
var sl=parseFloat(s.left),st=parseFloat(s.top);
if(!isNaN(sl)&&!isNaN(st)){
l=sl,t=st;
}else{
var p=node.parentNode;
if(p&&p.style){
var pcs=gcs(p);
if(pcs.overflow!="visible"){
var be=d._getBorderExtents(p,pcs);
l+=be.l,t+=be.t;
}
}
}
}else{
if(d.isOpera){
var p=node.parentNode;
if(p){
var be=d._getBorderExtents(p);
l-=be.l,t-=be.t;
}
}
}
return {l:l,t:t,w:node.offsetWidth+me.w,h:node.offsetHeight+me.h};
};
dojo._getContentBox=function(node,_277){
var s=_277||gcs(node),pe=d._getPadExtents(node,s),be=d._getBorderExtents(node,s),w=node.clientWidth,h;
if(!w){
w=node.offsetWidth,h=node.offsetHeight;
}else{
h=node.clientHeight,be.w=be.h=0;
}
if(d.isOpera){
pe.l+=be.l;
pe.t+=be.t;
}
return {l:pe.l,t:pe.t,w:w-pe.w-be.w,h:h-pe.h-be.h};
};
dojo._getBorderBox=function(node,_27e){
var s=_27e||gcs(node),pe=d._getPadExtents(node,s),cb=d._getContentBox(node,s);
return {l:cb.l-pe.l,t:cb.t-pe.t,w:cb.w+pe.w,h:cb.h+pe.h};
};
dojo._setBox=function(node,l,t,w,h,u){
u=u||"px";
var s=node.style;
if(!isNaN(l)){
s.left=l+u;
}
if(!isNaN(t)){
s.top=t+u;
}
if(w>=0){
s.width=w+u;
}
if(h>=0){
s.height=h+u;
}
};
dojo._usesBorderBox=function(node){
var n=node.tagName;
return d.boxModel=="border-box"||n=="TABLE"||n=="BUTTON";
};
dojo._setContentSize=function(node,_28c,_28d,_28e){
if(d._usesBorderBox(node)){
var pb=d._getPadBorderExtents(node,_28e);
if(_28c>=0){
_28c+=pb.w;
}
if(_28d>=0){
_28d+=pb.h;
}
}
d._setBox(node,NaN,NaN,_28c,_28d);
};
dojo._setMarginBox=function(node,_291,_292,_293,_294,_295){
var s=_295||gcs(node);
var bb=d._usesBorderBox(node),pb=bb?_299:d._getPadBorderExtents(node,s),mb=d._getMarginExtents(node,s);
if(_293>=0){
_293=Math.max(_293-pb.w-mb.w,0);
}
if(_294>=0){
_294=Math.max(_294-pb.h-mb.h,0);
}
d._setBox(node,_291,_292,_293,_294);
};
var _299={l:0,t:0,w:0,h:0};
dojo.marginBox=function(node,box){
var n=d.byId(node),s=gcs(n),b=box;
return !b?d._getMarginBox(n,s):d._setMarginBox(n,b.l,b.t,b.w,b.h,s);
};
dojo.contentBox=function(node,box){
var n=dojo.byId(node),s=gcs(n),b=box;
return !b?d._getContentBox(n,s):d._setContentSize(n,b.w,b.h,s);
};
var _2a5=function(node,prop){
if(!(node=(node||0).parentNode)){
return 0;
}
var val,_2a9=0,_b=d.body();
while(node&&node.style){
if(gcs(node).position=="fixed"){
return 0;
}
val=node[prop];
if(val){
_2a9+=val-0;
if(node==_b){
break;
}
}
node=node.parentNode;
}
return _2a9;
};
dojo._docScroll=function(){
var _b=d.body(),_w=d.global,de=d.doc.documentElement;
return {y:(_w.pageYOffset||de.scrollTop||_b.scrollTop||0),x:(_w.pageXOffset||d._fixIeBiDiScrollLeft(de.scrollLeft)||_b.scrollLeft||0)};
};
dojo._isBodyLtr=function(){
return !("_bodyLtr" in d)?d._bodyLtr=gcs(d.body()).direction=="ltr":d._bodyLtr;
};
dojo._getIeDocumentElementOffset=function(){
var de=d.doc.documentElement;
return (d.isIE>=7)?{x:de.getBoundingClientRect().left,y:de.getBoundingClientRect().top}:{x:d._isBodyLtr()||window.parent==window?de.clientLeft:de.offsetWidth-de.clientWidth-de.clientLeft,y:de.clientTop};
};
dojo._fixIeBiDiScrollLeft=function(_2af){
var dd=d.doc;
if(d.isIE&&!dojo._isBodyLtr()){
var de=dd.compatMode=="BackCompat"?dd.body:dd.documentElement;
return _2af+de.clientWidth-de.scrollWidth;
}
return _2af;
};
dojo._abs=function(node,_2b3){
var _2b4=node.ownerDocument;
var ret={x:0,y:0};
var db=d.body();
if(d.isIE||(d.isFF>=3)){
var _2b7=node.getBoundingClientRect();
var _2b8=(d.isIE)?d._getIeDocumentElementOffset():{x:0,y:0};
ret.x=_2b7.left-_2b8.x;
ret.y=_2b7.top-_2b8.y;
}else{
if(_2b4["getBoxObjectFor"]){
var bo=_2b4.getBoxObjectFor(node),b=d._getBorderExtents(node);
ret.x=bo.x-b.l-_2a5(node,"scrollLeft");
ret.y=bo.y-b.t-_2a5(node,"scrollTop");
}else{
if(node["offsetParent"]){
var _2bb;
if(d.isSafari&&(gcs(node).position=="absolute")&&(node.parentNode==db)){
_2bb=db;
}else{
_2bb=db.parentNode;
}
if(node.parentNode!=db){
var nd=node;
if(d.isOpera){
nd=db;
}
ret.x-=_2a5(nd,"scrollLeft");
ret.y-=_2a5(nd,"scrollTop");
}
var _2bd=node;
do{
var n=_2bd.offsetLeft;
if(!d.isOpera||n>0){
ret.x+=isNaN(n)?0:n;
}
var t=_2bd.offsetTop;
ret.y+=isNaN(t)?0:t;
if(d.isSafari&&_2bd!=node){
var cs=gcs(_2bd);
ret.x+=px(_2bd,cs.borderLeftWidth);
ret.y+=px(_2bd,cs.borderTopWidth);
}
_2bd=_2bd.offsetParent;
}while((_2bd!=_2bb)&&_2bd);
}else{
if(node.x&&node.y){
ret.x+=isNaN(node.x)?0:node.x;
ret.y+=isNaN(node.y)?0:node.y;
}
}
}
}
if(_2b3){
var _2c1=d._docScroll();
ret.y+=_2c1.y;
ret.x+=_2c1.x;
}
return ret;
};
dojo.coords=function(node,_2c3){
var n=d.byId(node),s=gcs(n),mb=d._getMarginBox(n,s);
var abs=d._abs(n,_2c3);
mb.x=abs.x;
mb.y=abs.y;
return mb;
};
var _2c8=function(name){
switch(name.toLowerCase()){
case "tabindex":
return (d.isIE&&d.isIE<8)?"tabIndex":"tabindex";
default:
return name;
}
};
var _2ca={colspan:"colSpan",enctype:"enctype",frameborder:"frameborder",method:"method",rowspan:"rowSpan",scrolling:"scrolling",shape:"shape",span:"span",type:"type",valuetype:"valueType"};
dojo.hasAttr=function(node,name){
var attr=d.byId(node).getAttributeNode(_2c8(name));
return attr?attr.specified:false;
};
var _2ce={};
var _ctr=0;
var _2d0=dojo._scopeName+"attrid";
dojo.attr=function(node,name,_2d3){
var args=arguments.length;
if(args==2&&!d.isString(name)){
for(var x in name){
d.attr(node,x,name[x]);
}
return;
}
node=d.byId(node);
name=_2c8(name);
if(args==3){
if(d.isFunction(_2d3)){
var _2d6=d.attr(node,_2d0);
if(!_2d6){
_2d6=_ctr++;
d.attr(node,_2d0,_2d6);
}
if(!_2ce[_2d6]){
_2ce[_2d6]={};
}
var h=_2ce[_2d6][name];
if(h){
d.disconnect(h);
}else{
try{
delete node[name];
}
catch(e){
}
}
_2ce[_2d6][name]=d.connect(node,name,_2d3);
}else{
if(typeof _2d3=="boolean"){
node[name]=_2d3;
}else{
node.setAttribute(name,_2d3);
}
}
return;
}else{
var prop=_2ca[name.toLowerCase()];
if(prop){
return node[prop];
}else{
var _2d3=node[name];
return (typeof _2d3=="boolean"||typeof _2d3=="function")?_2d3:(d.hasAttr(node,name)?node.getAttribute(name):null);
}
}
};
dojo.removeAttr=function(node,name){
d.byId(node).removeAttribute(_2c8(name));
};
})();
dojo.hasClass=function(node,_2dc){
return ((" "+dojo.byId(node).className+" ").indexOf(" "+_2dc+" ")>=0);
};
dojo.addClass=function(node,_2de){
node=dojo.byId(node);
var cls=node.className;
if((" "+cls+" ").indexOf(" "+_2de+" ")<0){
node.className=cls+(cls?" ":"")+_2de;
}
};
dojo.removeClass=function(node,_2e1){
node=dojo.byId(node);
var t=dojo.trim((" "+node.className+" ").replace(" "+_2e1+" "," "));
if(node.className!=t){
node.className=t;
}
};
dojo.toggleClass=function(node,_2e4,_2e5){
if(_2e5===undefined){
_2e5=!dojo.hasClass(node,_2e4);
}
dojo[_2e5?"addClass":"removeClass"](node,_2e4);
};
}
if(!dojo._hasResource["dojo._base.NodeList"]){
dojo._hasResource["dojo._base.NodeList"]=true;
dojo.provide("dojo._base.NodeList");
(function(){
var d=dojo;
var tnl=function(arr){
arr.constructor=dojo.NodeList;
dojo._mixin(arr,dojo.NodeList.prototype);
return arr;
};
var _2e9=function(func,_2eb){
return function(){
var _a=arguments;
var aa=d._toArray(_a,0,[null]);
var s=this.map(function(i){
aa[0]=i;
return d[func].apply(d,aa);
});
return (_2eb||((_a.length>1)||!d.isString(_a[0])))?this:s;
};
};
dojo.NodeList=function(){
return tnl(Array.apply(null,arguments));
};
dojo.NodeList._wrap=tnl;
dojo.extend(dojo.NodeList,{slice:function(){
var a=dojo._toArray(arguments);
return tnl(a.slice.apply(this,a));
},splice:function(){
var a=dojo._toArray(arguments);
return tnl(a.splice.apply(this,a));
},concat:function(){
var a=dojo._toArray(arguments,0,[this]);
return tnl(a.concat.apply([],a));
},indexOf:function(_2f3,_2f4){
return d.indexOf(this,_2f3,_2f4);
},lastIndexOf:function(){
return d.lastIndexOf.apply(d,d._toArray(arguments,0,[this]));
},every:function(_2f5,_2f6){
return d.every(this,_2f5,_2f6);
},some:function(_2f7,_2f8){
return d.some(this,_2f7,_2f8);
},map:function(func,obj){
return d.map(this,func,obj,d.NodeList);
},forEach:function(_2fb,_2fc){
d.forEach(this,_2fb,_2fc);
return this;
},coords:function(){
return d.map(this,d.coords);
},attr:_2e9("attr"),style:_2e9("style"),addClass:_2e9("addClass",true),removeClass:_2e9("removeClass",true),toggleClass:_2e9("toggleClass",true),connect:_2e9("connect",true),place:function(_2fd,_2fe){
var item=d.query(_2fd)[0];
return this.forEach(function(i){
d.place(i,item,(_2fe||"last"));
});
},orphan:function(_301){
var _302=_301?d._filterQueryResult(this,_301):this;
_302.forEach(function(item){
if(item.parentNode){
item.parentNode.removeChild(item);
}
});
return _302;
},adopt:function(_304,_305){
var item=this[0];
return d.query(_304).forEach(function(ai){
d.place(ai,item,_305||"last");
});
},query:function(_308){
if(!_308){
return this;
}
var ret=d.NodeList();
this.forEach(function(item){
d.query(_308,item).forEach(function(_30b){
if(_30b!==undefined){
ret.push(_30b);
}
});
});
return ret;
},filter:function(_30c){
var _30d=this;
var _a=arguments;
var r=d.NodeList();
var rp=function(t){
if(t!==undefined){
r.push(t);
}
};
if(d.isString(_30c)){
_30d=d._filterQueryResult(this,_a[0]);
if(_a.length==1){
return _30d;
}
_a.shift();
}
d.forEach(d.filter(_30d,_a[0],_a[1]),rp);
return r;
},addContent:function(_312,_313){
var ta=d.doc.createElement("span");
if(d.isString(_312)){
ta.innerHTML=_312;
}else{
ta.appendChild(_312);
}
if(_313===undefined){
_313="last";
}
var ct=(_313=="first"||_313=="after")?"lastChild":"firstChild";
this.forEach(function(item){
var tn=ta.cloneNode(true);
while(tn[ct]){
d.place(tn[ct],item,_313);
}
});
return this;
},empty:function(){
return this.forEach("item.innerHTML='';");
},instantiate:function(_318,_319){
var c=d.isFunction(_318)?_318:d.getObject(_318);
return this.forEach(function(i){
new c(_319||{},i);
});
}});
d.forEach(["blur","focus","click","keydown","keypress","keyup","mousedown","mouseenter","mouseleave","mousemove","mouseout","mouseover","mouseup"],function(evt){
var _oe="on"+evt;
dojo.NodeList.prototype[_oe]=function(a,b){
return this.connect(_oe,a,b);
};
});
})();
}
if(!dojo._hasResource["dojo._base.query"]){
dojo._hasResource["dojo._base.query"]=true;
dojo.provide("dojo._base.query");
(function(){
var d=dojo;
var _321=dojo.isIE?"children":"childNodes";
var _322=false;
var _323=function(_324){
if(">~+".indexOf(_324.charAt(_324.length-1))>=0){
_324+=" *";
}
_324+=" ";
var ts=function(s,e){
return d.trim(_324.slice(s,e));
};
var _328=[];
var _329=-1;
var _32a=-1;
var _32b=-1;
var _32c=-1;
var _32d=-1;
var inId=-1;
var _32f=-1;
var lc="";
var cc="";
var _332;
var x=0;
var ql=_324.length;
var _335=null;
var _cp=null;
var _337=function(){
if(_32f>=0){
var tv=(_32f==x)?null:ts(_32f,x).toLowerCase();
_335[(">~+".indexOf(tv)<0)?"tag":"oper"]=tv;
_32f=-1;
}
};
var _339=function(){
if(inId>=0){
_335.id=ts(inId,x).replace(/\\/g,"");
inId=-1;
}
};
var _33a=function(){
if(_32d>=0){
_335.classes.push(ts(_32d+1,x).replace(/\\/g,""));
_32d=-1;
}
};
var _33b=function(){
_339();
_337();
_33a();
};
for(;lc=cc,cc=_324.charAt(x),x<ql;x++){
if(lc=="\\"){
continue;
}
if(!_335){
_332=x;
_335={query:null,pseudos:[],attrs:[],classes:[],tag:null,oper:null,id:null};
_32f=x;
}
if(_329>=0){
if(cc=="]"){
if(!_cp.attr){
_cp.attr=ts(_329+1,x);
}else{
_cp.matchFor=ts((_32b||_329+1),x);
}
var cmf=_cp.matchFor;
if(cmf){
if((cmf.charAt(0)=="\"")||(cmf.charAt(0)=="'")){
_cp.matchFor=cmf.substring(1,cmf.length-1);
}
}
_335.attrs.push(_cp);
_cp=null;
_329=_32b=-1;
}else{
if(cc=="="){
var _33d=("|~^$*".indexOf(lc)>=0)?lc:"";
_cp.type=_33d+cc;
_cp.attr=ts(_329+1,x-_33d.length);
_32b=x+1;
}
}
}else{
if(_32a>=0){
if(cc==")"){
if(_32c>=0){
_cp.value=ts(_32a+1,x);
}
_32c=_32a=-1;
}
}else{
if(cc=="#"){
_33b();
inId=x+1;
}else{
if(cc=="."){
_33b();
_32d=x;
}else{
if(cc==":"){
_33b();
_32c=x;
}else{
if(cc=="["){
_33b();
_329=x;
_cp={};
}else{
if(cc=="("){
if(_32c>=0){
_cp={name:ts(_32c+1,x),value:null};
_335.pseudos.push(_cp);
}
_32a=x;
}else{
if(cc==" "&&lc!=cc){
_33b();
if(_32c>=0){
_335.pseudos.push({name:ts(_32c+1,x)});
}
_335.hasLoops=(_335.pseudos.length||_335.attrs.length||_335.classes.length);
_335.query=ts(_332,x);
_335.tag=(_335["oper"])?null:(_335.tag||"*");
_328.push(_335);
_335=null;
}
}
}
}
}
}
}
}
}
return _328;
};
var _33e={"*=":function(attr,_340){
return "[contains(@"+attr+", '"+_340+"')]";
},"^=":function(attr,_342){
return "[starts-with(@"+attr+", '"+_342+"')]";
},"$=":function(attr,_344){
return "[substring(@"+attr+", string-length(@"+attr+")-"+(_344.length-1)+")='"+_344+"']";
},"~=":function(attr,_346){
return "[contains(concat(' ',@"+attr+",' '), ' "+_346+" ')]";
},"|=":function(attr,_348){
return "[contains(concat(' ',@"+attr+",' '), ' "+_348+"-')]";
},"=":function(attr,_34a){
return "[@"+attr+"='"+_34a+"']";
}};
var _34b=function(_34c,_34d,_34e,_34f){
d.forEach(_34d.attrs,function(attr){
var _351;
if(attr.type&&_34c[attr.type]){
_351=_34c[attr.type](attr.attr,attr.matchFor);
}else{
if(attr.attr.length){
_351=_34e(attr.attr);
}
}
if(_351){
_34f(_351);
}
});
};
var _352=function(_353){
var _354=".";
var _355=_323(d.trim(_353));
while(_355.length){
var tqp=_355.shift();
var _357;
var _358="";
if(tqp.oper==">"){
_357="/";
tqp=_355.shift();
}else{
if(tqp.oper=="~"){
_357="/following-sibling::";
tqp=_355.shift();
}else{
if(tqp.oper=="+"){
_357="/following-sibling::";
_358="[position()=1]";
tqp=_355.shift();
}else{
_357="//";
}
}
}
_354+=_357+tqp.tag+_358;
if(tqp.id){
_354+="[@id='"+tqp.id+"'][1]";
}
d.forEach(tqp.classes,function(cn){
var cnl=cn.length;
var _35b=" ";
if(cn.charAt(cnl-1)=="*"){
_35b="";
cn=cn.substr(0,cnl-1);
}
_354+="[contains(concat(' ',@class,' '), ' "+cn+_35b+"')]";
});
_34b(_33e,tqp,function(_35c){
return "[@"+_35c+"]";
},function(_35d){
_354+=_35d;
});
}
return _354;
};
var _35e={};
var _35f=function(path){
if(_35e[path]){
return _35e[path];
}
var doc=d.doc;
var _362=_352(path);
var tf=function(_364){
var ret=[];
var _366;
try{
_366=doc.evaluate(_362,_364,null,XPathResult.ANY_TYPE,null);
}
catch(e){
console.debug("failure in exprssion:",_362,"under:",_364);
console.debug(e);
}
var _367=_366.iterateNext();
while(_367){
ret.push(_367);
_367=_366.iterateNext();
}
return ret;
};
return _35e[path]=tf;
};
var _368={};
var _369={};
var _36a=function(_36b,_36c){
if(!_36b){
return _36c;
}
if(!_36c){
return _36b;
}
return function(){
return _36b.apply(window,arguments)&&_36c.apply(window,arguments);
};
};
var _36d=function(root){
var ret=[];
var te,x=0,tret=root[_321];
while(te=tret[x++]){
if(te.nodeType==1){
ret.push(te);
}
}
return ret;
};
var _373=function(root,_375){
var ret=[];
var te=root;
while(te=te.nextSibling){
if(te.nodeType==1){
ret.push(te);
if(_375){
break;
}
}
}
return ret;
};
var _378=function(_379,_37a,_37b,idx){
var nidx=idx+1;
var _37e=(_37a.length==nidx);
var tqp=_37a[idx];
if(tqp.oper){
var ecn=(tqp.oper==">")?_36d(_379):_373(_379,(tqp.oper=="+"));
if(!ecn||!ecn.length){
return;
}
nidx++;
_37e=(_37a.length==nidx);
var tf=_382(_37a[idx+1]);
for(var x=0,ecnl=ecn.length,te;x<ecnl,te=ecn[x];x++){
if(tf(te)){
if(_37e){
_37b.push(te);
}else{
_378(te,_37a,_37b,nidx);
}
}
}
}
var _386=_387(tqp)(_379);
if(_37e){
while(_386.length){
_37b.push(_386.shift());
}
}else{
while(_386.length){
_378(_386.shift(),_37a,_37b,nidx);
}
}
};
var _388=function(_389,_38a){
var ret=[];
var x=_389.length-1,te;
while(te=_389[x--]){
_378(te,_38a,ret,0);
}
return ret;
};
var _382=function(q){
if(_368[q.query]){
return _368[q.query];
}
var ff=null;
if(q.tag){
if(q.tag=="*"){
ff=_36a(ff,function(elem){
return (elem.nodeType==1);
});
}else{
ff=_36a(ff,function(elem){
return ((elem.nodeType==1)&&(q.tag==elem.tagName.toLowerCase()));
});
}
}
if(q.id){
ff=_36a(ff,function(elem){
return ((elem.nodeType==1)&&(elem.id==q.id));
});
}
if(q.hasLoops){
ff=_36a(ff,_393(q));
}
return _368[q.query]=ff;
};
var _394=function(node){
var pn=node.parentNode;
var pnc=pn.childNodes;
var nidx=-1;
var _399=pn.firstChild;
if(!_399){
return nidx;
}
var ci=node["__cachedIndex"];
var cl=pn["__cachedLength"];
if(((typeof cl=="number")&&(cl!=pnc.length))||(typeof ci!="number")){
pn["__cachedLength"]=pnc.length;
var idx=1;
do{
if(_399===node){
nidx=idx;
}
if(_399.nodeType==1){
_399["__cachedIndex"]=idx;
idx++;
}
_399=_399.nextSibling;
}while(_399);
}else{
nidx=ci;
}
return nidx;
};
var _39d=0;
var _39e="";
var _39f=function(elem,attr){
if(attr=="class"){
return elem.className||_39e;
}
if(attr=="for"){
return elem.htmlFor||_39e;
}
return elem.getAttribute(attr,2)||_39e;
};
var _3a2={"*=":function(attr,_3a4){
return function(elem){
return (_39f(elem,attr).indexOf(_3a4)>=0);
};
},"^=":function(attr,_3a7){
return function(elem){
return (_39f(elem,attr).indexOf(_3a7)==0);
};
},"$=":function(attr,_3aa){
var tval=" "+_3aa;
return function(elem){
var ea=" "+_39f(elem,attr);
return (ea.lastIndexOf(_3aa)==(ea.length-_3aa.length));
};
},"~=":function(attr,_3af){
var tval=" "+_3af+" ";
return function(elem){
var ea=" "+_39f(elem,attr)+" ";
return (ea.indexOf(tval)>=0);
};
},"|=":function(attr,_3b4){
var _3b5=" "+_3b4+"-";
return function(elem){
var ea=" "+(elem.getAttribute(attr,2)||"");
return ((ea==_3b4)||(ea.indexOf(_3b5)==0));
};
},"=":function(attr,_3b9){
return function(elem){
return (_39f(elem,attr)==_3b9);
};
}};
var _3bb={"first-child":function(name,_3bd){
return function(elem){
if(elem.nodeType!=1){
return false;
}
var fc=elem.previousSibling;
while(fc&&(fc.nodeType!=1)){
fc=fc.previousSibling;
}
return (!fc);
};
},"last-child":function(name,_3c1){
return function(elem){
if(elem.nodeType!=1){
return false;
}
var nc=elem.nextSibling;
while(nc&&(nc.nodeType!=1)){
nc=nc.nextSibling;
}
return (!nc);
};
},"empty":function(name,_3c5){
return function(elem){
var cn=elem.childNodes;
var cnl=elem.childNodes.length;
for(var x=cnl-1;x>=0;x--){
var nt=cn[x].nodeType;
if((nt==1)||(nt==3)){
return false;
}
}
return true;
};
},"contains":function(name,_3cc){
return function(elem){
return (elem.innerHTML.indexOf(_3cc)>=0);
};
},"not":function(name,_3cf){
var ntf=_382(_323(_3cf)[0]);
return function(elem){
return (!ntf(elem));
};
},"nth-child":function(name,_3d3){
var pi=parseInt;
if(_3d3=="odd"){
return function(elem){
return (((_394(elem))%2)==1);
};
}else{
if((_3d3=="2n")||(_3d3=="even")){
return function(elem){
return ((_394(elem)%2)==0);
};
}else{
if(_3d3.indexOf("0n+")==0){
var _3d7=pi(_3d3.substr(3));
return function(elem){
return (elem.parentNode[_321][_3d7-1]===elem);
};
}else{
if((_3d3.indexOf("n+")>0)&&(_3d3.length>3)){
var _3d9=_3d3.split("n+",2);
var pred=pi(_3d9[0]);
var idx=pi(_3d9[1]);
return function(elem){
return ((_394(elem)%pred)==idx);
};
}else{
if(_3d3.indexOf("n")==-1){
var _3d7=pi(_3d3);
return function(elem){
return (_394(elem)==_3d7);
};
}
}
}
}
}
}};
var _3de=(d.isIE)?function(cond){
var clc=cond.toLowerCase();
return function(elem){
return elem[cond]||elem[clc];
};
}:function(cond){
return function(elem){
return (elem&&elem.getAttribute&&elem.hasAttribute(cond));
};
};
var _393=function(_3e4){
var _3e5=(_369[_3e4.query]||_368[_3e4.query]);
if(_3e5){
return _3e5;
}
var ff=null;
if(_3e4.id){
if(_3e4.tag!="*"){
ff=_36a(ff,function(elem){
return (elem.tagName.toLowerCase()==_3e4.tag);
});
}
}
d.forEach(_3e4.classes,function(_3e8,idx,arr){
var _3eb=_3e8.charAt(_3e8.length-1)=="*";
if(_3eb){
_3e8=_3e8.substr(0,_3e8.length-1);
}
var re=new RegExp("(?:^|\\s)"+_3e8+(_3eb?".*":"")+"(?:\\s|$)");
ff=_36a(ff,function(elem){
return re.test(elem.className);
});
ff.count=idx;
});
d.forEach(_3e4.pseudos,function(_3ee){
if(_3bb[_3ee.name]){
ff=_36a(ff,_3bb[_3ee.name](_3ee.name,_3ee.value));
}
});
_34b(_3a2,_3e4,_3de,function(_3ef){
ff=_36a(ff,_3ef);
});
if(!ff){
ff=function(){
return true;
};
}
return _369[_3e4.query]=ff;
};
var _3f0={};
var _387=function(_3f1,root){
var fHit=_3f0[_3f1.query];
if(fHit){
return fHit;
}
if(_3f1.id&&!_3f1.hasLoops&&!_3f1.tag){
return _3f0[_3f1.query]=function(root){
return [d.byId(_3f1.id)];
};
}
var _3f5=_393(_3f1);
var _3f6;
if(_3f1.tag&&_3f1.id&&!_3f1.hasLoops){
_3f6=function(root){
var te=d.byId(_3f1.id);
if(_3f5(te)){
return [te];
}
};
}else{
var tret;
if(!_3f1.hasLoops){
_3f6=function(root){
var ret=[];
var te,x=0,tret=root.getElementsByTagName(_3f1.tag);
while(te=tret[x++]){
ret.push(te);
}
return ret;
};
}else{
_3f6=function(root){
var ret=[];
var te,x=0,tret=root.getElementsByTagName(_3f1.tag);
while(te=tret[x++]){
if(_3f5(te)){
ret.push(te);
}
}
return ret;
};
}
}
return _3f0[_3f1.query]=_3f6;
};
var _402={};
var _403={"*":d.isIE?function(root){
return root.all;
}:function(root){
return root.getElementsByTagName("*");
},"~":_373,"+":function(root){
return _373(root,true);
},">":_36d};
var _407=function(_408){
var _409=_323(d.trim(_408));
if(_409.length==1){
var tt=_387(_409[0]);
tt.nozip=true;
return tt;
}
var sqf=function(root){
var _40d=_409.slice(0);
var _40e;
if(_40d[0].oper==">"){
_40e=[root];
}else{
_40e=_387(_40d.shift())(root);
}
return _388(_40e,_40d);
};
return sqf;
};
var _40f=((document["evaluate"]&&!d.isSafari)?function(_410){
var _411=_410.split(" ");
if((document["evaluate"])&&(_410.indexOf(":")==-1)&&(_410.indexOf("+")==-1)){
if(((_411.length>2)&&(_410.indexOf(">")==-1))||(_411.length>3)||(_410.indexOf("[")>=0)||((1==_411.length)&&(0<=_410.indexOf(".")))){
return _35f(_410);
}
}
return _407(_410);
}:_407);
var _412=function(_413){
var qcz=_413.charAt(0);
if(d.doc["querySelectorAll"]&&((!d.isSafari)||(d.isSafari>3.1))&&(">+~".indexOf(qcz)==-1)){
return function(root){
var r=root.querySelectorAll(_413);
r.nozip=true;
return r;
};
}
if(_403[_413]){
return _403[_413];
}
if(0>_413.indexOf(",")){
return _403[_413]=_40f(_413);
}else{
var _417=_413.split(/\s*,\s*/);
var tf=function(root){
var _41a=0;
var ret=[];
var tp;
while(tp=_417[_41a++]){
ret=ret.concat(_40f(tp,tp.indexOf(" "))(root));
}
return ret;
};
return _403[_413]=tf;
}
};
var _41d=0;
var _zip=function(arr){
if(arr&&arr.nozip){
return d.NodeList._wrap(arr);
}
var ret=new d.NodeList();
if(!arr){
return ret;
}
if(arr[0]){
ret.push(arr[0]);
}
if(arr.length<2){
return ret;
}
_41d++;
arr[0]["_zipIdx"]=_41d;
for(var x=1,te;te=arr[x];x++){
if(arr[x]["_zipIdx"]!=_41d){
ret.push(te);
}
te["_zipIdx"]=_41d;
}
return ret;
};
d.query=function(_423,root){
if(_423.constructor==d.NodeList){
return _423;
}
if(!d.isString(_423)){
return new d.NodeList(_423);
}
if(d.isString(root)){
root=d.byId(root);
}
return _zip(_412(_423)(root||d.doc));
};
d.query.pseudos=_3bb;
d._filterQueryResult=function(_425,_426){
var tnl=new d.NodeList();
var ff=(_426)?_382(_323(_426)[0]):function(){
return true;
};
for(var x=0,te;te=_425[x];x++){
if(ff(te)){
tnl.push(te);
}
}
return tnl;
};
})();
}
if(!dojo._hasResource["dojo._base.xhr"]){
dojo._hasResource["dojo._base.xhr"]=true;
dojo.provide("dojo._base.xhr");
(function(){
var _d=dojo;
function setValue(obj,name,_42e){
var val=obj[name];
if(_d.isString(val)){
obj[name]=[val,_42e];
}else{
if(_d.isArray(val)){
val.push(_42e);
}else{
obj[name]=_42e;
}
}
};
dojo.formToObject=function(_430){
var ret={};
var iq="input:not([type=file]):not([type=submit]):not([type=image]):not([type=reset]):not([type=button]), select, textarea";
_d.query(iq,_430).filter(function(node){
return !node.disabled&&node.name;
}).forEach(function(item){
var _in=item.name;
var type=(item.type||"").toLowerCase();
if(type=="radio"||type=="checkbox"){
if(item.checked){
setValue(ret,_in,item.value);
}
}else{
if(item.multiple){
ret[_in]=[];
_d.query("option",item).forEach(function(opt){
if(opt.selected){
setValue(ret,_in,opt.value);
}
});
}else{
setValue(ret,_in,item.value);
if(type=="image"){
ret[_in+".x"]=ret[_in+".y"]=ret[_in].x=ret[_in].y=0;
}
}
}
});
return ret;
};
dojo.objectToQuery=function(map){
var enc=encodeURIComponent;
var _43a=[];
var _43b={};
for(var name in map){
var _43d=map[name];
if(_43d!=_43b[name]){
var _43e=enc(name)+"=";
if(_d.isArray(_43d)){
for(var i=0;i<_43d.length;i++){
_43a.push(_43e+enc(_43d[i]));
}
}else{
_43a.push(_43e+enc(_43d));
}
}
}
return _43a.join("&");
};
dojo.formToQuery=function(_440){
return _d.objectToQuery(_d.formToObject(_440));
};
dojo.formToJson=function(_441,_442){
return _d.toJson(_d.formToObject(_441),_442);
};
dojo.queryToObject=function(str){
var ret={};
var qp=str.split("&");
var dec=decodeURIComponent;
_d.forEach(qp,function(item){
if(item.length){
var _448=item.split("=");
var name=dec(_448.shift());
var val=dec(_448.join("="));
if(_d.isString(ret[name])){
ret[name]=[ret[name]];
}
if(_d.isArray(ret[name])){
ret[name].push(val);
}else{
ret[name]=val;
}
}
});
return ret;
};
dojo._blockAsync=false;
dojo._contentHandlers={"text":function(xhr){
return xhr.responseText;
},"json":function(xhr){
if(!dojo.config.usePlainJson){
console.warn("Consider using mimetype:text/json-comment-filtered"+" to avoid potential security issues with JSON endpoints"+" (use djConfig.usePlainJson=true to turn off this message)");
}
return (xhr.status==204)?undefined:_d.fromJson(xhr.responseText);
},"json-comment-filtered":function(xhr){
var _44e=xhr.responseText;
var _44f=_44e.indexOf("/*");
var _450=_44e.lastIndexOf("*/");
if(_44f==-1||_450==-1){
throw new Error("JSON was not comment filtered");
}
return (xhr.status==204)?undefined:_d.fromJson(_44e.substring(_44f+2,_450));
},"javascript":function(xhr){
return _d.eval(xhr.responseText);
},"xml":function(xhr){
var _453=xhr.responseXML;
if(_d.isIE&&(!_453||window.location.protocol=="file:")){
_d.forEach(["MSXML2","Microsoft","MSXML","MSXML3"],function(_454){
try{
var dom=new ActiveXObject(_454+".XMLDOM");
dom.async=false;
dom.loadXML(xhr.responseText);
_453=dom;
}
catch(e){
}
});
}
return _453;
}};
dojo._contentHandlers["json-comment-optional"]=function(xhr){
var _457=_d._contentHandlers;
try{
return _457["json-comment-filtered"](xhr);
}
catch(e){
return _457["json"](xhr);
}
};
dojo._ioSetArgs=function(args,_459,_45a,_45b){
var _45c={args:args,url:args.url};
var _45d=null;
if(args.form){
var form=_d.byId(args.form);
var _45f=form.getAttributeNode("action");
_45c.url=_45c.url||(_45f?_45f.value:null);
_45d=_d.formToObject(form);
}
var _460=[{}];
if(_45d){
_460.push(_45d);
}
if(args.content){
_460.push(args.content);
}
if(args.preventCache){
_460.push({"dojo.preventCache":new Date().valueOf()});
}
_45c.query=_d.objectToQuery(_d.mixin.apply(null,_460));
_45c.handleAs=args.handleAs||"text";
var d=new _d.Deferred(_459);
d.addCallbacks(_45a,function(_462){
return _45b(_462,d);
});
var ld=args.load;
if(ld&&_d.isFunction(ld)){
d.addCallback(function(_464){
return ld.call(args,_464,_45c);
});
}
var err=args.error;
if(err&&_d.isFunction(err)){
d.addErrback(function(_466){
return err.call(args,_466,_45c);
});
}
var _467=args.handle;
if(_467&&_d.isFunction(_467)){
d.addBoth(function(_468){
return _467.call(args,_468,_45c);
});
}
d.ioArgs=_45c;
return d;
};
var _469=function(dfd){
dfd.canceled=true;
var xhr=dfd.ioArgs.xhr;
var _at=typeof xhr.abort;
if(_at=="function"||_at=="unknown"){
xhr.abort();
}
var err=new Error("xhr cancelled");
err.dojoType="cancel";
return err;
};
var _46e=function(dfd){
return _d._contentHandlers[dfd.ioArgs.handleAs](dfd.ioArgs.xhr);
};
var _470=function(_471,dfd){
console.debug(_471);
return _471;
};
var _473=function(args){
var dfd=_d._ioSetArgs(args,_469,_46e,_470);
dfd.ioArgs.xhr=_d._xhrObj(dfd.ioArgs.args);
return dfd;
};
var _476=null;
var _477=[];
var _478=function(){
var now=(new Date()).getTime();
if(!_d._blockAsync){
for(var i=0,tif;i<_477.length&&(tif=_477[i]);i++){
var dfd=tif.dfd;
try{
if(!dfd||dfd.canceled||!tif.validCheck(dfd)){
_477.splice(i--,1);
}else{
if(tif.ioCheck(dfd)){
_477.splice(i--,1);
tif.resHandle(dfd);
}else{
if(dfd.startTime){
if(dfd.startTime+(dfd.ioArgs.args.timeout||0)<now){
_477.splice(i--,1);
var err=new Error("timeout exceeded");
err.dojoType="timeout";
dfd.errback(err);
dfd.cancel();
}
}
}
}
}
catch(e){
console.debug(e);
dfd.errback(new Error("_watchInFlightError!"));
}
}
}
if(!_477.length){
clearInterval(_476);
_476=null;
return;
}
};
dojo._ioCancelAll=function(){
try{
_d.forEach(_477,function(i){
i.dfd.cancel();
});
}
catch(e){
}
};
if(_d.isIE){
_d.addOnUnload(_d._ioCancelAll);
}
_d._ioWatch=function(dfd,_480,_481,_482){
if(dfd.ioArgs.args.timeout){
dfd.startTime=(new Date()).getTime();
}
_477.push({dfd:dfd,validCheck:_480,ioCheck:_481,resHandle:_482});
if(!_476){
_476=setInterval(_478,50);
}
_478();
};
var _483="application/x-www-form-urlencoded";
var _484=function(dfd){
return dfd.ioArgs.xhr.readyState;
};
var _486=function(dfd){
return 4==dfd.ioArgs.xhr.readyState;
};
var _488=function(dfd){
var xhr=dfd.ioArgs.xhr;
if(_d._isDocumentOk(xhr)){
dfd.callback(dfd);
}else{
var err=new Error("Unable to load "+dfd.ioArgs.url+" status:"+xhr.status);
err.status=xhr.status;
err.responseText=xhr.responseText;
dfd.errback(err);
}
};
var _48c=function(type,dfd){
var _48f=dfd.ioArgs;
var args=_48f.args;
var xhr=_48f.xhr;
xhr.open(type,_48f.url,args.sync!==true,args.user||undefined,args.password||undefined);
if(args.headers){
for(var hdr in args.headers){
if(hdr.toLowerCase()==="content-type"&&!args.contentType){
args.contentType=args.headers[hdr];
}else{
xhr.setRequestHeader(hdr,args.headers[hdr]);
}
}
}
xhr.setRequestHeader("Content-Type",args.contentType||_483);
if(!args.headers||!args.headers["X-Requested-With"]){
xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
}
try{
xhr.send(_48f.query);
}
catch(e){
dfd.cancel();
}
_d._ioWatch(dfd,_484,_486,_488);
xhr=null;
return dfd;
};
dojo._ioAddQueryToUrl=function(_493){
if(_493.query.length){
_493.url+=(_493.url.indexOf("?")==-1?"?":"&")+_493.query;
_493.query=null;
}
};
dojo.xhr=function(_494,args,_496){
var dfd=_473(args);
if(!_496){
_d._ioAddQueryToUrl(dfd.ioArgs);
}
return _48c(_494,dfd);
};
dojo.xhrGet=function(args){
return _d.xhr("GET",args);
};
dojo.xhrPost=function(args){
return _d.xhr("POST",args,true);
};
dojo.rawXhrPost=function(args){
var dfd=_473(args);
dfd.ioArgs.query=args.postData;
return _48c("POST",dfd);
};
dojo.xhrPut=function(args){
return _d.xhr("PUT",args,true);
};
dojo.rawXhrPut=function(args){
var dfd=_473(args);
var _49f=dfd.ioArgs;
if(args.putData){
_49f.query=args.putData;
args.putData=null;
}
return _48c("PUT",dfd);
};
dojo.xhrDelete=function(args){
return _d.xhr("DELETE",args);
};
})();
}
if(!dojo._hasResource["dojo._base.fx"]){
dojo._hasResource["dojo._base.fx"]=true;
dojo.provide("dojo._base.fx");
(function(){
var d=dojo;
dojo._Line=function(_4a2,end){
this.start=_4a2;
this.end=end;
this.getValue=function(n){
return ((this.end-this.start)*n)+this.start;
};
};
d.declare("dojo._Animation",null,{constructor:function(args){
d.mixin(this,args);
if(d.isArray(this.curve)){
this.curve=new d._Line(this.curve[0],this.curve[1]);
}
},duration:350,repeat:0,rate:10,_percent:0,_startRepeatCount:0,_fire:function(evt,args){
try{
if(this[evt]){
this[evt].apply(this,args||[]);
}
}
catch(e){
console.error("exception in animation handler for:",evt);
console.error(e);
}
return this;
},play:function(_4a8,_4a9){
var _t=this;
if(_4a9){
_t._stopTimer();
_t._active=_t._paused=false;
_t._percent=0;
}else{
if(_t._active&&!_t._paused){
return _t;
}
}
_t._fire("beforeBegin");
var de=_4a8||_t.delay;
var _p=dojo.hitch(_t,"_play",_4a9);
if(de>0){
setTimeout(_p,de);
return _t;
}
_p();
return _t;
},_play:function(_4ad){
var _t=this;
_t._startTime=new Date().valueOf();
if(_t._paused){
_t._startTime-=_t.duration*_t._percent;
}
_t._endTime=_t._startTime+_t.duration;
_t._active=true;
_t._paused=false;
var _4af=_t.curve.getValue(_t._percent);
if(!_t._percent){
if(!_t._startRepeatCount){
_t._startRepeatCount=_t.repeat;
}
_t._fire("onBegin",[_4af]);
}
_t._fire("onPlay",[_4af]);
_t._cycle();
return _t;
},pause:function(){
this._stopTimer();
if(!this._active){
return this;
}
this._paused=true;
this._fire("onPause",[this.curve.getValue(this._percent)]);
return this;
},gotoPercent:function(_4b0,_4b1){
this._stopTimer();
this._active=this._paused=true;
this._percent=_4b0;
if(_4b1){
this.play();
}
return this;
},stop:function(_4b2){
if(!this._timer){
return this;
}
this._stopTimer();
if(_4b2){
this._percent=1;
}
this._fire("onStop",[this.curve.getValue(this._percent)]);
this._active=this._paused=false;
return this;
},status:function(){
if(this._active){
return this._paused?"paused":"playing";
}
return "stopped";
},_cycle:function(){
var _t=this;
if(_t._active){
var curr=new Date().valueOf();
var step=(curr-_t._startTime)/(_t._endTime-_t._startTime);
if(step>=1){
step=1;
}
_t._percent=step;
if(_t.easing){
step=_t.easing(step);
}
_t._fire("onAnimate",[_t.curve.getValue(step)]);
if(_t._percent<1){
_t._startTimer();
}else{
_t._active=false;
if(_t.repeat>0){
_t.repeat--;
_t.play(null,true);
}else{
if(_t.repeat==-1){
_t.play(null,true);
}else{
if(_t._startRepeatCount){
_t.repeat=_t._startRepeatCount;
_t._startRepeatCount=0;
}
}
}
_t._percent=0;
_t._fire("onEnd");
_t._stopTimer();
}
}
return _t;
}});
var ctr=0;
var _4b7=[];
var _4b8={run:function(){
}};
var _4b9=null;
dojo._Animation.prototype._startTimer=function(){
if(!this._timer){
this._timer=d.connect(_4b8,"run",this,"_cycle");
ctr++;
}
if(!_4b9){
_4b9=setInterval(d.hitch(_4b8,"run"),this.rate);
}
};
dojo._Animation.prototype._stopTimer=function(){
if(this._timer){
d.disconnect(this._timer);
this._timer=null;
ctr--;
}
if(ctr<=0){
clearInterval(_4b9);
_4b9=null;
ctr=0;
}
};
var _4ba=(d.isIE)?function(node){
var ns=node.style;
if(!ns.zoom.length&&d.style(node,"zoom")=="normal"){
ns.zoom="1";
}
if(!ns.width.length&&d.style(node,"width")=="auto"){
ns.width="auto";
}
}:function(){
};
dojo._fade=function(args){
args.node=d.byId(args.node);
var _4be=d.mixin({properties:{}},args);
var _4bf=(_4be.properties.opacity={});
_4bf.start=!("start" in _4be)?function(){
return Number(d.style(_4be.node,"opacity"));
}:_4be.start;
_4bf.end=_4be.end;
var anim=d.animateProperty(_4be);
d.connect(anim,"beforeBegin",d.partial(_4ba,_4be.node));
return anim;
};
dojo.fadeIn=function(args){
return d._fade(d.mixin({end:1},args));
};
dojo.fadeOut=function(args){
return d._fade(d.mixin({end:0},args));
};
dojo._defaultEasing=function(n){
return 0.5+((Math.sin((n+1.5)*Math.PI))/2);
};
var _4c4=function(_4c5){
this._properties=_4c5;
for(var p in _4c5){
var prop=_4c5[p];
if(prop.start instanceof d.Color){
prop.tempColor=new d.Color();
}
}
this.getValue=function(r){
var ret={};
for(var p in this._properties){
var prop=this._properties[p];
var _4cc=prop.start;
if(_4cc instanceof d.Color){
ret[p]=d.blendColors(_4cc,prop.end,r,prop.tempColor).toCss();
}else{
if(!d.isArray(_4cc)){
ret[p]=((prop.end-_4cc)*r)+_4cc+(p!="opacity"?prop.units||"px":"");
}
}
}
return ret;
};
};
dojo.animateProperty=function(args){
args.node=d.byId(args.node);
if(!args.easing){
args.easing=d._defaultEasing;
}
var anim=new d._Animation(args);
d.connect(anim,"beforeBegin",anim,function(){
var pm={};
for(var p in this.properties){
if(p=="width"||p=="height"){
this.node.display="block";
}
var prop=this.properties[p];
prop=pm[p]=d.mixin({},(d.isObject(prop)?prop:{end:prop}));
if(d.isFunction(prop.start)){
prop.start=prop.start();
}
if(d.isFunction(prop.end)){
prop.end=prop.end();
}
var _4d2=(p.toLowerCase().indexOf("color")>=0);
function getStyle(node,p){
var v=({height:node.offsetHeight,width:node.offsetWidth})[p];
if(v!==undefined){
return v;
}
v=d.style(node,p);
return (p=="opacity")?Number(v):(_4d2?v:parseFloat(v));
};
if(!("end" in prop)){
prop.end=getStyle(this.node,p);
}else{
if(!("start" in prop)){
prop.start=getStyle(this.node,p);
}
}
if(_4d2){
prop.start=new d.Color(prop.start);
prop.end=new d.Color(prop.end);
}else{
prop.start=(p=="opacity")?Number(prop.start):parseFloat(prop.start);
}
}
this.curve=new _4c4(pm);
});
d.connect(anim,"onAnimate",anim,function(_4d6){
for(var s in _4d6){
d.style(this.node,s,_4d6[s]);
}
});
return anim;
};
dojo.anim=function(node,_4d9,_4da,_4db,_4dc,_4dd){
return d.animateProperty({node:node,duration:_4da||d._Animation.prototype.duration,properties:_4d9,easing:_4db,onEnd:_4dc}).play(_4dd||0);
};
})();
}
if(!dojo._hasResource["dojo._base.browser"]){
dojo._hasResource["dojo._base.browser"]=true;
dojo.provide("dojo._base.browser");
if(dojo.config.require){
dojo.forEach(dojo.config.require,"dojo['require'](item);");
}
}
if(dojo.config.afterOnLoad&&dojo.isBrowser){
window.setTimeout(dojo._fakeLoadInit,1000);
}
})();
