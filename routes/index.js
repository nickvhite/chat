var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/user'),
    Pay = require('../models/pay'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    paypal = require('paypal-rest-sdk'),
    MongoClient = require('mongodb').MongoClient;

paypal.configure({
    'mode': 'sandbox', // sandbox или live
    'client_id': 'AeNYu-PwZs9ulbPctLMxj8GzHAUgmtC1nlR8GBzZgS8AmlVZJZvOcfJtD3WJM1HIMlSUyus38YyrZLaR',
    'client_secret': 'EI5hT7YMffU3ikHG50UkTio3lGlHzyg3FAU8Ha-dE7x3-b1aCeTgaLfFPUI10DsPFhGkLIs727B93DKY'
});

router.post('/pay', function (req, res) {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "https://afternoon-forest-18813.herokuapp.com/success_pay",
            "cancel_url": "https://afternoon-forest-18813.herokuapp.com/cansel_pay"
        },
        // "redirect_urls": {
        //     "return_url": "http://localhost:3000/success_pay",
        //     "cancel_url": "http://localhost:3000/cansel_pay"
        // },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Registration donate",
                    "sku": "001",
                    "price": "5.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "5.00"
            },
            "description": "Registration donate",
            "custom": req.body.custom
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            var newPay = new Pay({payid: payment.id, usermail: payment.transactions[0].custom});
            newPay.save(function (err) {
                if (err) throw err;
            });
            for (var i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

var transporter = nodemailer.createTransport(smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "nickvhite26@gmail.com",
        pass: "Nick123nick"
    }
}));

router.get('/success_pay', function (req, res) {
    var payerId = req.query.PayerID,
        paymentId = req.query.paymentId,
        execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "5.00"
                }
            }]
        };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            MongoClient.connect('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb', function (err, db) {
                if (err) throw err;
                var myquery = {payid: payment.id, usermail: payment.transactions[0].custom};
                db.collection("pays").findOne(myquery, function (err, res) {
                    if (err) {
                        throw err;
                    } else if (!res.registered && !res.sendmail && !res.successpay) {
                        db.collection("pays").updateOne(myquery, {$set: {successpay: true}}, function (err, res) {
                            if (err) throw err;
                        });
                        var mailOptions = {
                            from: 'nickvhite26@gmail.com', //от кого
                            to: res.usermail,  //кому
                            subject: 'HI', //тема
                            text: 'https://afternoon-forest-18813.herokuapp.com/register?_id=' + res.payid //текст
                            // text: 'http://localhost:3000/register?_id=' + res.payid //текст
                        };
                        transporter.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                throw error;
                            } else {
                                db.collection("pays").updateOne(myquery, {$set: {sendmail: true}}, function (err, res) {
                                    if (err) throw err;
                                    db.close();
                                });
                            }
                        });
                    }
                });
            });
            res.send('Success');
        }
    });
});

router.get('/cancel_pay', function (req, res) {
    res.send('Canseled');
});

/* GET home page. */
router.get('/', ensureAuthenticated, function (req, res) {
    res.render('index');
});

router.get('/index', function(req, res){
    res.redirect('/');
});

function ensureAuthenticated(req, res) {
    if (req.isAuthenticated()) {
        res.render('chat');
        return true;
    }
    res.render('index');
}

router.get('/cookie', function (req, res) {
    res.end(JSON.stringify({username: req.user.username}));
});

router.get('/messages', function(req, res){
    console.log(req.query.step);
    MongoClient.connect('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb', function(err, db) {
       var messages = db.collection('messages').find().sort({date: -1}).skip(30*req.query.step).limit(30).toArray(function(err, data){
           res.json(data);
       });
   })
});

router.get('/mailValid', function (req, res) {
    MongoClient.connect('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb', function (err, db) {
        db.collection("pays").findOne({usermail: req.query.email}, function (err, result) {
            if (err) res.end(err);
            if (!result) {
                res.end('email not exist');
            }
            else res.end('email already exist');
            db.close();
        })
    })
});

router.get('/usernameValid', function (req, res) {
    MongoClient.connect('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb', function (err, db) {
        db.collection("users").findOne({username: req.query.username}, function (err, result) {
            if (err) res.end(JSON.stringify({answer: err}));
            if (!result) res.end(JSON.stringify({answer: 'user not exist'}));
            else res.end(JSON.stringify({answer: 'user already exist'}));
            db.close();
        })
    })
});

router.get('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.end(info.message); }
        var user_id = user.id;
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    })(req, res, next);
});

passport.serializeUser(function (user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
    User.getUserById(user_id, function (err, user_id) {
        done(err, user_id);
    });
});

passport.use(new LocalStrategy(function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (!user) {
            return done(null, false, {message: 'Uncnown User'});
        }
        User.comparePassword(password, user.password, function (err, isMatch) {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Uncnown User'});
            }
        })
    })
}));

