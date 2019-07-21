const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const request = require('request');
const logger = require("morgan");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 8080;

const app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
    extended: true
}));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


// app.get("/", (req, res) => {

//     res.render("index");
// });

app.get("/scrape", (req, res) => {

    axios.get("https://nerdreactor.com/latest-posts/").then((response) => {
        //We hsoudl have new articles before we save to collection we should drop
        const $ = cheerio.load(response.data);

        $(".item_content").each(function (i, element) {

            const result = {};

            result.title = $(this)
                .children('h4')
                .text();
            result.link = $(this)
                .children('h4')
                .children('a')
                .attr('href');
            result.summary = $(this)
                .children('p')
                .text();

            // Create a new Article using the 'result' object built from scraping
            db.Article.create(result)
                .then((dbArticle) => {
                    // View the added result in the console
                })
                .catch((err) => res.json(err));
        });
        // If we were successful scraping and save an Article, send a message to the client
        // res.send("Scrape Complete");
        res.redirect("/");

    });
});

// Route for getting all Articles from the db
app.get("/", (req, res) => {
    // Grab every doc in the articles collection
    db.Article.find({})
        .then((dbArticle) => {
            // if find articles, send them to the client
            res.render("index", {
                dbArticle
            })
        })
        .catch((err) => {
            // If an error occurred, send it to the client
            res.json(err);
        });
})
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", (req, res) => {
    // query that finds the matching one in our db
    db.Article.findOne({
            _id: req.params.id
        })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then((dbArticle) => {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch((err) => {
            res.json(err);
        })
})





// Route for saving or updating a given Article's associated Note
app.post("/articles/:id", (req, res) => {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then((dbNote) => db.Article.findOneAndUpdate({
            _id: req.params.id
        }, {
            note: dbNote._id
        }, {
            new: true
        }))
        .then((dbArticle) => {
            res.json(dbArticle);
        })
        .catch((err) => {
            res.json(err);
        });
});

app.delete("/articles/:id", (req, res) => {

    db.Note.remove().then((dbNote) => {
            res.json(dbNote);
        })

        .catch((err) => {
            res.json(err);
        })
});


app.get("/saved-articles", (req, res) => {
    console.log('Rotue hit')
    db.Article.find({})
        
        
        .populate("Note")
        .then((articles) => {
            console.log(articles);
            res.render("saved", {articles});
        })
        .catch((err) => {
            res.json(err);
        })
})

app.post("/save/:id", function (req, res) {
    db.Article.updateOne({ _id: req.params.id},{$set: {saved: true}}).then(function(response){
        console.log(response);
        res.sendStatus(200);
    }).catch(function(err){
        console.log(err);
        res.sendStatus(500);
    });
    
});

app.delete('/saved/:id', function(req, res){
    db.Article.updateOne({ _id: req.params.id},{$set: {saved: false}}).then(function(response){
        console.log(response);
        res.sendStatus(200);
    }).catch(function(err){
        console.log(err);
        res.sendStatus(500);
    });
});






// Start the server
app.listen(PORT, () => {
    console.log(`App running on port ${  PORT  }!`);
});