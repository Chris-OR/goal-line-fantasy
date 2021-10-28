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
const https = require("https");

const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip, deflateSync } = require('zlib')


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

const NHL_TEAMS = {
    "New Jersey Devils" : {
        "abbreviation" : "NJD",
        "logo" : "/team-logos/N.J_logo.svg", 
    },
    "New York Islanders" : {
        "abbreviation" : "NYI",
        "logo" : "/team-logos/NYI_logo.svg",
    },
    "New York Rangers" : {
        "abbreviation" : "NYR",
        "logo" : "/team-logos/NYR_logo.svg",
    },
    "Philadelphia Flyers" : {
        "abbreviation" : "PHI",
        "logo" : "/team-logos/PHI_logo.svg"
    },
    "Pittsburgh Penguins" : {
        "abbreviation" : "PIT",
        "logo" : "/team-logos/PIT_logo.svg"
    },
    "Boston Bruins" : {
        "abbreviation" : "BOS",
        "logo" : "/team-logos/BOS_logo.svg"
    },
    "Buffalo Sabres" : {
        "abbreviation" : "BUF",
        "logo" : "/team-logos/BUF_logo.svg"
    },
    "Montréal Canadiens" : {
        "abbreviation" : "MTL",
        "logo" : "/team-logos/MTL_logo.svg"
    },
    "Ottawa Senators" : {
        "abbreviation" : "OTT",
        "logo" : "/team-logos/OTT_logo.svg"
    },
    "Toronto Maple Leafs" : {
        "abbreviation" : "TOR",
        "logo" : "/team-logos/TOR_logo.svg"
    },
    "Carolina Hurricanes" : {
        "abbreviation" : "CAR",
        "logo" : "/team-logos/CAR_logo.svg"
    },
    "Florida Panthers" : {
        "abbreviation" : "FLA",
        "logo" : "/team-logos/FLA_logo.svg"
    },
    "Tampa Bay Lightning" : {
        "abbreviation" : "T.B",
        "logo" : "/team-logos/T.B_logo.svg"
    },
    "Washington Capitals" : {
        "abbreviation" : "WSH",
        "logo" : "/team-logos/WSH_logo.svg"
    },
    "Chicago Blackhawks" : {
        "abbreviation" : "CHI",
        "logo" : "/team-logos/CHI_logo.svg"
    },
    "Detroit Red Wings" : {
        "abbreviation" : "DET",
        "logo" : "/team-logos/DET_logo.svg"
    },
    "Nashville Predators" : {
        "abbreviation" : "NSH",
        "logo" : "/team-logos/NSH_logo.svg"
    },
    "St. Louis Blues" : {
        "abbreviation" : "STL",
        "logo" : "/team-logos/STL_logo.svg"
    },
    "Calgary Flames" : {
        "abbreviation" : "CGY",
        "logo" : "/team-logos/CGY_logo.svg"
    },
    "Colorado Avalanche" : {
        "abbreviation" : "COL",
        "logo" : "/team-logos/COL_logo.svg"
    },
    "Edmonton Oilers" : {
        "abbreviation" : "EDM",
        "logo" : "/team-logos/EDM_logo.svg"
    },
    "Vancouver Canucks" : {
        "abbreviation" : "VAN",
        "logo" : "/team-logos/VAN_logo.svg"
    },
    "Anaheim Ducks" : {
        "abbreviation" : "ANA",
        "logo" : "/team-logos/ANA_logo.svg"
    },
    "Dallas Stars" : {
        "abbreviation" : "DAL",
        "logo" : "/team-logos/DAL_logo.svg"
    },
    "Los Angeles Kings" : {
        "abbreviation" : "L.A",
        "logo" : "/team-logos/L.A_logo.svg"
    },
    "San Jose Sharks" : {
        "abbreviation" : "S.J",
        "logo" : "/team-logos/S.J_logo.svg"
    },
    "Columbus Blue Jackets" : {
        "abbreviation" : "CBJ",
        "logo" : "/team-logos/CBJ_logo.svg"
    },
    "Minnesota Wild" : {
        "abbreviation" : "MIN",
        "logo" : "/team-logos/MIN_logo.svg"
    },
    "Winnipeg Jets" : {
        "abbreviation" : "WPG",
        "logo" : "/team-logos/WPG_logo.svg"
    
    },
    "Arizona Coyotes" : {
        "abbreviation" : "ARI",
        "logo" : "/team-logos/ARI_logo.svg"
    
    },
    "Vegas Golden Knights" : {
        "abbreviation" : "VGK",
        "logo" : "/team-logos/VGK_logo.svg"
    
    },
    "Seattle Kraken" : {
        "abbreviation" : "SEA",
        "logo" : "/team-logos/SEA_logo.svg"
    },
};

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

function setupSchedule(res, startDate, endDate) {
    const url = `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${startDate}&endDate=${endDate}`
    https.get(url, function(response) {
        console.log(response.statusCode);
        const chunks = [];
        response.on("data", function(chunk) {
            chunks.push(chunk);
        });
        response.on("end", function() {
            const data = Buffer.concat(chunks);
            var games = JSON.parse(data);
            var activeTeams = [];
            games.dates.forEach(function(day) {
                day.games.forEach(function(game) {
                    if (!activeTeams.includes(game.teams.away.team.name)) {
                        activeTeams.push(game.teams.away.team.name);
                    }
                    if (!activeTeams.includes(game.teams.home.team.name)) {
                        activeTeams.push(game.teams.home.team.name);

                    }
                });
            });
            res.render("schedule-tool", {startDate: startDate, endDate: endDate, games: games, activeTeams: activeTeams, NHL_TEAMS: NHL_TEAMS});
        })
    });
}

app.get("/schedule-tool", function(req, res) {
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - (startDate.getDay() + 6) % 7);
    startDate = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate(); 
    
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + (7 + 7 - endDate.getDay()) % 7);
    endDate = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate();

    setupSchedule(res, startDate, endDate);
});

app.post("/schedule-tool", function(req, res) {
    const start = req.body.start;
    const end = req.body.end;
    if (req.body.button === "load") {
        setupSchedule(res, start, end);
    } else {
        res.redirect("/schedule-tool");
    }
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
            smStream.write({ url: item, changefreq: "daily", priority: 0.9 })
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

app.get("/robots.txt", function(req, res) {
    res.render("robots.txt");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("server started successfully");
});