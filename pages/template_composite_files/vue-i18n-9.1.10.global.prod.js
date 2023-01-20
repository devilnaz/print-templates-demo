/*!
  * vue-i18n v9.1.10
  * (c) 2022 kazuya kawaguchi
  * Released under the MIT License.
  */
var VueI18n=function(e,t){"use strict";const n="function"==typeof Symbol&&"symbol"==typeof Symbol.toStringTag,r=e=>n?Symbol(e):e,a=e=>JSON.stringify(e).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029").replace(/\u0027/g,"\\u0027"),o=e=>"number"==typeof e&&isFinite(e),s=e=>"[object RegExp]"===_(e),l=e=>v(e)&&0===Object.keys(e).length;function c(e,t){"undefined"!=typeof console&&(console.warn("[intlify] "+e),t&&console.warn(t.stack))}const i=Object.assign;function u(e){return e.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}const f=Object.prototype.hasOwnProperty;function m(e,t){return f.call(e,t)}const p=Array.isArray,g=e=>"function"==typeof e,d=e=>"string"==typeof e,b=e=>"boolean"==typeof e,h=e=>null!==e&&"object"==typeof e,k=Object.prototype.toString,_=e=>k.call(e),v=e=>"[object Object]"===_(e),y=[];y[0]={w:[0],i:[3,0],"[":[4],o:[7]},y[1]={w:[1],".":[2],"[":[4],o:[7]},y[2]={w:[2],i:[3,0],0:[3,0]},y[3]={i:[3,0],0:[3,0],w:[1,1],".":[2,1],"[":[4,1],o:[7,1]},y[4]={"'":[5,0],'"':[6,0],"[":[4,2],"]":[1,3],o:8,l:[4,0]},y[5]={"'":[4,0],o:8,l:[5,0]},y[6]={'"':[4,0],o:8,l:[6,0]};const F=/^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;function L(e){if(null==e)return"o";switch(e.charCodeAt(0)){case 91:case 93:case 46:case 34:case 39:return e;case 95:case 36:case 45:return"i";case 9:case 10:case 13:case 160:case 65279:case 8232:case 8233:return"w"}return"i"}function w(e){const t=e.trim();return("0"!==e.charAt(0)||!isNaN(parseInt(e)))&&(F.test(t)?function(e){const t=e.charCodeAt(0);return t!==e.charCodeAt(e.length-1)||34!==t&&39!==t?e:e.slice(1,-1)}(t):"*"+t)}const T=new Map;function C(e,t){if(!h(e))return null;let n=T.get(t);if(n||(n=function(e){const t=[];let n,r,a,o,s,l,c,i=-1,u=0,f=0;const m=[];function p(){const t=e[i+1];if(5===u&&"'"===t||6===u&&'"'===t)return i++,a="\\"+t,m[0](),!0}for(m[0]=()=>{void 0===r?r=a:r+=a},m[1]=()=>{void 0!==r&&(t.push(r),r=void 0)},m[2]=()=>{m[0](),f++},m[3]=()=>{if(f>0)f--,u=4,m[0]();else{if(f=0,void 0===r)return!1;if(r=w(r),!1===r)return!1;m[1]()}};null!==u;)if(i++,n=e[i],"\\"!==n||!p()){if(o=L(n),c=y[u],s=c[o]||c.l||8,8===s)return;if(u=s[0],void 0!==s[1]&&(l=m[s[1]],l&&(a=n,!1===l())))return;if(7===u)return t}}(t),n&&T.set(t,n)),!n)return null;const r=n.length;let a=e,o=0;for(;o<r;){const e=a[n[o]];if(void 0===e)return null;a=e,o++}return a}function x(e){if(!h(e))return e;for(const t in e)if(m(e,t))if(t.includes(".")){const n=t.split("."),r=n.length-1;let a=e;for(let e=0;e<r;e++)n[e]in a||(a[n[e]]={}),a=a[n[e]];a[n[r]]=e[t],delete e[t],h(a[n[r]])&&x(a[n[r]])}else h(e[t])&&x(e[t]);return e}const P=e=>e,O=e=>"",$=e=>0===e.length?"":e.join(""),M=e=>null==e?"":p(e)||v(e)&&e.toString===k?JSON.stringify(e,null,2):String(e);function W(e,t){return e=Math.abs(e),2===t?e?e>1?1:0:1:e?Math.min(e,2):0}function I(e={}){const t=e.locale,n=function(e){const t=o(e.pluralIndex)?e.pluralIndex:-1;return e.named&&(o(e.named.count)||o(e.named.n))?o(e.named.count)?e.named.count:o(e.named.n)?e.named.n:t:t}(e),r=h(e.pluralRules)&&d(t)&&g(e.pluralRules[t])?e.pluralRules[t]:W,a=h(e.pluralRules)&&d(t)&&g(e.pluralRules[t])?W:void 0,s=e.list||[],l=e.named||{};o(e.pluralIndex)&&function(e,t){t.count||(t.count=e),t.n||(t.n=e)}(n,l);function c(t){const n=g(e.messages)?e.messages(t):!!h(e.messages)&&e.messages[t];return n||(e.parent?e.parent.message(t):O)}const i=v(e.processor)&&g(e.processor.normalize)?e.processor.normalize:$,u=v(e.processor)&&g(e.processor.interpolate)?e.processor.interpolate:M,f={list:e=>s[e],named:e=>l[e],plural:e=>e[r(n,e.length,a)],linked:(t,n)=>{const r=c(t)(f);return d(n)?(a=n,e.modifiers?e.modifiers[a]:P)(r):r;var a},message:c,type:v(e.processor)&&d(e.processor.type)?e.processor.type:"text",interpolate:u,normalize:i};return f}function N(e){throw e}function S(e,t,n){const r={start:e,end:t};return null!=n&&(r.source=n),r}const E=" ",j="\n",H=String.fromCharCode(8232),R=String.fromCharCode(8233);function D(e){const t=e;let n=0,r=1,a=1,o=0;const s=e=>"\r"===t[e]&&t[e+1]===j,l=e=>t[e]===R,c=e=>t[e]===H,i=e=>s(e)||(e=>t[e]===j)(e)||l(e)||c(e),u=e=>s(e)||l(e)||c(e)?j:t[e];function f(){return o=0,i(n)&&(r++,a=0),s(n)&&n++,n++,a++,t[n]}return{index:()=>n,line:()=>r,column:()=>a,peekOffset:()=>o,charAt:u,currentChar:()=>u(n),currentPeek:()=>u(n+o),next:f,peek:function(){return s(n+o)&&o++,o++,t[n+o]},reset:function(){n=0,r=1,a=1,o=0},resetPeek:function(e=0){o=e},skipToPeek:function(){const e=n+o;for(;e!==n;)f();o=0}}}const A=void 0;function U(e,t={}){const n=!1!==t.location,r=D(e),a=()=>r.index(),o=()=>{return e=r.line(),t=r.column(),n=r.index(),{line:e,column:t,offset:n};var e,t,n},s=o(),l=a(),c={currentType:14,offset:l,startLoc:s,endLoc:s,lastType:14,lastOffset:l,lastStartLoc:s,lastEndLoc:s,braceNest:0,inLinked:!1,text:""},i=()=>c,{onError:u}=t;function f(e,t,r){e.endLoc=o(),e.currentType=t;const a={type:t};return n&&(a.loc=S(e.startLoc,e.endLoc)),null!=r&&(a.value=r),a}const m=e=>f(e,14);function p(e,t){return e.currentChar()===t?(e.next(),t):(o(),"")}function g(e){let t="";for(;e.currentPeek()===E||e.currentPeek()===j;)t+=e.currentPeek(),e.peek();return t}function d(e){const t=g(e);return e.skipToPeek(),t}function b(e){if(e===A)return!1;const t=e.charCodeAt(0);return t>=97&&t<=122||t>=65&&t<=90||95===t}function h(e,t){const{currentType:n}=t;if(2!==n)return!1;g(e);const r=function(e){if(e===A)return!1;const t=e.charCodeAt(0);return t>=48&&t<=57}("-"===e.currentPeek()?e.peek():e.currentPeek());return e.resetPeek(),r}function k(e){g(e);const t="|"===e.currentPeek();return e.resetPeek(),t}function _(e,t=!0){const n=(t=!1,r="",a=!1)=>{const o=e.currentPeek();return"{"===o?"%"!==r&&t:"@"!==o&&o?"%"===o?(e.peek(),n(t,"%",!0)):"|"===o?!("%"!==r&&!a)||!(r===E||r===j):o===E?(e.peek(),n(!0,E,a)):o!==j||(e.peek(),n(!0,j,a)):"%"===r||t},r=n();return t&&e.resetPeek(),r}function v(e,t){const n=e.currentChar();return n===A?A:t(n)?(e.next(),n):null}function y(e){return v(e,(e=>{const t=e.charCodeAt(0);return t>=97&&t<=122||t>=65&&t<=90||t>=48&&t<=57||95===t||36===t}))}function F(e){return v(e,(e=>{const t=e.charCodeAt(0);return t>=48&&t<=57}))}function L(e){return v(e,(e=>{const t=e.charCodeAt(0);return t>=48&&t<=57||t>=65&&t<=70||t>=97&&t<=102}))}function w(e){let t="",n="";for(;t=F(e);)n+=t;return n}function T(e){const t=e.currentChar();switch(t){case"\\":case"'":return e.next(),`\\${t}`;case"u":return C(e,t,4);case"U":return C(e,t,6);default:return o(),""}}function C(e,t,n){p(e,t);let r="";for(let t=0;t<n;t++){const t=L(e);if(!t){o(),e.currentChar();break}r+=t}return`\\${t}${r}`}function x(e){d(e);const t=p(e,"|");return d(e),t}function P(e,t){let n=null;switch(e.currentChar()){case"{":return t.braceNest>=1&&o(),e.next(),n=f(t,2,"{"),d(e),t.braceNest++,n;case"}":return t.braceNest>0&&2===t.currentType&&o(),e.next(),n=f(t,3,"}"),t.braceNest--,t.braceNest>0&&d(e),t.inLinked&&0===t.braceNest&&(t.inLinked=!1),n;case"@":return t.braceNest>0&&o(),n=O(e,t)||m(t),t.braceNest=0,n;default:let r=!0,a=!0,s=!0;if(k(e))return t.braceNest>0&&o(),n=f(t,1,x(e)),t.braceNest=0,t.inLinked=!1,n;if(t.braceNest>0&&(5===t.currentType||6===t.currentType||7===t.currentType))return o(),t.braceNest=0,$(e,t);if(r=function(e,t){const{currentType:n}=t;if(2!==n)return!1;g(e);const r=b(e.currentPeek());return e.resetPeek(),r}(e,t))return n=f(t,5,function(e){d(e);let t="",n="";for(;t=y(e);)n+=t;return e.currentChar()===A&&o(),n}(e)),d(e),n;if(a=h(e,t))return n=f(t,6,function(e){d(e);let t="";return"-"===e.currentChar()?(e.next(),t+=`-${w(e)}`):t+=w(e),e.currentChar()===A&&o(),t}(e)),d(e),n;if(s=function(e,t){const{currentType:n}=t;if(2!==n)return!1;g(e);const r="'"===e.currentPeek();return e.resetPeek(),r}(e,t))return n=f(t,7,function(e){d(e),p(e,"'");let t="",n="";const r=e=>"'"!==e&&e!==j;for(;t=v(e,r);)n+="\\"===t?T(e):t;const a=e.currentChar();return a===j||a===A?(o(),a===j&&(e.next(),p(e,"'")),n):(p(e,"'"),n)}(e)),d(e),n;if(!r&&!a&&!s)return n=f(t,13,function(e){d(e);let t="",n="";const r=e=>"{"!==e&&"}"!==e&&e!==E&&e!==j;for(;t=v(e,r);)n+=t;return n}(e)),o(),d(e),n}return n}function O(e,t){const{currentType:n}=t;let r=null;const a=e.currentChar();switch(8!==n&&9!==n&&12!==n&&10!==n||a!==j&&a!==E||o(),a){case"@":return e.next(),r=f(t,8,"@"),t.inLinked=!0,r;case".":return d(e),e.next(),f(t,9,".");case":":return d(e),e.next(),f(t,10,":");default:return k(e)?(r=f(t,1,x(e)),t.braceNest=0,t.inLinked=!1,r):function(e,t){const{currentType:n}=t;if(8!==n)return!1;g(e);const r="."===e.currentPeek();return e.resetPeek(),r}(e,t)||function(e,t){const{currentType:n}=t;if(8!==n&&12!==n)return!1;g(e);const r=":"===e.currentPeek();return e.resetPeek(),r}(e,t)?(d(e),O(e,t)):function(e,t){const{currentType:n}=t;if(9!==n)return!1;g(e);const r=b(e.currentPeek());return e.resetPeek(),r}(e,t)?(d(e),f(t,12,function(e){let t="",n="";for(;t=y(e);)n+=t;return n}(e))):function(e,t){const{currentType:n}=t;if(10!==n)return!1;const r=()=>{const t=e.currentPeek();return"{"===t?b(e.peek()):!("@"===t||"%"===t||"|"===t||":"===t||"."===t||t===E||!t)&&(t===j?(e.peek(),r()):b(t))},a=r();return e.resetPeek(),a}(e,t)?(d(e),"{"===a?P(e,t)||r:f(t,11,function(e){const t=(n=!1,r)=>{const a=e.currentChar();return"{"!==a&&"%"!==a&&"@"!==a&&"|"!==a&&a?a===E?r:a===j?(r+=a,e.next(),t(n,r)):(r+=a,e.next(),t(!0,r)):r};return t(!1,"")}(e))):(8===n&&o(),t.braceNest=0,t.inLinked=!1,$(e,t))}}function $(e,t){let n={type:14};if(t.braceNest>0)return P(e,t)||m(t);if(t.inLinked)return O(e,t)||m(t);const r=e.currentChar();switch(r){case"{":return P(e,t)||m(t);case"}":return o(),e.next(),f(t,3,"}");case"@":return O(e,t)||m(t);default:if(k(e))return n=f(t,1,x(e)),t.braceNest=0,t.inLinked=!1,n;if(_(e))return f(t,0,function(e){let t="";for(;;){const n=e.currentChar();if("{"===n||"}"===n||"@"===n||"|"===n||!n)break;if("%"===n){if(!_(e))break;t+=n,e.next()}else if(n===E||n===j)if(_(e))t+=n,e.next();else{if(k(e))break;t+=n,e.next()}else t+=n,e.next()}return t}(e));if("%"===r)return e.next(),f(t,4,"%")}return n}return{nextToken:function(){const{currentType:e,offset:t,startLoc:n,endLoc:s}=c;return c.lastType=e,c.lastOffset=t,c.lastStartLoc=n,c.lastEndLoc=s,c.offset=a(),c.startLoc=o(),r.currentChar()===A?f(c,14):$(r,c)},currentOffset:a,currentPosition:o,context:i}}const z=/(?:\\\\|\\'|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;function J(e,t,n){switch(e){case"\\\\":return"\\";case"\\'":return"'";default:{const e=parseInt(t||n,16);return e<=55295||e>=57344?String.fromCodePoint(e):"�"}}}function V(e={}){const t=!1!==e.location,{onError:n}=e;function r(e,n,r){const a={type:e,start:n,end:n};return t&&(a.loc={start:r,end:r}),a}function a(e,n,r,a){e.end=n,a&&(e.type=a),t&&e.loc&&(e.loc.end=r)}function o(e,t){const n=e.context(),o=r(3,n.offset,n.startLoc);return o.value=t,a(o,e.currentOffset(),e.currentPosition()),o}function s(e,t){const n=e.context(),{lastOffset:o,lastStartLoc:s}=n,l=r(5,o,s);return l.index=parseInt(t,10),e.nextToken(),a(l,e.currentOffset(),e.currentPosition()),l}function l(e,t){const n=e.context(),{lastOffset:o,lastStartLoc:s}=n,l=r(4,o,s);return l.key=t,e.nextToken(),a(l,e.currentOffset(),e.currentPosition()),l}function c(e,t){const n=e.context(),{lastOffset:o,lastStartLoc:s}=n,l=r(9,o,s);return l.value=t.replace(z,J),e.nextToken(),a(l,e.currentOffset(),e.currentPosition()),l}function u(e){const t=e.context(),n=r(6,t.offset,t.startLoc);let o=e.nextToken();if(9===o.type){const t=function(e){const t=e.nextToken(),n=e.context(),{lastOffset:o,lastStartLoc:s}=n,l=r(8,o,s);return 12!==t.type?(l.value="",a(l,o,s),{nextConsumeToken:t,node:l}):(null==t.value&&q(t),l.value=t.value||"",a(l,e.currentOffset(),e.currentPosition()),{node:l})}(e);n.modifier=t.node,o=t.nextConsumeToken||e.nextToken()}switch(10!==o.type&&q(o),o=e.nextToken(),2===o.type&&(o=e.nextToken()),o.type){case 11:null==o.value&&q(o),n.key=function(e,t){const n=e.context(),o=r(7,n.offset,n.startLoc);return o.value=t,a(o,e.currentOffset(),e.currentPosition()),o}(e,o.value||"");break;case 5:null==o.value&&q(o),n.key=l(e,o.value||"");break;case 6:null==o.value&&q(o),n.key=s(e,o.value||"");break;case 7:null==o.value&&q(o),n.key=c(e,o.value||"");break;default:const t=e.context(),i=r(7,t.offset,t.startLoc);return i.value="",a(i,t.offset,t.startLoc),n.key=i,a(n,t.offset,t.startLoc),{nextConsumeToken:o,node:n}}return a(n,e.currentOffset(),e.currentPosition()),{node:n}}function f(e){const t=e.context(),n=r(2,1===t.currentType?e.currentOffset():t.offset,1===t.currentType?t.endLoc:t.startLoc);n.items=[];let i=null;do{const t=i||e.nextToken();switch(i=null,t.type){case 0:null==t.value&&q(t),n.items.push(o(e,t.value||""));break;case 6:null==t.value&&q(t),n.items.push(s(e,t.value||""));break;case 5:null==t.value&&q(t),n.items.push(l(e,t.value||""));break;case 7:null==t.value&&q(t),n.items.push(c(e,t.value||""));break;case 8:const r=u(e);n.items.push(r.node),i=r.nextConsumeToken||null}}while(14!==t.currentType&&1!==t.currentType);return a(n,1===t.currentType?t.lastOffset:e.currentOffset(),1===t.currentType?t.lastEndLoc:e.currentPosition()),n}function m(e){const t=e.context(),{offset:n,startLoc:o}=t,s=f(e);return 14===t.currentType?s:function(e,t,n,o){const s=e.context();let l=0===o.items.length;const c=r(1,t,n);c.cases=[],c.cases.push(o);do{const t=f(e);l||(l=0===t.items.length),c.cases.push(t)}while(14!==s.currentType);return a(c,e.currentOffset(),e.currentPosition()),c}(e,n,o,s)}return{parse:function(n){const o=U(n,i({},e)),s=o.context(),l=r(0,s.offset,s.startLoc);return t&&l.loc&&(l.loc.source=n),l.body=m(o),a(l,o.currentOffset(),o.currentPosition()),l}}}function q(e){if(14===e.type)return"EOF";const t=(e.value||"").replace(/\r?\n/gu,"\\n");return t.length>10?t.slice(0,9)+"…":t}function B(e,t){for(let n=0;n<e.length;n++)G(e[n],t)}function G(e,t){switch(e.type){case 1:B(e.cases,t),t.helper("plural");break;case 2:B(e.items,t);break;case 6:G(e.key,t),t.helper("linked");break;case 5:t.helper("interpolate"),t.helper("list");break;case 4:t.helper("interpolate"),t.helper("named")}}function Y(e,t={}){const n=function(e,t={}){const n={ast:e,helpers:new Set};return{context:()=>n,helper:e=>(n.helpers.add(e),e)}}(e);n.helper("normalize"),e.body&&G(e.body,n);const r=n.context();e.helpers=Array.from(r.helpers)}function K(e,t){const{helper:n}=e;switch(t.type){case 0:!function(e,t){t.body?K(e,t.body):e.push("null")}(e,t);break;case 1:!function(e,t){const{helper:n,needIndent:r}=e;if(t.cases.length>1){e.push(`${n("plural")}([`),e.indent(r());const a=t.cases.length;for(let n=0;n<a&&(K(e,t.cases[n]),n!==a-1);n++)e.push(", ");e.deindent(r()),e.push("])")}}(e,t);break;case 2:!function(e,t){const{helper:n,needIndent:r}=e;e.push(`${n("normalize")}([`),e.indent(r());const a=t.items.length;for(let n=0;n<a&&(K(e,t.items[n]),n!==a-1);n++)e.push(", ");e.deindent(r()),e.push("])")}(e,t);break;case 6:!function(e,t){const{helper:n}=e;e.push(`${n("linked")}(`),K(e,t.key),t.modifier&&(e.push(", "),K(e,t.modifier)),e.push(")")}(e,t);break;case 8:case 7:e.push(JSON.stringify(t.value),t);break;case 5:e.push(`${n("interpolate")}(${n("list")}(${t.index}))`,t);break;case 4:e.push(`${n("interpolate")}(${n("named")}(${JSON.stringify(t.key)}))`,t);break;case 9:case 3:e.push(JSON.stringify(t.value),t)}}function Z(e,t={}){const n=i({},t),r=V(n).parse(e);return Y(r,n),((e,t={})=>{const n=d(t.mode)?t.mode:"normal",r=d(t.filename)?t.filename:"message.intl",a=t.needIndent?t.needIndent:"arrow"!==n,o=e.helpers||[],s=function(e,t){const{filename:n,breakLineCode:r,needIndent:a}=t,o={source:e.loc.source,filename:n,code:"",column:1,line:1,offset:0,map:void 0,breakLineCode:r,needIndent:a,indentLevel:0};function s(e,t){o.code+=e}function l(e,t=!0){const n=t?r:"";s(a?n+"  ".repeat(e):n)}return{context:()=>o,push:s,indent:function(e=!0){const t=++o.indentLevel;e&&l(t)},deindent:function(e=!0){const t=--o.indentLevel;e&&l(t)},newline:function(){l(o.indentLevel)},helper:e=>`_${e}`,needIndent:()=>o.needIndent}}(e,{mode:n,filename:r,sourceMap:!!t.sourceMap,breakLineCode:null!=t.breakLineCode?t.breakLineCode:"arrow"===n?";":"\n",needIndent:a});s.push("normal"===n?"function __msg__ (ctx) {":"(ctx) => {"),s.indent(a),o.length>0&&(s.push(`const { ${o.map((e=>`${e}: _${e}`)).join(", ")} } = ctx`),s.newline()),s.push("return "),K(s,e),s.deindent(a),s.push("}");const{code:l,map:c}=s.context();return{ast:e,code:l,map:c?c.toJSON():void 0}})(r,n)}let Q;let X=0;function ee(e={}){const t=d(e.version)?e.version:"9.1.10",n=d(e.locale)?e.locale:"en-US",r=p(e.fallbackLocale)||v(e.fallbackLocale)||d(e.fallbackLocale)||!1===e.fallbackLocale?e.fallbackLocale:n,a=v(e.messages)?e.messages:{[n]:{}},o=v(e.datetimeFormats)?e.datetimeFormats:{[n]:{}},l=v(e.numberFormats)?e.numberFormats:{[n]:{}},u=i({},e.modifiers||{},{upper:e=>d(e)?e.toUpperCase():e,lower:e=>d(e)?e.toLowerCase():e,capitalize:e=>d(e)?`${e.charAt(0).toLocaleUpperCase()}${e.substr(1)}`:e}),f=e.pluralRules||{},m=g(e.missing)?e.missing:null,k=!b(e.missingWarn)&&!s(e.missingWarn)||e.missingWarn,_=!b(e.fallbackWarn)&&!s(e.fallbackWarn)||e.fallbackWarn,y=!!e.fallbackFormat,F=!!e.unresolving,L=g(e.postTranslation)?e.postTranslation:null,w=v(e.processor)?e.processor:null,T=!b(e.warnHtmlMessage)||e.warnHtmlMessage,C=!!e.escapeParameter,x=g(e.messageCompiler)?e.messageCompiler:Q,P=g(e.onWarn)?e.onWarn:c,O=e,$=h(O.__datetimeFormatters)?O.__datetimeFormatters:new Map,M=h(O.__numberFormatters)?O.__numberFormatters:new Map,W=h(O.__meta)?O.__meta:{};X++;return{version:t,cid:X,locale:n,fallbackLocale:r,messages:a,datetimeFormats:o,numberFormats:l,modifiers:u,pluralRules:f,missing:m,missingWarn:k,fallbackWarn:_,fallbackFormat:y,unresolving:F,postTranslation:L,processor:w,warnHtmlMessage:T,escapeParameter:C,messageCompiler:x,onWarn:P,__datetimeFormatters:$,__numberFormatters:M,__meta:W}}function te(e,t,n,r,a){const{missing:o}=e;if(null!==o){const r=o(e,n,t,a);return d(r)?r:t}return t}function ne(e,t,n){const r=e;r.__localeChainCache||(r.__localeChainCache=new Map);let a=r.__localeChainCache.get(n);if(!a){a=[];let e=[n];for(;p(e);)e=re(a,e,t);const o=p(t)?t:v(t)?t.default?t.default:null:t;e=d(o)?[o]:o,p(e)&&re(a,e,!1),r.__localeChainCache.set(n,a)}return a}function re(e,t,n){let r=!0;for(let a=0;a<t.length&&b(r);a++){d(t[a])&&(r=ae(e,t[a],n))}return r}function ae(e,t,n){let r;const a=t.split("-");do{r=oe(e,a.join("-"),n),a.splice(-1,1)}while(a.length&&!0===r);return r}function oe(e,t,n){let r=!1;if(!e.includes(t)&&(r=!0,t)){r="!"!==t[t.length-1];const a=t.replace(/!/g,"");e.push(a),(p(n)||v(n))&&n[a]&&(r=n[a])}return r}function se(e,t,n){e.__localeChainCache=new Map,ne(e,n,t)}const le=e=>e;let ce=Object.create(null);const ie=()=>"",ue=e=>g(e);function fe(e,...t){const{fallbackFormat:n,postTranslation:r,unresolving:a,fallbackLocale:s,messages:l}=e,[c,i]=pe(...t),f=(b(i.missingWarn),b(i.fallbackWarn),b(i.escapeParameter)?i.escapeParameter:e.escapeParameter),m=!!i.resolvedMessage,k=d(i.default)||b(i.default)?b(i.default)?c:i.default:n?c:"",_=n||""!==k,v=d(i.locale)?i.locale:e.locale;f&&function(e){p(e.list)?e.list=e.list.map((e=>d(e)?u(e):e)):h(e.named)&&Object.keys(e.named).forEach((t=>{d(e.named[t])&&(e.named[t]=u(e.named[t]))}))}(i);let[y,F,L]=m?[c,v,l[v]||{}]:function(e,t,n,r,a,o){const{messages:s}=e,l=ne(e,r,n);let c,i={},u=null;const f="translate";for(let n=0;n<l.length&&(c=l[n],i=s[c]||{},null===(u=C(i,t))&&(u=i[t]),!d(u)&&!g(u));n++){const n=te(e,t,c,0,f);n!==t&&(u=n)}return[u,c,i]}(e,c,v,s),w=c;if(m||d(y)||ue(y)||_&&(y=k,w=y),!(m||(d(y)||ue(y))&&d(F)))return a?-1:c;let T=!1;const x=ue(y)?y:me(e,c,F,y,w,(()=>{T=!0}));if(T)return y;const P=function(e,t,n){return t(n)}(0,x,I(function(e,t,n,r){const{modifiers:a,pluralRules:s}=e,l={locale:t,modifiers:a,pluralRules:s,messages:r=>{const a=C(n,r);if(d(a)){let n=!1;const o=me(e,r,t,a,r,(()=>{n=!0}));return n?ie:o}return ue(a)?a:ie}};e.processor&&(l.processor=e.processor);r.list&&(l.list=r.list);r.named&&(l.named=r.named);o(r.plural)&&(l.pluralIndex=r.plural);return l}(e,F,L,i)));return r?r(P):P}function me(e,t,n,r,o,s){const{messageCompiler:l,warnHtmlMessage:c}=e;if(ue(r)){const e=r;return e.locale=e.locale||n,e.key=e.key||t,e}const i=l(r,function(e,t,n,r,o,s){return{warnHtmlMessage:o,onError:e=>{throw s&&s(e),e},onCacheKey:e=>((e,t,n)=>a({l:e,k:t,s:n}))(t,n,e)}}(0,n,o,0,c,s));return i.locale=n,i.key=t,i.source=r,i}function pe(...e){const[t,n,r]=e,a={};if(!d(t)&&!o(t)&&!ue(t))throw Error(14);const s=o(t)?String(t):(ue(t),t);return o(n)?a.plural=n:d(n)?a.default=n:v(n)&&!l(n)?a.named=n:p(n)&&(a.list=n),o(r)?a.plural=r:d(r)?a.default=r:v(r)&&i(a,r),[s,a]}function ge(e,...t){const{datetimeFormats:n,unresolving:r,fallbackLocale:a}=e,{__datetimeFormatters:o}=e,[s,c,u,f]=de(...t);b(u.missingWarn);b(u.fallbackWarn);const m=!!u.part,p=d(u.locale)?u.locale:e.locale,g=ne(e,a,p);if(!d(s)||""===s)return new Intl.DateTimeFormat(p).format(c);let h,k={},_=null;for(let t=0;t<g.length&&(h=g[t],k=n[h]||{},_=k[s],!v(_));t++)te(e,s,h,0,"datetime format");if(!v(_)||!d(h))return r?-1:s;let y=`${h}__${s}`;l(f)||(y=`${y}__${JSON.stringify(f)}`);let F=o.get(y);return F||(F=new Intl.DateTimeFormat(h,i({},_,f)),o.set(y,F)),m?F.formatToParts(c):F.format(c)}function de(...e){const[t,n,r,a]=e;let s,l={},c={};if(d(t)){if(!/\d{4}-\d{2}-\d{2}(T.*)?/.test(t))throw Error(16);s=new Date(t);try{s.toISOString()}catch(e){throw Error(16)}}else if("[object Date]"===_(t)){if(isNaN(t.getTime()))throw Error(15);s=t}else{if(!o(t))throw Error(14);s=t}return d(n)?l.key=n:v(n)&&(l=n),d(r)?l.locale=r:v(r)&&(c=r),v(a)&&(c=a),[l.key||"",s,l,c]}function be(e,t,n){const r=e;for(const e in n){const n=`${t}__${e}`;r.__datetimeFormatters.has(n)&&r.__datetimeFormatters.delete(n)}}function he(e,...t){const{numberFormats:n,unresolving:r,fallbackLocale:a}=e,{__numberFormatters:o}=e,[s,c,u,f]=ke(...t);b(u.missingWarn);b(u.fallbackWarn);const m=!!u.part,p=d(u.locale)?u.locale:e.locale,g=ne(e,a,p);if(!d(s)||""===s)return new Intl.NumberFormat(p).format(c);let h,k={},_=null;for(let t=0;t<g.length&&(h=g[t],k=n[h]||{},_=k[s],!v(_));t++)te(e,s,h,0,"number format");if(!v(_)||!d(h))return r?-1:s;let y=`${h}__${s}`;l(f)||(y=`${y}__${JSON.stringify(f)}`);let F=o.get(y);return F||(F=new Intl.NumberFormat(h,i({},_,f)),o.set(y,F)),m?F.formatToParts(c):F.format(c)}function ke(...e){const[t,n,r,a]=e;let s={},l={};if(!o(t))throw Error(14);const c=t;return d(n)?s.key=n:v(n)&&(s=n),d(r)?s.locale=r:v(r)&&(l=r),v(a)&&(l=a),[s.key||"",c,s,l]}function _e(e,t,n){const r=e;for(const e in n){const n=`${t}__${e}`;r.__numberFormatters.has(n)&&r.__numberFormatters.delete(n)}}const ve="9.1.10",ye=r("__transrateVNode"),Fe=r("__datetimeParts"),Le=r("__numberParts"),we=r("__setPluralRules"),Te=r("__injectWithOption");let Ce=0;function xe(e){return(n,r,a,o)=>e(r,a,t.getCurrentInstance()||void 0,o)}function Pe(e,t){const{messages:n,__i18n:r}=t,a=v(n)?n:p(r)?{}:{[e]:{}};if(p(r)&&r.forEach((({locale:e,resource:t})=>{e?(a[e]=a[e]||{},$e(t,a[e])):$e(t,a)})),t.flatJson)for(const e in a)m(a,e)&&x(a[e]);return a}const Oe=e=>!h(e)||p(e);function $e(e,t){if(Oe(e)||Oe(t))throw Error(20);for(const n in e)m(e,n)&&(Oe(e[n])||Oe(t[n])?t[n]=e[n]:$e(e[n],t[n]))}function Me(e={}){const{__root:n}=e,r=void 0===n;let a=!b(e.inheritLocale)||e.inheritLocale;const l=t.ref(n&&a?n.locale.value:d(e.locale)?e.locale:"en-US"),c=t.ref(n&&a?n.fallbackLocale.value:d(e.fallbackLocale)||p(e.fallbackLocale)||v(e.fallbackLocale)||!1===e.fallbackLocale?e.fallbackLocale:l.value),u=t.ref(Pe(l.value,e)),f=t.ref(v(e.datetimeFormats)?e.datetimeFormats:{[l.value]:{}}),m=t.ref(v(e.numberFormats)?e.numberFormats:{[l.value]:{}});let k=n?n.missingWarn:!b(e.missingWarn)&&!s(e.missingWarn)||e.missingWarn,_=n?n.fallbackWarn:!b(e.fallbackWarn)&&!s(e.fallbackWarn)||e.fallbackWarn,y=n?n.fallbackRoot:!b(e.fallbackRoot)||e.fallbackRoot,F=!!e.fallbackFormat,L=g(e.missing)?e.missing:null,w=g(e.missing)?xe(e.missing):null,T=g(e.postTranslation)?e.postTranslation:null,x=!b(e.warnHtmlMessage)||e.warnHtmlMessage,P=!!e.escapeParameter;const O=n?n.modifiers:v(e.modifiers)?e.modifiers:{};let $,M=e.pluralRules||n&&n.pluralRules;$=ee({version:ve,locale:l.value,fallbackLocale:c.value,messages:u.value,datetimeFormats:f.value,numberFormats:m.value,modifiers:O,pluralRules:M,missing:null===w?void 0:w,missingWarn:k,fallbackWarn:_,fallbackFormat:F,unresolving:!0,postTranslation:null===T?void 0:T,warnHtmlMessage:x,escapeParameter:P,__datetimeFormatters:v($)?$.__datetimeFormatters:void 0,__numberFormatters:v($)?$.__numberFormatters:void 0,__v_emitter:v($)?$.__v_emitter:void 0,__meta:{framework:"vue"}}),se($,l.value,c.value);const W=t.computed({get:()=>l.value,set:e=>{l.value=e,$.locale=l.value}}),I=t.computed({get:()=>c.value,set:e=>{c.value=e,$.fallbackLocale=c.value,se($,l.value,e)}}),N=t.computed((()=>u.value)),S=t.computed((()=>f.value)),E=t.computed((()=>m.value));function j(e,t,r,a,s,l){let c;if(c=e($),o(c)&&-1===c){const[e,r]=t();return n&&y?a(n):s(e)}if(l(c))return c;throw Error(14)}function H(...e){return j((t=>fe(t,...e)),(()=>pe(...e)),0,(t=>t.t(...e)),(e=>e),(e=>d(e)))}const R={normalize:function(e){return e.map((e=>d(e)?t.createVNode(t.Text,null,e,0):e))},interpolate:e=>e,type:"vnode"};function D(e){return u.value[e]||{}}Ce++,n&&(t.watch(n.locale,(e=>{a&&(l.value=e,$.locale=e,se($,l.value,c.value))})),t.watch(n.fallbackLocale,(e=>{a&&(c.value=e,$.fallbackLocale=e,se($,l.value,c.value))})));return{id:Ce,locale:W,fallbackLocale:I,get inheritLocale(){return a},set inheritLocale(e){a=e,e&&n&&(l.value=n.locale.value,c.value=n.fallbackLocale.value,se($,l.value,c.value))},get availableLocales(){return Object.keys(u.value).sort()},messages:N,datetimeFormats:S,numberFormats:E,get modifiers(){return O},get pluralRules(){return M||{}},get isGlobal(){return r},get missingWarn(){return k},set missingWarn(e){k=e,$.missingWarn=k},get fallbackWarn(){return _},set fallbackWarn(e){_=e,$.fallbackWarn=_},get fallbackRoot(){return y},set fallbackRoot(e){y=e},get fallbackFormat(){return F},set fallbackFormat(e){F=e,$.fallbackFormat=F},get warnHtmlMessage(){return x},set warnHtmlMessage(e){x=e,$.warnHtmlMessage=e},get escapeParameter(){return P},set escapeParameter(e){P=e,$.escapeParameter=e},t:H,rt:function(...e){const[t,n,r]=e;if(r&&!h(r))throw Error(15);return H(t,n,i({resolvedMessage:!0},r||{}))},d:function(...e){return j((t=>ge(t,...e)),(()=>de(...e)),0,(t=>t.d(...e)),(()=>""),(e=>d(e)))},n:function(...e){return j((t=>he(t,...e)),(()=>ke(...e)),0,(t=>t.n(...e)),(()=>""),(e=>d(e)))},te:function(e,t){return null!==C(D(d(t)?t:l.value),e)},tm:function(e){const t=function(e){let t=null;const n=ne($,c.value,l.value);for(let r=0;r<n.length;r++){const a=C(u.value[n[r]]||{},e);if(null!=a){t=a;break}}return t}(e);return null!=t?t:n&&n.tm(e)||{}},getLocaleMessage:D,setLocaleMessage:function(e,t){u.value[e]=t,$.messages=u.value},mergeLocaleMessage:function(e,t){u.value[e]=u.value[e]||{},$e(t,u.value[e]),$.messages=u.value},getDateTimeFormat:function(e){return f.value[e]||{}},setDateTimeFormat:function(e,t){f.value[e]=t,$.datetimeFormats=f.value,be($,e,t)},mergeDateTimeFormat:function(e,t){f.value[e]=i(f.value[e]||{},t),$.datetimeFormats=f.value,be($,e,t)},getNumberFormat:function(e){return m.value[e]||{}},setNumberFormat:function(e,t){m.value[e]=t,$.numberFormats=m.value,_e($,e,t)},mergeNumberFormat:function(e,t){m.value[e]=i(m.value[e]||{},t),$.numberFormats=m.value,_e($,e,t)},getPostTranslationHandler:function(){return g(T)?T:null},setPostTranslationHandler:function(e){T=e,$.postTranslation=e},getMissingHandler:function(){return L},setMissingHandler:function(e){null!==e&&(w=xe(e)),L=e,$.missing=w},[ye]:function(...e){return j((t=>{let n;const r=t;try{r.processor=R,n=fe(r,...e)}finally{r.processor=null}return n}),(()=>pe(...e)),0,(t=>t[ye](...e)),(e=>[t.createVNode(t.Text,null,e,0)]),(e=>p(e)))},[Le]:function(...e){return j((t=>he(t,...e)),(()=>ke(...e)),0,(t=>t[Le](...e)),(()=>[]),(e=>d(e)||p(e)))},[Fe]:function(...e){return j((t=>ge(t,...e)),(()=>de(...e)),0,(t=>t[Fe](...e)),(()=>[]),(e=>d(e)||p(e)))},[we]:function(e){M=e,$.pluralRules=M},[Te]:e.__injectWithOption}}function We(e={}){const t=Me(function(e){const t=d(e.locale)?e.locale:"en-US",n=d(e.fallbackLocale)||p(e.fallbackLocale)||v(e.fallbackLocale)||!1===e.fallbackLocale?e.fallbackLocale:t,r=g(e.missing)?e.missing:void 0,a=!b(e.silentTranslationWarn)&&!s(e.silentTranslationWarn)||!e.silentTranslationWarn,o=!b(e.silentFallbackWarn)&&!s(e.silentFallbackWarn)||!e.silentFallbackWarn,l=!b(e.fallbackRoot)||e.fallbackRoot,c=!!e.formatFallbackMessages,u=v(e.modifiers)?e.modifiers:{},f=e.pluralizationRules,m=g(e.postTranslation)?e.postTranslation:void 0,h=!d(e.warnHtmlInMessage)||"off"!==e.warnHtmlInMessage,k=!!e.escapeParameterHtml,_=!b(e.sync)||e.sync;let y=e.messages;if(v(e.sharedMessages)){const t=e.sharedMessages;y=Object.keys(t).reduce(((e,n)=>{const r=e[n]||(e[n]={});return i(r,t[n]),e}),y||{})}const{__i18n:F,__root:L,__injectWithOption:w}=e;return{locale:t,fallbackLocale:n,messages:y,flatJson:e.flatJson,datetimeFormats:e.datetimeFormats,numberFormats:e.numberFormats,missing:r,missingWarn:a,fallbackWarn:o,fallbackRoot:l,fallbackFormat:c,modifiers:u,pluralRules:f,postTranslation:m,warnHtmlMessage:h,escapeParameter:k,inheritLocale:_,__i18n:F,__root:L,__injectWithOption:w}}(e)),n={id:t.id,get locale(){return t.locale.value},set locale(e){t.locale.value=e},get fallbackLocale(){return t.fallbackLocale.value},set fallbackLocale(e){t.fallbackLocale.value=e},get messages(){return t.messages.value},get datetimeFormats(){return t.datetimeFormats.value},get numberFormats(){return t.numberFormats.value},get availableLocales(){return t.availableLocales},get formatter(){return{interpolate:()=>[]}},set formatter(e){},get missing(){return t.getMissingHandler()},set missing(e){t.setMissingHandler(e)},get silentTranslationWarn(){return b(t.missingWarn)?!t.missingWarn:t.missingWarn},set silentTranslationWarn(e){t.missingWarn=b(e)?!e:e},get silentFallbackWarn(){return b(t.fallbackWarn)?!t.fallbackWarn:t.fallbackWarn},set silentFallbackWarn(e){t.fallbackWarn=b(e)?!e:e},get modifiers(){return t.modifiers},get formatFallbackMessages(){return t.fallbackFormat},set formatFallbackMessages(e){t.fallbackFormat=e},get postTranslation(){return t.getPostTranslationHandler()},set postTranslation(e){t.setPostTranslationHandler(e)},get sync(){return t.inheritLocale},set sync(e){t.inheritLocale=e},get warnHtmlInMessage(){return t.warnHtmlMessage?"warn":"off"},set warnHtmlInMessage(e){t.warnHtmlMessage="off"!==e},get escapeParameterHtml(){return t.escapeParameter},set escapeParameterHtml(e){t.escapeParameter=e},get preserveDirectiveContent(){return!0},set preserveDirectiveContent(e){},get pluralizationRules(){return t.pluralRules||{}},__composer:t,t(...e){const[n,r,a]=e,o={};let s=null,l=null;if(!d(n))throw Error(15);const c=n;return d(r)?o.locale=r:p(r)?s=r:v(r)&&(l=r),p(a)?s=a:v(a)&&(l=a),t.t(c,s||l||{},o)},rt:(...e)=>t.rt(...e),tc(...e){const[n,r,a]=e,s={plural:1};let l=null,c=null;if(!d(n))throw Error(15);const i=n;return d(r)?s.locale=r:o(r)?s.plural=r:p(r)?l=r:v(r)&&(c=r),d(a)?s.locale=a:p(a)?l=a:v(a)&&(c=a),t.t(i,l||c||{},s)},te:(e,n)=>t.te(e,n),tm:e=>t.tm(e),getLocaleMessage:e=>t.getLocaleMessage(e),setLocaleMessage(e,n){t.setLocaleMessage(e,n)},mergeLocaleMessage(e,n){t.mergeLocaleMessage(e,n)},d:(...e)=>t.d(...e),getDateTimeFormat:e=>t.getDateTimeFormat(e),setDateTimeFormat(e,n){t.setDateTimeFormat(e,n)},mergeDateTimeFormat(e,n){t.mergeDateTimeFormat(e,n)},n:(...e)=>t.n(...e),getNumberFormat:e=>t.getNumberFormat(e),setNumberFormat(e,n){t.setNumberFormat(e,n)},mergeNumberFormat(e,n){t.mergeNumberFormat(e,n)},getChoiceIndex:(e,t)=>-1,__onComponentInstanceCreated(t){const{componentInstanceCreatedListener:r}=e;r&&r(t,n)}};return n}const Ie={tag:{type:[String,Object]},locale:{type:String},scope:{type:String,validator:e=>"parent"===e||"global"===e,default:"parent"},i18n:{type:Object}},Ne={name:"i18n-t",props:i({keypath:{type:String,required:!0},plural:{type:[Number,String],validator:e=>o(e)||!isNaN(e)}},Ie),setup(e,n){const{slots:r,attrs:a}=n,o=e.i18n||Ue({useScope:e.scope,__useComponent:!0}),s=Object.keys(r).filter((e=>"_"!==e));return()=>{const r={};e.locale&&(r.locale=e.locale),void 0!==e.plural&&(r.plural=d(e.plural)?+e.plural:e.plural);const l=function({slots:e},t){return 1===t.length&&"default"===t[0]?e.default?e.default():[]:t.reduce(((t,n)=>{const r=e[n];return r&&(t[n]=r()),t}),{})}(n,s),c=o[ye](e.keypath,l,r),u=i({},a);return d(e.tag)||h(e.tag)?t.h(e.tag,u,c):t.h(t.Fragment,u,c)}}};function Se(e,n,r,a){const{slots:o,attrs:s}=n;return()=>{const n={part:!0};let l={};e.locale&&(n.locale=e.locale),d(e.format)?n.key=e.format:h(e.format)&&(d(e.format.key)&&(n.key=e.format.key),l=Object.keys(e.format).reduce(((t,n)=>r.includes(n)?i({},t,{[n]:e.format[n]}):t),{}));const c=a(e.value,n,l);let u=[n.key];p(c)?u=c.map(((e,t)=>{const n=o[e.type];return n?n({[e.type]:e.value,index:t,parts:c}):[e.value]})):d(c)&&(u=[c]);const f=i({},s);return d(e.tag)||h(e.tag)?t.h(e.tag,f,u):t.h(t.Fragment,f,u)}}const Ee=["localeMatcher","style","unit","unitDisplay","currency","currencyDisplay","useGrouping","numberingSystem","minimumIntegerDigits","minimumFractionDigits","maximumFractionDigits","minimumSignificantDigits","maximumSignificantDigits","notation","formatMatcher"],je={name:"i18n-n",props:i({value:{type:Number,required:!0},format:{type:[String,Object]}},Ie),setup(e,t){const n=e.i18n||Ue({useScope:"parent",__useComponent:!0});return Se(e,t,Ee,((...e)=>n[Le](...e)))}},He=["dateStyle","timeStyle","fractionalSecondDigits","calendar","dayPeriod","numberingSystem","localeMatcher","timeZone","hour12","hourCycle","formatMatcher","weekday","era","year","month","day","hour","minute","second","timeZoneName"],Re={name:"i18n-d",props:i({value:{type:[Number,Date],required:!0},format:{type:[String,Object]}},Ie),setup(e,t){const n=e.i18n||Ue({useScope:"parent",__useComponent:!0});return Se(e,t,He,((...e)=>n[Fe](...e)))}};function De(e){const t=(t,{instance:n,value:r})=>{if(!n||!n.$)throw Error(22);const a=function(e,t){const n=e;if("composition"===e.mode)return n.__getInstance(t)||e.global;{const r=n.__getInstance(t);return null!=r?r.__composer:e.global.__composer}}(e,n.$),s=function(e){if(d(e))return{path:e};if(v(e)){if(!("path"in e))throw Error(19,"path");return e}throw Error(20)}(r);t.textContent=a.t(...function(e){const{path:t,locale:n,args:r,choice:a,plural:s}=e,l={},c=r||{};d(n)&&(l.locale=n);o(a)&&(l.plural=a);o(s)&&(l.plural=s);return[t,c,l]}(s))};return{beforeMount:t,beforeUpdate:t}}function Ae(e,t){e.locale=t.locale||e.locale,e.fallbackLocale=t.fallbackLocale||e.fallbackLocale,e.missing=t.missing||e.missing,e.silentTranslationWarn=t.silentTranslationWarn||e.silentFallbackWarn,e.silentFallbackWarn=t.silentFallbackWarn||e.silentFallbackWarn,e.formatFallbackMessages=t.formatFallbackMessages||e.formatFallbackMessages,e.postTranslation=t.postTranslation||e.postTranslation,e.warnHtmlInMessage=t.warnHtmlInMessage||e.warnHtmlInMessage,e.escapeParameterHtml=t.escapeParameterHtml||e.escapeParameterHtml,e.sync=t.sync||e.sync,e.__composer[we](t.pluralizationRules||e.pluralizationRules);const n=Pe(e.locale,{messages:t.messages,__i18n:t.__i18n});return Object.keys(n).forEach((t=>e.mergeLocaleMessage(t,n[t]))),t.datetimeFormats&&Object.keys(t.datetimeFormats).forEach((n=>e.mergeDateTimeFormat(n,t.datetimeFormats[n]))),t.numberFormats&&Object.keys(t.numberFormats).forEach((n=>e.mergeNumberFormat(n,t.numberFormats[n]))),e}function Ue(e={}){const n=t.getCurrentInstance();if(null==n)throw Error(16);if(!n.appContext.app.__VUE_I18N_SYMBOL__)throw Error(17);const r=t.inject(n.appContext.app.__VUE_I18N_SYMBOL__);if(!r)throw Error(22);const a="composition"===r.mode?r.global:r.global.__composer,o=l(e)?"__i18n"in n.type?"local":"global":e.useScope?e.useScope:"local";if("global"===o){let t=h(e.messages)?e.messages:{};"__i18nGlobal"in n.type&&(t=Pe(a.locale.value,{messages:t,__i18n:n.type.__i18nGlobal}));const r=Object.keys(t);if(r.length&&r.forEach((e=>{a.mergeLocaleMessage(e,t[e])})),h(e.datetimeFormats)){const t=Object.keys(e.datetimeFormats);t.length&&t.forEach((t=>{a.mergeDateTimeFormat(t,e.datetimeFormats[t])}))}if(h(e.numberFormats)){const t=Object.keys(e.numberFormats);t.length&&t.forEach((t=>{a.mergeNumberFormat(t,e.numberFormats[t])}))}return a}if("parent"===o){let t=function(e,t,n=!1){let r=null;const a=t.root;let o=t.parent;for(;null!=o;){const t=e;if("composition"===e.mode)r=t.__getInstance(o);else{const e=t.__getInstance(o);null!=e&&(r=e.__composer),n&&r&&!r[Te]&&(r=null)}if(null!=r)break;if(a===o)break;o=o.parent}return r}(r,n,e.__useComponent);return null==t&&(t=a),t}if("legacy"===r.mode)throw Error(18);const s=r;let c=s.__getInstance(n);if(null==c){const r=n.type,o=i({},e);r.__i18n&&(o.__i18n=r.__i18n),a&&(o.__root=a),c=Me(o),function(e,n,r){t.onMounted((()=>{}),n),t.onUnmounted((()=>{e.__deleteInstance(n)}),n)}(s,n),s.__setInstance(n,c)}return c}const ze=["locale","fallbackLocale","availableLocales"],Je=["t","rt","d","n","tm"];return Q=function(e,t={}){{const n=(t.onCacheKey||le)(e),r=ce[n];if(r)return r;let a=!1;const o=t.onError||N;t.onError=e=>{a=!0,o(e)};const{code:s}=Z(e,t),l=new Function(`return ${s}`)();return a?l:ce[n]=l}},e.DatetimeFormat=Re,e.NumberFormat=je,e.Translation=Ne,e.VERSION=ve,e.createI18n=function(e={}){const n=!b(e.legacy)||e.legacy,a=!!e.globalInjection,o=new Map,s=n?We(e):Me(e),l=r(""),c={get mode(){return n?"legacy":"composition"},async install(e,...r){e.__VUE_I18N_SYMBOL__=l,e.provide(e.__VUE_I18N_SYMBOL__,c),!n&&a&&function(e,n){const r=Object.create(null);ze.forEach((e=>{const a=Object.getOwnPropertyDescriptor(n,e);if(!a)throw Error(22);const o=t.isRef(a.value)?{get:()=>a.value.value,set(e){a.value.value=e}}:{get:()=>a.get&&a.get()};Object.defineProperty(r,e,o)})),e.config.globalProperties.$i18n=r,Je.forEach((t=>{const r=Object.getOwnPropertyDescriptor(n,t);if(!r||!r.value)throw Error(22);Object.defineProperty(e.config.globalProperties,`$${t}`,r)}))}(e,c.global),function(e,t,...n){const r=v(n[0])?n[0]:{},a=!!r.useI18nComponentName;(!b(r.globalInstall)||r.globalInstall)&&(e.component(a?"i18n":Ne.name,Ne),e.component(je.name,je),e.component(Re.name,Re)),e.directive("t",De(t))}(e,c,...r),n&&e.mixin(function(e,n,r){return{beforeCreate(){const a=t.getCurrentInstance();if(!a)throw Error(22);const o=this.$options;if(o.i18n){const t=o.i18n;o.__i18n&&(t.__i18n=o.__i18n),t.__root=n,this===this.$root?this.$i18n=Ae(e,t):(t.__injectWithOption=!0,this.$i18n=We(t))}else this.$i18n=o.__i18n?this===this.$root?Ae(e,o):We({__i18n:o.__i18n,__injectWithOption:!0,__root:n}):e;e.__onComponentInstanceCreated(this.$i18n),r.__setInstance(a,this.$i18n),this.$t=(...e)=>this.$i18n.t(...e),this.$rt=(...e)=>this.$i18n.rt(...e),this.$tc=(...e)=>this.$i18n.tc(...e),this.$te=(e,t)=>this.$i18n.te(e,t),this.$d=(...e)=>this.$i18n.d(...e),this.$n=(...e)=>this.$i18n.n(...e),this.$tm=e=>this.$i18n.tm(e)},mounted(){},beforeUnmount(){const e=t.getCurrentInstance();if(!e)throw Error(22);delete this.$t,delete this.$rt,delete this.$tc,delete this.$te,delete this.$d,delete this.$n,delete this.$tm,r.__deleteInstance(e),delete this.$i18n}}}(s,s.__composer,c))},get global(){return s},__instances:o,__getInstance:e=>o.get(e)||null,__setInstance(e,t){o.set(e,t)},__deleteInstance(e){o.delete(e)}};return c},e.useI18n=Ue,e.vTDirective=De,Object.defineProperty(e,"__esModule",{value:!0}),e}({},Vue);