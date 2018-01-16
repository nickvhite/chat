function setCookie(cname, cvalue, exMins) {
    var d = new Date();
    d.setTime(d.getTime() + (exMins * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

window.ajax = function ajax(url, data, callback) {
    var xhr = new XMLHttpRequest();
    var str = '?';
    if (data) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                let val = data[key].push ? JSON.stringify(data[key]) : data[key];
                str += ( key + '=' + val + '&');
            }
        }
    } else {
        data = null;
    }
    xhr.open('GET', url + str, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            callback(JSON.parse(xhr.status + ': ' + xhr.statusText));
        } else {
            callback(JSON.parse(xhr.responseText));
        }
    }
};

function askCookie() {
    ajax('/cookie', {}, function (ans) {
        setCookie('username', ans.username, 30);
    })
};
askCookie();
var exit = document.getElementById('exitLink');
exit.addEventListener('click', function () {
    setCookie('username', '', 0);
    setCookie('connect.sid', '', 0);
});
var ChatApp = window.React.createClass({
    step: 0,
    lastMessagesAnsverLength: 30,
    askMessages: function (step) {
        var self = this,
            field = document.getElementById('chat-field'),
            fieldHeight = field.scrollHeight,
            preloader = document.getElementById('preloader_chat');
        window.ajax('/messages', {step: step}, function (ans) {
            self.lastMessagesAnsverLength =ans.length;
            if (!ans.length) {
                preloader.style.display = 'none';
                return;
            }
            ans.reverse();
            var messages = self.state.messages,
                msgArr = [];
            ans.forEach(function (msg) {
                msgArr.push(self.convertDate(msg));
            });
            msgArr = msgArr.concat(messages);
            self.state.messages = msgArr;
            self.setState({messages: msgArr});
            field.scrollTop = field.scrollHeight - fieldHeight;
            preloader.style.display = 'none';
        });
        self.step += 1;
    },
    getInitialState: function () {
        return {
            messages: [],
            user: undefined,
            date: undefined,
            socket: window.io('https://afternoon-forest-18813.herokuapp.com/')
        }
    },
    convertDate: function (message) {
        var convertedDate = new Date(message.date - new Date().getTimezoneOffset() * 60 * 1000);
        var options = {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit'
        };
        return {
            text: message.text,
            user: message.user ? message.user : message.username,
            date: convertedDate.toLocaleString("en-US", options)
        }
    },
    componentDidMount: function () {
        var self = this,
            field = document.getElementById('chat-field'),
            preloader = document.getElementById('preloader_chat');
        self.askMessages(self.step);
        this.state.socket.on("receive-message", function (msg) {
            var fieldScrollHeight = field.scrollHeight,
                fieldHeight = field.clientHeight,
                fieldTop = field.scrollTop,
                mes = self.convertDate(msg),
                messages = self.state.messages;
            messages.push(mes);
            self.setState({messages: messages});
            preloader.style.display = 'none';
            field.scrollTop = fieldTop === fieldScrollHeight - fieldHeight ? 9999999 : fieldTop;
        });
    },
    catchEnter: function (event) {
        if ((event.keyCode === 10 || event.keyCode === 13) && event.ctrlKey) {
            document.getElementById('submit').click();
        }
    },
    catchScroll: function (event) {
        var self = this;
        if (event.target.scrollTop === 0 && self.lastMessagesAnsverLength === 30) {
            self.askMessages(self.step);
            var preloader = document.getElementById('preloader_chat');
            preloader.style.display = 'block';
        }
    },
    submitMessage: function (event) {
        event.preventDefault();
        var message = {
            text: document.getElementById('message').value,
            user: document.cookie.split('=')[1],
            date: new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000)
        };
        this.state.socket.emit("new-message", message);
        document.getElementById('message').value = '';
    },
    render: function () {
        var self = this;
        var messages = self.state.messages.map(function (msg) {
            return <div id="message-field">
                <p id="message-field__user">
                    {msg.user}
                    <br/>
                    {msg.date}
                </p>
                <p id="message-field__text">
							<pre>
								<strong>
									{msg.text}
								</strong>
							</pre>
                </p>
            </div>
        });
        return (
            <div id="chat-field" onScroll={() => self.catchScroll(event)}>
                {messages}
                <form method="post" onSubmit={() => self.submitMessage(event)}>
                    <textarea id="message" onKeyDown={() => self.catchEnter(event)} name="message" cols="30" rows="3"
                              wrap="hard"></textarea>
                    <input id="submit" type="submit" name="submit" value="send"/>
                </form>
            </div>
        )
    }
});
window.ReactDOM.render(
    <ChatApp/>,
    document.getElementById("chat")
);