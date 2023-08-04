var cacheName = 'gotop-03' // 决定是否更新本地资源，每次要更新记得替换

var cacheList = [ // 需要保存本地资源列表，支持*匹配
 "/",
 "index.html",
  "dist/app.js",
  "style.css",
]

// Service Worker 注册完成事件，写入缓存
self.addEventListener('install', e => {
  e.waitUntil(
  caches.open(cacheName)
 .then(cache => cache.addAll(cacheList))
 .then(() => self.skipWaiting())
 )
})

// Service Worker 启动事件，处理更新缓存
self.addEventListener('activate', e => {
  e.waitUntil(
 Promise.all(
    caches.keys().then(keys => keys.map(key => {
 if(key !== cacheName) {
 return caches.delete(key)
 }
 }))
 ).then(() => {
 self.clients.claim()
 })
 )
})


self.addEventListener("message", function (e) {
    let promise = self.clients.matchAll().then((clientList) => {
        let senderId = e.source ? e.source.id : 'unknown';
        clientList.forEach(client => {
            if (client.id === senderId) {
                return       //当前发送页面直接返回不做处理
            } else {
                client.postMessage({      //向其他其他被监听页面广播主页发送的信息
                    client: senderId,
                    message: e.data
                })
            }
        })
    })
    e.waitUntil(promise)
})



// 请求接口事件，处理相关逻辑
self.addEventListener('fetch', e => {
  e.respondWith(
  caches.match(e.request)
 .then(res => res || fetch(e.request.url))
 )
})