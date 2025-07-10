const mongoose = require('mongoose');
const data = require('./data.js');
const Listing = require('../models/listing.js');


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });
    

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    console.log("Database cleared");
    console.log("Inserting data into the database");
    console.log("Data length: ", data.length);
    for(let i = 0; i < data.length; i++) {
        console.log(data[i]);
    }
    await Listing.insertMany(data);
    console.log("data was initialized");
}

initDB();



