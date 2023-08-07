function t(t,e,i,s){var n,r=arguments.length,o=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(o=(r<3?n(o):r>3?n(e,i,o):n(e,i))||o);return r>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=window,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),n=new WeakMap;class r{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}}const o=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,s))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var l;const a=window,c=a.trustedTypes,d=c?c.emptyScript:"",h=a.reactiveElementPolyfillSupport,u={toAttribute(t,e){switch(e){case Boolean:t=t?d:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},p=(t,e)=>e!==t&&(e==e||t==t),v={attribute:!0,type:String,converter:u,reflect:!1,hasChanged:p},$="finalized";class g extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Ep(i,e);void 0!==s&&(this._$Ev.set(s,i),t.push(s))})),t}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const n=this[t];this[e]=s,this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||v}static finalize(){if(this.hasOwnProperty($))return!1;this[$]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{i?t.adoptedStyleSheets=s.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):s.forEach((i=>{const s=document.createElement("style"),n=e.litNonce;void 0!==n&&s.setAttribute("nonce",n),s.textContent=i.cssText,t.appendChild(s)}))})(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=v){var s;const n=this.constructor._$Ep(t,i);if(void 0!==n&&!0===i.reflect){const r=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:u).toAttribute(e,i.type);this._$El=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,n=s._$Ev.get(t);if(void 0!==n&&this._$El!==n){const t=s.getPropertyOptions(n),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:u;this._$El=n,this[n]=r.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||p)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var m;g[$]=!0,g.elementProperties=new Map,g.elementStyles=[],g.shadowRootOptions={mode:"open"},null==h||h({ReactiveElement:g}),(null!==(l=a.reactiveElementVersions)&&void 0!==l?l:a.reactiveElementVersions=[]).push("1.6.3");const f=window,_=f.trustedTypes,y=_?_.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",b=`lit$${(Math.random()+"").slice(9)}$`,E="?"+b,S=`<${E}>`,w=document,x=()=>w.createComment(""),C=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,k="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,R=/>/g,T=RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,H=/"/g,O=/^(?:script|style|textarea|title)$/i,M=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),B=new WeakMap,D=w.createTreeWalker(w,129,null,!1);function I(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==y?y.createHTML(e):e}const V=(t,e)=>{const i=t.length-1,s=[];let n,r=2===e?"<svg>":"",o=P;for(let e=0;e<i;e++){const i=t[e];let l,a,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,a=o.exec(i),null!==a);)d=o.lastIndex,o===P?"!--"===a[1]?o=U:void 0!==a[1]?o=R:void 0!==a[2]?(O.test(a[2])&&(n=RegExp("</"+a[2],"g")),o=T):void 0!==a[3]&&(o=T):o===T?">"===a[0]?(o=null!=n?n:P,c=-1):void 0===a[1]?c=-2:(c=o.lastIndex-a[2].length,l=a[1],o=void 0===a[3]?T:'"'===a[3]?H:z):o===H||o===z?o=T:o===U||o===R?o=P:(o=T,n=void 0);const h=o===T&&t[e+1].startsWith("/>")?" ":"";r+=o===P?i+S:c>=0?(s.push(l),i.slice(0,c)+A+i.slice(c)+b+h):i+b+(-2===c?(s.push(void 0),e):h)}return[I(t,r+(t[i]||"<?>")+(2===e?"</svg>":"")),s]};class q{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,r=0;const o=t.length-1,l=this.parts,[a,c]=V(t,e);if(this.el=q.createElement(a,i),D.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=D.nextNode())&&l.length<o;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith(A)||e.startsWith(b)){const i=c[r++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+A).split(b),e=/([.?@])?(.*)/.exec(i);l.push({type:1,index:n,name:e[2],strings:t,ctor:"."===e[1]?Z:"?"===e[1]?F:"@"===e[1]?Q:J})}else l.push({type:6,index:n})}for(const e of t)s.removeAttribute(e)}if(O.test(s.tagName)){const t=s.textContent.split(b),e=t.length-1;if(e>0){s.textContent=_?_.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],x()),D.nextNode(),l.push({type:2,index:++n});s.append(t[e],x())}}}else if(8===s.nodeType)if(s.data===E)l.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(b,t+1));)l.push({type:7,index:n}),t+=b.length-1}n++}}static createElement(t,e){const i=w.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,s){var n,r,o,l;if(e===L)return e;let a=void 0!==s?null===(n=i._$Co)||void 0===n?void 0:n[s]:i._$Cl;const c=C(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==c&&(null===(r=null==a?void 0:a._$AO)||void 0===r||r.call(a,!1),void 0===c?a=void 0:(a=new c(t),a._$AT(t,i,s)),void 0!==s?(null!==(o=(l=i)._$Co)&&void 0!==o?o:l._$Co=[])[s]=a:i._$Cl=a),void 0!==a&&(e=G(t,a._$AS(t,e.values),a,s)),e}class W{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:s}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:w).importNode(i,!0);D.currentNode=n;let r=D.nextNode(),o=0,l=0,a=s[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new K(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new Y(r,this,t)),this._$AV.push(e),a=s[++l]}o!==(null==a?void 0:a.index)&&(r=D.nextNode(),o++)}return D.currentNode=w,n}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class K{constructor(t,e,i,s){var n;this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cp=null===(n=null==s?void 0:s.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),C(t)?t===j||null==t||""===t?(this._$AH!==j&&this._$AR(),this._$AH=j):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>N(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==j&&C(this._$AH)?this._$AA.nextSibling.data=t:this.$(w.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:s}=t,n="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=q.createElement(I(s.h,s.h[0]),this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.v(i);else{const t=new W(n,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=B.get(t.strings);return void 0===e&&B.set(t.strings,e=new q(t)),e}T(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new K(this.k(x()),this.k(x()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class J{constructor(t,e,i,s,n){this.type=1,this._$AH=j,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=j}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const n=this.strings;let r=!1;if(void 0===n)t=G(this,t,e,0),r=!C(t)||t!==this._$AH&&t!==L,r&&(this._$AH=t);else{const s=t;let o,l;for(t=n[0],o=0;o<n.length-1;o++)l=G(this,s[i+o],e,o),l===L&&(l=this._$AH[o]),r||(r=!C(l)||l!==this._$AH[o]),l===j?t=j:t!==j&&(t+=(null!=l?l:"")+n[o+1]),this._$AH[o]=l}r&&!s&&this.j(t)}j(t){t===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Z extends J{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===j?void 0:t}}const X=_?_.emptyScript:"";class F extends J{constructor(){super(...arguments),this.type=4}j(t){t&&t!==j?this.element.setAttribute(this.name,X):this.element.removeAttribute(this.name)}}class Q extends J{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=G(this,t,e,0))&&void 0!==i?i:j)===L)return;const s=this._$AH,n=t===j&&s!==j||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==j&&(s===j||n);n&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class Y{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const tt=f.litHtmlPolyfillSupport;null==tt||tt(q,K),(null!==(m=f.litHtmlVersions)&&void 0!==m?m:f.litHtmlVersions=[]).push("2.8.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var et,it;class st extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var s,n;const r=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let o=r._$litPart$;if(void 0===o){const t=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:null;r._$litPart$=o=new K(e.insertBefore(x(),t),t,void 0,null!=i?i:{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return L}}st.finalized=!0,st._$litElement$=!0,null===(et=globalThis.litElementHydrateSupport)||void 0===et||et.call(globalThis,{LitElement:st});const nt=globalThis.litElementPolyfillSupport;null==nt||nt({LitElement:st}),(null!==(it=globalThis.litElementVersions)&&void 0!==it?it:globalThis.litElementVersions=[]).push("3.3.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const rt=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}},ot=(t,e,i)=>{e.constructor.createProperty(i,t)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function lt(t){return function(t){return(e,i)=>void 0!==i?ot(t,e,i):rt(t,e)}({...t,state:!0})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var at;null===(at=window.HTMLSlotElement)||void 0===at||at.prototype.assignedElements;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct=1;class dt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ht=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends dt{constructor(t){var e;if(super(t),t.type!==ct||"class"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter((e=>t[e])).join(" ")+" "}update(t,[e]){var i,s;if(void 0===this.it){this.it=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in e)e[t]&&!(null===(i=this.nt)||void 0===i?void 0:i.has(t))&&this.it.add(t);return this.render(e)}const n=t.element.classList;this.it.forEach((t=>{t in e||(n.remove(t),this.it.delete(t))}));for(const t in e){const i=!!e[t];i===this.it.has(t)||(null===(s=this.nt)||void 0===s?void 0:s.has(t))||(i?(n.add(t),this.it.add(t)):(n.remove(t),this.it.delete(t)))}return L}});function ut(t){return new CustomEvent("oscd-edit",{composed:!0,bubbles:!0,detail:t})}const pt="https://transpower.com/SCL/SSD/SLD/v0",vt=["E","S","W","N"];const $t={E:"S",S:"W",W:"N",N:"E"};function gt(t){var e,i;const[s,n,r,o]=["x","y","w","h"].map((e=>{var i;return parseInt(null!==(i=t.getAttributeNS(pt,e))&&void 0!==i?i:"1",10)}));return{x:s,y:n,w:r,h:o,dir:function(t){const e=null==t?void 0:t.toUpperCase();return vt.includes(e)?e:"S"}(t.getAttributeNS(pt,"dir")),bus:["true","1"].includes(null!==(i=null===(e=t.getAttributeNS(pt,"bus"))||void 0===e?void 0:e.trim())&&void 0!==i?i:"false")}}const mt={SCL:["Substation"],Substation:["VoltageLevel"],VoltageLevel:["Bay"],Bay:["ConductingEquipment","Terminal"]};class ft extends st{constructor(){super(...arguments),this.editCount=-1,this.created=0}moveTo(t,e,i){console.log("moving",this.placing,"to",i,t,e),this.placing&&(this.placing.parentElement!==i&&"Terminal"!==this.placing.tagName&&this.dispatchEvent(ut({node:this.placing,parent:i})),this.dispatchEvent(ut({element:this.placing,attributes:{x:{namespaceURI:pt,value:t.toString()},y:{namespaceURI:pt,value:e.toString()}}})))}createAt(t,e,i){this.placing&&(this.placing.setAttributeNS(pt,"x",t.toString()),this.placing.setAttributeNS(pt,"y",e.toString()),this.placing.setAttributeNS(pt,"w","5"),this.placing.setAttributeNS(pt,"h","5"),this.placing.setAttribute("name",this.placing.tagName+this.created),this.created+=1,this.dispatchEvent(ut({node:this.placing,parent:i})))}placeAt(t,e,i){this.placing&&(this.placing.parentElement?this.moveTo(t,e,i):this.createAt(t,e,i),this.placing=void 0)}place(t){console.log("placing",t),this.resizing=void 0,this.placing=t}resizeTo(t,e){if(!this.resizing)return;const{x:i,y:s}=gt(this.resizing),n=Math.max(1,t-i+1).toString(),r=Math.max(1,e-s+1).toString();this.dispatchEvent(ut({element:this.resizing,attributes:{w:{namespaceURI:pt,value:n},h:{namespaceURI:pt,value:r}}})),this.resizing=void 0}resize(t){this.placing=void 0,this.resizing=t}rotate(t){if(!t)return;const{dir:e}=gt(t);this.dispatchEvent(ut({element:t,attributes:{dir:{namespaceURI:pt,value:$t[e]}}}))}renderResizeGrid(t,e,i){var s;return(null===(s=this.resizing)||void 0===s?void 0:s.parentElement)!==i?M``:new Array(e).fill(0).map(((e,i)=>new Array(t).fill(0).map(((t,e)=>M`<div
                @click=${()=>this.resizeTo(e+1,i+1)}
                class="clickable location"
                style="grid-column: ${e+1}; grid-row: ${i+1}"
              ></div>`))))}renderPlacementGrid(t,e,i){return function(t,e){var i,s,n;return null!==(n=null===(i=mt[t.tagName])||void 0===i?void 0:i.includes(null!==(s=null==e?void 0:e.tagName)&&void 0!==s?s:""))&&void 0!==n&&n}(i,this.placing)?new Array(e).fill(0).map(((e,s)=>new Array(t).fill(0).map(((t,e)=>M`<div
                @click=${()=>this.placeAt(e+1,s+1,i)}
                class="clickable location"
                style="grid-column: ${e+1}; grid-row: ${s+1}"
              ></div>`)))):M``}renderTerminal(t){const{x:e,y:i}=gt(t);return M`<div
      class="terminal"
      style="grid-column: ${e}; grid-row: ${i};"
      @click=${()=>this.place(t)}
    >
      ${t.getAttribute("cNodeName")}
    </div>`}renderEquipment(t){var e;const{x:i,y:s,dir:n}=gt(t),[r,o]=Array.from(null!==(e=t.children)&&void 0!==e?e:[]).filter((t=>"Terminal"===t.tagName));let[l,a,c,d]=[i,i,s,s];"S"===n?(c-=1,d+=1):"N"===n?(c+=1,d-=1):"E"===n?(l-=1,a+=1):"W"===n&&(l+=1,a-=1);const h=r?M`<div
          class="clickable terminal"
          style="grid-column: ${l}; grid-row: ${c};"
        >
          <abbr title="${r.getAttribute("connectivityNode")}"
            >${r.getAttribute("cNodeName")}</abbr
          >
        </div>`:void 0,u=o?M`<div
          class="clickable terminal"
          style="grid-column: ${a}; grid-row: ${d};"
        >
          <abbr title="${o.getAttribute("connectivityNode")}"
            >${o.getAttribute("cNodeName")}</abbr
          >
        </div>`:void 0;return M`<div
        class="clickable equipment"
        style="grid-column: ${i}; grid-row: ${s};"
        @click=${()=>this.place(t)}
        @contextmenu=${e=>{e.preventDefault(),this.rotate(t)}}
      >
        <abbr title=${t.getAttribute("name")}
          >${t.getAttribute("type")}</abbr
        >
      </div>
      ${h} ${u}`}renderBay(t){var e;const{x:i,y:s,w:n,h:r,bus:o}=gt(t),l=Array.from(null!==(e=t.children)&&void 0!==e?e:[]).filter((t=>"ConductingEquipment"===t.tagName));return M`<section
      class="${ht({bus:o,bay:!o,moving:this.placing===t})}"
      style="grid-column: ${i} / span ${n}; grid-row: ${s} / span ${r};"
    >
      <span
        class="clickable label"
        @click=${()=>this.place(t)}
        @contextmenu=${e=>{e.preventDefault(),this.resize(t)}}
      >
        ${t.getAttribute("name")}
      </span>
      ${l.map((t=>this.renderEquipment(t)))}
      ${o?j:this.renderPlacementGrid(n,r,t)}
      ${this.renderResizeGrid(n,r,t)}
    </section>`}renderVoltageLevel(t){var e;const{x:i,y:s,w:n,h:r}=gt(t),o=Array.from(null!==(e=t.children)&&void 0!==e?e:[]).filter((t=>"Bay"===t.tagName));return M`<section
      class="voltagelevel"
      style="grid-column: ${i} / span ${n}; grid-row: ${s} / span ${r};"
    >
      <span
        class="clickable label"
        @click=${()=>this.place(t)}
        @contextmenu=${e=>{e.preventDefault(),this.resize(t)}}
        >${t.getAttribute("name")}</span
      >
      ${o.map((t=>this.renderBay(t)))}
      ${this.renderPlacementGrid(n,r,t)}
      ${this.renderResizeGrid(n,r,t)}
    </section>`}renderSubstation(t){var e;const{x:i,y:s,w:n,h:r}=gt(t),o=Array.from(null!==(e=t.children)&&void 0!==e?e:[]).filter((t=>"VoltageLevel"===t.tagName));return M`<section
      class="substation"
      style="grid-column: ${i} / span ${n}; grid-row: ${s} / span ${r};"
    >
      <span
        class="clickable label"
        @click=${()=>this.place(t)}
        @contextmenu=${e=>{e.preventDefault(),this.resize(t)}}
        >${t.getAttribute("name")}</span
      >
      ${o.map((t=>this.renderVoltageLevel(t)))}
      ${this.renderPlacementGrid(n,r,t)}
      ${this.renderResizeGrid(n,r,t)}
    </section>`}render(){var t,e,i,s,n;const r=Array.from(null!==(e=null===(t=this.doc)||void 0===t?void 0:t.documentElement.children)&&void 0!==e?e:[]).filter((t=>"Substation"===t.tagName&&Array.from(t.attributes).map((t=>t.value)).includes(pt))),o=Math.max(...r.map((t=>{const{y:e,h:i}=gt(t);return e+i+15}))),l=Math.max(...r.map((t=>{const{x:e,w:i}=gt(t);return e+i+15})));return M` <menu>
        <li>
          <button
            @click=${()=>{var t;const e=null===(t=this.doc)||void 0===t?void 0:t.createElement("Substation");null==e||e.setAttribute("xmlns:esld",pt),this.place(e)}}
          >
            S
          </button>
        </li>
        <li>
          <button
            @click=${()=>{var t;return this.place(null===(t=this.doc)||void 0===t?void 0:t.createElement("VoltageLevel"))}}
          >
            V
          </button>
        </li>
        <li>
          <button @click=${()=>{var t;return this.place(null===(t=this.doc)||void 0===t?void 0:t.createElement("Bay"))}}>
            B
          </button>
        </li>
        <li>
          <button
            @click=${()=>{var t;return this.place(null===(t=this.doc)||void 0===t?void 0:t.createElement("ConductingEquipment"))}}
          >
            E
          </button>
        </li>
        <li>
          <button
            @click=${()=>{this.placing=void 0}}
          >
            X
          </button>
        </li>
      </menu>
      <main>
        ${r.map((t=>this.renderSubstation(t)))}
        ${(null===(i=this.doc)||void 0===i?void 0:i.documentElement)?[this.renderPlacementGrid(l,o,null===(s=this.doc)||void 0===s?void 0:s.documentElement),this.renderResizeGrid(l,o,null===(n=this.doc)||void 0===n?void 0:n.documentElement)]:j}
      </main>`}}ft.styles=((t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return new r(i,t,s)})`
    menu {
      position: fixed;
      bottom: 20px;
      left: 20px;
      list-style-type: none;
      display: flex;
      padding: 0;
      margin: 0;
      gap: 5px;
      z-index: 100;
    }

    main,
    section {
      margin: 0px;
      padding: 0px;
      border: 0px;
      display: grid;
      grid-auto-columns: ${24}px;
      grid-auto-rows: ${24}px;
      font-size: ${20}px;
      background: white;
      pointer-events: none;
    }

    main {
      padding-right: 16px;
      padding-bottom: 16px;
      min-width: max-content;
      min-height: max-content;
    }

    .clickable {
      pointer-events: auto;
    }

    .label {
      position: relative;
      top: -${24}px;
      grid-row: 1;
      grid-column: 1;
      overflow-x: visible;
      white-space: nowrap;
    }

    .moving {
      opacity: 0.3;
    }

    div.location {
      outline: 0.5px rgba(0, 0, 0, 0.2) dotted;
      z-index: 1;
    }

    main > div.location:hover {
      outline: 2px lightblue solid;
    }

    section.substation {
      outline: 2px lightblue solid;
    }

    section.substation > div.location:hover {
      outline: 2px lightgreen solid;
    }

    section.voltagelevel {
      outline: 2px lightgreen solid;
    }

    section.voltagelevel > div.location:hover {
      outline: 2px blue dashed;
    }

    section.bay {
      outline: 2px blue dashed;
    }

    section.bay > div.location:hover {
      background: grey;
    }

    section.bus {
      background: none;
      border-bottom: ${6}px orange solid;
    }

    div {
      direction: rtl;
      overflow: hidden;
      font-size: 50%;
    }

    div.equipment {
      font-weight: 700;
    }

    div.terminal {
      color: grey;
    }
  `,t([lt()],ft.prototype,"doc",void 0),t([lt()],ft.prototype,"editCount",void 0),t([lt()],ft.prototype,"placing",void 0),t([lt()],ft.prototype,"resizing",void 0);export{ft as default};
//# sourceMappingURL=oscd-designer.js.map
