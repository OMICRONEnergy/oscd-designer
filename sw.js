if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,o)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let d={};const t=e=>i(e,n),c={module:{uri:n},exports:d,require:t};s[n]=Promise.all(r.map((e=>c[e]||t(e)))).then((e=>(o(...e),d)))}}define(["./workbox-088bfcc4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"icons.js",revision:"01f03d3742da1f2ee3bde5c41976d146"},{url:"oscd-designer.js",revision:"c0f6e0606435300a290ff75b5d919e59"},{url:"oscd-designer.spec.js",revision:"134f242c65363f868d584accbc253591"},{url:"sld-editor.js",revision:"c514744fa7e93d2dd4a2b6a4627dfbd1"},{url:"util.js",revision:"788fd7e79b570730ab2a6f9a739f1920"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))),e.registerRoute("polyfills/*.js",new e.CacheFirst,"GET")}));
//# sourceMappingURL=sw.js.map
