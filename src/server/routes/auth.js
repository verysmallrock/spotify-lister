import querystring from 'querystring'
import request from 'request'

var express = require('express');
var router = express.Router();


import config from 'js-yaml-loader!../../config/spotify.yml' // only used in dev
var client_id, client_secret, redirect_uri;

if (process.env.ENV == 'production') {
	console.log('running PRODUCTION')
	redirect_uri = 'https://spotify-song-finder.herokuapp.com/callback'
	client_id = process.env.spotify_client_id
	client_secret = process.env.spotify_client_secret
} else {
	redirect_uri = 'http://localhost:8080/callback'
	console.log('running DEVELOPMENT')
	client_id = config['dev'].client_id;
	client_secret = config['dev'].client_secret;
}

var generateRandomString = function(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var stateKey = 'spotify_auth_state';

router.get('/login', function(req, res) {

	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	var scope = 'user-read-private user-read-email user-library-read streaming user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private';
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
	}));
});

router.get('/about', function(req, res) {
	res.send('About us');
  });

router.get('/callback', function(req, res) {

	// your application requests refresh and access tokens
	// after checking the state parameter
  
	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;
  
	if (state === null || state !== storedState) {
	  res.redirect('/#' +
		querystring.stringify({
		  error: 'state_mismatch'
		}));
	} else {
	  res.clearCookie(stateKey);
	  var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
		  code: code,
		  redirect_uri: redirect_uri,
		  grant_type: 'authorization_code'
		},
		headers: {
		  'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
		},
		json: true
	  };
  
	  request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
  
		  var access_token = body.access_token,
			  refresh_token = body.refresh_token;
  
		  // we can also pass the token to the browser to make requests from there
		  res.redirect('/#' +
			querystring.stringify({
			  access_token: access_token,
			  refresh_token: refresh_token
			}));
		} else {
		  res.redirect('/#' +
			querystring.stringify({
			  error: 'invalid_token'
			}));
		}
	  });
	}
  });

  router.get('/refresh_token', function(req, res) {

	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
	  url: 'https://accounts.spotify.com/api/token',
	  headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
	  form: {
		grant_type: 'refresh_token',
		refresh_token: refresh_token
	  },
	  json: true
	};
  
	request.post(authOptions, function(error, response, body) {
	  if (!error && response.statusCode === 200) {
		var access_token = body.access_token;
		res.redirect('/#' +
		querystring.stringify({
		  access_token: access_token,
		  refresh_token: refresh_token
		}));
	  }
	});
  });

 export default router