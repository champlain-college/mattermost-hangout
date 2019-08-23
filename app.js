var express = require('express');
var https = require('https');
var fs = require('fs');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var log = require('./app/lib/log.js');

var app = express();

app.engine('handlebars', exphbs({
	defaultLayout: 'layout',
	layoutsDir: __dirname + '/app/views/layout'
}));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/app/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/app/public'));

// Require key on all requests
app.use(function(req, res, next){
    if(req.body.key != (process.env.ACCESS_KEY || 'add-key-please')){
        res.status(401).send('No dice!');
    } else {
        next();
    }
});


require(__dirname + '/app/routes')(app);

log.debug("Auth.js is located at " + require('./app/lib/config.js').getAuthPath());

var port = Number(process.env.PORT || 5000);
var privateKey = fs.readFileSync(process.env.SSL_KEY || 'privatekey.pem' );
var certificate = fs.readFileSync(process.env.SSL_CERT || 'certificate.pem' );

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port);
