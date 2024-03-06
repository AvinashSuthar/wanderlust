const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {
  listingSchema
} = require("../schema");
const {
  isLoggedIn,
  isOwner
} = require("../middleware");
const multer = require("multer");
const {
  storage
} = require("../cloudconfig");
const upload = multer({
  storage
});

const validateListing = (req, res, next) => {
  let {
    error
  } = listingSchema.validate(req.body)
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
}

router.get("/", wrapAsync(async (req, res) => {
  const allListing = await Listing.find({});
  res.render("./listing/index.ejs", {
    allListing
  });
}))
// router.post('/' ,upload.single('listing[image]') , (req, res)=>{
//   res.send("Done uploading");
// })

router.post("/", isLoggedIn, upload.single('listing[image]'), wrapAsync(async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {
    url,
    filename
  };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listing");
}))

router.get("/new", isLoggedIn, (req, res) => {
  res.render("./listing/addNew.ejs");
})

router.get("/:id", wrapAsync(async (req, res) => {
  let {
    id
  } = req.params;
  const curListing = await Listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author"
    }
  }).populate("owner");
  if (!curListing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listing");
  }
  // console.log(curListing.owner);
  res.render("./listing/show.ejs", {
    curListing
  });
}))

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  let {
    id
  } = req.params;
  const curListing = await Listing.findById(id);
  if (!curListing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listing");
  }
  res.render("./listing/edit.ejs", {
    curListing
  });
}))

router.put("/:id", isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(async (req, res) => {
  let {
    id
  } = req.params;

  const curListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing
  });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    curListing.image = {
      url,
      filename
    };
    await curListing.save();
  }
  //  console.log("done")
  req.flash("success", "Listing Updated!");
  res.redirect(`/listing/${id}`);
}))

router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  let {
    id
  } = req.params;
  const curListing = await Listing.findByIdAndDelete(id);
  //  console.log("done")
  req.flash("success", "Listing deleted!");

  res.redirect(`/listing`);
}))

module.exports = router;