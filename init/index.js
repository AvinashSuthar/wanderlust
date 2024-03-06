const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../models/listing");

const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to DB")

}).catch((err) => {
    console.log(err)
})

async function main() {
    await mongoose.connect(mongoUrl);
}
const initDB = async () => {
    await Listing.deleteMany({})
    initdata.data = initdata.data.map((obj)=>(
        ({...obj , owner:"65e44a652213cf100bf95394"})
    ))
    await Listing.insertMany(initdata.data);
    console.log("data added ");
}
initDB();