

const fs = require('fs');
const express = require('express');
var cluster = require('cluster');
var sticky = require('sticky-session');

var redisPort = 6375;
var redisHost = '127.0.0.1';
var maxSaveLimit = 30;
var isDebug = true;
isDebug = false;

function GroupChat(channel, group) {

	var Redis = require("ioredis");
	var redisCli = new Redis(redisPort, redisHost);
	
	var allGroups = [
		{
			id: "wf5mfgmui7grb546",
			avatarUrl: "/static/images/group-icon.png",
			name: 'VIP用户交流',
			type: "group",
		},
		{
			id: "4j2e8xk1uimg1gir",
			avatarUrl: "/static/images/group-icon.png",
			name: '用户交流',
			type: "group"
		}
	];

	var totalOnline = 0;

	channel.on('connection', function (socket) {
		totalOnline++;

		console.log('totalOnline', totalOnline, cluster.worker.id);
		var userGroups = [];

		//创建用户链接
		socket.on('login', (user) => {
			console.log('login', user);
			var uid = user.uid;
			socket.user = user;

			userGroups = [].concat(allGroups);
			if (user.role != 'vip') {
				var disableGroup = userGroups.shift();
				disableGroup.lock = true;
				userGroups.push(disableGroup);
				console.log('disable vip', user.role);
			}else{
				// userGroups[0].lock = false;
			}

			(async () => {

				for (let index = 0; index < userGroups.length; index++) {
					const allGroup = userGroups[index];
					if(allGroup.lock) continue;

					socket.join(allGroup.id);
					var RoomUserSet = 'room_'+allGroup.id+'_users';
					var cmdRes = await redisCli.pipeline().sadd(RoomUserSet, uid).scard(RoomUserSet).exec();
					var groupUserCount = cmdRes[1][1];
					// console.log('groupUserCount', groupUserCount);
					allGroup.online = groupUserCount;
					socket.broadcast.to(allGroup.id).emit('system', user, 'join', allGroup.id, groupUserCount);
				}

				var returnData = [].concat(userGroups);
	
				for (let rIndex = 0; rIndex < returnData.length; rIndex++) {
					const g = returnData[rIndex];
					if(g.lock) {
						g.recentMessages = [];
						continue;
					};
					
					var RoomUserSet = 'room_'+g.id+'_recentmsg';
					var recentMessages = await redisCli.pipeline().lrange(RoomUserSet, 0, -1).exec();
					var msgs = recentMessages[0][1].reverse();
					g.recentMessages = msgs.map((a) => JSON.parse(a));
				}
				
				socket.emit('loginSuccess', user, [], returnData, returnData[0].online);
			})();

		});

		//用户注销链接
		socket.on('disconnect', () => {
			totalOnline--;
			console.log('totalOnline', totalOnline, cluster.worker.id);
			if (socket.user == null) {
				return;
			}

			userGroups.forEach((allGroup) => {
				(async () => {
					var totalAlive = 0;
					var RoomUserSet = 'room_'+allGroup.id+'_users';
					var cmdRes = await redisCli.pipeline().srem(RoomUserSet, socket.user.uid).scard(RoomUserSet).exec();
					totalAlive = cmdRes[1][1];
					console.log(cmdRes);
					socket.broadcast.to(allGroup.id)
						.emit('system', socket.user, 'logout', allGroup.id, totalAlive);
				})();
			});
		});

		//发送消息
		socket.on('message', function (to, msg, from) {
			// groupRecentMessages[]
			socket.broadcast.to(to).emit('message', to, socket.user, msg);
			var message = {
				threadId: to,
				from: from,
				content: msg,
				time: new Date().getTime(),
				type: "receive",
				isRead: true
			};

			(async () => {
				var RoomMSgSet = 'room_'+to+'_recentmsg';
				await redisCli.pipeline()
					.lpush(RoomMSgSet, JSON.stringify(message))
					.ltrim(RoomMSgSet, 0, maxSaveLimit)
					.exec();
			})();
		});
	});
}


var http = require('http');
const app = express();
var server = http.createServer(app);

if (!sticky.listen(server, 3000)) {
	// Master code
	server.once('listening', function() {
	  console.log('server started on 3000 port');
	});
} else {	
	console.log('worker', cluster.worker.id)
	// Worker code
	app.use('/static', express.static(__dirname + '/static'));
	app.get("/", (req, res) => {
		let path = __dirname + '/static/index.html';
		res.sendFile(path);
	});
	
	var redis = require('socket.io-redis');
	const io = require('socket.io').listen(server);
	
	if(!isDebug) {
		io.adapter(redis({ host: 'localhost', port: redisPort }));
	}

	var channels = [{
		channel: '/channel',
		title: 'all'
	}];

	channels.forEach(function (group) {
		let channel = io.of(group.channel);;
		new GroupChat(channel, group);
	});
}
