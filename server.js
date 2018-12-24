const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

// scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// models
const db = require("./models");

const PORT = 3000;

// initializing express
const app = express();


// morgan logger for logging requests
app.use(logger("dev"));
// request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// public static folder
app.use(express.static("public"));

// connecting to Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/starticle";

mongoose.connect(MONGODB_URI);
// mongoose.connect("mongodb://localhost/starticle", { useNewUrlParser: true });

// Routes

// GET route for scraping the website
app.get("/scrape", function(req, res) {
  axios.get("https://medium.com/topic/culture").then(function(response) {
    const $ = cheerio.load(response.data);

    // grabbing every h2 within an article tag
    $("section h3").each(function(i, element) {
      let result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = "https://medium.com" + $(this)
        .children("a")
        .attr("href");
      result.summary = $(this).siblings().children().children().text();
      result.imageURL = "https://medium.com" + $(this).parent().parent().parent().siblings().children().children().attr("href");

      // creates new article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("scrape complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id and populating it with its note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, query the matching one in our db
  db.Article.findOne({ _id: req.params.id })
    // populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // create new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// start server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
