import fs from 'fs';
import express from 'express';
import https from 'https';
import socket from 'socket.io';
import cors from 'cors';

import { STREAM_PORT } from '../config';
import Database from './database';

const app = express();
app.use(cors());

const server = https.createServer({

	cert: fs.readFileSync('/etc/letsencrypt/live/thecodeninjas.net/cert.pem'),
	key: fs.readFileSync('/etc/letsencrypt/live/thecodeninjas.net/privkey.pem'),
	ca: fs.readFileSync('/etc/letsencrypt/live/thecodeninjas.net/chain.pem')
}, app).listen(STREAM_PORT, () => console.log(`Listening on port ${STREAM_PORT}`));

const io = socket(server);
io.on('connection', sd => {

	console.log('User connected =>', sd.handshake.address);

	sd.on('disconnect', () => {

		console.log('User disconnected');
	});

	sd.on('ADD_STORY', (data) => {

		io.emit('PUSH_STORY', data);
	});

	sd.on('DEL_STORY', (data) => {

		io.emit('POP_STORY', data);

		const db = new Database();
		db.query('update stories set status = 1 where id = ?', [data])
			.catch(err => console.log('[ERROR]', err));
		db.close().catch(err => console.log('[ERROR]', err));
	});
});

app.get('/story', (req, res) => {

	const db = new Database();

	db.query('select b.createdAt, b.id, a.pageid, a.userid, a.first_name, a.last_name, a.gender, a.profile_pic, b.status, b.details, b.storytype from userinfos a inner join stories b on a.userid = b.userid where b.status = 0')
		.then(data => res.send(data))
		.catch(err => console.log('[ERROR]', err));
	db.close().catch(err => console.log('[ERROR]', err));
});

app.get('/polls', async (req, res) => {

	const db = new Database();
	db.query('select id from polls where id in(select distinct pollid from votes)')
		.then(data => {

			//res.send(data)

			const plist = data.map(p => getPollDetails(p.id));

			Promise.all(plist).then(retval => {

				res.send(retval);	

			});

		}).catch(err => {
			console.log('[ERROR]', err)
			res.send({});
		});

		db.close().catch(err => console.log('[ERROR]', err));
});

app.get('/polls/:pollid', (req, res) => {

	getPollDetails(req.params.pollid)
		.then(data => res.send(data))
		.catch(err => {

			console.log('[ERROR]', err)
			res.send({});
		});
});

const getPollDetails = (pollid) => {

	const getPollStats = async (pollid) => {

		const db = new Database();
		const retval = await db.query('select vote, count(*) cnt from votes where pollid = ? group by vote', [pollid]);
		db.close().catch(err => console.log('[ERROR]', err));

		return retval;
	};

	const getPollDetails = async (pollid) => {

		const db = new Database();
		const retval = await db.query('select id, status, details, options, createdAt from polls where id = ?', [pollid]);
		db.close().catch(err => console.log('[ERROR]', err));

		return retval;
	};

	return Promise.all([

		getPollStats(pollid),
		getPollDetails(pollid)
	]).then(data => {

		if (data[0].length != 0 && data[1] != 0) {

			const optmap = JSON.parse(data[1][0].options);
			const options = data[0].map(x => ({

				key: optmap.find(y => parseInt(y.id) === x.vote).text,
				value: x.cnt
			}));

			const poll = {

				pollid: data[1][0].id,
				status: data[1][0].status,
				details: data[1][0].details,
				createdAt: data[1][0].createdAt,
				stats: options
			};

			return poll;
		} else {

			return {};
		}
	});
};
