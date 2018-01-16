(function(){
    var React = window.React,
        Component = React.Component,
        ReactDom = window.ReactDOM;

    class LoginApp extends Component {
        constructor(props) {
            super(props);
            this.state = {
                username: "",
                usernameErrorText: "",
                userNameErrorClass: "",
                password: "",
                passwordErrorText: "",
                passwordErrorClass: "",
                userErrorClass: "",
                userErrorText: ""
            };
            this.onSubmit = this.onSubmit.bind(this);
            this.onChange = this.onChange.bind(this);
            this.change = this.change.bind(this);
            this.validate = this.validate.bind(this);
        };

        onChange(updatedValue) {
            this.setState({
                fields: {
                    ...this.state.fields,
                    ...updatedValue
                }
            });
        };

        change(e) {
            this.onChange({[e.target.name]: e.target.value});
            if (e.target.value.length > 0) {
                e.target.classList.add("inputed");
            } else {
                e.target.classList.remove("inputed");
            }
            this.setState({
                [e.target.name]: e.target.value
            });
        };

        validate() {
            let isError = false,
                errors = {
                    userNameErrorClass: "",
                    passwordErrorClass: "",
                    userErrorClass: "",
                    userErrorText: ""
                },
                that = this;
            if (this.state.username.length < 1) {
                isError = true;
                errors.usernameErrorText = "Enter Username";
                errors.userNameErrorClass = "error";
            }
            if (this.state.password.length < 1) {
                isError = true;
                errors.passwordErrorText = "Enter Password";
                errors.passwordErrorClass = "error";
            }
            this.setState({
                ...this.state,
                ...errors
            });
            if (!isError) {
                var preloader = document.getElementById('preloader');
                preloader.style.display = 'block';
                var data = {username: this.state.username, password: this.state.password}
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '/login?' + 'username='+this.state.username+'&password='+this.state.password);
                xhr.send(null)
                xhr.onreadystatechange = function() {
                    if (xhr.readyState != 4) return;
                    if (xhr.status != 200) {
                        console.log(xhr.response);
                    } else {
                        if(xhr.responseText === 'Uncnown User'){
                            isError = true;
                            errors.userErrorClass = "error_user";
                            errors.userErrorText = "Invalid login or password";
                            preloader.style.display = 'none';
                            that.setState({
                                ...that.state,
                                ...errors
                            });
                        } else {
                            window.location.href="/";
                        }
                    }
                }
            }
            return isError;
        }

        onSubmit(e) {
            e.preventDefault();
            this.setState({
                userNameErrorClass: "",
                passwordErrorClass: "",
                userErrorClass: "",
                userErrorText: ""
            });
            // this.props.onSubmit(this.state);
            var err = this.validate();
            //clear form
            if (!err) {
                this.onChange({
                    username: this.state.username,
                    password: this.state.password
                });
            }
        };

        render() {
            return (
                <form id="login-form">
                    <div
                        className="form_header"
                    ><p><span>
                            SignIn
                        </span></p>
                    </div>
                    <p
                        className={this.state.userErrorClass}
                    ><span>
                        {this.state.userErrorText}
                    </span></p>
                    <input
                        id="username"
                        name="username"
                        className="username_input"
                        value={this.state.username}
                        onChange={this.change}
                        required
                    />
                    <label
                        className="username_label input_label"
                        htmlFor="username"
                    >Username</label>
                    <p
                        className={this.state.userNameErrorClass}
                    ><span>
                        {this.state.usernameErrorText}
                    </span></p>
                    <input
                        id="password"
                        name="password"
                        className="password_input"
                        type="password"
                        value={this.state.password1}
                        onChange={this.change}
                        required
                    />
                    <label
                        className="password_label input_label"
                        htmlFor="password"
                    >Password</label>
                    <p
                        className={this.state.passwordErrorClass}
                    ><span>
                        {this.state.passwordErrorText}
                    </span></p>
                    <button onClick={this.onSubmit}>SignIn</button>
                </form>
            );
        }
    }

    ReactDom.render(<LoginApp/>, document.getElementById('login__form'));
})();