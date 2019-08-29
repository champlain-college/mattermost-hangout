var core = require('../lib/core.js');
var google = require('../lib/google.js');
var mattermost = require('../lib/mattermost.js');
var log = require('../lib/log.js');

function checkClientIp(req, res, next){
    if(req.connection.remoteAddress != '127.0.0.1'){
        res.status(401).send('No dice!');
    } else {
        next();
    }
}

module.exports = function(app){
	app.post('/', checkClientIp, function(req, res){
		if(!req.body.user_name) {
			return core.error(res, 'Parameter user_name is missing!');
		}
		google.createHangoutMeeting(req.body, function(err, event) {
			event = event.data;
			res.setHeader('Content-Type', 'application/json');
			if(err) {
				res.status(200).send(mattermost.responseMessage('An error occured!\n``' + err + '``', 'ephemeral'));
			}
			
			var message = (process.env.MESSAGE || '**{user} initiated a Hangout**\nClick <{link}|here> to join!');
			message = message.replace('{user}', req.body.user_name);
			message = message.replace('{link}', event.hangoutLink);
						
			log.info("Created Call for user "+req.body.user_name+" at "+event.hangoutLink+"!");
			res.status(200).send(mattermost.responseMessage(message));
		});
	});
	app.get('/auth', function(req, res){
		res.redirect(google.generateAuthUrl());
	});
	app.get('/oauth2callback', function(req, res){
		google.getToken(req.query['code'], function(err, token) {
			if(err != null || !token) {
				return core.error(res, err);
			}
			log.info("Successfully linked Google Account!");
			return res.render('success');
		});
	});
}
