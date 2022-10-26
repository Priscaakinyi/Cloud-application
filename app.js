var express = require('express');
var jsonServer = require('json-server');
var path = require('path');
var app = express();
const ejs = require('ejs');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const jsonParser = express.json();

const cookieName = "LearnerId"; // session ID cookie name
const oneDay = 1000 * 60 * 60 * 24;

let sessionInfo = [];

var loginBoolean = false;

// view engine EJS
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


//middleware
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/public', express.static('./public/'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'some secret',
	resave: false,
    cookie: {maxAge: oneDay}, // session lasts a day
    saveUninitialized: false,
	name: cookieName // sets the  name of the cookie used by the session middleware.
}));


// User and Courses data
const users = require('./db.json');
const courses = 'Courses.json'; //??

//Load data from Courses.json
let rawCourseInfo = fs.readFileSync(courses);
let coursesInfo = JSON.parse(rawCourseInfo);

//Load data from users.json
const userdb = 'db.json';
let rawAdminUserInfo = fs.readFileSync(userdb);
let adminUsers = JSON.parse(rawAdminUserInfo);

//Set the View Engine to work with ejs
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

//Initialize session state
const setUpSessionMiddleware = function(req,res,next){
	// console.log(`session object: ${JSON.stringify(req.session)}`);
	// console.log(`session id: ${req.session.id}`);
	if(!req.session.user){
		req.session.user = {role: "guest"};
	}
	next();
}
app.use(setUpSessionMiddleware);

//middleware to restrict paths to only logged in users
const checkGuestMiddleware = function(req,res,next){
	if(req.session.user.role != "role" || req.session.user.role != "admin"){
		res.status(401).json({error:"Not permitted"});
	} else{
		// console.log(`Session info: ${JSON.stringify(req.session)} \n`);
		next();
	}
}

// middleware to restrict path to only admins
const checkAdminMiddleware = function(req,res,next){
	if(req.session.user.role === "admin"){
		res.status(401).json({error:"Not permitted"});
	} else{
		next();
	}
}


//for User Login page
app.get('/', function(request,response){
	response.render("welcomePage");
});

// to post the login
app.post('/login', express.json(), function(req,res){
	let email = req.body.email;
	let password = req.body.password;
	console.log(email);
	console.log(password);
	console.log(req.body);

	// find the user
	let auser = users.find(function(user){
		return user.email === email
	});
	if (!auser){ // if not found
		res.status(401).json({error:true, message:"User/password error "});
		return;
	};

	let verified = bcrypt.compareSync(password, auser.passHash);

	if(verified){
		//upgrade in privileged, should generate new session id
		// Save old session info if any, create a new session

		let oldinfo = req.session.user;
		req.session.regenerate(function(err){
			if(err){
				console.log(err);
			}
			let newUserInfo = Object.assign(oldinfo, auser);
			delete newUserInfo.passHash;
			req.session.user = newUserInfo;
			sessionInfo = req.session.user;
			console.log(req.session.user.role);
			//res.render('adminPage');

			// find the role
			let ruser = req.session.user.role;
			console.log(ruser);

			if (ruser ==="admin"){ // if  an admin
				res.render('adminPage');
				}else{
					res.render('userView',{
						user: req.session.user.firstName
					});
				}
			});
		}else{
		res.status(401).json({error:true, message:"User/Password error"});
		}

});


app.get('/adminPage',  function(request,response){
	if(loginBoolean){
		response.status(401).json({error:true, message:"Sorry you need to login first"});
	}else{
			response.render('adminPage');
	}
});
//logging out logic
app.get('/logout', function (req,res){
	let options = req.session.cookie;
	req.session.destroy(function(err){
		if (err){
			console.log(err);
		}
		res.clearCookie(cookieName, options); // the cookie name and options
		res.json({message: "Goodbye"})
	})
});

//for /home page
app.get('/userView', function(request,response){
	if(loginBoolean){
		response.status(401).json({error:true, message:"Sorry you need to login first"});
	}else{
			response.render('userView');
	}
});

//For creating the users
app.post('/users', (request, response) => {
	const userData = request.body;
	console.log(userData);
	adminUsers.push(userData); 
	fs.writeFileSync(userdb, JSON.stringify(adminUsers, null, 2));
	response.redirect('/adminPage');
});

//For creating the courses
app.post('/courses', (request, response) => {
	const coursesData = request.body;
	coursesInfo.push(coursesData);
	fs.writeFileSync(courses, JSON.stringify(coursesInfo, null, 2));
	response.redirect('/adminPage');
});



//Send list of courses to admin
app.get('/coursesInfo', jsonParser, (request, response) => {
	response.send(coursesInfo);
});

//send list of users to admin
app.get('/adminUsers', jsonParser, (request, response) => {
	response.send(adminUsers);
});

app.get('/users', (req, res) => {
	res.render('users');
});

app.get('/sessionInfo', (req, res) => {
	console.log("Here");
	res.send(sessionInfo);
})

app.listen(4500,function(){
	console.log('Listening at port 4500...');
});

module.exports = app;

