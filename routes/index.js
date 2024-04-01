const express = require('express');
const router = express.Router();
const session = require('express-session');
const User = require('../models/user');

// Add session middleware
router.use(session({
  secret: 'SaNNMHzlTBxP2hY5',
  resave: true,
  saveUninitialized: true
}));

router.get('/', (req, res, next) => {
    return res.render('index.ejs');
});


router.post('/', (req, res, next) => {
    let personInfo = req.body;

    if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
        res.send();
    } else {
        if (personInfo.password == personInfo.passwordConf) {

            User.findOne({ email: personInfo.email }, (err, data) => {
                if (!data) {
                    let c;
                    User.findOne({}, (err, data) => {

                        if (data) {
                            c = data.unique_id + 1;
                        } else {
                            c = 1;
                        }

                        let newPerson = new User({
                            unique_id: c,
                            email: personInfo.email,
                            username: personInfo.username,
                            password: personInfo.password,
                            passwordConf: personInfo.passwordConf
                        });

                        newPerson.save((err, Person) => {
                            if (err)
                                console.log(err);
                            else
                                console.log('Success');
                        });

                    }).sort({ _id: -1 }).limit(1);
                    req.session.userId = c; // Set session userId
                    res.send({ "Success": "You are registered,You can login now." });
                } else {
                    res.send({ "Success": "Email is already used." });
                }

            });
        } else {
            res.send({ "Success": "password is not matched" });
        }
    }
});

router.get('/login', (req, res, next) => {
    return res.render('login.ejs');
});

router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, data) => {
        if (data) {

            if (data.password == req.body.password) {
                req.session.userId = data.unique_id; // Set session userId
                res.send({ "Success": "Success!" });
            } else {
                res.send({ "Success": "Wrong password!" });
            }
        } else {
            res.send({ "Success": "This Email Is not registered!" });
        }
    });
});

router.get('/profile', (req, res, next) => {
    User.findOne({ unique_id: req.session.userId }, (err, data) => {
        if (!data) {
            res.redirect('/');
        } else {
            return res.render('data.ejs', { "name": data.username, "email": data.email });
        }
    });
});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.get('/forgetpass', (req, res, next) => {
    res.render("forget.ejs");
});

router.post('/forgetpass', (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, data) => {
        if (!data) {
            res.send({ "Success": "This Email Is not registered!" });
        } else {
            if (req.body.password == req.body.passwordConf) {
                data.password = req.body.password;
                data.passwordConf = req.body.passwordConf;

                data.save((err, Person) => {
                    if (err)
                        console.log(err);
                    else
                        console.log('Success');
                    res.send({ "Success": "Password changed!" });
                });
            } else {
                res.send({ "Success": "Password does not match! Both Passwords should be the same." });
            }
        }
    });

});

module.exports = router;
