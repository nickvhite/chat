var express = require('express'),
	app = require('./app'),
	http = require('http').Server(app),
	Message = require('./models/message'),
	io = require('socket.io')(http);

io.on('connection', function(socket){
  socket.on("new-message", function(msg){
  	var newMessage = new Message({username: msg.user, text: msg.text, date: msg.date});
    newMessage.save(function(err){
      if (err) throw err;
      io.emit("receive-message", msg);
    })
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});