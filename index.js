var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var db;
//Setting public as my static folder
app.use(express.static('public'));

//Connecting Mongo
var mongoClient = require('mongodb').MongoClient;
mongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser: true}, function(err, client) {
    if(err) throw err;

    db = client.db('school')
    console.log(db.students)

    db.collection('userRegister').find().toArray(function(err, result) {
        if(err) throw err;
        console.log(result)
    })
})

//Creating a get search function
app.get('/get', function(req, res) {
    db.collection('subjects').find().toArray(function(err, result) {
        if(err) throw err;
        res.json(result);
    });
});

//Before Using the form we must put the bodyParser in use. So that the form data can be parsed.
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/insert', function(req, res) {
    db.collection('subjects').insert({name: "English", credits: 4, prof: "Mr. E"})
    res.redirect('/search');
})
//login route
app.get('/login', function(req, res) {
        res.sendfile('public/login.html')
})


//Posting registration form
app.post('/form', function(req, res) { 
    db.collection('userRegister').insertOne(req.body);
    res.redirect('/login');
    console.log(JSON.stringify(req.body) + " added to the db.userRegister"); 
});


//Express-Session
app.use(session({
    secret: "some secret"
}))

//For Login
app.post('/form-login', function(req, res) {
    if((db.collection('userRegister').find({username: req.body.username}))) {
        req.session.loggedIn = true;
        req.session.username = req.body.username;
    }res.redirect('/profile')
    
})

//The profile route

app.get('/profile', function(req, res) {
    if(req.session.loggedIn == true) {
        res.sendfile('./public/profile.html')
        // res.send("Welcome " + req.session.username + ". <a href='/logout'>Logout</a>")
    }else {
        res.send('Sorry <a href="/login">Login</a>')
    }
});

//addExpense

app.post('/addExpense', function(req, res){
    console.log(req.session.username + ' added newExpense.');
    db.collection('userRegister').updateOne({username: req.session.username}, { $set: {expense: req.body.expense}});
    res.send(alert('Expense added for ' + req.body.session));
})

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/login');
})


app.listen(3000)