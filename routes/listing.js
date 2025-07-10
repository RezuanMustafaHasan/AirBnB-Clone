const express = require('express');
const router = express.Router({mergeParams: true}); // This allows us to access req.params.id from the parent route
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError.js');
const {listingSchema, reviewSchema} = require('../schema.js');
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middlewares.js');
const multer = require('multer');
const {storage} = require('../cloudConfig.js'); // Assuming you have a cloudConfig.js file for cloudinary configuration
const upload = multer({ storage }); // Set the destination for uploaded files

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    next();
};

router.get('/', validateListing, wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs',{allListings});
}));

router.get('/new', isLoggedIn, (req, res) => { //This should be written before the /:id route
    res.render('listings/new.ejs');
});


router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    // console.log(listing);
    if(!listing) {
        req.flash('error', 'Listing Not Found!');
        return res.redirect('/listings');
    }
    res.render('listings/show.ejs', { listing });
}));

router.post('/', isLoggedIn, upload.single('listing[image]'), wrapAsync(async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.image.url = url;
    newListing.image.filename = filename;
    console.log(newListing);
    await newListing.save();
    req.flash('success', 'New Listing Created Successfully!');
    res.redirect('/listings');
}));

// router.post('/', validateListing, wrapAsync(async (req, res) => {
//     res.send(req.file);
// }));


router.get('/:id/edit', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
}));

router.put('/:id', isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    req.body.listing.image = {
        url: req.body.listing.image,
        filename: req.body.listing.title
    };
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/${id}`);
}));


router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing Deleted Successfully!');
    res.redirect('/listings');
}));

module.exports = router;