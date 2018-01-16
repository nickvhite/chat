(function(){
    var React = window.React,
        Component = React.Component,
        ReactDom = window.ReactDOM;

    class DonateApp extends Component {
        constructor(props) {
            super(props);
            this.state = {
                email: "",
                emailErrorText: "",
                emailErrorClass: ""
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
                    emailErrorText: "",
                    emailErrorClass: ""
                },
                that = this;
            if (this.state.email.length < 1) {
                isError = true;
                errors.emailErrorText = "Enter Your email address";
                errors.emailErrorClass = "error";
            } else if (this.state.email.indexOf("@") === -1) {
                isError = true;
                errors.emailErrorText = "Email must have @";
                errors.emailErrorClass = "error";
            }
            this.setState({
                ...this.state,
                ...errors
            });
            if (!isError) {
                let preloader = document.getElementById('preloader');
                preloader.style.display = 'block';
                let xhr = new XMLHttpRequest();
                xhr.open('GET', '/mailValid?' + 'email='+this.state.email);
                xhr.send(null)
                xhr.onreadystatechange = function() {
                    if (xhr.readyState != 4) return;
                    if (xhr.status != 200) {
                        console.log(xhr.response);
                    } else {
                        if(xhr.responseText === 'email already exist'){
                            preloader.style.display = 'none';
                            isError = true;
                            errors.emailErrorText = "Email not unique, try other";
                            errors.emailErrorClass = "error";
                            that.setState({
                                ...that.state,
                                ...errors
                            });
                        } else if(xhr.responseText === 'email not exist'){
                            var form = document.getElementById('donate-form');
                            form.submit();
                            return;
                        } else {
                            preloader.style.display = 'none';
                            isError = true;
                            errors.emailErrorText = "Something went wrong";
                            errors.emailErrorClass = "error";
                            that.setState({
                                ...that.state,
                                ...errors
                            });
                        }
                    }
                }
            }
            return isError;
        }

        onSubmit(e) {
            e.preventDefault();
            this.setState({
                emailErrorClass: ""
            });
            // this.props.onSubmit(this.state);
            var err = this.validate();
            //clear form
            if (!err) {
                this.onChange({
                    email: this.state.email
                });
            }
        };

        render() {
            return (
                <form
                    id="donate-form"
                    method="post"
                    action="/pay"
                >
                    <div
                        className="form_header"
                    ><p><span>
                            Donate
                        </span></p>
                    </div>
                    <input
                        id="email"
                        name="email"
                        className="email_input"
                        value={this.state.email}
                        onChange={this.change}
                        required
                    />
                    <label
                        className="email_label input_label"
                        htmlFor="email"
                    >Email</label>
                    <p
                        className={this.state.emailErrorClass}
                    ><span>
                        {this.state.emailErrorText}
                    </span></p>
                    <button
                        id="button-donate"
                        onClick={this.onSubmit}
                    > </button>
                </form>
            );
        }
    }

    ReactDom.render(<DonateApp/>, document.getElementById('donate__form'));
})();