const mongoose = require("mongoose");
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const url =
  "mongodb+srv://kavyaagarwal1708_db_user:Kavya1417@cluster0.jqlne6c.mongodb.net/bni";

//asynchronous function - returns promise object
mongoose
  .connect(url)
  .then((result) => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });
