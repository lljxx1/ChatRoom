!function (a, b) { typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = b() : typeof define === 'function' && define.amd ? define(b) : (a.liike = b()) }(this, (function () { 'use strict'; var a = function d(a, b, c) { var e = c.start, f = c.end, g = c.from, h = c.to, i = c.easing, j = c.onstart, k = c.onprogress, l = c.onend; this.target = a; this.handler = b; this.start = e; this.end = f; this.easing = i; this.from = g; this.to = h; this.keys = []; this.onstart = j; this.onprogress = k; this.onend = l; this.running = !1; this.store = a.__liike || (a.__liike = {}) }; a.prototype.init = function a() { var b = this, c = this, d = c.from, e = c.to, f = c.keys; for (var g in e) (g in d) || (d[g] = b.store[g] || 0), f.push(g); for (var h in d) (h in e) || (e[h] = b.store[h] || 0, f.push(h)) }; a.prototype.tick = function b(a) { var c = this, d = this, e = d.keys, f = d.from, g = d.to, h = d.easing, i = h(a); for (var j = 0; j < e.length; j++) { var k = e[j]; c.store[k] = f[k] + (g[k] - f[k]) * i } this.handler(this.target, this.store) }; var b = function (a) { return function (b) { return Math.pow(b, a) } }, c = function (a) { return function (b) { return 1 - Math.abs(Math.pow(b - 1, a)) } }, d = function (a) { return function (d) { return d < 0.5 ? b(a)(d * 2) / 2 : c(a)(d * 2 - 1) / 2 + 0.5 } }, e = function (a) { return a }, f = b(2), g = c(2), h = d(2), i = b(3), j = c(3), k = d(3), l = b(4), m = c(4), n = d(4), o = b(5), p = c(5), q = d(5), r = function (a) { return 1 + Math.sin(Math.PI / 2 * a - Math.PI / 2) }, s = function (a) { return Math.sin(Math.PI / 2 * a) }, u = function (a) { return (1 + Math.sin(Math.PI * a - Math.PI / 2)) / 2 }, v = function (a) { var b = 7.5625, c = 2.75; if (a < 1 / c) { return b * a * a } if (a < 2 / c) { a -= 1.5 / c; return b * a * a + 0.75 } if (a < 2.5 / c) { a -= 2.25 / c; return b * a * a + 0.9375 } a -= 2.625 / c; return b * a * a + 0.984375 }, w = function (a) { return 1 - v(1 - a) }, x = function (a) { return a < 0.5 ? w(a * 2) * 0.5 : v(a * 2 - 1) * 0.5 + 0.5 }, y = Object.freeze({ linear: e, quadIn: f, quadOut: g, quadInOut: h, cubicIn: i, cubicOut: j, cubicInOut: k, quartIn: l, quartOut: m, quartInOut: n, quintIn: o, quintOut: p, quintInOut: q, sineIn: r, sineOut: s, sineInOut: u, bounceOut: v, bounceIn: w, bounceInOut: x }), z = [], A = [], B = function () { }, C = 0, D = function (a) { while (A.length) { var b = A.shift(); b(a) } for (var c = 0; c < z.length; c++) { var d = z[c]; if (a < d.start) { continue } d.running || (d.running = !0, d.init(), d.onstart(d.target)); var e = (a - d.start) / (d.end - d.start); d.tick(e < 1 ? e : 1); d.onprogress(d.target, e); a > d.end && (d.onend(d.target), z.splice(c--, 1)) } A.length || z.length ? (C = window.requestAnimationFrame(D)) : (C = 0) }, E = function (b) { return function (c, d) { var e = d.delay; e === void 0 && (e = 0); var f = d.duration; f === void 0 && (f = 0); var g = d.from; g === void 0 && (g = {}); var h = d.to; h === void 0 && (h = {}); var i = d.easing; i === void 0 && (i = 'linear'); var j = d.onprogress; j === void 0 && (j = B); var k = d.onstart; k === void 0 && (k = B); var l = d.onend; l === void 0 && (l = B); A.push(function (d) { var m = new a(c, b, { start: d + e, end: d + e + f, from: g, to: h, easing: y[i], onstart: k, onprogress: j, onend: l }); z.push(m) }); C || (C = window.requestAnimationFrame(D)) } }; return E }));

function addCssByLink(url) {
    var doc = document;
    var link = doc.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", url);

    var heads = doc.getElementsByTagName("head");
    if (heads.length)
        heads[0].appendChild(link);
    else
        doc.documentElement.appendChild(link);
}

