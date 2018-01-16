window.onload = function() {

	var start;

	function StartPage() {
		this.stringNum = 0,
		this.stringClasses = [
			'greeting__caption',
			'text_1',
			'text_2',
			'text_3',
			'text_4'
		],
		this.greeting = [
			'HELLO!!!',
			'All the world\'s a stage,',
			'And all the men and women merely players:',
			'They have their exits and their entrances;',
			'And one man in his time plays many parts.'
		]
	};

	StartPage.prototype.showButtons = function() {
		var buttons = document.getElementById('buttons');
		buttons.style.visibility = 'visible';
		buttons.classList.add('fadeIn');
	};

    StartPage.prototype.showLogo = function() {
        var logo = document.getElementById('logo');
        logo.style.opacity = '1';
        logo.style.top = '100px';
    };

	StartPage.prototype.showString = function(sourse, clas) {
		var that = this,
			literNum = 0,
			str = document.querySelector('.' + clas).firstChild,
			sourseArr = sourse.split('');
		function addLiter() {
			setTimeout(function() {
				str.innerHTML += sourseArr[literNum];
				literNum += 1;
				if( literNum < sourseArr.length ) {
					addLiter();
				} else if(that.stringNum < 4){
					that.stringNum += 1;
					that.showString(that.greeting[that.stringNum], that.stringClasses[that.stringNum]);
				} else if(that.stringNum === 4) {
					that.showButtons();
				}
			}.bind(this), 15)
		}
		addLiter();
	};
	start = new StartPage();
    setTimeout(start.showString.bind(start), 2000, start.greeting[start.stringNum], start.stringClasses[start.stringNum]);
    start.showLogo();

	var loginButton = document.querySelector('.login__button'),
		registerButton = document.querySelector('.donate__button'),
		loginForm = document.getElementById('login__form'),
		donateFormContainer = document.getElementById('donate__form'),
		startContainer = document.getElementById('start__container'),
		buttons = document.getElementById('buttons'),
		backButton = document.getElementById('back__button'),
		body = document.body;

	function showForm(form) {
		startContainer.style.display = 'none';
		buttons.style.display = 'none';
		backButton.style.display = 'block';
		form.style.display = 'block';
	}

	function hideForms() {
		startContainer.style.display = 'block';
		buttons.style.display = 'flex';
		backButton.style.display = 'none';
		loginForm.style.display = 'none';
		donateFormContainer.style.display = 'none';
        body.classList.remove("donate");
        body.classList.remove("login");
	};
	loginButton.addEventListener('click', function(){
		showForm(loginForm);
		body.classList.add("login");
	});
	registerButton.addEventListener('click', function(){
		showForm(donateFormContainer);
        body.classList.add("donate");
	});
	backButton.addEventListener('click', hideForms);
};