#!/usr/bin/env node
// Tell IndexNow engines (Bing, Yandex, Seznam, Naver; Bing also feeds ChatGPT search) that every
// URL in the live sitemap changed. Run after a production deploy, never before: the URLs must be
// live. The key is public by design (IndexNow proves ownership by serving it at /<key>.txt).
//
//   node scripts/indexnow.mjs            submit every URL in https://16x9.ai/sitemap.xml
//   node scripts/indexnow.mjs --dry-run  print what would be sent
const KEY = "f68d0a04b7ea9d1570f98e7eee754b69";
const HOST = "16x9.ai";
const dry = process.argv.includes("--dry-run");

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !u.includes("/intel"));
const keyOk = (await (await fetch(`https://${HOST}/${KEY}.txt`)).text()).trim() === KEY;
console.log(`${urls.length} URLs; key file live: ${keyOk}`);
if (!keyOk) process.exit(1);
if (dry) {
  console.log(urls.join("\n"));
  process.exit(0);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log("IndexNow:", res.status, res.statusText);
process.exit(res.ok ? 0 : 1);
