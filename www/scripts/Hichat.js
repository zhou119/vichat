window.onload = function() {
	var hichat = new HiChat();
	hichat.init();
};

var HiChat = function() {
	this.socket=null;
};

HiChat.prototype = {
	init: function() {
		var that = this;
		this.socket = io.connect();
		this.socket.on('connect',function() {
			document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
		});

		document.getElementById('loginBtn').addEventListener('click',function(){
		var nickName = document.getElementById('nicknameInput').value;
			if(nickName.trim().length>0){
				that.socket.emit('login',nickName);
			}else{
				document.getElementById('nicknameInput').focus();
			}
		},false);

		this.socket.on('nickExisted', function() {
     		document.getElementById('info').textContent = '!nickname is taken, choose another pls';
 		});

 		this.socket.on('loginSuccess', function() {
		    document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
		    document.getElementById('loginWrapper').style.display = 'none';
		    document.getElementById('messageInput').focus();
		});

		this.socket.on('system', function(nickName, userCount, type) {
		     //判断用户是连接还是离开以显示不同的信息
		     var msg = nickName + (type == 'login' ? ' joined' : ' left');
		     that._displayNewMsg('system',msg,'red');
		     //将在线人数显示到页面顶部
		     document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
		 });

		this.socket.on('newMsg', function(user, msg) {
			that._displayNewMsg(user, msg);
		});

		this.socket.on('newImg', function(user, img) {
		     that._displayImage(user, img);
		 });

		document.getElementById('sendBtn').addEventListener('click', function() {
		    var messageInput = document.getElementById('messageInput'),
		        msg = messageInput.value;
		    messageInput.value = '';
		    color = document.getElementById('colorStyle').value;
		    messageInput.focus();
		    if (msg.trim().length != 0) {
		        that.socket.emit('postMsg', msg,color); //把消息发送到服务器
		        that._displayNewMsg('me', msg,color); //把自己的消息显示到自己的窗口中
		    };
		}, false);	

		document.getElementById('sendImage').addEventListener('change', function() {
		    //检查是否有文件被选中
		     if (this.files.length != 0) {
		        //获取文件并用FileReader进行读取
		         var file = this.files[0],
		             reader = new FileReader();
		         if (!reader) {
		             that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
		             this.value = '';
		             return;
		         };
		         reader.onload = function(e) {
		            //读取成功，显示到页面并发送到服务器
		             this.value = '';
		             that.socket.emit('img', e.target.result);
		             that._displayImage('me', e.target.result);
		         };
		         reader.readAsDataURL(file);
		     };
		 }, false);	

		this._initialEmoji();
		 document.getElementById('emoji').addEventListener('click', function(e) {
		     var emojiwrapper = document.getElementById('emojiWrapper');
		     emojiwrapper.style.display = 'block';
		     e.stopPropagation();
		 }, false);
		 document.body.addEventListener('click', function(e) {
		     var emojiwrapper = document.getElementById('emojiWrapper');
		     if (e.target != emojiwrapper) {
		         emojiwrapper.style.display = 'none';
		     };
		 });

		 document.getElementById('emojiWrapper').addEventListener('click', function(e) {
		    //获取被点击的表情
		    var target = e.target;
		    if (target.nodeName.toLowerCase() == 'img') {
		        var messageInput = document.getElementById('messageInput');
		        messageInput.focus();
		        messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
		    };
		}, false);

		document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
		      if (e.keyCode == 13) {
		          var nickName = document.getElementById('nicknameInput').value;
		          if (nickName.trim().length != 0) {
		              that.socket.emit('login', nickName);
		          };
		      };
		}, false);
	},

	_displayNewMsg: function(user,msg,color){
		var container = document.getElementById('historyMsg')
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + this._showEmoji(msg);
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
	},

	_displayImage: function(user, imgData, color) {
	    var container = document.getElementById('historyMsg'),
	        msgToDisplay = document.createElement('p'),
	        date = new Date().toTimeString().substr(0, 8);
	    msgToDisplay.style.color = color || '#000';
	    msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
	    container.appendChild(msgToDisplay);
	    container.scrollTop = container.scrollHeight;
	},

	_initialEmoji: function() {
	    var emojiContainer = document.getElementById('emojiWrapper'),
	        docFragment = document.createDocumentFragment();
	    for (var i = 62; i > 0; i--) {
	        var emojiItem = document.createElement('img');
	        emojiItem.src = '../content/emoji/' + i + '.gif';
	        emojiItem.title = i;
	        docFragment.appendChild(emojiItem);
	    };
	    emojiContainer.appendChild(docFragment);
	},

	_showEmoji: function(msg) {
	    var match, 
	        result = msg,
	        reg = /\[emoji:\d+\]/g,
	        emojiIndex,
	        totalEmojiNum = document.getElementById('emojiWrapper').children.length;
	    while (match = reg.exec(msg)) {
	        emojiIndex = match[0].slice(7, -1);
	        if (emojiIndex > totalEmojiNum) {
	            result = result.replace(match[0], '[X]');
	        } else {
	            result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
	        };
	    };
	    return result;
	}
};