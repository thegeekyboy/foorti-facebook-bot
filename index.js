import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import bodyparser from 'body-parser';
import crypto from 'crypto';

import { webhook } from './facebook';
import { PORT, APP_SECRET, VERIFY_TOKEN } from './config';
import { query } from './database';

const app = express();

app.use(bodyparser.json({ verify: verifyRequestSignature }));

https.createServer({

	cert: fs.readFileSync('/etc/letsencrypt/live/thecodeninjas.net/cert.pem'),
	key: fs.readFileSync('/etc/letsencrypt/live/thecodeninjas.net/privkey.pem'),
	ca: fs.readFileSync('/etc/letsencrypt/live/thecodeninjas.net/chain.pem')
}, app).listen(PORT);

function verifyRequestSignature(req, res, buf) {

	let signature = req.headers["x-hub-signature"];

	if (!signature) {
		console.error('[ERROR] Cannot validate the signature.');
	} else {

		let elements = signature.split('=');
		let method = elements[0];
		let signatureHash = elements[1];
		let expectedHash = crypto.createHmac('sha1', APP_SECRET).update(buf).digest('hex');

		if (signatureHash != expectedHash) {
			throw new Error('[ERROR] Cannot validate the request signature.');
		}
	}
}

app.get('/webhook', (req, res) => {

	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {

		console.log("[DEBUG] Verification completed. Sending challenge code.");
		res.status(200).send(req.query['hub.challenge']);
	} else {

		console.error("Failed verification. Make sure the VERIFY_TOKEN match.");
		res.sendStatus(403);
	}
});

app.post('/webhook', function (req, res) {

	let data = req.body;

	if (data.object == 'page') {

		webhook(data);

	} else {

		console.log('[ERROR] Not a pages call');
	}

	res.sendStatus(200);
});

module.exports = app;