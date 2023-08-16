function t(t,e,i,n){var r,s=arguments.length,o=s<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,n);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=window,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;class s{constructor(t,e,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}}const o=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,n))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var l;const a=window,c=a.trustedTypes,d=c?c.emptyScript:"",u=a.reactiveElementPolyfillSupport,h={toAttribute(t,e){switch(e){case Boolean:t=t?d:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},p=(t,e)=>e!==t&&(e==e||t==t),m={attribute:!0,type:String,converter:h,reflect:!1,hasChanged:p},S="finalized";class y extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const n=this._$Ep(i,e);void 0!==n&&(this._$Ev.set(n,i),t.push(n))})),t}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,n=this.getPropertyDescriptor(t,i,e);void 0!==n&&Object.defineProperty(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(n){const r=this[t];this[e]=n,this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||m}static finalize(){if(this.hasOwnProperty(S))return!1;this[S]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const n=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,n)=>{i?t.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((i=>{const n=document.createElement("style"),r=e.litNonce;void 0!==r&&n.setAttribute("nonce",r),n.textContent=i.cssText,t.appendChild(n)}))})(n,this.constructor.elementStyles),n}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=m){var n;const r=this.constructor._$Ep(t,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==(null===(n=i.converter)||void 0===n?void 0:n.toAttribute)?i.converter:h).toAttribute(e,i.type);this._$El=t,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$El=null}}_$AK(t,e){var i;const n=this.constructor,r=n._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=n.getPropertyOptions(r),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:h;this._$El=r,this[r]=s.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let n=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||p)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):n=!1),!this.isUpdatePending&&n&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var v;y[S]=!0,y.elementProperties=new Map,y.elementStyles=[],y.shadowRootOptions={mode:"open"},null==u||u({ReactiveElement:y}),(null!==(l=a.reactiveElementVersions)&&void 0!==l?l:a.reactiveElementVersions=[]).push("1.6.3");const g=window,f=g.trustedTypes,$=f?f.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",b=`lit$${(Math.random()+"").slice(9)}$`,E="?"+b,C=`<${E}>`,N=document,x=()=>N.createComment(""),k=t=>null===t||"object"!=typeof t&&"function"!=typeof t,L=Array.isArray,w="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,T=/>/g,P=RegExp(`>|${w}(?:([^\\s"'>=/]+)(${w}*=${w}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),q=/'/g,R=/"/g,V=/^(?:script|style|textarea|title)$/i,O=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),I=O(1),M=O(2),G=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),H=new WeakMap,U=N.createTreeWalker(N,129,null,!1);function F(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==$?$.createHTML(e):e}const j=(t,e)=>{const i=t.length-1,n=[];let r,s=2===e?"<svg>":"",o=D;for(let e=0;e<i;e++){const i=t[e];let l,a,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,a=o.exec(i),null!==a);)d=o.lastIndex,o===D?"!--"===a[1]?o=_:void 0!==a[1]?o=T:void 0!==a[2]?(V.test(a[2])&&(r=RegExp("</"+a[2],"g")),o=P):void 0!==a[3]&&(o=P):o===P?">"===a[0]?(o=null!=r?r:D,c=-1):void 0===a[1]?c=-2:(c=o.lastIndex-a[2].length,l=a[1],o=void 0===a[3]?P:'"'===a[3]?R:q):o===R||o===q?o=P:o===_||o===T?o=D:(o=P,r=void 0);const u=o===P&&t[e+1].startsWith("/>")?" ":"";s+=o===D?i+C:c>=0?(n.push(l),i.slice(0,c)+A+i.slice(c)+b+u):i+b+(-2===c?(n.push(void 0),e):u)}return[F(t,s+(t[i]||"<?>")+(2===e?"</svg>":"")),n]};class z{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let r=0,s=0;const o=t.length-1,l=this.parts,[a,c]=j(t,e);if(this.el=z.createElement(a,i),U.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(n=U.nextNode())&&l.length<o;){if(1===n.nodeType){if(n.hasAttributes()){const t=[];for(const e of n.getAttributeNames())if(e.endsWith(A)||e.startsWith(b)){const i=c[s++];if(t.push(e),void 0!==i){const t=n.getAttribute(i.toLowerCase()+A).split(b),e=/([.?@])?(.*)/.exec(i);l.push({type:1,index:r,name:e[2],strings:t,ctor:"."===e[1]?Z:"?"===e[1]?Q:"@"===e[1]?tt:K})}else l.push({type:6,index:r})}for(const e of t)n.removeAttribute(e)}if(V.test(n.tagName)){const t=n.textContent.split(b),e=t.length-1;if(e>0){n.textContent=f?f.emptyScript:"";for(let i=0;i<e;i++)n.append(t[i],x()),U.nextNode(),l.push({type:2,index:++r});n.append(t[e],x())}}}else if(8===n.nodeType)if(n.data===E)l.push({type:2,index:r});else{let t=-1;for(;-1!==(t=n.data.indexOf(b,t+1));)l.push({type:7,index:r}),t+=b.length-1}r++}}static createElement(t,e){const i=N.createElement("template");return i.innerHTML=t,i}}function W(t,e,i=t,n){var r,s,o,l;if(e===G)return e;let a=void 0!==n?null===(r=i._$Co)||void 0===r?void 0:r[n]:i._$Cl;const c=k(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==c&&(null===(s=null==a?void 0:a._$AO)||void 0===s||s.call(a,!1),void 0===c?a=void 0:(a=new c(t),a._$AT(t,i,n)),void 0!==n?(null!==(o=(l=i)._$Co)&&void 0!==o?o:l._$Co=[])[n]=a:i._$Cl=a),void 0!==a&&(e=W(t,a._$AS(t,e.values),a,n)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:n}=this._$AD,r=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:N).importNode(i,!0);U.currentNode=r;let s=U.nextNode(),o=0,l=0,a=n[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new Y(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new et(s,this,t)),this._$AV.push(e),a=n[++l]}o!==(null==a?void 0:a.index)&&(s=U.nextNode(),o++)}return U.currentNode=N,r}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{constructor(t,e,i,n){var r;this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cp=null===(r=null==n?void 0:n.isConnected)||void 0===r||r}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=W(this,t,e),k(t)?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==G&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>L(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==B&&k(this._$AH)?this._$AA.nextSibling.data=t:this.$(N.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:n}=t,r="number"==typeof n?this._$AC(t):(void 0===n.el&&(n.el=z.createElement(F(n.h,n.h[0]),this.options)),n);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===r)this._$AH.v(i);else{const t=new X(r,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=H.get(t.strings);return void 0===e&&H.set(t.strings,e=new z(t)),e}T(t){L(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,n=0;for(const r of t)n===e.length?e.push(i=new Y(this.k(x()),this.k(x()),this,this.options)):i=e[n],i._$AI(r),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class K{constructor(t,e,i,n,r){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=B}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,n){const r=this.strings;let s=!1;if(void 0===r)t=W(this,t,e,0),s=!k(t)||t!==this._$AH&&t!==G,s&&(this._$AH=t);else{const n=t;let o,l;for(t=r[0],o=0;o<r.length-1;o++)l=W(this,n[i+o],e,o),l===G&&(l=this._$AH[o]),s||(s=!k(l)||l!==this._$AH[o]),l===B?t=B:t!==B&&(t+=(null!=l?l:"")+r[o+1]),this._$AH[o]=l}s&&!n&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Z extends K{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}const J=f?f.emptyScript:"";class Q extends K{constructor(){super(...arguments),this.type=4}j(t){t&&t!==B?this.element.setAttribute(this.name,J):this.element.removeAttribute(this.name)}}class tt extends K{constructor(t,e,i,n,r){super(t,e,i,n,r),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=W(this,t,e,0))&&void 0!==i?i:B)===G)return;const n=this._$AH,r=t===B&&n!==B||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==B&&(n===B||r);r&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class et{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){W(this,t)}}const it=g.litHtmlPolyfillSupport;null==it||it(z,Y),(null!==(v=g.litHtmlVersions)&&void 0!==v?v:g.litHtmlVersions=[]).push("2.8.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var nt,rt;class st extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var n,r;const s=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:e;let o=s._$litPart$;if(void 0===o){const t=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:null;s._$litPart$=o=new Y(e.insertBefore(x(),t),t,void 0,null!=i?i:{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return G}}st.finalized=!0,st._$litElement$=!0,null===(nt=globalThis.litElementHydrateSupport)||void 0===nt||nt.call(globalThis,{LitElement:st});const ot=globalThis.litElementPolyfillSupport;null==ot||ot({LitElement:st}),(null!==(rt=globalThis.litElementVersions)&&void 0!==rt?rt:globalThis.litElementVersions=[]).push("3.3.3");
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt=Symbol.for(""),at=t=>{if((null==t?void 0:t.r)===lt)return null==t?void 0:t._$litStatic$},ct=new Map,dt=(t=>(e,...i)=>{const n=i.length;let r,s;const o=[],l=[];let a,c=0,d=!1;for(;c<n;){for(a=e[c];c<n&&void 0!==(s=i[c],r=at(s));)a+=r+e[++c],d=!0;c!==n&&l.push(s),o.push(a),c++}if(c===n&&o.push(e[n]),d){const t=o.join("$$lit$$");void 0===(e=ct.get(t))&&(o.raw=o,ct.set(t,e=o)),i=l}return t(e,...i)})(M),ut=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}},ht=(t,e,i)=>{e.constructor.createProperty(i,t)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function pt(t){return function(t){return(e,i)=>void 0!==i?ht(t,e,i):ut(t,e)}({...t,state:!0})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var mt;function St(t){return new CustomEvent("oscd-edit",{composed:!0,bubbles:!0,detail:t})}null===(mt=window.HTMLSlotElement)||void 0===mt||mt.prototype.assignedElements;const yt=["TransformerWinding","ConductingEquipment"],vt=["GeneralEquipment","PowerTransformer",...yt],gt=["Substation","VoltageLevel","Bay"],ft=["Process","Line"],$t=["EqSubFunction","EqFunction"],At=["ConnectivityNode",...["SubFunction","Function","TapChanger","SubEquipment",...vt,...gt,...ft,...$t]],bt=["LN0","LN"],Et=["GSSE","GOOSE","ConfReportControl","SMVsc","DynDataSet","ConfDataSet"],Ct=[...["SCL",...["SubNetwork","GOOSESecurity","SMVSecurity",...At],...["ConnectedAP","PhysConn","SDO","DO","DAI","SDI","DOI","Inputs","RptEnabled","Server","ServerAt","SettingControl","Communication","Log","LDevice","DataSet","AccessPoint","IED","NeutralPoint",...["SampledValueControl","GSEControl","LogControl","ReportControl"],"GSE","SMV","BDA","DA"],"LNodeType","DOType","DAType","EnumType"],"Text","Private","Hitem","AccessControl","Header","LNode","Val","Voltage","Services","Subject","IssuerName","MinTime","MaxTime","Association","FCDA","ClientLN","IEDName","ExtRef","Protocol",...bt,"FileHandling","TimeSyncProt","CommProt","SGEdit","ConfSG","GetDirectory","GetDataObjectDefinition","DataObjectDirectory","GetDataSetValue","SetDataSetValue","DataSetDirectory","ReadWrite","TimerActivatedControl","GetCBValues","GSEDir","ConfLdName","DynAssociation","SettingGroups",...Et,"ConfLogControl","ConfSigRef","ReportSettings","LogSettings","GSESettings","SMVSettings","ConfLNs","ClientServices","SupSubscription","ValueHandling","RedProt","McSecurity","KDC","Address","P","ProtNs","EnumVal","Terminal","BitRate","Authentication","DataTypeTemplates","History","OptFields","SmvOpts","TrgOps","SamplesPerSec","SmpRate","SecPerSamples"],Nt=["Text","Private"],xt=[...Nt],kt=[...Nt],Lt=[...Nt],wt=[...kt,"Val"],Dt=[...xt,"LNode"],_t=[...Dt],Tt=[..._t],Pt=[..._t,"PowerTransformer","GeneralEquipment"],qt=[...Tt,"Terminal"],Rt=[...kt,"Address"],Vt=[...xt],Ot=[...Vt,"IEDName"],It=[...kt,"DataSet","ReportControl","LogControl","DOI","Inputs","Log"],Mt=[..._t,"GeneralEquipment","Function"],Gt=[...Vt,"TrgOps"],Bt=[..._t,"GeneralEquipment","EqSubFunction"],Ht={AccessControl:{parents:["LDevice"],children:[]},AccessPoint:{parents:["IED"],children:[...xt,"Server","LN","ServerAt","Services","GOOSESecurity","SMVSecurity"]},Address:{parents:["ConnectedAP","GSE","SMV"],children:["P"]},Association:{parents:["Server"],children:[]},Authentication:{parents:["Server"],children:[]},BDA:{parents:["DAType"],children:[...wt]},BitRate:{parents:["SubNetwork"],children:[]},Bay:{parents:["VoltageLevel"],children:[...Pt,"ConductingEquipment","ConnectivityNode","Function"]},ClientLN:{parents:["RptEnabled"],children:[]},ClientServices:{parents:["Services"],children:["TimeSyncProt","McSecurity"]},CommProt:{parents:["Services"],children:[]},Communication:{parents:["SCL"],children:[...kt,"SubNetwork"]},ConductingEquipment:{parents:["Process","Line","SubFunction","Function","Bay"],children:[...qt,"EqFunction","SubEquipment"]},ConfDataSet:{parents:["Services"],children:[]},ConfLdName:{parents:["Services"],children:[]},ConfLNs:{parents:["Services"],children:[]},ConfLogControl:{parents:["Services"],children:[]},ConfReportControl:{parents:["Services"],children:[]},ConfSG:{parents:["SettingGroups"],children:[]},ConfSigRef:{parents:["Services"],children:[]},ConnectedAP:{parents:["SubNetwork"],children:[...kt,"Address","GSE","SMV","PhysConn"]},ConnectivityNode:{parents:["Bay","Line"],children:[...Dt]},DA:{parents:["DOType"],children:[...wt]},DAI:{parents:["DOI","SDI"],children:[...kt,"Val"]},DAType:{parents:["DataTypeTemplates"],children:[...Lt,"BDA","ProtNs"]},DO:{parents:["LNodeType"],children:[...kt]},DOI:{parents:[...bt],children:[...kt,"SDI","DAI"]},DOType:{parents:["DataTypeTemplates"],children:[...Lt,"SDO","DA"]},DataObjectDirectory:{parents:["Services"],children:[]},DataSet:{parents:[...bt],children:[...xt,"FCDA"]},DataSetDirectory:{parents:["Services"],children:[]},DataTypeTemplates:{parents:["SCL"],children:["LNodeType","DOType","DAType","EnumType"]},DynAssociation:{parents:["Services"],children:[]},DynDataSet:{parents:["Services"],children:[]},EnumType:{parents:["DataTypeTemplates"],children:[...Lt,"EnumVal"]},EnumVal:{parents:["EnumType"],children:[]},EqFunction:{parents:["GeneralEquipment","TapChanger","TransformerWinding","PowerTransformer","SubEquipment","ConductingEquipment"],children:[...Bt]},EqSubFunction:{parents:["EqSubFunction","EqFunction"],children:[...Bt]},ExtRef:{parents:["Inputs"],children:[]},FCDA:{parents:["DataSet"],children:[]},FileHandling:{parents:["Services"],children:[]},Function:{parents:["Bay","VoltageLevel","Substation","Process","Line"],children:[..._t,"SubFunction","GeneralEquipment","ConductingEquipment"]},GeneralEquipment:{parents:["SubFunction","Function",...ft,...$t,...gt],children:[...Tt,"EqFunction"]},GetCBValues:{parents:["Services"],children:[]},GetDataObjectDefinition:{parents:["Services"],children:[]},GetDataSetValue:{parents:["Services"],children:[]},GetDirectory:{parents:["Services"],children:[]},GOOSE:{parents:["Services"],children:[]},GOOSESecurity:{parents:["AccessPoint"],children:[...xt,"Subject","IssuerName"]},GSE:{parents:["ConnectedAP"],children:[...Rt,"MinTime","MaxTime"]},GSEDir:{parents:["Services"],children:[]},GSEControl:{parents:["LN0"],children:[...Ot,"Protocol"]},GSESettings:{parents:["Services"],children:[]},GSSE:{parents:["Services"],children:[]},Header:{parents:["SCL"],children:["Text","History"]},History:{parents:["Header"],children:["Hitem"]},Hitem:{parents:["History"],children:[]},IED:{parents:["SCL"],children:[...kt,"Services","AccessPoint","KDC"]},IEDName:{parents:["GSEControl","SampledValueControl"],children:[]},Inputs:{parents:[...bt],children:[...kt,"ExtRef"]},IssuerName:{parents:["GOOSESecurity","SMVSecurity"],children:[]},KDC:{parents:["IED"],children:[]},LDevice:{parents:["Server"],children:[...kt,"LN0","LN","AccessControl"]},LN:{parents:["AccessPoint","LDevice"],children:[...It]},LN0:{parents:["LDevice"],children:[...It,"GSEControl","SampledValueControl","SettingControl"]},LNode:{parents:[...At],children:[...kt]},LNodeType:{parents:["DataTypeTemplates"],children:[...Lt,"DO"]},Line:{parents:["Process","SCL"],children:[...Mt,"Voltage","ConductingEquipment"]},Log:{parents:[...bt],children:[...kt]},LogControl:{parents:[...bt],children:[...Gt]},LogSettings:{parents:["Services"],children:[]},MaxTime:{parents:["GSE"],children:[]},McSecurity:{parents:["GSESettings","SMVSettings","ClientServices"],children:[]},MinTime:{parents:["GSE"],children:[]},NeutralPoint:{parents:["TransformerWinding"],children:[...kt]},OptFields:{parents:["ReportControl"],children:[]},P:{parents:["Address","PhysConn"],children:[]},PhysConn:{parents:["ConnectedAP"],children:[...kt,"P"]},PowerTransformer:{parents:[...gt],children:[...Tt,"TransformerWinding","SubEquipment","EqFunction"]},Private:{parents:[],children:[]},Process:{parents:["Process","SCL"],children:[...Mt,"ConductingEquipment","Substation","Line","Process"]},ProtNs:{parents:["DAType","DA"],children:[]},Protocol:{parents:["GSEControl","SampledValueControl"],children:[]},ReadWrite:{parents:["Services"],children:[]},RedProt:{parents:["Services"],children:[]},ReportControl:{parents:[...bt],children:[...Gt,"OptFields","RptEnabled"]},ReportSettings:{parents:["Services"],children:[]},RptEnabled:{parents:["ReportControl"],children:[...kt,"ClientLN"]},SamplesPerSec:{parents:["SMVSettings"],children:[]},SampledValueControl:{parents:["LN0"],children:[...Ot,"SmvOpts"]},SecPerSamples:{parents:["SMVSettings"],children:[]},SCL:{parents:[],children:[...Nt,"Header","Substation","Communication","IED","DataTypeTemplates","Line","Process"]},SDI:{parents:["DOI","SDI"],children:[...kt,"SDI","DAI"]},SDO:{parents:["DOType"],children:[...xt]},Server:{parents:["AccessPoint"],children:[...kt,"Authentication","LDevice","Association"]},ServerAt:{parents:["AccessPoint"],children:[...kt]},Services:{parents:["IED","AccessPoint"],children:["DynAssociation","SettingGroups","GetDirectory","GetDataObjectDefinition","DataObjectDirectory","GetDataSetValue","SetDataSetValue","DataSetDirectory","ConfDataSet","DynDataSet","ReadWrite","TimerActivatedControl","ConfReportControl","GetCBValues","ConfLogControl","ReportSettings","LogSettings","GSESettings","SMVSettings","GSEDir","GOOSE","GSSE","SMVsc","FileHandling","ConfLNs","ClientServices","ConfLdName","SupSubscription","ConfSigRef","ValueHandling","RedProt","TimeSyncProt","CommProt"]},SetDataSetValue:{parents:["Services"],children:[]},SettingControl:{parents:["LN0"],children:[...kt]},SettingGroups:{parents:["Services"],children:["SGEdit","ConfSG"]},SGEdit:{parents:["SettingGroups"],children:[]},SmpRate:{parents:["SMVSettings"],children:[]},SMV:{parents:["ConnectedAP"],children:[...Rt]},SmvOpts:{parents:["SampledValueControl"],children:[]},SMVsc:{parents:["Services"],children:[]},SMVSecurity:{parents:["AccessPoint"],children:[...xt,"Subject","IssuerName"]},SMVSettings:{parents:["Services"],children:["SmpRate","SamplesPerSec","SecPerSamples","McSecurity"]},SubEquipment:{parents:["TapChanger","PowerTransformer","ConductingEquipment","TransformerWinding",...yt],children:[..._t,"EqFunction"]},SubFunction:{parents:["SubFunction","Function"],children:[..._t,"GeneralEquipment","ConductingEquipment","SubFunction"]},SubNetwork:{parents:["Communication"],children:[...xt,"BitRate","ConnectedAP"]},Subject:{parents:["GOOSESecurity","SMVSecurity"],children:[]},Substation:{parents:["SCL"],children:[...Pt,"VoltageLevel","Function"]},SupSubscription:{parents:["Services"],children:[]},TapChanger:{parents:["TransformerWinding"],children:[..._t,"SubEquipment","EqFunction"]},Terminal:{parents:[...vt],children:[...kt]},Text:{parents:Ct.filter((t=>"Text"!==t&&"Private"!==t)),children:[]},TimerActivatedControl:{parents:["Services"],children:[]},TimeSyncProt:{parents:["Services","ClientServices"],children:[]},TransformerWinding:{parents:["PowerTransformer"],children:[...qt,"TapChanger","NeutralPoint","EqFunction","SubEquipment"]},TrgOps:{parents:["ReportControl"],children:[]},Val:{parents:["DAI","DA","BDA"],children:[]},ValueHandling:{parents:["Services"],children:[]},Voltage:{parents:["VoltageLevel"],children:[]},VoltageLevel:{parents:["Substation"],children:[...Pt,"Voltage","Bay","Function"]}},Ut=new Set(Ct);function Ft(t){return Ut.has(t)}function jt(t,e){if(!Ft(e))return null;const i=t.tagName,n=Array.from(t.children);if("Services"===i||"SettingGroups"===i||!Ft(i))return n.find((t=>t.tagName===e))??null;const r=Ht[i].children;let s,o=r.findIndex((t=>t===e));if(o<0)return null;for(;o<r.length&&!s;)s=n.find((t=>t.tagName===r[o])),o+=1;return s??null}function zt(t){return`${Qt(t.parentElement)}>${t.getAttribute("connectivityNode")}`}function Wt(t){const[e,i]=["name","ix"].map((e=>t.getAttribute(e)));return`${Qt(t.parentElement)}>${e}${i?`[${i}]`:""}`}function Xt(t){const[e,i]=["ldInst","cbName"].map((e=>t.getAttribute(e)));return`${e} ${i}`}function Yt(t){return"SCL"===t.parentElement.tagName?t.getAttribute("name"):`${Qt(t.parentElement)}>${t.getAttribute("name")}`}function Kt(t){return Qt(t.parentElement).toString()}function Zt(t){return`#${t.id}`}const Jt={AccessControl:{identity:Kt},AccessPoint:{identity:Yt},Address:{identity:Kt},Association:{identity:function(t){const[e,i,n,r,s]=["iedName","ldInst","prefix","lnClass","lnInst","lnType"].map((e=>t.getAttribute(e)));return`${Qt(t.parentElement)}>${e} ${i}/${n??""} ${r} ${s??""}`}},Authentication:{identity:Kt},BDA:{identity:Yt},BitRate:{identity:Kt},Bay:{identity:Yt},ClientLN:{identity:function(t){const[e,i,n,r,s,o]=["apRef","iedName","ldInst","prefix","lnClass","lnInst"].map((e=>t.getAttribute(e)));return`${Qt(t.parentElement)}>${i} ${e||""} ${n}/${r??""} ${s} ${o}`}},ClientServices:{identity:Kt},CommProt:{identity:Kt},Communication:{identity:Kt},ConductingEquipment:{identity:Yt},ConfDataSet:{identity:Kt},ConfLdName:{identity:Kt},ConfLNs:{identity:Kt},ConfLogControl:{identity:Kt},ConfReportControl:{identity:Kt},ConfSG:{identity:Kt},ConfSigRef:{identity:Kt},ConnectedAP:{identity:function(t){const[e,i]=["iedName","apName"].map((e=>t.getAttribute(e)));return`${e} ${i}`}},ConnectivityNode:{identity:Yt},DA:{identity:Yt},DAI:{identity:Wt},DAType:{identity:Zt},DO:{identity:Yt},DOI:{identity:Yt},DOType:{identity:Zt},DataObjectDirectory:{identity:Kt},DataSet:{identity:Yt},DataSetDirectory:{identity:Kt},DataTypeTemplates:{identity:Kt},DynAssociation:{identity:Kt},DynDataSet:{identity:Kt},EnumType:{identity:Zt},EnumVal:{identity:function(t){return`${Qt(t.parentElement)}>${t.getAttribute("ord")}`}},EqFunction:{identity:Yt},EqSubFunction:{identity:Yt},ExtRef:{identity:function(t){if(!t.parentElement)return NaN;const e=Qt(t.parentElement),i=t.getAttribute("iedName"),n=t.getAttribute("intAddr"),r=Array.from(t.parentElement.querySelectorAll(`ExtRef[intAddr="${n}"]`)).indexOf(t);if(!i)return`${e}>${n}[${r}]`;const[s,o,l,a,c,d,u,h,p,m,S,y]=["ldInst","prefix","lnClass","lnInst","doName","daName","serviceType","srcLDInst","srcPrefix","srcLNClass","srcLNInst","srcCBName"].map((e=>t.getAttribute(e))),v=y?`${u}:${y} ${h??""}/${p??""} ${m??""} ${S??""}`:"";return`${e}>${v?`${v} `:""}${`${i} ${s}/${o??""} ${l} ${a??""} ${c} ${d||""}`}${n?`@${n}`:""}`}},FCDA:{identity:function(t){const[e,i,n,r,s,o,l,a]=["ldInst","prefix","lnClass","lnInst","doName","daName","fc","ix"].map((e=>t.getAttribute(e))),c=`${e}/${i??""} ${n} ${r??""}.${s} ${o||""}`;return`${Qt(t.parentElement)}>${c} (${l}${a?` [${a}]`:""})`}},FileHandling:{identity:Kt},Function:{identity:Yt},GeneralEquipment:{identity:Yt},GetCBValues:{identity:Kt},GetDataObjectDefinition:{identity:Kt},GetDataSetValue:{identity:Kt},GetDirectory:{identity:Kt},GOOSE:{identity:Kt},GOOSESecurity:{identity:Yt},GSE:{identity:Xt},GSEDir:{identity:Kt},GSEControl:{identity:Yt},GSESettings:{identity:Kt},GSSE:{identity:Kt},Header:{identity:Kt},History:{identity:Kt},Hitem:{identity:function(t){return`${t.getAttribute("version")}\t${t.getAttribute("revision")}`}},IED:{identity:Yt},IEDName:{identity:function(t){const e=t.textContent,[i,n,r,s,o]=["apRef","ldInst","prefix","lnClass","lnInst"].map((e=>t.getAttribute(e)));return`${Qt(t.parentElement)}>${e} ${i||""} ${n||""}/${r??""} ${s??""} ${o??""}`}},Inputs:{identity:Kt},IssuerName:{identity:Kt},KDC:{identity:function(t){return`${Qt(t.parentElement)}>${t.getAttribute("iedName")} ${t.getAttribute("apName")}`}},LDevice:{identity:function(t){return`${Qt(t.closest("IED"))}>>${t.getAttribute("inst")}`}},LN:{identity:function(t){const[e,i,n]=["prefix","lnClass","inst"].map((e=>t.getAttribute(e)));return`${Qt(t.parentElement)}>${e??""} ${i} ${n}`}},LN0:{identity:Kt},LNode:{identity:function(t){const[e,i,n,r,s,o]=["iedName","ldInst","prefix","lnClass","lnInst","lnType"].map((e=>t.getAttribute(e)));return"None"===e?`${Qt(t.parentElement)}>(${r} ${o})`:`${e} ${i||"(Client)"}/${n??""} ${r} ${s??""}`}},LNodeType:{identity:Zt},Line:{identity:Yt},Log:{identity:Yt},LogControl:{identity:Yt},LogSettings:{identity:Kt},MaxTime:{identity:Kt},McSecurity:{identity:Kt},MinTime:{identity:Kt},NeutralPoint:{identity:zt},OptFields:{identity:Kt},P:{identity:function(t){if(!t.parentElement)return NaN;const e=t.parentElement,i=t.getAttribute("type");if("PhysConn"===e.tagName)return`${Qt(t.parentElement)}>${i}`;const n=Array.from(t.parentElement.children).filter((t=>t.getAttribute("type")===i)).findIndex((e=>e.isSameNode(t)));return`${Qt(t.parentElement)}>${i} [${n}]`}},PhysConn:{identity:function(t){if(!t.parentElement)return NaN;if(!t.parentElement.querySelector('PhysConn[type="RedConn"]'))return NaN;const e=t.getAttribute("type");return t.parentElement.children.length>1&&"Connection"!==e&&"RedConn"!==e?NaN:`${Qt(t.parentElement)}>${e}`}},PowerTransformer:{identity:Yt},Private:{identity:()=>NaN},Process:{identity:Yt},ProtNs:{identity:function(t){return`${Qt(t.parentElement)}>${t.getAttribute("type")||"8-MMS"}\t${t.textContent}`}},Protocol:{identity:Kt},ReadWrite:{identity:Kt},RedProt:{identity:Kt},ReportControl:{identity:Yt},ReportSettings:{identity:Kt},RptEnabled:{identity:Kt},SamplesPerSec:{identity:Kt},SampledValueControl:{identity:Yt},SecPerSamples:{identity:Kt},SCL:{identity:function(){return""}},SDI:{identity:Wt},SDO:{identity:Yt},Server:{identity:Kt},ServerAt:{identity:Kt},Services:{identity:Kt},SetDataSetValue:{identity:Kt},SettingControl:{identity:Kt},SettingGroups:{identity:Kt},SGEdit:{identity:Kt},SmpRate:{identity:Kt},SMV:{identity:Xt},SmvOpts:{identity:Kt},SMVsc:{identity:Kt},SMVSecurity:{identity:Yt},SMVSettings:{identity:Kt},SubEquipment:{identity:Yt},SubFunction:{identity:Yt},SubNetwork:{identity:Yt},Subject:{identity:Kt},Substation:{identity:Yt},SupSubscription:{identity:Kt},TapChanger:{identity:Yt},Terminal:{identity:zt},Text:{identity:Kt},TimerActivatedControl:{identity:Kt},TimeSyncProt:{identity:Kt},TransformerWinding:{identity:Yt},TrgOps:{identity:Kt},Val:{identity:function(t){if(!t.parentElement)return NaN;const e=t.getAttribute("sGroup"),i=Array.from(t.parentElement.children).filter((t=>t.getAttribute("sGroup")===e)).findIndex((e=>e.isSameNode(t)));return`${Qt(t.parentElement)}>${e?`${e}.`:""} ${i}`}},ValueHandling:{identity:Kt},Voltage:{identity:Kt},VoltageLevel:{identity:Yt}};function Qt(t){if(null===t)return NaN;if(t.closest("Private"))return NaN;const e=t.tagName;return Ft(e)?Jt[e].identity(t):NaN}const te=M`<symbol
  id="IFL"
  viewBox="0 0 25 25"
  width="1" height="1"
>
  <path
    d="M 12.5 0 L 12.5 4"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d=" M 12.5 25 L 12.5 21"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <polygon
    points="4,4 12.5,21 21,4"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
</symbol>`,ee=M`<symbol
  id="DIS"
  viewBox="0 0 25 25"
  width="1" height="1"
>
  <path
    d="M 12.5 0 L 12.5 4"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d=" M 12.5 25 L 12.5 21"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 12.5 21 L 4 4"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 8 4 L 17 4"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</symbol>`,ie=M`<symbol
  id="CBR"
  viewBox="0 0 25 25"
  width="1" height="1"
>
  <line
    x1="12.5"
    y1="0"
    x2="12.5"
    y2="4"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="25"
    x2="12.5"
    y2="21"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="21"
    x2="4"
    y2="5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="9.5"
    y1="1"
    x2="15.5"
    y2="7"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="9.5"
    y1="7"
    x2="15.5"
    y2="1"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</symbol>`,ne=M`<symbol
  id="CTR"
  viewBox="0 0 25 25"
  width="1" height="1"
>
  <line
    x1="12.5"
    y1="0"
    x2="12.5"
    y2="25"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="12.5"
    r="7.5"
    stroke="currentColor"
    fill="transparent"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</symbol>`,re=M`<symbol
  id="VTR"
  viewBox="0 0 25 25"
  width="1" height="1"
>
  <line
    x1="12.5"
    y1="0"
    x2="12.5"
    y2="5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="10"
    r="5"
    stroke="currentColor"
    fill="transparent"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="15"
    r="5"
    stroke="currentColor"
    fill="transparent"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="20"
    x2="12.5"
    y2="25"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="9"
    y1="24.25"
    x2="16"
    y2="24.25"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</symbol>`,se=M`<symbol
  id="ConductingEquipment"
  viewBox="0 0 25 25"
  width="1" height="1"
>
  <circle
    cx="12.5"
    cy="12.5"
    r="11"
    stroke-width="1.5"
    stroke="currentColor"
    fill="transparent"
  />
  <path
    d=" M 7.5 17.5
    L 12 13
    Z"
    fill="transparent"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="	M 11 7
      L 10 8
      C 5 13, 11 20, 17 15
      L 18 14
      Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linejoin="round"
  />
  <path
    d=" M 13 9
    L 16 6
    Z"
    fill="transparent"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d=" M 16 12
    L 19 9
    Z"
    fill="transparent"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
</symbol>`,oe=M`<marker
  markerWidth="3" markerHeight="3"
  refX="12.5" refY="12.5"
  viewBox="0 0 25 25"
  id="circle"
>
  <circle
    fill="black"
    cx="12.5"
    cy="12.5"
    r="12.5"
  />
</marker>`,le=M`<marker
  markerWidth="20" markerHeight="20"
  refX="12.5" refY="12.5"
  viewBox="0 0 25 25"
  id="grounded"
  orient="auto-start-reverse"
>
  <line
    y1="17"
    y2="8"
    x1="12.5"
    x2="12.5"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    y1="15.5"
    y2="9.5"
    x1="14.7"
    x2="14.7"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    y1="14.5"
    y2="10.5"
    x1="16.8"
    x2="16.8"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
</marker>`,ae=M`
  <defs>
  <pattern id="dots" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse" width="1" height="1">
    <circle class="droptarget" cx="0.5" cy="0.5" r="0.1" fill="#888" fill-opacity="0.3">
  </pattern>
${ee}
${ie}
${re}
${ne}
${te}
${se}
${oe}
${le}
  </defs>
`,ce="http://www.w3.org/2000/svg",de="https://transpower.com/SCL/SSD/SLD/v0",ue=["VTR","GEN","MOT","FAN","PMP","EFN","BAT","RRC","SAR","SMC","IFL"],he=["E","S","W","N"],pe={E:"S",S:"W",W:"N",N:"E"};const me={S:0,W:90,N:180,E:270};function Se(t){var e,i;const[n,r,s,o]=["x","y","w","h"].map((e=>{var i;return parseInt(null!==(i=t.getAttributeNS(de,e))&&void 0!==i?i:"1",10)})),l=function(t){const e=null==t?void 0:t.toUpperCase();return he.includes(e)?e:"S"}(t.getAttributeNS(de,"dir"));return{x:n,y:r,w:s,h:o,bus:["true","1"].includes(null!==(i=null===(e=t.getAttributeNS(de,"bus"))||void 0===e?void 0:e.trim())&&void 0!==i?i:"false"),dir:l}}const ye={SCL:["Substation"],Substation:["VoltageLevel"],VoltageLevel:["Bay"],Bay:["ConductingEquipment","ConnectivityNode"],ConductingEquipment:["Terminal"]};function ve(t){return Array.from(t.children).filter((e=>{var i;return null===(i=ye[t.tagName])||void 0===i?void 0:i.includes(e.tagName)}))}function ge(t,e){var i;return(null===(i=ye[t.tagName])||void 0===i?void 0:i.includes(e.tagName))&&[t,null].includes(e.closest(t.tagName))}function fe(t,e,i){var n;const r=new DOMPoint(t,e),{x:s,y:o}=r.matrixTransform(null===(n=i.getScreenCTM())||void 0===n?void 0:n.inverse());return{clickedX:Math.floor(s),clickedY:Math.floor(o)}}class $e extends st{constructor(){super(...arguments),this.editCount=-1,this.currentLine=[],this.eqPlaced=1,this.bussesPlaced=1,this.baysPlaced=1,this.vlPlaced=0,this.sPlaced=1}getSVG(t){var e,i;return Number.isNaN(t)?null:null!==(i=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector(`svg#${t}`))&&void 0!==i?i:null}insertAt(t,e,i){this.placing&&(this.placing.setAttributeNS(de,"x",t.toString()),this.placing.setAttributeNS(de,"y",e.toString()),this.dispatchEvent(St({parent:i,node:this.placing,reference:jt(i,this.placing.tagName)})))}placeAt(t,e,i){if(!this.placing)return;const n=this.getSVG(Qt(i.closest("Substation")));if(!n)return;const{clickedX:r,clickedY:s}=fe(t,e,n);this.placing.closest(i.tagName)===i?this.dispatchEvent(St({element:this.placing,attributes:{x:{namespaceURI:de,value:r.toString()},y:{namespaceURI:de,value:s.toString()}}})):this.insertAt(r,s,i),["ConductingEquipment","Substation","ConnectivityNode"].includes(this.placing.tagName)||(this.resizing=this.placing),this.placing=void 0}rotateEquipment(t){const{dir:e}=Se(t),i=pe[e];this.dispatchEvent(St({element:t,attributes:{dir:{namespaceURI:de,value:i}}}))}resizeTo(t,e){if(!this.resizing)return;const i=this.getSVG(Qt(this.resizing.closest("Substation")));if(!i)return;const{clickedX:n,clickedY:r}=fe(t,e,i),{x:s,y:o,bus:l}=Se(this.resizing),a=Math.max(n-s+1,1),c=Math.max(r-o+1,1);if(l){const t=a>c,[e,i]=[s,o].map((t=>t+.5));let[n,r]=[e,i];t?n+=a-1:r+=c-1;const l=this.doc.createElement("ConnectivityNode");l.setAttribute("name","L1");const[d,u,h]=["Substation","VoltageLevel","Bay"].map((t=>{var e;return null===(e=this.resizing.closest(t))||void 0===e?void 0:e.getAttribute("name")})),p=`${[d,u,h].join("/")}/L1`;l.setAttribute("pathName",p);const m=this.doc.createElement("Private");m.setAttribute("type","Transpower-SLD-v0"),m.setAttribute("xmlns",ce),m.setAttribute("xmlns:esld",de),l.appendChild(m);const S=this.doc.createElement("line");S.setAttribute("x1",e.toString()),S.setAttribute("y1",i.toString()),S.setAttribute("x2",n.toString()),S.setAttribute("y2",r.toString());const y=S.cloneNode();y.setAttribute("stroke","transparent"),y.setAttribute("stroke-width","0.6"),y.setAttribute("stroke-linecap","square"),S.setAttribute("stroke","black"),S.setAttribute("stroke-width","0.06"),S.setAttribute("stroke-linecap","round"),m.appendChild(S),m.appendChild(y),this.dispatchEvent(St({parent:this.resizing,node:l,reference:null}))}else this.dispatchEvent(St({element:this.resizing,attributes:{w:{namespaceURI:de,value:a.toString()},h:{namespaceURI:de,value:c.toString()}}}));this.resizing=void 0}equipmentAt(t,e,i){const n=Array.from(i.querySelectorAll(":scope > VoltageLevel > Bay > ConductingEquipment")).find((i=>i.getAttributeNS(de,"x")===t.toString()&&i.getAttributeNS(de,"y")===e.toString()));return n}lineTo(t,e){if(!this.lineStart)return;const i=this.getSVG(Qt(this.lineStart.from.closest("Substation")));if(!i)return;const{clickedX:n,clickedY:r}=fe(t,e,i),s=n+.5,o=r+.5,{x1:l,y1:a,from:c}=this.lineStart;if(l!==s&&a!==o){const t=this.currentLine[this.currentLine.length-1];if(t){t.y1===t.y2?(t.x2=s,this.lineStart={...this.lineStart,x1:s}):(t.y2=o,this.lineStart={...this.lineStart,y1:o})}else{["W","E"].includes(Se(c.closest("ConductingEquipment")).dir)?(this.currentLine.push({...this.lineStart,x2:s,y2:a}),this.lineStart={...this.lineStart,x1:s}):(this.currentLine.push({...this.lineStart,x2:l,y2:o}),this.lineStart={...this.lineStart,y1:o})}}this.currentLine.push({...this.lineStart,x2:s,y2:o}),this.lineStart={...this.lineStart,x1:s,y1:o}}connectNodeAt(t,e,i){if(!this.lineStart)return;const n=this.getSVG(Qt(i.closest("Substation")));if(!n)return;const{clickedX:r,clickedY:s}=fe(t,e,n),o=r+.5,l=s+.5,{x1:a,y1:c,from:d}=this.lineStart;if(a!==o&&c!==l){const t=this.currentLine[this.currentLine.length-1];if(t){t.y1===t.y2?(t.x2=o,this.lineStart={...this.lineStart,x1:o}):(t.y2=l,this.lineStart={...this.lineStart,y1:l})}else{["W","E"].includes(Se(d.closest("ConductingEquipment")).dir)?(this.currentLine.push({...this.lineStart,x2:o,y2:c}),this.lineStart={...this.lineStart,x1:o}):(this.currentLine.push({...this.lineStart,x2:a,y2:l}),this.lineStart={...this.lineStart,y1:l})}}const u=i.querySelector('Private[type="Transpower-SLD-v0"]');let h=1;for(;null==u?void 0:u.querySelector(`circle[id="${Qt(i)}$node${h}"]`);)h++;this.currentLine.push({...this.lineStart,x2:o,y2:l}),this.currentLine.forEach((t=>t.to=h)),this.connectToConnectivityNode(i)}connectToConnectivityNode(t){var e,i,n;const r=[],s=t.querySelector('Private[type="Transpower-SLD-v0"]');if(!s)return;this.currentLine.forEach((({x1:e,y1:i,x2:n,y2:o,from:l,to:a},c)=>{const d=`${Qt(l.parentElement).toString()}/${l.getAttribute("name")}`,u=`${Qt(t)}$node${a}`,h=this.doc.createElement("line");h.setAttribute("x1",e.toString()),h.setAttribute("y1",i.toString()),h.setAttribute("x2",n.toString()),h.setAttribute("y2",o.toString()),h.setAttributeNS(de,"segment",`${d}//${c.toString()}`),h.setAttributeNS(de,"from",d),h.setAttributeNS(de,"to",u);const p=h.cloneNode();p.setAttribute("stroke","transparent"),p.setAttribute("stroke-width",".6"),p.setAttribute("stroke-linecap","square"),h.setAttribute("stroke","black"),h.setAttribute("stroke-width","0.06"),h.setAttribute("stroke-linecap","round"),r.push({parent:s,node:h,reference:null}),r.push({parent:s,node:p,reference:null})}));const{x2:o,y2:l,from:a,to:c}=this.currentLine[this.currentLine.length-1],d=this.doc.createElement("circle");d.setAttribute("cx",o.toString()),d.setAttribute("cy",l.toString()),d.setAttribute("r","0.1"),d.setAttribute("id",`${Qt(t)}$node${c}`),r.push({parent:s,node:d,reference:null}),r.push({element:a,attributes:{connectivityNode:t.getAttribute("pathName"),cNodeName:t.getAttribute("name"),bayName:null===(e=t.closest("Bay"))||void 0===e?void 0:e.getAttribute("name"),voltageLevelName:null===(i=t.closest("VoltageLevel"))||void 0===i?void 0:i.getAttribute("name"),substationName:null===(n=t.closest("Substation"))||void 0===n?void 0:n.getAttribute("name")}}),r.push(this.breakLineAt(o,l,t,`${Qt(t)}$node${c}`)),this.dispatchEvent(St(r)),this.reset()}breakLineAt(t,e,i,n){var r,s,o,l;const a=[],c=i.querySelector('Private[type="Transpower-SLD-v0"]'),d=Array.from(null!==(r=null==c?void 0:c.children)&&void 0!==r?r:[]).filter((i=>{if("line"!==i.tagName)return!1;const[n,r,s,o]=["x1","y1","x2","y2"].map((t=>{var e;return parseFloat(null!==(e=i.getAttribute(t))&&void 0!==e?e:"NaN")})),l=r===o,a=(t,e,i)=>t<=e&&e<=i||t>=e&&e>=i;return n===s?t===n&&a(r,e,o):!!l&&(e===r&&a(n,t,s))}));d.length,d.forEach((i=>{const[r,s,o,l]=["x1","y1","x2","y2"].map((t=>{var e;return parseFloat(null!==(e=i.getAttribute(t))&&void 0!==e?e:"NaN")})),d=r===o,u=s===l,h=i.cloneNode();if(u){r<o?(h.setAttribute("x1",t.toString()),h.setAttributeNS(de,"from",n),a.push({element:i,attributes:{x2:t.toString(),to:{namespaceURI:de,value:n}}})):(h.setAttribute("x2",t.toString()),h.setAttributeNS(de,"to",n),a.push({element:i,attributes:{x1:t.toString(),from:{namespaceURI:de,value:n}}}))}else if(d){s<l?(h.setAttribute("y1",e.toString()),h.setAttributeNS(de,"from",n),a.push({element:i,attributes:{y2:e.toString(),to:{namespaceURI:de,value:n}}})):(h.setAttribute("y2",e.toString()),h.setAttributeNS(de,"to",n),a.push({element:i,attributes:{y1:e.toString(),from:{namespaceURI:de,value:n}}}))}a.push({parent:c,node:h,reference:i.nextElementSibling})}));const u=d[0],h=u.getAttributeNS(de,"from"),p=u.getAttributeNS(de,"to"),[m,S]=null!==(o=null===(s=u.getAttributeNS(de,"segment"))||void 0===s?void 0:s.split("//"))&&void 0!==o?o:[],y=parseInt(S,10);return Array.from(null!==(l=null==c?void 0:c.children)&&void 0!==l?l:[]).filter((t=>"line"===t.tagName)).forEach((t=>{var e,i;const r=t.getAttributeNS(de,"from"),s=t.getAttributeNS(de,"to"),[o,l]=null!==(i=null===(e=t.getAttributeNS(de,"segment"))||void 0===e?void 0:e.split("//"))&&void 0!==i?i:[],c=parseInt(l,10);m===o&&c>y&&r===h&&a.push({element:t,attributes:{from:{namespaceURI:de,value:n}}}),m===o&&c<y&&s===p&&a.push({element:t,attributes:{to:{namespaceURI:de,value:n}}})})),a}connectionPoint(t){const e=t.closest("ConductingEquipment");if(!e)return[[NaN,NaN],[NaN,NaN]];const{x:i,y:n,dir:r}=Se(e),s=0===Array.from(e.children).filter((t=>"Terminal"===t.tagName)).findIndex((e=>e===t));return[{S:[i+.5,s?n-.5:n+1.5],N:[i+.5,s?n+1.5:n-.5],E:[s?i-.5:i+1.5,n+.5],W:[s?i+1.5:i-.5,n+.5]}[r],{S:[i+.5,s?n:n+1],N:[i+.5,s?n+1:n],E:[s?i:i+1,n+.5],W:[s?i+1:i,n+.5]}[r]]}disconnectEquipment(t){const e=Array.from(t.children).filter((t=>"Terminal"===t.tagName));e.forEach((t=>{const e=t.getAttribute("cNodeName");e&&"grounded"!==e&&this.disconnectTerminal(t)}))}disconnectTerminal(t){var e,i;const n=[],r=null===(e=t.closest("Substation"))||void 0===e?void 0:e.querySelector(`ConnectivityNode[pathName="${t.getAttribute("connectivityNode")}"]`);if(!r)throw new Error(`no cNode for terminal ${Qt(t)}`);const s=r.querySelector('Private[type="Transpower-SLD-v0"]');if(!s)return;const o=Array.from(null!==(i=s.children)&&void 0!==i?i:[]).filter((t=>"line"===t.tagName)).filter((e=>{const[i,n]=["from","to"].map((t=>e.getAttributeNS(de,t)));return[i,n].includes(`${Qt(t.parentElement)}/${t.getAttribute("name")}`)})),l=new Set(o.flatMap((t=>["from","to"].map((e=>t.getAttributeNS(de,e))))).filter((t=>!s.querySelector(`circle[id="${t}"]`))));if(n.push([...l].map((t=>{var e,i,n,s,o;const[l,a]=(null!=t?t:"").split("/"),[c,d,u,h]=l.split(">");return null===(o=null===(s=null===(n=null===(i=null===(e=r.closest("SCL"))||void 0===e?void 0:e.querySelector(`:scope > Substation[name="${c}"]`))||void 0===i?void 0:i.querySelector(`:scope > VoltageLevel[name="${d}"]`))||void 0===n?void 0:n.querySelector(`:scope > Bay[name="${u}"]`))||void 0===s?void 0:s.querySelector(`:scope > ConductingEquipment[name="${h}"]`))||void 0===o?void 0:o.querySelector(`:scope > Terminal[name="${a}"]`)})).filter((t=>t)).map((t=>({element:t,attributes:{cNodeName:null,connectivityNode:null,bayName:null,voltageLevelName:null,substationName:null}})))),r.closest("Substation").querySelectorAll(`Terminal[connectivityNode="${r.getAttribute("pathName")}"]`).length<=2){r.closest("Substation").querySelectorAll(`Terminal[connectivityNode="${r.getAttribute("pathName")}"]`).forEach((t=>n.push({element:t,attributes:{cNodeName:null,connectivityNode:null,bayName:null,voltageLevelName:null,substationName:null}}))),r.closest("Bay").children.length>1&&n.push({node:r})}n.push(o.map((t=>({node:t}))));const a=new Set(o.flatMap((t=>["from","to"].map((e=>t.getAttributeNS(de,e))))).filter((t=>s.querySelector(`circle[id="${t}"]`))));a.size>1&&console.error("removing two nodes!!!"),[...a].forEach((t=>n.push(this.patchOutNode(r,t)))),this.dispatchEvent(St(n))}patchOutNode(t,e){const i=t.querySelector('Private[type="Transpower-SLD-v0"]');if(!i)throw new Error(`no priv for ${e}`);const n=i.querySelector(`circle[id="${e}"]`),r=[];if(!n)throw new Error(`No node ${e}`);r.push({node:n});const[s,o]=["cx","cy"].map((t=>n.getAttribute(t))),l=Array.from(i.querySelectorAll("line")),a=l.filter((t=>t.getAttributeNS(de,"to")===e)),c=l.filter((t=>t.getAttributeNS(de,"from")===e)),d=a.filter((t=>t.getAttribute("x2")===s&&t.getAttribute("y2")===o)),u=c.filter((t=>t.getAttribute("x1")===s&&t.getAttribute("y1")===o)),h=d.find((t=>"black"===t.getAttribute("stroke"))),p=u.find((t=>"black"===t.getAttribute("stroke"))),m=h.getAttributeNS(de,"from"),S=p.getAttributeNS(de,"to");return a.forEach((t=>r.push({element:t,attributes:{to:{namespaceURI:de,value:S}}}))),c.forEach((t=>r.push({element:t,attributes:{from:{namespaceURI:de,value:m}}}))),r}groundTerminal(t){const e=[],i=t.closest("Bay"),[n,r,s]=["Substation","VoltageLevel","Bay"].map((e=>{var i;return null===(i=t.closest(e))||void 0===i?void 0:i.getAttribute("name")}));if(!i)return;let o=i.querySelector('ConnectivityNode[name="grounded"]');if(!o){const t="grounded",l=`${n}/${r}/${s}/${t}`;o=this.doc.createElement("ConnectivityNode"),o.setAttribute("name",t),o.setAttribute("pathName",l),e.push({parent:i,node:o,reference:jt(i,"ConnectivityNode")})}e.push({element:t,attributes:{cNodeName:"grounded",connectivityNode:o.getAttribute("pathName"),substationName:n,voltageLevelName:r,bayName:s}}),this.dispatchEvent(St(e))}connectTerminal(t){const[[e,i],[n,r]]=this.connectionPoint(t);if(!this.lineStart)return this.currentLine.push({x1:n,y1:r,x2:e,y2:i,from:t}),void(this.lineStart={x1:e,y1:i,from:t});const{x1:s,y1:o,from:l}=this.lineStart;if(s!==e&&o!==i){const t=this.currentLine[this.currentLine.length-1];if(t){t.y1===t.y2?(t.x2=e,this.lineStart={...this.lineStart,x1:e}):(t.y2=i,this.lineStart={...this.lineStart,y1:i})}else{["W","E"].includes(Se(l.closest("ConductingEquipment")).dir)?(this.currentLine.push({...this.lineStart,x2:e,y2:o}),this.lineStart={...this.lineStart,x1:e}):(this.currentLine.push({...this.lineStart,x2:s,y2:i}),this.lineStart={...this.lineStart,y1:i})}}this.currentLine.push({...this.lineStart,x2:e,y2:i}),this.currentLine.push({...this.lineStart,x1:e,y1:i,x2:n,y2:r}),this.currentLine.forEach((e=>e.to=t)),this.createConnectivityNode()}createConnectivityNode(){if(!this.doc||!this.lineStart)return;const t=[],{from:e}=this.lineStart,i=e.closest("Bay"),n=Array.from(i.querySelectorAll(":scope > ConnectivityNode")).map((t=>t.getAttribute("name")));let r=1;for(;n.includes(`L${r}`);)r++;const s=`L${r}`,[o,l,a]=["Substation","VoltageLevel","Bay"].map((t=>{var i;return null===(i=e.closest(t))||void 0===i?void 0:i.getAttribute("name")})),c=`${[o,l,a].join("/")}/${s}`,d=this.doc.createElement("ConnectivityNode");d.setAttribute("name",s),d.setAttribute("pathName",c),[e,this.currentLine[this.currentLine.length-1].to].forEach((e=>t.push({element:e,attributes:{connectivityNode:c,cNodeName:s,bayName:a,voltageLevelName:l,substationName:o}})));const u=this.doc.createElement("Private");u.setAttribute("type","Transpower-SLD-v0"),u.setAttribute("xmlns",ce),u.setAttribute("xmlns:esld",de),this.currentLine.forEach((({x1:t,y1:e,x2:i,y2:n,from:r,to:s},o)=>{const l=`${Qt(r.parentElement).toString()}/${r.getAttribute("name")}`,a=`${Qt(s.parentElement).toString()}/${s.getAttribute("name")}`,c=this.doc.createElement("line");c.setAttribute("x1",t.toString()),c.setAttribute("y1",e.toString()),c.setAttribute("x2",i.toString()),c.setAttribute("y2",n.toString()),c.setAttributeNS(de,"segment",`${l}//${o.toString()}`),c.setAttributeNS(de,"from",l),c.setAttributeNS(de,"to",a);const d=c.cloneNode();d.setAttribute("stroke","transparent"),d.setAttribute("stroke-width","0.6"),d.setAttribute("stroke-linecap","square"),c.setAttribute("stroke","black"),c.setAttribute("stroke-width","0.06"),c.setAttribute("stroke-linecap","round"),u.appendChild(c),u.appendChild(d)})),d.appendChild(u);const h=jt(i,"ConnectivityNode");t.push({parent:i,node:d,reference:h}),this.dispatchEvent(St(t)),this.reset()}renderEquipment(t){var e,i,n,r,s,o;const{x:l,y:a,dir:c}=Se(t),[d,u]=Array.from(null!==(e=t.children)&&void 0!==e?e:[]).filter((t=>"Terminal"===t.tagName)),h=me[c],p="grounded"===(null==d?void 0:d.getAttribute("cNodeName"))?M`<line x1="0.5" y1="-0.1" x2="0.5" y2="0" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`:B,m="grounded"===(null==u?void 0:u.getAttribute("cNodeName"))?M`<line x1="0.5" y1="1.1" x2="0.5" y2="1" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`:B,S=(null===(i=null==d?void 0:d.closest("Substation"))||void 0===i?void 0:i.querySelector(`ConnectivityNode[pathName="${d.getAttribute("connectivityNode")}"] > Private[type="Transpower-SLD-v0"]`))||!d||(null===(n=this.lineStart)||void 0===n?void 0:n.from)===d||p!==B?B:M`<circle cx="0.5" cy="0" r="0.2" opacity="0.4"
    fill="green" stroke="lightgreen"
    @click=${()=>this.connectTerminal(d)}
    @contextmenu=${t=>{t.preventDefault(),this.groundTerminal(d)}}
      />`,y=(null===(r=null==u?void 0:u.closest("Substation"))||void 0===r?void 0:r.querySelector(`ConnectivityNode[pathName="${u.getAttribute("connectivityNode")}"] > Private[type="Transpower-SLD-v0"]`))||!u||(null===(s=this.lineStart)||void 0===s?void 0:s.from)===u||m!==B?B:M`<circle cx="0.5" cy="1" r="0.2" opacity="0.4"
      fill="green" stroke="lightgreen"
    @click=${()=>this.connectTerminal(u)}
    @contextmenu=${t=>{t.preventDefault(),this.groundTerminal(u)}}
      />`,v=null!==(o=t.getAttribute("type"))&&void 0!==o?o:"",g=["CBR","CTR","VTR","DIS","IFL"].includes(v)?v:"ConductingEquipment";return M`<g class="equipment" transform="translate(${l} ${a}) rotate(${h}, 0.5, 0.5)">
      ${p}
      ${m}
      <title>${t.getAttribute("name")}</title>
      <use href="#${g}" />
      <rect x=".1" y=".1" width=".8" height=".8" fill="transparent"
        @click=${()=>{this.disconnectEquipment(t),this.placing=t}}
        @contextmenu=${e=>{e.preventDefault(),this.disconnectEquipment(t),this.rotateEquipment(t)}}
        />
      ${S}
      ${y}
    </g>`}renderConnectivityNode(t){const e=t.querySelector('Private[type="Transpower-SLD-v0"]');if(!e)return B;const i=e.innerHTML;return dt`<g class="node" @click=${e=>this.connectNodeAt(e.clientX,e.clientY,t)}>
       ${(t=>({_$litStatic$:t,r:lt}))(i)}
      <title>${t.getAttribute("pathName")}</title>
      </g>`}renderBay(t){const{x:e,y:i,w:n,h:r}=Se(t),s=this.placing&&ge(t,this.placing)?M`<rect
      x="${e}"
      y="${i}"
      width="${n}"
      height="${r}"
      @click=${e=>this.placeAt(e.clientX,e.clientY,t)}
      fill="url(#dots)" />`:B;return M`<g>
      <text x="${e+.1}" y="${i-.2}" style="font: 0.8px sans-serif;" @click=${()=>this.placing=t}>
        ${t.getAttribute("name")}
      </text>
      <rect
      x="${e}"
      y="${i}"
      width="${n}"
      height="${r}"
      fill="transparent" stroke="blue" stroke-dasharray=".2 .2" />
      ${s}
    </g>`}renderVoltageLevel(t){const{x:e,y:i,w:n,h:r}=Se(t),s=[];ve(t).forEach((t=>{const{bus:e}=Se(t);e||s.push(t)}));const o=this.placing&&ge(t,this.placing)?M`
      <rect
      x="${e}"
      y="${i}"
      width="${n}"
      height="${r}"
      @click=${e=>this.placeAt(e.clientX,e.clientY,t)}
      fill="url(#dots)" />
    `:B;return M`<g id="${Qt(t)}">
      <text @click=${()=>this.placing=t} x="${e}.1" y="${i-.2}" style="font: 0.9px sans-serif;">
        ${t.getAttribute("name")}
      </text>
      <rect
      x="${e}"
      y="${i}"
      width="${n}"
      height="${r}"
      fill="transparent" stroke="orange" />
      ${s.map((t=>this.renderBay(t)))}
      ${o}
    </g>`}renderSubstation(t){const{w:e,h:i}=Se(t),n=this.placing&&ge(t,this.placing)?M`<rect
      width="${e}"
      height="${i}"
      @click=${e=>this.placeAt(e.clientX,e.clientY,t)}
      fill="url(#dots)" />`:B,r=this.resizing?M`<rect
      width="${e}"
      height="${i}"
      @click=${t=>this.resizeTo(t.clientX,t.clientY)}
      fill="url(#dots)" />`:B,s=this.lineStart?M`<rect
      width="${e}"
      height="${i}"
      @click=${t=>this.lineTo(t.clientX,t.clientY)}
      fill="url(#dots)" />`:B;return I`<h3>${t.getAttribute("name")}</h3>
      <svg
        id=${Qt(t)}
        viewBox="0 0 ${e} ${i}"
        width="${25*e}"
        height="${25*i}"
        style="margin: 20px;"
        stroke-width="0.1"
        xmlns="${ce}"
      >
        ${ae}
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        ${ve(t).map((t=>this.renderVoltageLevel(t)))}
        ${n} ${r} ${s}
        ${this.currentLine.map((({x1:t,y1:e,x2:i,y2:n})=>M`<line x1="${t}" y1="${e}" x2="${i}" y2="${n}"
                      stroke="black" stroke-width="0.06" />`))}
        ${Array.from(t.querySelectorAll("VoltageLevel > Bay > ConductingEquipment")).map((t=>this.renderEquipment(t)))}
        ${Array.from(t.querySelectorAll("VoltageLevel > Bay > ConnectivityNode")).map((t=>this.renderConnectivityNode(t)))}
      </svg>`}render(){var t,e;const i=Array.from(null!==(e=null===(t=this.doc)||void 0===t?void 0:t.documentElement.children)&&void 0!==e?e:[]).filter((t=>"Substation"===t.tagName&&Array.from(t.attributes).map((t=>t.value)).includes(de)));return I`<menu>
        <li>
          <button @click=${()=>this.insertSubstation()}>S</button>
        </li>
        <li>
          <button @click=${()=>this.placeVoltageLevel()}>VL</button>
        </li>
        <li>
          <button @click=${()=>this.placeBay()}>Bay</button>
        </li>
        <li>
          <button @click=${()=>this.placeBus()}>Bus</button>
        </li>
        <li>
          <button @click=${()=>this.placeEquipment()}>E</button>
        </li>
        <li>
          <button @click=${()=>this.reset()}>X</button>
        </li>
      </menu>
      <main>${i.map((t=>this.renderSubstation(t)))}</main>`}reset(){this.placing=void 0,this.resizing=void 0,this.lineStart=void 0,this.currentLine=[]}placeEquipment(){if(!this.doc)return;const t=prompt("Equipment type","CBR");if(!t)return;const e=prompt("Equipment name",`${t}${this.eqPlaced++}`);if(!e)return;const i=this.doc.createElement("ConductingEquipment");i.setAttribute("type",t),i.setAttribute("name",e),i.setAttributeNS(de,"esld:w","8"),i.setAttributeNS(de,"esld:h","8");const n=this.doc.createElement("Terminal");if(n.setAttribute("name","T1"),i.append(n),!ue.includes(t)){const t=this.doc.createElement("Terminal");t.setAttribute("name","T2"),i.append(t)}this.placing=i}placeBus(){if(!this.doc)return;const t=prompt("Bus name","Bus "+this.bussesPlaced++);if(!t)return;const e=this.doc.createElement("Bay");e.setAttribute("name",t),e.setAttributeNS(de,"bus","true"),this.placing=e}placeBay(){if(!this.doc)return;const t=prompt("Bay name",`B${this.baysPlaced++}0`);if(!t)return;const e=this.doc.createElement("Bay");e.setAttribute("name",t),e.setAttributeNS(de,"esld:w","8"),e.setAttributeNS(de,"esld:h","8"),this.placing=e}placeVoltageLevel(){if(!this.doc)return;const t=prompt("Voltage Level name",0===this.vlPlaced?"220kV":1===this.vlPlaced?"33kV":`VL${this.vlPlaced}`);if(!t)return;this.vlPlaced++;const e=this.doc.createElement("VoltageLevel");e.setAttribute("name",t),e.setAttributeNS(de,"esld:w","10"),e.setAttributeNS(de,"esld:h","10"),this.placing=e}insertSubstation(){var t,e;if(!this.doc)return;const i=prompt("Substation name","AA"+this.sPlaced++);if(!i)return;const n=parseInt(null!==(t=prompt("width","50"))&&void 0!==t?t:"50",10),r=parseInt(null!==(e=prompt("height","25"))&&void 0!==e?e:"25",10);if(!n||!r)return;const s=this.doc.createElement("Substation");s.setAttribute("name",i),s.setAttribute("xmlns:esld",de),s.setAttributeNS(de,"esld:w",n.toString()),s.setAttributeNS(de,"esld:h",r.toString()),this.dispatchEvent(St({parent:this.doc.documentElement,node:s,reference:jt(this.doc.documentElement,"Substation")}))}firstUpdated(){window.addEventListener("keydown",(t=>{"Escape"===t.key&&this.reset()}),!0)}}$e.styles=((t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[n+1]),t[0]);return new s(i,t,n)})`
    g.equipment:hover g.terminal > circle {
      stroke: green;
    }
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
  `,t([pt()],$e.prototype,"doc",void 0),t([pt()],$e.prototype,"editCount",void 0),t([pt()],$e.prototype,"placing",void 0),t([pt()],$e.prototype,"resizing",void 0),t([pt()],$e.prototype,"lineStart",void 0),t([pt()],$e.prototype,"currentLine",void 0);export{$e as default};
//# sourceMappingURL=oscd-designer.js.map
