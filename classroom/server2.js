const express = require('express');
const app = express();
const path = require('path');

const session = require('express-session');
const flash = require('connect-flash');
const sessionOptions = {
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true
};
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(session(sessionOptions));
app.use(flash());


app.get("/register", (req, res) => {
    let {name = "anonymous"} = req.query;
    req.session.name = name;
    res.send(name);
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/reg", (req, res) => {
    let {name = "anonymous"} = req.query;
    req.session.name = name;
    if(name === "anonymous"){
        req.flash("success", "Registration failed. Please provide a name.");
    } else {
        req.flash("success", "Registration successful!");
    }
    res.redirect("/helo");
});
app.get("/helo", (req, res) => {
    res.render("page.ejs", { name: req.session.name });
});

app.get("/hello", (req, res) => {
    let {name = "anonymous"} = req.session;
    res.send(`Hello, ${name}`);
});

app.get("/test", (req, res) => {
    req.session.name = "Rezuan";
    res.send("Session data set");
});

app.get("/reqcount", (req, res) => {
    if(req.session.count){
        req.session.count++;
    }
    else{
        req.session.count = 1;
    }
    res.send(`You have sent requests ${req.session.count} times.`);
});



app.listen(3000, () => { 
    console.log("Server is running on port 3000");
});

/*
What is session?
Session is a way to store data on the server side for a specific user. 
It allows you to persist user data across multiple requests, making it easier to manage user state 
and information.
*/

