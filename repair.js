
var Redis = require("ioredis");
var redisPort = 6375;
var redisHost = '127.0.0.1';
var redisCli = new Redis(redisPort, redisHost);

(async () => {

    var msg = await redisCli.pipeline().lindex('room_wf5mfgmui7grb546_recentmsg', 1).exec();
    console.log(msg);
    
})();;