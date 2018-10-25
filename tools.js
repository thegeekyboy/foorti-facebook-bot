'use strict';

import axios from 'axios';
import Sequelize from 'sequelize';

import { APP_SECRET, ACCESS_TOKEN } from './config';
import { query, User, Location, Request, Checkin, Poll, Story, Vote } from './database';
import { imageResize } from './image';

const op = Sequelize.Op;

module.exports.SubmitPDU = (data) => {

	//console.log('[DEBUG] [SubmitPDU]', JSON.stringify(data));

	return axios({

		url: 'https://graph.facebook.com/v2.9/me/messages',
		params: { access_token: ACCESS_TOKEN },
		method: 'post',
		data: data
	}).then(response => {

		// console.log(response);
		return true;

	}).catch(error => {

		if (error.response) {

			console.log('[ERROR] [SubmitPDU]', error.response.data);
			console.log('[ERROR] [SubmitPDU]', error.response.status);
			console.log('[ERROR] [SubmitPDU]', error.response.headers);
		} else if (error.request) {

			console.log('[ERROR] [SubmitPDU]', error.request);
		} else {

			console.log('[ERROR] [SubmitPDU]', error.message);
		}

		console.log('[ERROR] [SubmitPDU]', error.config);

		return false;
	});
}

module.exports.getUserInfo = async (pageid, userid) => {

	try {

		let respdb = await dbGetUserInfo(pageid, userid);

		if (respdb !== undefined) {

			return respdb;
		} else {

			let respapi = await apiGetUserInfo(pageid, userid);

			if (respapi !== undefined) {

				respapi.data['pageid'] = pageid;
				respapi.data['userid'] = userid;
				respapi.data['status'] = 0;

				dbWriteUserInfo(respapi.data);
				imageResize(respapi.data);

				return respapi.data;
			} else {

				return undefined;
			}
		}

	} catch (err) {

		console.log('[ERROR] [getUserInfo]', err);
		return undefined;
	}

	return undefined;
}

function apiGetUserInfo(pageid, userid) {

	let retval = axios({

		url: 'https://graph.facebook.com/v2.9/' + userid,
		params: { access_token: ACCESS_TOKEN },
		method: 'get'
	}).then(response => {

		return response;
	}).catch(error => {

		console.log('[ERROR] [axios]', error);
		return undefined;
	});

	return retval;
}

function dbGetUserInfo(pageid, userid) {

	let retval = User.findOne({
		where: {
			userid,
			pageid
		}
	}).then(userinfo => {

		if (userinfo)
			return userinfo.dataValues;
		else
			return undefined;
	});

	return retval;
}

function dbWriteUserInfo(data) {

	return User.create({

		status: data.status,
		pageid: data.pageid,
		userid: data.userid,
		first_name: data.first_name || data.name,
		last_name: data.last_name,
		gender: data.gender,
		profile_pic: data.profile_pic,
		timezone: data.timezone,
		locale: data.locale
	});

	return undefined;
}

module.exports.updateUserStatus = (data) => {

	return User.update({

		status: data.status,
		phone: data.phone
	}, {

			where: {
				userid: data.userid,
				pageid: data.pageid
			}
		});
}

module.exports.dbWriteUserLocation = (data) => {

	return Location.create({

		userid: data.userid,
		pageid: data.pageid,
		latitude: data.lat,
		longitude: data.long
	});

	return undefined;
};

module.exports.dbWriteUserRequest = (userinfo, details) => {

	return Request.create({

		userid: userinfo.userid,
		pageid: userinfo.pageid,
		status: 0,
		details: details
	});
};

module.exports.dbWriteUserRequest = (userinfo, details) => {

	return Request.create({

		userid: userinfo.userid,
		pageid: userinfo.pageid,
		status: 0,
		details: details
	});
};

module.exports.dbWriteUserCheckin = (userinfo, details) => {

	return Checkin.create({

		userid: userinfo.userid,
		pageid: userinfo.pageid,
		status: 0,
		details: details
	});
};

module.exports.dbWriteUserStory = (userinfo, details, storytype) => {

	return Story.create({

		userid: userinfo.userid,
		pageid: userinfo.pageid,
		status: 0,
		details: details,
		storytype: storytype
	});
};

module.exports.dbGetPollList = async (userinfo) => {

	let retval = await query('select * from polls where id not in (select pollid from votes where userid = ?)', [userinfo.userid], Sequelize.QueryTypes.SELECT);;
	let data = [];

	if (retval.length < 1) {

		return [];
	} else {

		data = retval.map((item) => {

			let x = {};

			x.id = item.id;
			x.status = item.status;
			x.details = item.details;
			x.options = JSON.parse(item.options);

			return x;
		});
	}

	return data;
};

module.exports.dbPostVote = (userinfo, bits) => {

	return Vote.create({
		pageid: userinfo.pageid,
		userid: userinfo.userid,
		pollid: bits[0],
		vote: bits[1]
	});
};