; (function () {
    function imLoader(conf) {
        conf = conf || {};
        var buttonName = conf.name || '消息';
        function receiveMessage(event) {
            var data = null;
            try {
                data = JSON.parse(event.data);
            } catch (e) { }
            console.log('event', data, event);
            if (data) {
                if (data.imready) {
                    whenFrameReady();
                }
                if (data.method) {
                    if (data.method == "close") {
                        closePannel();
                    }

                    if (data.method == "usersChange") {
                        usersChange(data);
                    }
                    if (data.method == "reciveChatMessage") {
                        reciveChatMessage(data);
                    }
                }
                if (data.loginSuccess) {
                    loginSuccess(data);
                }
            }
        }

        window.addEventListener("message", receiveMessage, false);

        var div = document.createElement('div');
        // var pUrl = "https://im.adbug.cn/";
        var pUrl = "http://localhost:3000/";

        div.innerHTML = '<iframe marginheight="0" style="border: 0px; visibility: visible; width: 100%; height: 100%; margin: 0px; padding: 0px;" marginwidth="0" frameborder="0" allowtransparency="true"  src="' + pUrl + '"></iframe>';
        div.style.display = "none";

        document.body.appendChild(div);

        var label = document.createElement('div');
        var notifyElStr = '<span id="im-unread-count" style="display:none">0</span>';

        var useStatusHtml = '<div class="im-user-block"><img src ="http://file.adbug.cn/icon/default.png" height="22" class="im-user-avatar"/><div class="presence-indicator--is-online"></div></div>'

        label.innerHTML = '<div class="btn-chat-rooom" style="box-shadow: 0 2px 6px 0 rgba(0,0,0,.4);cursor: pointer;background-color: rgb(63, 139, 190);color:white; position:fixed; height: 50px; bottom: -6px;right: 50px;display: block;">'+
        useStatusHtml + 
        buttonName + '<span style="" id="chat-im-online">(2)</span>'+notifyElStr+'</div>';


        document.body.appendChild(label);
        label.style = "display:none";

        var isOpend = false;

        var frame = div.getElementsByTagName('iframe')[0];
        var notifyEl = document.getElementById('im-unread-count');

        label.addEventListener('click', function () {
            console.log('toggel');
            if (!isOpend) {
                div.style.display = "block";
                showPannel();
                label.style = "display: none";

            } else {
                isOpend = false;
            }
        })

        function slideOut(target, data) {
            target.style.right = data.right + 'px';
        };

        var tween = liike(slideOut);

        var unReadCount = 0;
        var lastReadTime = 0;

        function showPannel() {
            tween(div, {
                delay: 0,
                duration: 800,
                easing: 'bounceOut',
                from: {
                    right: -530
                },
                to: {
                    right: 0
                }
            });

            setTimeout(function () {
                isOpend = true;
                unReadCount = 0;
                updateunRead();
            }, 1000);
        }


        function updateunRead(){
            if(unReadCount > 0){
                notifyEl.innerText = unReadCount;
                notifyEl.style.display = 'inline-block';
                if(document.title.indexOf('条消息') > -1){
                    document.title = "（"+unReadCount+"条消息）"+(document.title.split('条消息）')[1]);
                }else{
                    document.title = "（"+unReadCount+"条消息）"+document.title;
                }

            }else{
                if(document.title.indexOf('条消息') > -1){
                    document.title = document.title.split('条消息）')[1];
                }
                notifyEl.style.display = 'none';
            }
        }

        function closePannelAni() {
            tween(div, {
                delay: 0,
                duration: 1000,
                easing: 'bounceOut',
                from: {
                    right: 0
                },
                to: {
                    right: -530
                }
            });

            setTimeout(function () {
                div.style.display = "none";
            }, 1000);
        }

        var isReady = false;

        function whenFrameReady() {
            isReady = true;
            for (var k in readyCallBacks) {
                readyCallBacks[k]();
            }
        }

        var countLabel = document.getElementById('chat-im-online');

        function updateCount(count) {
            countLabel.innerText = '(' + count + ')';
        }

        function reciveChatMessage(msg){
            console.log('reciveChatMessage', msg)
            unReadCount++;
            updateunRead();
        }

        function loginSuccess(msg) {
            if(!isOpend){
                label.style = "display:block";
                div.style = "position: fixed; top: 0px; box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 8px; height: 100%; width: 530px; right:-530px; z-index: 2000000013;";
                div.style.display = "block";
            }
            console.log('loginSuccess', msg)
            updateCount(msg.count + 1);
        }

        function closePannel() {
            label.style = "display:block";
            isOpend = false;
            closePannelAni();
            console.log('closePannel')
        }

        function usersChange(msg) {
            updateCount(msg.count);
        }

        document.body.addEventListener('click', function (event) {
            if (isOpend) {
                closePannel();
            }
        });

        addCssByLink(pUrl + 'static/css/embed.css?ver=201908061610');

        var readyCallBacks = [];
        function sendMessage(msg) {
            frame.contentWindow.postMessage(JSON.stringify(msg), "*");
        }

        return {
            ready: function (cb) {
                if(!isReady){
                    readyCallBacks.push(cb);
                }else{
                    cb();
                }
            },
            login: function (user) {
                var msg = Object.assign({
                    'method': 'login',
                }, user);
                sendMessage(msg);
            },

            loginAsGuest: function(){
                var cachedUserInfo = window.localStorage.getItem('im_guest');
                if(!cachedUserInfo){
                    var ramdonId = Math.floor(Math.random() * 100000000);
                    var uid = 'guest'+ ramdonId;
                    var name = '游客'+ramdonId;
                    var cachedUserInfo = {
                        'username': name,
                        'userId': uid,
                        'avatarUrl': 'http://file.adbug.cn/icon/default.png'
                    }
                    window.localStorage.setItem('im_guest', JSON.stringify(cachedUserInfo));
                }else{
                    cachedUserInfo = JSON.parse(cachedUserInfo);
                }
                var msg = Object.assign({
                    'method': 'login',
                }, cachedUserInfo);
                sendMessage(msg);
            }
        }
    }

    window.$im = new imLoader();
})();