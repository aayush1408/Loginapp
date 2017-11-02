var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var connect = mongoose.connect('mongodb://localhost/user_details');
var db = mongoose.connection;

//Creating Schema for UserData
var Schema = new mongoose.Schema({
	name:{type:String,required:true},
	email:{type:String},
	username:{type:String},
	password:{type:String}
});
//Model
var User = mongoose.model('User',Schema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'LoginApp',user : req.user });
});

router.get('/register',function(req,res,next){
    res.render('signup',{errors:false});
});

router.get('/login',function(req,res,next){
	res.render('login');
});

router.post('/signup',function(req,res,next){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var rpassword = req.body.rpassword;

	//validation
	req.checkBody('name','Name is required').notEmpty();
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('username','Username is required').notEmpty();
	req.checkBody('password','Password is required').notEmpty();
	req.checkBody('rpassword','Passwords arent same').equals(password);

	//Check for errors
	 

	if(errors){
   			res.render('signup',{errors:errors});
		    console.log(errors);
	}
	else{
        //Save the data in database
		var newUser = new User({
			name:name,
			email:email,
			username:username,
			password:password,
			rpassword:rpassword
		});
		newUser.save(function(err){
			if(err){
				console.log('Data cannot be saved');
			}
		});
		res.render('index',{title:'Express',user:false});
	}
});

//Passport Authentication
passport.use(new LocalStrategy(                           //LocalStrategy
  function(username, password, cb) {
    User.findOne({username:username}, function(err, user) {
      if (err) { return cb(err); }
      if (!user) {
        console.log('No user found');
        return cb(null, false); }
      if (user.password != password) { 
        console.log(user);
        console.log(password);
        console.log(user.password);
        console.log('Password is wrong');
        return cb(null, false); 
    }

      return cb(null, user);
    });
  }));
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.find({_id:id}, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

  
router.post('/logindata', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

//Get the user profile
router.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),  //connect-ensure-login module
  function(req, res){
    console.log(req.user);
    res.render('profile', { user: req.user });
  });
//Logout
router.get('/logout',
  function(req, res){
    req.session.destroy(function (err) {
    res.clearCookie('connect.sid');  
    res.redirect('/'); //Inside a callback… bulletproof!
  });
  });
module.exports = router;