router.get('/register', function (req, res) {
    MongoClient.connect('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb', function (err, db) {
        db.collection("pays").findOne({payid: req.query._id}, function (err, result) {
            if (err) throw err;
            if (!result) res.end(JSON.stringify({answer: 'Pay not found'}));
            else {
                if(result.registered) {
                    res.end(JSON.stringify({answer: 'User already registered'}));
                } else if(!result.registered) {
                    res.render('register', {email: req.query._id});
                }
            }
            db.close();
        })
    });
});

router.post('/register', function (req, res) {
    var payId = req.query.payId,
        username = req.query.username,
        password = req.query.password;
    MongoClient.connect('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb', function (err, db) {
        db.collection("pays").findOne({payid: payId}, function (err, result) {
            if (err) throw err;
            if (!result) res.end(JSON.stringify({answer: 'Pay not found'}));
            else {
                if(result.registered) {
                    res.end(JSON.stringify({answer: 'User already registered'}));
                } else if(!result.registered) {
                    var newUser = new User({
                        email: result.usermail,
                        username: username,
                        password: password
                    });
                    User.createUser(newUser, function (err, user) {
                        if (err) throw err;
                        else {
                            MongoClient.connect('mongodb://nickvhite:Nick123nick@ds121955.mlab.com:21955/chatdb', function (err, db) {
                                db.collection("pays").updateOne({usermail: user.email}, {$set: {registered: true}}, function (err, res) {
                                    if (err) throw err;
                                });
                            });
                            req.logIn(user, function(err) {
                                var user_id = user.id;
                                if (err) { return next(err); }
                                res.end(JSON.stringify({answer: 'Registration success'}));
                            });
                        }
                    });
                }
            }
            db.close();
        });
    });
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;


// {
// 	"id":"PAY-2TM5400733587935ALHW22EI",
// 	"intent":"sale",
// 	"state":"approved",
// 	"cart":"24M99545BG3124915",
// 	"payer": {
// 		"payment_method":"paypal",
// 		"status":"VERIFIED",
// 		"payer_info": {
// 			"email":"chesterPersonal@gmail.com",
// 			"first_name":"Brath",
// 			"last_name":"Chester",
// 			"payer_id":"HULJG5NYED9FL",
// 			"shipping_address": {
// 				"recipient_name":"Brath Chester",
// 				"line1":"1 Main St",
// 				"city":"San Jose",
// 				"state":"CA",
// 				"postal_code":"95131",
// 				"country_code":"US"
// 			},
// 			"country_code":"US"
// 		}
// 	},
// 	"transactions": [{ 
// 		"amount": {
// 			"total":"5.00",
// 			"currency":"USD",
// 			"details":{}
// 		},
// 		"payee": {
// 			"merchant_id":"5CJWXPPMWPP78"
// 			,"email":"chesterBusines@gmail.com"
// 		},
// 		"description":"Registration donate",
// 		"item_list": {
// 			"items": [{
// 				"name":"Registration donate",
// 				"sku":"001",
// 				"price":"5.00",
// 				"currency":"USD",
// 				"quantity":1
// 			}],
// 			"shipping_address": {
// 				"recipient_name":"Brath Chester",
// 				"line1":"1 Main St",
// 				"city":"San Jose",
// 				"state":"CA",
// 				"postal_code":"95131",
// 				"country_code":"US"
// 			}
// 		},
// 		"related_resources": [{
// 			"sale": {
// 				"id":"8FS662642W175072U",
// 				"state":"completed",
// 				"amount": {
// 					"total":"5.00",
// 					"currency":"USD",
// 					"details": {
// 						"subtotal":"5.00"
// 					}
// 				},
// 				"payment_mode":"INSTANT_TRANSFER",
// 				"protection_eligibility":"INELIGIBLE",
// 				"transaction_fee": {
// 					"value":"0.45",
// 					"currency":"USD"
// 				},
// 				"parent_payment":"PAY-2TM5400733587935ALHW22EI",
// 				"create_time":"2017-10-23T08:49:42Z",
// 				"update_time":"2017-10-23T08:49:42Z",
// 				"links": [{
// 					"href":"https://api.sandbox.paypal.com/v1/payments/sale/8FS662642W175072U","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/payments/sale/8FS662642W175072U/refund","rel":"refund","method":"POST"
// 				},{
// 					"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAY-2TM5400733587935ALHW22EI",
// 					"rel":"parent_payment",
// 					"method":"GET"
// 				}]
// 			}
// 		}]
// 	}],
// 	"create_time":"2017-10-23T08:49:43Z",
// 	"links": [{
// 		"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAY-2TM5400733587935ALHW22EI",
// 		"rel":"self",
// 		"method":"GET"
// 	}],
// 	"httpStatusCode":200
// }

<!--form(action='/mailValid' method="post")-->