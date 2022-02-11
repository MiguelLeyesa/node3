const express = require("express")
const path = require("path")
const exphandle = require("express-handlebars")
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser")

const app = express();
const port = process.env.PORT || 9000;

app.engine("hbs", engine({
    extname: "hbs",
    defaultView: "main",
    layoutsDir: path.join(__dirname, "/views/layouts"), // Layouts folder
    partialsDir: path.join(__dirname, "/views/partials"), // Partials folder
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
}))

app.set("view engine", "hbs")

app.use(express.static("public"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(port, function() {
    console.log("App listening at port "  + port);
});

/* ---------------------------------------- ROUTES ---------------------------------------- */

var genres = [
    "Short",
    "Crime",
    "Western",
    "Family",
    "Animation",
    "Drama",
    "Comedy",
    "Mystery",
    "Documentary",
    "Action",
    "Music",
    "Fantasy",
    "Sci-Fi",
    "Musical",
    "Horror",
    "Romance",
    "Thriller",
    "War",
    "Adventure",
    "Film-Noir"
]

var site = process.argv[2]

app.get("/", function(req, res) {
res.render("home", {
    site: site,
    title: site + " | home",
});
})
app.get("/search", function(req, res) {
    res.render("search", {
        site: site,
        title: site + " | search",
        genres: genres,
    })
})
app.get("/add", function(req, res) {
    res.render("add", {
        site: site,
        title: site + " | add",
        genres: genres,
    })
})
app.get("/update", function(req, res) {
    res.render("update", {
        site: site,
        title: site + " | update",
        genres: genres,
    })
})
app.get("/delete", function(req, res) {
    res.render("delete", {
        site: site,
        title: site + " | delete",
    })
})

posts = require('./posts.js')
app.post("/idlookup", posts.idlookup)
app.post("/search", posts.search)
app.post("/add", posts.add)
app.post("/update", posts.update)
app.post("/delete", posts.delete)