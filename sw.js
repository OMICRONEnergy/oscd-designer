if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let c={};const d=e=>i(e,o),t={module:{uri:o},exports:c,require:d};s[o]=Promise.all(r.map((e=>t[e]||d(e)))).then((e=>(n(...e),c)))}}define(["./workbox-088bfcc4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"__snapshots__/oscd-designer.spec.snap.js",revision:"23ec148e9cc83002d70a86a0282fe1d7"},{url:"icons.js",revision:"b4763d4c2cc027fe15eee3e00d83651e"},{url:"oscd-designer.js",revision:"af8434516d6a21bb76f77350f20f3289"},{url:"oscd-designer.spec.js",revision:"a39026886d82cfe3f773a44dba997f4a"},{url:"sld-editor.js",revision:"f0bab21fc5764f80468fc4ea55d1ffc9"},{url:"util.js",revision:"76d42eb2ed371f2ba777a5ec4451be95"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))),e.registerRoute("polyfills/*.js",new e.CacheFirst,"GET")}));
//# sourceMappingURL=sw.js.map
