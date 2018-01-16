var React = window.React,
    Component = React.Component,
    ReactDom = window.ReactDOM;

class RegisterApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            payId: window.location.search.split('?')[1].split('=')[1],
            username: "",
            usernameErrorText: "",
            password: "",
            passwordErrorText: "",
            passwordErrorFull: "",
            password2: "",
            userErrorClass: "",
            passwordErrorClass: "",
            password2ErrorClass: ""
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
                userErrorClass: "",
                passwordErrorClass: "",
                password2ErrorClass: ""
            },
            that = this;
        if (this.state.username.length < 5) {
            isError = true;
            errors.usernameErrorText = "Username needs to be atleast 5 characters long";
            errors.userErrorClass = "error";
        }
        if (this.state.password !== this.state.password2) {
            isError = true;
            errors.passwordErrorText = "Passwords do not match";
            errors.passwordErrorClass = "error";
            errors.password2ErrorClass = "error";
        }
        if (this.state.password.length < 8 && (this.state.password === this.state.password2)) {
            isError = true;
            errors.passwordErrorText = "Password needs to be atleast 8 characters long";
            errors.passwordErrorClass = "error";
            if (this.state.password2.length < 8) {
                errors.password2ErrorClass = "error";
            }
        }
        this.setState({
            ...this.state,
            ...errors
        });
        if (!isError) {
            var preloader = document.getElementById('preloader');
            preloader.style.display = 'block';
            ajax('/usernameValid', {username: this.state.username}, function (ans) {
                var answer = ans.answer;
                if (answer === 'user not exist') {
                    var data = 'payId=' + that.state.payId + '&username=' + that.state.username + '&password=' + that.state.password;
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', '/register?' + data, true);
                    xhr.send(null);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState != 4) return;
                        if (xhr.status != 200) {
                            JSON.parse(xhr.status + ': ' + xhr.statusText);
                        } else {
                            if(JSON.parse(xhr.responseText).answer === 'Registration success'){
                                window.location.href="/";
                            }
                        }
                    }
                } else if (answer === 'user already exist') {
                    isError = true;
                    errors.usernameErrorText = "Username is not unique try other";
                    that.setState({
                        ...that.state,
                        ...errors
                    })
                    // SHOW ERROR
                } else {
                    console.log(answer);
                    // errors
                }
            });
        }
        return isError;
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({
            userErrorClass: "",
            passwordErrorClass: "",
            password2ErrorClass: ""
        });
        // this.props.onSubmit(this.state);
        var err = this.validate();
        //clear form
        if (!err) {
            this.onChange({
                username: this.state.username,
                password: this.state.password,
                password2: this.state.password2
            });
        }
    };

    render() {
        return (
            <form id="registration-form">
                <div
                    className="form_header"
                ><p><span>
                            SignUp
                        </span></p>
                </div>
                <input
                    name="payId"
                    type="hidden"
                    value={window.location.search.split('?')[1].split('=')[1]}
                />
                <input
                    id="username"
                    name="username"
                    className="username_input"
                    value={this.state.username}
                    onChange={this.change}
                    required
                />
                <label
                    htmlFor="username"
                    className="username_label input_label"
                >Username</label>
                <p
                    className={this.state.userErrorClass}
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
                    htmlFor="password"
                    className="password_label input_label"
                >Password</label>
                <p
                    className={this.state.passwordErrorClass}
                ><span>
                    {this.state.passwordErrorText}
                </span></p>
                <input
                    id="password2"
                    name="password2"
                    className="password2_input"
                    type="password"
                    value={this.state.password2}
                    onChange={this.change}
                    required
                />
                <label
                    htmlFor="password2"
                    className="password2_label input_label"
                >Confirm Password</label>
                <p
                    className={this.state.password2ErrorClass}
                > </p>
                <button onClick={this.onSubmit}>SignUp</button>
            </form>
        );
    }
}

ReactDom.render(<RegisterApp/>, document.getElementById('register__form'));