const express = require("express")
const router = express.Router({mergeParams:true});
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {reviewSchema } = require("../schema");
const Listing = require("../models/listing");
const { isLoggedIn , isReviewAuthor } = require("../middleware");


const validateReview = (req, res , next)=>{
  let {error} =  reviewSchema.validate(req.body)
  if(error){
    let errMsg = error.details.map( (el)=> el.message).join(' , ');
      throw new ExpressError(400 , errMsg);
  }else{
      next();
  }
}
router.post("/" ,isLoggedIn, validateReview , wrapAsync(async (req, res)=>{
  let {id} = req.params;
  let review = new Review( req.body.review );
  const curListing = await Listing.findById(id);
  review.author = req.user._id;
  // console.log(review);
   curListing.reviews.push(review);
  await review.save();
  await curListing.save();
  req.flash("success" , "New Review created!");
  
  res.redirect(`/listing/${id}`);

}))
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync( async (req, res)=> {
  let {id , reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success" , "Review deleted!");

  res.redirect(`/listing/${id}`);
}))

module.exports = router;