if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,o)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let d={};const t=e=>i(e,n),c={module:{uri:n},exports:d,require:t};s[n]=Promise.all(r.map((e=>c[e]||t(e)))).then((e=>(o(...e),d)))}}define(["./workbox-088bfcc4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"icons.js",revision:"e47aa59bf71bd1db8107ad31a6c4f6fc"},{url:"oscd-designer.js",revision:"4fb407458eebd2efbcd5ad8882d898c6"},{url:"oscd-designer.spec.js",revision:"006afb17d79e6879e3c5e5c5b7a4d4b7"},{url:"sld-editor.js",revision:"f4003bd55e4f5e1825d7aa0930194dc8"},{url:"util.js",revision:"821f35533075990331f836397e5b2b89"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))),e.registerRoute("polyfills/*.js",new e.CacheFirst,"GET")}));
//# sourceMappingURL=sw.js.map
