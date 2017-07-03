var http = require('http');
var socket =  require('socket.io');
var express = require('express');

    app = express();
    server = http.createServer(app);
    io = socket.listen(server);
    users = [];

    app.use('/',express.static(__dirname+'/www'));
	server.listen(9963);

	io.on('connection',function(sock) {

		sock.on('login',function(nickname){
			if(users.indexOf(nickname)>-1){
				sock.emit('nickExisted');
			}else{
				sock.userIndex = users.length;
	            sock.nickname = nickname;
	            users.push(nickname);
	            sock.emit('loginSuccess');
	            io.sockets.emit('system', nickname, users.length, 'login');
			}
		});

		sock.on('foo',function(data) {
			console.log(data);	
		});

		sock.on('disconnect',function(){
			if(sock.nickname){
				users.splice(inArray(sock.nickname,users),1);
				sock.broadcast.emit('system', sock.nickname, users.length, 'logout');
			}
		});

		sock.on('postMsg', function(msg,color) {
	        //将消息发送到除自己外的所有用户
	        sock.broadcast.emit('newMsg', sock.nickname, msg,color);
	    });

	    sock.on('img', function(imgData) {
		    //通过一个newImg事件分发到除自己外的每个用户
		     sock.broadcast.emit('newImg', sock.nickname, imgData);
		 });

	});
	function inArray(needle, haystack) {
	    var length = haystack.length;
	    for(var i = 0; i < length; i++) {
	        if(haystack[i] == needle) return i;
	    }
	}

console.log('server started');