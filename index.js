if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("express-flash");
const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({
    extended: true
}));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);
const db = process.env.MONGO_ATLAS;
async function main() {
    // await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
    await mongoose.connect(db);
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
main().then(() => console.log("connected")).catch(err => console.log(err))
// app.get("/", (req, res) => {
//     res.send("done working");
// })

const store = MongoStore.create({
    mongoUrl: db,
    crypto:{
    secret: process.env.SECRET,
    },
    touchAfter : 24 * 3600,
})
store.on("error" , ()=>{
    console.log("Error in mongo session store" , err);
}) 
const sessionOptions = {
    store,
    secret:  process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curuser = req.user;
    next();
})
app.use("/listing", listingsRouter);
app.use("/listing/:id/review", reviewsRouter);
app.use("/", userRouter);
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
})
app.use((err, req, res, next) => {
    let {
        status = 500, message = "something went wrong"
    } = err;
    res.status(status).send(message);
})
app.listen(3000, () => {
    console.log("listening on port 3000");
})