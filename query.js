// all concurrency logic here

const mysql = require('mysql')

const addToQueue = require('./addToQueue.js')
const addToHistory = require('./addToHistory.js');
const e = require('express');

details = {
    node1: {
        host: 'us-cdbr-east-05.cleardb.net',
        //host: 'a',
        user: 'b6a546b49b5f9a',
        password: '4469befb',
        database: 'heroku_4d478ba2b4e8562'
    },
    node2: {
        host: 'us-cdbr-east-05.cleardb.net',
        //host: 'a',
        user: 'b030d6dfff505f',
        password: '6d157c81',
        database: 'heroku_2dc4422a8802044'
    },
    node3: {
        host: 'us-cdbr-east-05.cleardb.net',
        //host: 'a',
        user: 'bec9842212802f',
        password: 'ee599e7b',
        database: 'heroku_362b679429ad586'
    },
}

gettime = () => {
    var currentdate = new Date(); 
    var datetime = "" + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    return datetime + "\t=>\t"
}

tablename = "movies_denormalized";

var node1
var node2
var node3

function handleDisconnectNode1() {
    node1 = mysql.createConnection(details.node1); 
    node1.connect( function onConnect(err) {  
        if (err) {                                  
            console.log(gettime() + 'error when connecting to node1, trying again in 5secs...');
            setTimeout(handleDisconnectNode1, 5000);    
        } else {
            console.log(gettime() + 'connected to node1 with hostname ' + details.node1.host);
        }                                          
    });                                            
                                               
    node1.on('error', function onError(err) {
        console.log(gettime() + 'node1 error PROTOCOL_CONNECTION_LOST');
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode1();                         
        } else {
            console.log(gettime() + 'throwed err');                        
            throw err;                                  
        }
    });
}

function handleDisconnectNode2() {
    node2 = mysql.createConnection(details.node2); 
    node2.connect( function onConnect(err) {  
        if (err) {                                  
            console.log(gettime() + 'error when connecting to node2, trying again in 5secs...');
            setTimeout(handleDisconnectNode2, 5000);    
        } else {
            console.log(gettime() + 'connected to node2 with hostname ' + details.node2.host);
        }                                          
    });                                            
                                               
    node2.on('error', function onError(err) {
        console.log(gettime() + 'node2 error PROTOCOL_CONNECTION_LOST');
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode2();                         
        } else {
            console.log(gettime() + 'throwed err');                        
            throw err;                                  
        }
    });
}

function handleDisconnectNode3() {
    node3 = mysql.createConnection(details.node3); 
    node3.connect( function onConnect(err) {  
        if (err) {                                  
            console.log(gettime() + 'error when connecting to node3, trying again in 5secs...');
            setTimeout(handleDisconnectNode3, 5000);    
        } else {
            console.log(gettime() + 'connected to node3 with hostname ' + details.node3.host);
        }                                          
    });                                            
                                               
    node3.on('error', function onError(err) {
        console.log(gettime() + 'node3 error PROTOCOL_CONNECTION_LOST');
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode3();                         
        } else {
            console.log(gettime() + 'throwed err');                        
            throw err;                                  
        }
    });
}

handleDisconnectNode1();
handleDisconnectNode2();
handleDisconnectNode3();

