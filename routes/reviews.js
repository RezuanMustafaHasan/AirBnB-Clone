const express = require('express');
const router = express.Router({mergeParams: true}); // This allows us to access req.params.id from the parent route
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError.js');
const {listingSchema, reviewSchema} = require('../schema.js');
const Listing = require('../models/listing');
const Review = require('../models/review');


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    next();
}; 


router.post('/', validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    listing.reviews.push(review);
    await listing.save();
    await review.save();
    res.redirect(`/listings/${id}`);    
}));

//Delete review Route

router.delete('/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;