const express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

const fs = require('fs');

app.use('/static', express.static(__dirname + '/static'));
app.get("/", (req, res) => {
	let path = __dirname + '/static/index.html';
	res.sendFile(path);
});


function GroupChat(channel, group) {

	var allGroups = [
		{
			id: "wf5mfgmui7grb546",
			avatarUrl: "/static/images/group-icon.png",
			name: 'VIP用户交流',
			type: "group"
		},
		{
			id: "4j2e8xk1uimg1gir",
			avatarUrl: "/static/images/group-icon.png",
			name: '普通用户交流',
			type: "group"
		}
	];
	
	var groupData = {};
	var groupRecentMessages = {};
	var cacheFile = './cache.json';

	if(fs.existsSync(cacheFile)){
		groupRecentMessages = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
	}

	channel.on('connection', function (socket) {
		console.log('new connection', group);
		var userGroups = [];

		//创建用户链接
		socket.on('login', (user) => {
			console.log('login', user);
			var uid = user.uid;
			socket.user = user;

			userGroups = [].concat(allGroups);
			if(user.role != 'vip'){
				userGroups.shift();
			}

			userGroups.forEach((allGroup) => {
				groupData[allGroup.id] = groupData[allGroup.id] || {};
				groupData[allGroup.id][uid] = socket.id;

				socket.join(allGroup.id);
				var groupUserCount =  Object.keys(groupData[allGroup.id]).length;
				allGroup.online = groupUserCount;
				socket.broadcast.to(allGroup.id).emit('system', user, 'join', allGroup.id, groupUserCount);
			});

			var returnData = [].concat(userGroups);
			returnData.forEach((g) => {
				g.recentMessages = groupRecentMessages[g.id] || [];
			})

			socket.emit('loginSuccess', user, [], returnData, returnData[0].online);
		});

		//用户注销链接
		socket.on('disconnect', () => {
			if(socket.user == null){
				return;
			}
			userGroups.forEach((allGroup) => {
				if(groupData[allGroup.id]) {
					delete groupData[allGroup.id][socket.user.uid];
				}
				socket.broadcast.to(allGroup.id)
					.emit('system', socket.user, 'logout', allGroup.id, Object.keys(groupData[allGroup.id]).length);
			});
		});

		//发送消息
		socket.on('message', function (to, msg, from) {
			// groupRecentMessages[]
			socket.broadcast.to(to).emit('message', to, socket.user, msg);
			groupRecentMessages[to] = groupRecentMessages[to] || [];

			var recentMessages = groupRecentMessages[to];
			if(recentMessages.length > 16){
				recentMessages.shift();
			}
			recentMessages.push({
				threadId: to,
				from: from,
				content: msg,
				time: new Date().getTime(),
				type: "receive",
				isRead: true
			  });
		});
	});

	setInterval(() => {
		try{
			fs.writeFileSync(cacheFile, JSON.stringify(groupRecentMessages));
		}catch(e){}
		// groupRecentMessages
	}, 60 * 1000);
	// groupRecentMessages
}

var channels = [{
	channel: '/',
	title: 'all'
}];

channels.forEach(function(group){
	let channel = io.of(group.channel);;
	new GroupChat(channel, group);
});

//启动服务器
server.listen(3000, function () {
	console.log("服务器已启动在：3000端口", "http://localhost:3000")
});