require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const e = require('express');
const { mapLimit } = require('async');

const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib')


const app = express();

let sitemap;

app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://" + process.env.ATLAS_USERNAME + ":" + process.env.ATLAS_PASSWORD + "@cluster0.chbkz.mongodb.net/fhPostsDB?retryWrites=true&w=majority/fhPostsDB");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const postSchema = new mongoose.Schema({
    title: String,
    blurb: String,
    content: String,
    date: String,
    image: String,
    season: String,
    tag: String
});

const Post = mongoose.model("Post", postSchema);


app.get("/", function(req, res) {
    Post.find(function(err, posts) {
        if (err) {
            console.log(err);
        } else {
            if (posts) {
                res.render("home", {posts: posts});
            }
        }
    })
});

app.get("/posts/:postName", function(req, res) {
    const postName = req.params.postName;

    Post.find(function(err, posts) {
        if (err) {
            console.log(err);
        } else {
            if (posts) {
                posts.forEach(function(post) {
                    if (_.lowerCase(post.title) === _.lowerCase(postName)) {
                      res.render("post", {postTitle: post.title, postContent: post.content, postDate: post.date, postImage: post.image});
                    }
                  });
            }
        }
    });
    
});

app.get("/articles/:articleType", function(req, res) {
    const articleType = req.params.articleType;
    if (articleType === "pre-season-primers-2021-2022") {
        Post.find({season: "2021-2022", tag: "pre-season primer"}, function(err, posts) {
            if (err) {
                console.log(err);
            } else {
                if (posts) {
                    res.render("articles", {posts: posts, articleType: "Pre-Season Primers for 2021-2022"});
                }
            }
        });
    } else if (articleType === "in-season-articles-2021-2022") {
        Post.find({season: "2021-2022", tag: "in-season article"}, function(err, posts) {
            if (err) {
                console.log(err);
            } else {
                if (posts) {
                    res.render("articles", {posts: posts, articleType: "In-Season Articles for 2021-2022"});
                }
            }
        });
    }
});

app.get("/compose", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("compose");
    } else {
        res.render("not-authenticated");
    }
    
});
  
app.post("/compose", function(req, res) {
    const options = {
        day: "numeric",
        month: "long",
        year: "numeric"
    }

    if (req.body.button === "submit") {
        const post = new Post ({
            title: req.body.postTitle,
            blurb: req.body.postBlurb,
            content: req.body.postContent,
            date: new Date().toLocaleDateString("en-US", options),
            image: req.body.postImage,
            season: req.body.season,
            tag: req.body.tag
          });
      
          post.save();
      
          res.redirect("/");
    } else if (req.body.button === "preview") {
        res.render("post", {postTitle: req.body.postTitle, postContent: req.body.postContent, postDate: new Date().toLocaleDateString("en-US", options), postImage: body.req.postImage});
    }
});

app.get("/all-posts", function(req, res) {
    if (req.isAuthenticated()) {
        Post.find(function(err, posts) {
            if (err) {
                console.log(err);
            } else {
                if (posts) {
                    res.render("all-posts", {posts: posts});
                }
            }
        });
    } else {
        res.render("not-authenticated");
    }
    
});

app.post("/update", function(req, res) {
    if (req.body.delete) {
        Post.deleteOne({_id: req.body.delete}, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted the article");
            }
            res.redirect('/all-posts');
        });
    } else if (req.body.edit) {
        Post.findOne({_id: req.body.edit}, function(err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                res.render("edit", {post: results});
            }
        });
    }
});

app.post("/edit", function(req, res) {
    if (req.body.button === "submit") {
        Post.updateOne({_id: req.body.postID}, {title: req.body.postTitle, blurb: req.body.postBlurb, content: req.body.postContent, image: req.body.postImage, season: req.body.season, tag: req.body.tag}, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("successfully updated the article");
            }
            res.redirect("/");
        });
    } else if (req.body.button === "preview") {
        res.render("post", {postTitle: req.body.postTitle, postContent: req.body.postContent, postDate: "Placeholder Date", postImage: req.body.image});
    }
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.get("/contact", function(req, res) {
    res.render("contact");
});

app.post("/contact", function(req, res) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
      });
      
      var mailOptions = {
        from: 'automatedsender12.90@gmail.com',
        to: 'chris.oreilly97@gmail.com',
        subject: 'New Message from Goal Line Fantasy',
        text: "New message from "+ req.body.name + " at " + req.body.email + "\r\n" + req.body.name + "'s message:\r\n\r\n" + req.body.message
    };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.render("contact-success");
        }
      });
});

app.get("/login", function(req, res) {
    res.render("login");
});
  
// app.get("/register", function(req, res) {
//     res.render("register");
// });

// app.post("/register", function(req, res) {
//     User.register({username: req.body.username}, req.body.password, function(err, user) {
//         if (!err) {
//             passport.authenticate("local")(req, res, function () {
//                 res.redirect("/all-posts");
//             });
//         } else {
//             console.log(err);
//             res.redirect("/register");
//         }
//     });
// });

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/all-posts");
            });
        }
    });
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/sitemap.xml", async function(req, res) {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
    if (sitemap) {
        res.send(sitemap)
        return
    }
    try {
        const allPosts = await Post.find().select("title");
        const posts = allPosts.map( ({ title }) => `/posts/${title}`);
        const smStream = new SitemapStream({ hostname: 'https://goal-line-fantasy.herokuapp.com/' });
        const pipeline = smStream.pipe(createGzip())
        
        posts.forEach(function(item) {
            smStream.write({ url: item, changefreq: "daily", piority: 1 })
        });

        smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.4})
        smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.4})
        smStream.write({ url: '/articles/in-season-articles-2021-2022', changefreq: 'weekly', priority: 0.6})
        smStream.write({ url: '/articles/pre-season-primers-2021-2022', changefreq: 'weekly', priority: 0.6})

        streamToPromise(pipeline).then(sm => sitemap = sm);
        smStream.end();

    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("server started successfully");
});