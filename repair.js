
var Redis = require("ioredis");
var redisPort = 6375;
var redisHost = '127.0.0.1';
var redisCli = new Redis(redisPort, redisHost);

(async () => {
    var msg = await redisCli.pipeline().lindex('room_4j2e8xk1uimg1gir_recentmsg', 1).exec();
    console.log(msg);
    var d = JSON.parse(msg[0][1]);
    if(d.from.name.indexOf('游客') > -1){
        console.log(d);
        d.from.name = 'zhangdi';
        d.from.role = 'vip';
        d.from.avatarUrl = 'http://adbugsns.oss-cn-hangzhou.aliyuncs.com/headFile/201908/201908281817145d6654aa007a2.jpg';
        d.from.uid = 20;
        var res = await redisCli.pipeline().lset('room_4j2e8xk1uimg1gir_recentmsg', 1, JSON.stringify(d)).exec();
        console.log(res);
    }

})();;