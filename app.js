const express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  //用于保存用户信息的数组
  users = [];
let kit = {
  //判断用户是否存在
  isHaveUser(user) {
    var flag = false;
    users.forEach(function (item) {
      if (item.uid == user.uid) {
        flag = true;
      }
    })
    return flag;
  },
  //删除某一用户
  delUser(id) {
    users.forEach(function (item, index) {
      if (item.id == id) {
        users.splice(index, 1);
      }
    })
  }
}
//设置静态资源
app.use('/static', express.static(__dirname + '/static'));
//用户访问网站页面会根据浏览器userAgent返回不同的页面
app.get("/", (req, res) => {
  let path = __dirname + '/static/index.html';
  res.sendFile(path);
  // let userAgent = req.headers['user-agent'].toLowerCase();
  // let bIsIpad = userAgent.match(/ipad/i) == "ipad";
  // let bIsIphoneOs = userAgent.match(/iphone os/i) == "iphone os";
  // let bIsMidp = userAgent.match(/midp/i) == "midp";
  // let bIsUc7 = userAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
  // let bIsUc = userAgent.match(/ucweb/i) == "ucweb";
  // let bIsAndroid = userAgent.match(/android/i) == "android";
  // let bIsCE = userAgent.match(/windows ce/i) == "windows ce";
  // let bIsWM = userAgent.match(/windows mobile/i) == "windows mobile";
  // if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
  //   let path = __dirname + '/static/iChat.html';
  //   res.sendFile(path);
  // } else {
  //   let path = __dirname + '/static/index.html';
  //   res.sendFile(path);
  // }
})

var fs = require('fs');
var chatHistory = {
  add(){

  },
  addGroup(){

  }
}

var recentMessages = [];

io.sockets.on('connection', function (socket) {
  //创建用户链接
  socket.on('login', (user) => {
    if (kit.isHaveUser(user)) {
      console.log("登录失败！", user)
      socket.emit('loginFail', "登录失败,昵称已存在!");
    } else {
      socket.user = user;
      user.id = socket.id;
      user.address = socket.handshake.address;
      console.log("登录成功！", user)
      socket.emit('loginSuccess', user, users, recentMessages);
      users.push(user)
      socket.broadcast.emit('system', user, 'join');
    }
  });

  //用户注销链接
  socket.on('disconnect',()=> {
    if (socket.user != null) {
      kit.delUser(socket.id);
      console.log("用户退出！", socket.user)
      socket.broadcast.emit('system', socket.user, 'logout');
    }
  });

  //群发消息
  socket.on('groupMessage', function (msg, from) {
    console.log(msg, from);
    //用户登录状态掉线，重置用户登录状态
    if (!socket.user) {
      from.id = socket.id;
      socket.user = from;
      users.push(from);
      socket.broadcast.emit('system', from, 'join');
      socket.emit('loginSuccess', from, []);
    }
    socket.broadcast.emit('groupMessage', socket.user, msg);
    if(recentMessages.length > 25){
      recentMessages.shift();
    }

    recentMessages.push({
      threadId: 'group',
      from: from,
      to: {},
      content: msg,
      time: new Date().getTime(),
      type: "receive",
      isRead: true
    });
  });

  //发送私信
  socket.on('message', function (id, msg, from) {
    //用户登录状态掉线，重置用户登录状态
    if (!socket.user) {
      from.id = socket.id;
      socket.user = from;
      users.push(from);
      socket.broadcast.emit('system', from, 'join');
      socket.emit('loginSuccess', from, []);
    }
    console.log(msg, from, id);
    socket.broadcast.to(id).emit('message', socket.user, msg);
  });
});

//启动服务器
server.listen(3000, function () {
  console.log("服务器已启动在：3000端口", "http://localhost:3000")
});