let query = {
    search: (q, year) => {
        return new Promise((resolve, reject) => {
            node1.query(q, (err, result) => {
                if (err) {
                    if (year == -1) {
                        var out
                        var founderr1 = false
                        var founderr2 = false
                        var incomplete = false
                        var remaining = false
                        node2.query(q, (err1, result1) => {
                            if (err1) {
                                founderr1 = true
                            } else {
                                addToHistory(2, q)
                            }

                            node3.query(q, (err2, result2) => {
                                if (err2) {
                                    founderr2 = true
                                } else {
                                    addToHistory(3, q)
                                }
                                
                                if (founderr1 && founderr2) {
                                    resolve({
                                        error: true
                                    })
                                } else {
                                    if (!founderr1 && founderr2) {
                                        out = result1
                                        incomplete = true
                                    } else if (founderr1 && !founderr2) {
                                        out = result2
                                        incomplete = true
                                    } else {
                                        out = result1.concat(result2)
                                    }
                                    
                                    if (out.length > 100) {
                                        out = out.slice(0, 100)
                                        remaining = true
                                    }
    
                                    resolve({
                                        incomplete: incomplete,
                                        result: out,
                                        remaining: remaining
                                    })
                                }
                            })
                        })
                    } else if (year < 1980) {
                        node2.query(q, (err, result) => {
                            if (err) {
                                resolve({error: true})
                            } else {
                                addToHistory(2, q)
                                var remaining = false

                                if (result) {
                                    if (result.length > 100) {
                                        result = result.slice(0, 100)
                                        remaining = true
                                    }
                                }

                                resolve({
                                    result: result,
                                    remaining: remaining
                                })
                            }
                        })
                    } else if (year >= 1980) {
                        node3.query(q, (err, result) => {
                            if (err) {
                                resolve({error: true})
                            } else {
                                addToHistory(3, q)
                                var remaining = false

                                if (result) {
                                    if (result.length > 100) {
                                        result = result.slice(0, 100)
                                        remaining = true
                                    }
                                }

                                resolve({
                                    result: result,
                                    remaining: remaining
                                })
                            }
                        })
                    }
                } else {
                    addToHistory(1, q)
                    if (result.length > 100) {
                        result = result.slice(0, 100)
                        remaining = true
                    }

                    resolve({
                        result: result,
                        remaining: remaining
                    })
                }
            })
        })
    },
    idlookup: (q) => {
        return new Promise((resolve, reject) => {
            node1.query(q, (err1, result1) => {
                if (err1) {
                    var out
                    var err2found = false
                    var err3found = false
                    var uncertain = false
                    node2.query(q, (err2, result2) => {
                        if (err2) {
                            err2found = true
                        } else {
                            addToHistory(2, q)
                        }
                        node3.query(q, (err3, result3) => {
                            if (err3) {
                                err3found = true
                            } else {
                                addToHistory(3, q)
                            }

                            if (err2 && err3) {
                                resolve({
                                    error: true
                                })
                            } else if (!err2 && err3) {
                                out = result2
                                uncertain = result2.length == 0
                            } else if (err2 && !err3) {
                                out = result3
                                uncertain = result3.length == 0
                            } else {
                                out = result2.concat(result3)
                            }

                            resolve({
                                result: out,
                                uncertain: uncertain
                            })
                        })
                    })
                } else {
                    addToHistory(1, q)
                    resolve({
                        result: result1
                    })
                }
            })
        })
    },
    add: (q, year) => {
        return new Promise((resolve, reject) => {
            node1.query(q, (err1, result) => {
                if (err1) {
                    addToQueue(1, q)
                } else {
                    addToHistory(1, q)
                }
                
                if (year < 1980) {
                    node2.query(q, (err2, result) => {
                        if (err2) {
                            addToQueue(2, q)
                        } else {
                            addToHistory(2, q)
                        }

                        resolve({
                            success: true
                        })
                    })
                } else {
                    node3.query(q, (err3, result) => {
                        if (err3) {
                            addToQueue(3, q)
                        } else {
                            addToHistory(3, q)
                        }

                        resolve({
                            success: true
                        })
                    })
                }
            })
        })
    },
    update: (details) => {
        return new Promise((resolve, reject) => {
            console.log(details)
            var id = details.id
            var name = details.name
            var year = details.year
            var genre = details.genre
            var director_firstname = details.director_firstname
            var director_lastname = details.director_lastname

            let qUpdate = `UPDATE ${tablename} SET name=\"${name}\", year=${year}, genre=\"${genre}\", director_firstname=\"${director_firstname}\", director_lastname=\"${director_lastname}\" WHERE id=${id};`
            let qDelete = `DELETE FROM ${tablename} WHERE id=${id};`
            let qInsert = `INSERT INTO ${tablename} VALUES (${id}, \"${name}\", ${year}, \"${genre}\", \"${director_firstname}\", \"${director_lastname}\");`
            
            var oldyear = details.oldyear
            console.log(qUpdate)
            console.log(qDelete)
            console.log(qInsert)
            node1.query(qUpdate, (err, result) => {
                if (err) {
                    addToQueue(1, qUpdate)
                } else {
                    addToHistory(1, qUpdate)
                }

                if (oldyear < 1980 && year < 1980) {
                    // update node 2
                    node2.query(qUpdate, (err, result) => {
                        if (err) {
                            addToQueue(2, qUpdate)
                        } else {
                            addToHistory(2, qUpdate)
                        }

                        resolve({
                            success: true
                        })
                    });
                    
                } else if (oldyear >= 1980 && year >= 1980) {
                    // update node 3
                    node3.query(qUpdate, (err, result) => {
                        if (err) {
                            addToQueue(3, qUpdate)
                        } else {
                            addToHistory(3, qUpdate)
                        }

                        resolve({
                            success: true
                        })
                    });
                    
                } else if (oldyear < 1980 && year >= 1980) {
                    //delete node 2
                    node2.query(qDelete, (err, result) => {
                        if (err) {
                            addToQueue(2, qDelete)
                        } else {
                            addToHistory(2, qDelete)
                        }

                        //insert node 3
                        node3.query(qInsert, (err, result) => {
                            if (err) {
                                addToQueue(3, qInsert)
                            } else {
                                addToHistory(3, qInsert)
                            }

                            resolve({
                                success: true
                            })
                        })
                    })                    
                } else if (oldyear >= 1980 && year < 1980) {
                    //delete node 3
                    node3.query(qDelete, (err, result) => {
                        if (err) {
                            addToQueue(3, qDelete)
                        } else {
                            addToHistory(3, qDelete)
                        }
                        
                        //insert node 2
                        node2.query(qInsert, (err, result) => {
                            if (err) {
                                addToQueue(2, qInsert)
                            } else {
                                addToHistory(2, qInsert)
                            }

                            resolve({
                                success: true
                            })
                        })
                    })
                }
            })
        })
    },
    delete: (q) => {
        return new Promise((resolve, reject) => {
            node1.query(q, (err1, result) => {
                if (err1) {
                    addToQueue(1, q)
                } else {
                    addToHistory(1, q)
                }

                node2.query(q, (err2, result) => {
                    if (err2) {
                        addToQueue(2, q)
                    } else {
                        addToHistory(2, q)
                    }

                    node3.query(q, (err3, result) => {
                        if (err3) {
                            addToQueue(3, q)
                        } else {
                            addToHistory(3, q)
                        }

                        resolve({
                            success: true
                        })
                    })
                })
            })
        })
    }
}

let queryasync = {
    search: async (q, year) => {
        return await query.search(q, year)
    },
    idlookup: async (q) => {
        return await query.idlookup(q)
    },
    add: async (q, year) => {
        return await query.add(q, year)
    },
    update: async (q, year) => {
        return await query.update(q, year)
    },
    delete: async (q) => {
        return await query.update(q, year)
    },
}

module.exports = queryasync