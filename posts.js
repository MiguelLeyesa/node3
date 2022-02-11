const query = require('./query.js')

posts = {
    search: function(req, res) {
        var name = "name LIKE \"%" + req.body.name + "%\"";
    
        var year = req.body.year
        if (year != -1) {
            year = "year=" + req.body.year;
        } else {
            year = "year>0"
        }
        
        var genre;
        if (req.body.genre == "Any") {
            genre = "genre LIKE \"%\"";
        } else {
            genre = "genre=\"" + req.body.genre +"\"";
        }

        let q = 'SELECT * FROM ' + tablename + " WHERE " + name + " AND " + year + " AND " + genre + ";";
        query.search(q, req.body.year).then(result => {
            res.send(result)
        })
    },
    idlookup: function(req, res) {
        let q = "SELECT * from " + tablename + " WHERE id=" + req.body.id + ";"
        query.idlookup(q).then(result => {
            res.send(result)
        })
    },
    add: function(req, res) {
        var id = req.body.id
        var name = req.body.name
        var year = req.body.year
        var genre = req.body.genre
        var director_firstname = req.body.director_firstname
        var director_lastname = req.body.director_lastname
        let q = "INSERT INTO " + tablename + " VALUES (" + id + ", \"" + name + "\", " + year + ", \"" + genre + "\", \"" + director_firstname + "\", \"" + director_lastname + "\");"

        query.add(q, req.body.year).then(result => {
            res.send(result)
        })
    },
    update: function(req, res) {
        var id = req.body.id
        var name = req.body.name
        var year = req.body.year
        var genre = req.body.genre
        var director_firstname = req.body.director_firstname
        var director_lastname = req.body.director_lastname
        let q = "UPDATE " + tablename + " SET name=\"" + name + "\", year=" + year + ", genre=\"" + genre + "\", director_firstname=\"" + director_firstname + "\", director_lastname=\"" + director_lastname + "\" WHERE id=" + id + ";"
        
        query.update(q, req.body.year).then(result => {
            res.send(result)
        })
    }, 
    delete: function(req, res) {
        var id = req.body.id
        let q = "DELETE FROM " + tablename + " WHERE id=" + id + ";"
        
        query.update(q).then(result => {
            res.send(result)
        })
    },
}

module.exports = posts