const fetch = require('node-fetch')

const dest='https://stadvdb-recovery-server.herokuapp.com/addToQueue'

let addToQueue = (node, q) => {
    let url = `${dest}?node=${node}&query=${q}`
    fetch(url)
}

module.exports = addToQueue