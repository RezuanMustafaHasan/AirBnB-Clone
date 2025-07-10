const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middlewares.js');

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
    try{
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to Wanderlust!');
            res.redirect('/listings');
        });
        
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", saveRedirectUrl, passport.authenticate("local",{failureRedirect: '/login', failureFlash: 'true'}), (req, res) => {
    req.flash('success', 'Welcome back!');
    console.log(req.user);
    // res.redirect('/listings');
    console.log("User logged in successfully");
    console.log("User details:");
    res.redirect(res.locals.redirectUrl || '/listings'); // Redirect to the original URL or default to /listings
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
        if(!req.user) console.log("logged out");
        if(!req.user) req.flash('success', 'You have successfully logged out!');
        res.redirect('/listings');
    });
});

module.exports = router;
