(function(){
	window.onload = function(){
		//var socket = new WebSocket('ws://echo.websocket.org');
		var socket = new WebSocket('ws://localhost:8080');
		var status = document.getElementById('status');
		socket.onmessage = function(event){
			if (document.cookie) {
				let mess = JSON.parse(event.data);
				var name = document.cookie.split('; ')[1].split('=')[1];
				var date = new Date;
				var div = document.getElementById('messages-field');
				var innerDiv = document.createElement('div');
				innerDiv.classList.add('message');
				var title = document.createElement('p');
				title.classList.add('message__title');
				title.innerHTML = '<span>' + `${mess.name}` + '</span><br>' + 
				'<span>' + date.getHours() + ':' + date.getMinutes() + '</span>';
				var content = document.createElement('p');
				content.classList.add('message__content');
				content.innerHTML = `${mess.msg}`;
				if(`${mess.name}` === name) {
					title.classList.add('my_title');
					content.classList.add('my_content');
					innerDiv.appendChild(content);
					innerDiv.appendChild(title);
				} else {
					innerDiv.appendChild(title);
					innerDiv.appendChild(content);
				}
				div.appendChild(innerDiv);
				div.scrollTop = 9999;
				document.getElementById('textField').value = '';
			}
		};
		document.forms['messages'].onsubmit = function(){
			var str = this.msg.value.replace(/\n/ig, '<br>');
			let message = {
                id: document.cookie.split('; ')[0].split('=')[1],
				name: document.cookie.split('; ')[1].split('=')[1],
				msg: str
			};
			if (this.msg.value === '') {
				return false;
			}
            var mes = JSON.stringify(message);
			socket.send(mes);
            var x = new XMLHttpRequest();
            x.open("POST", "messages.php?", true);
            x.send(mes);
			return false;
		};
		var area = document.getElementById('textField');
		var submitButton = document.getElementsByClassName('messages__submit')[0].children[0];

		function catchEnter(event) {
			if((event.keyCode === 10 || event.keyCode === 13) && event.ctrlKey) {
				submitButton.click();
			}
		}
		area.addEventListener('keypress', catchEnter);
	};
})();