var express = require('express');
var https = require('https');
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

require(__dirname + '/app/routes')(app);

log.debug("Auth.js is located at " + require('./app/lib/config.js').getAuthPath());

var port = Number(process.env.PORT || 5000);
var privateKey = fs.readFileSync(process.env.SSL_KEY || 'privatekey.pem' );
var certificate = fs.readFileSync(process.env.SSL_CERT || 'certificate.pem' );

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port);
