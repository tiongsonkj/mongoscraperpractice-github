// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var request = require("request");
var logger = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// require models
var models = require("./models/note");

// set mongoose to leverage built in JS ES6 Promises
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/hw_scraper");

// initialize express
var app = express();

// Set the app up with morgan, body-parser, and a static folder
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static("public"));

// handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");



// database configurations
var databaseUrl = "hw_scraper"
var collections = ["nba_hw", ];

// hook mongo js configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
    console.log("Database Error: ", error);
});

// Main route (goes to index page)
app.get("/", function(req, res) {
    
    db.nba_hw.find({}, function(error, found) {
        // Log any errors if the server encounters one
        if (error) {
            console.log(error);
        }
        // Otherwise, send the result of this query to the browser
        else {
            var hbsObject = { nbaNews: found };
            return res.render("index", hbsObject);
        }
    });
    
});

// get all the data from the database 
app.get("/all", function(request, response) {
    // find all results from the nba_hw collection in the db
    db.nba_hw.find({}, function(error, found) {
        // throw any errors to the console.
        if (error) {
            console.log(error);
        }
        // if there are no errors, send the data to the browser as json
        else {
            response.json(found);
        }
    });
});

// scrape the data from one site and place it into the mongodb database
app.get("/scrape", function(req, res) {
    // make a request for the news section of nba.com
    request("http://www.nba.com/", function(error, response, html) {

        var $ = cheerio.load(html);

        // empty array to save the data
        var results = [];

        $("a.content_list--item").each(function(i, element) {

            var link = $(element).attr("href");
            var title = $(element).find("h5").text();

            results.push({
                title: title,
                link: link
            });

            // if this found element had both title and link
            if (title && link) {
                // insert the data in the nba_hw database
                db.nba_hw.insert({
                    title: title,
                    link: link
                },
                function(error, inserted) {
                    if (error) {
                        // log the error if one is encountered during the query
                        console.log(error);
                    }
                    else {
                        // otherwise, log the inserted data
                        console.log(inserted);
                    }
                });
            }
        }); 
    });

    // send a "Scrape Complete" message to browser
    res.send("index");
});

// post the note
app.post("/submit", function(req, resp) {
    console.log(req.body);

    models.create(req.body).then(function(dbNote){
        console.log(dbNote);
        return db.nba_hw.findOneandUpdate({}, { $push: { articlenotes: dbNote._id } }, { new: true});
    }).then(function(dbNBA) {

        resp.json(dbNBA);
    }).catch(function(err) {
        resp.json(err);
    });
    // // create a new note in the db
    // db.Note.create(req.body).then(function(dbNote) {
    //     // if note was created successfuly, push new note id to nba_hw array
    //     // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    //     // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    //     return db.nba_hw.findOneandUpdate({}, { $push: { body: dbNote._id } }, { new: true});
    // }).then(function(dbNews){
    //     // if user was updated successfully, send it back to the client
    //     resp.json(dbNews);
    // }).catch(function(error) {
    //     // if error occurs, send it back to client
    //     resp.json(error);
    // });
});

// get all of the nba news and populate them with their notes
app.get("/populatednews", function(req, res) {
    // Find all users
    db.nba_hw.find({})
      // Specify that we want to populate the retrieved users with any associated notes
      .populate("notes")
      .then(function(dbUser) {
        // If able to successfully find and associate all Users and Notes, send them back to the client
        res.json(dbUser);
      })
      .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
    });
});

// delete one from the database
app.get("/delete/:id", function (req, resp) {
    // remove a nba article using the object id
    db.nba_hw.remove({
        "_id": mongojs.ObjectID(req.params.id)
    }, function(error, removed) {
        // log any errors from mongojs
        if(error) {
            console.log(error);
            resp.send(error);
        }
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        else {
            console.log(removed);
            resp.send(removed);
        }
    });
});

// Listen on port 3035
app.listen(3035, function() {
    console.log("App running on port 3035!");
  });

// request("http://www.nba.com/", function(error, response, html) {

//     var $ = cheerio.load(html);

//     // empty array to save the data
//     var results = [];

//     $("a.content_list--item").each(function(i, element) {

//         var link = $(element).attr("href");
//         var title = $(element).find("h5").text();
//         console.log(title);

//         results.push({
//             title: title,
//             link: link
//         });
//     });

//     console.log(results);
// });

