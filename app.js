if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
} 
// console.log("Production Mode");
// console.log(process.env.SECRET);
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const Listing = require('./models/listing');
const Review = require('./models/review');
const path = require('path');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const User = require('./models/user');
const LocalStrategy = require('passport-local');

const listingRouter = require('./routes/listing');
const reviewRouter = require('./routes/reviews');
const userRouter = require('./routes/user'); 

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 7 * 1000 * 60 * 60 * 24, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
};

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch(err=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get('/', (req, res) => {
    res.send('Hi, I am root');
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "test@example.com",
        username: "testuser"
    });

    let registeredUser = await User.register(fakeUser, "password123");
    res.send(registeredUser);
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render('error.ejs', { message });
    // res.status(statusCode).send(message);
});

/* For live update */
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");

// Create a LiveReload server
const liveReloadServer = livereload.createServer();

// Watch for changes in these directories
liveReloadServer.watch(path.join(__dirname, 'views'));
liveReloadServer.watch(path.join(__dirname, 'public'));

// Ping the browser when the server starts
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
    liveReloadServer.refresh("/listings/new");
    liveReloadServer.refresh("/listings");
    liveReloadServer.refresh("/listings/:id");
    liveReloadServer.refresh("/listings/:id/edit");
  }, 100);
});

// Inject LiveReload script into the page
app.use(connectLiveReload());
/*Live Update code ends here */


app.listen(8080, () => {
    console.log("Server is running on port 8080");
});


/*
if (!req.body.listing) {
        throw new ExpressError(400, "Invalid Listing Data");
    }
    if(!newListing.title){
        throw new ExpressError(400, "Title is required");   
    }
    if(!newListing.description){
        throw new ExpressError(400, "Description is required");
    }
    if(!newListing.price || isNaN(newListing.price)){
        throw new ExpressError(400, "Price must be a number");
    }
    if(!newListing.country){
        throw new ExpressError(400, "Country is required");
    }
    if(!newListing.location){
        throw new ExpressError(400, "Location is required");
    }

    let result = listingSchema.validate(req.body);
    if(result.error) {
        throw new ExpressError(400, result.error.details[0].message);
    }
*/