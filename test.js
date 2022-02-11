const mysql = require('mysql')

var detail = {
    //host: 'us-cdbr-east-05.cleardb.net',
    host:  'a',
    user: 'b6a546b49b5f9a',
    password: '4469befb',
    database: 'heroku_4d478ba2b4e8562'
}

showtime = () => {
    var currentdate = new Date(); 
    var datetime = "" + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    console.log(datetime)
}

var node1;
function handleDisconnect() {
    showtime()
    node1 = mysql.createConnection(detail); 
    node1.connect( function onConnect(err) {  
        if (err) {                                  
            console.log('error when connecting to node1, trying again in 5secs...');
            setTimeout(handleDisconnect, 5000);    
        } else {
            console.log('connected to node1');
        }                                          
});                                            
                                               
node1.on('error', function onError(err) {
    console.log('node1 error PROTOCOL_CONNECTION_LOST');
        showtime()
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();                         
        } else {
            console.log('throwed err');                        
            throw err;                                  
        }
    });
}
handleDisconnect();