import io from 'socket.io-client';

import { ACCESS_TOKEN } from './config';
import {

	SubmitPDU,
	getUserInfo,
	updateUserStatus,
	dbWriteUserLocation,
	dbWriteUserRequest,
	dbWriteUserCheckin,
	dbWriteUserStory,
	dbGetPollList,
	dbPostVote
} from './tools';

const printlog = (data) => console.log('>>', JSON.stringify(data), '<<');

module.exports.webhook = (data) => {

	data.entry.forEach((pageEntry) => {

		let pageID = pageEntry.id;
		let timeOfEvent = pageEntry.time;

		if (pageEntry.messaging) {
			pageEntry.messaging.forEach(function (messagingEvent) {

				let senderID = messagingEvent.sender.id;

				getUserInfo(pageID, senderID).then(data => {

					if (messagingEvent.optin) {

						//receivedAuthentication(messagingEvent);
					} else if (messagingEvent.message) {

						sendMarkSeen(senderID);
						receivedMessage(messagingEvent, data);
					} else if (messagingEvent.delivery) {

						// receivedDeliveryConfirmation(messagingEvent);
					} else if (messagingEvent.postback) {

						sendMarkSeen(senderID);
						receivedPostback(messagingEvent, data);
					} else if (messagingEvent.read) {

						// receivedMessageRead(messagingEvent);
					} else if (messagingEvent.account_linking) {

						// receivedAccountLink(messagingEvent);
					} else {

						console.log("Webhook received unknown messagingEvent: ", messagingEvent);
					}
				});
			});
		} else {

			console.log('>>', JSON.stringify(pageEntry), '<<');
		}
	});
}

function receivedMessage(event, userinfo) {

	const senderID = event.sender.id;
	const recipientID = event.recipient.id;
	const timeOfMessage = event.timestamp;
	const message = event.message;

	const isEcho = message.is_echo;
	const messageId = message.mid;
	const appId = message.app_id;
	const metadata = message.metadata;

	const messageText = message.text;
	const messageAttachments = message.attachments;
	const quickReply = message.quick_reply;

	if (isEcho) {

		return;
	} else if (quickReply) {

		const payload = quickReply.payload;

		if (userinfo.status < 3) {
			switch (payload) {
				case 'FOORTI_PRIVACY_ACCEPT':
					requestUserLocation(userinfo.userid, 'Awesommme, May I ask for your location?');

					userinfo.status = 1;
					updateUserStatus(userinfo);
					break;

				case 'FOORTI_PRIVACY_REJECT':
					sendTextMessage(userinfo.userid, 'Darn it! You will find me here if you change your mind :) cheers! All information about you in my mind will be removed now.');

					userinfo.status = 0;
					updateUserStatus(userinfo);
					break;

				default:
					sendTextMessage(userinfo.userid, 'Something\'s not right. We should start from scratch. Sorry about that!');
			}
		}

		return;
	}

	if (messageText) {

		switch (messageText) {

			case 'image':
				// sendImageMessage(senderID);
				break;

			case 'gif':
				// sendGifMessage(senderID);
				break;

			case 'audio':
				// sendAudioMessage(senderID);
				break;

			case 'video':
				// sendVideoMessage(senderID);
				break;

			case 'file':
				// sendFileMessage(senderID);
				break;

			case 'button':
				// sendButtonMessage(senderID);
				break;

			case 'generic':
				// sendGenericMessage(senderID);
				break;

			case 'receipt':
				// sendReceiptMessage(senderID);
				break;

			case 'quick reply':
				// sendQuickReply(senderID);
				break;

			case 'read receipt':
				// sendReadReceipt(senderID);
				break;

			case 'typing on':
				// sendTypingOn(senderID);
				break;

			case 'typing off':
				// sendTypingOff(senderID);
				break;

			case 'account linking':
				// sendAccountLinking(senderID);
				break;

			default:
				switch (userinfo.status) {
					case 0:
						sendTextMessage(userinfo.userid, `Hola ${userinfo.first_name}! I am your friendly FOORTI Bot :)`);
						setTimeout(() => sendTextMessage(userinfo.userid, 'Please note by talking to me you agree to sharing information which may be stored in my memory for later usage or analysis. A detailed privacy policy can be found at https://thecodeninjas.net/legal/privacy.html'), 500);
						setTimeout(() => sendTextMessage(userinfo.userid, 'Should you not want to interact with me, you can turn me off by typing \'OFF\' here.'), 700);
						setTimeout(() => sendButtonPrivacy(userinfo.userid), 1000);

						userinfo.status = 0.1;
						updateUserStatus(userinfo);

						break;

					case 0.1:
						sendButtonPrivacy(userinfo.userid);
						break;

					case 1:
						requestUserLocation(userinfo.userid, 'Still waiting for your location my friend.');
						break;

					case 2:

						if (messageText.match(/^(015|016|017|018|019)[0-9]{8}$/)) {

							sendTextMessage(userinfo.userid, 'Ahh seems a ligit number :D thanks for sharing. You are all set now, we can talk more when you are ready.');
							userinfo.status = 3;
							userinfo.phone = messageText;
							updateUserStatus(userinfo);
						} else {

							sendTextMessage(userinfo.userid, `${messageText} does not seem legit, kind of still need your phone number :/ just type in your number`);
							//console.log(messageText);
						}
						break;

					case 3:
						if (messageText.toUpperCase() == 'OFF') {

							sendTextMessage(userinfo.userid, 'Ok, that hurts. But fine, I will turn myself off :\'( anytime you want me to start talking just type \'ON\'');
							userinfo.status = 7;
							updateUserStatus(userinfo);
						} else {

							sendButtonMessage(userinfo.userid);
						}
						break;

					case 4.1:
						sendButtonMusic(userinfo.userid);
						break;

					case 4.2:
						dbWriteUserRequest(userinfo, messageText);
						dbWriteUserStory(userinfo, messageText, 0).then(data => {

							const pushdata = {
								...userinfo,
								...data.dataValues
							};
							const socket = io('https://thecodeninjas.net:5001');
							socket.emit('ADD_STORY', pushdata);
						});
						sendTextMessage(userinfo.userid, 'Duly noted my friend, I will pass it along.');

						userinfo.status = 3;
						updateUserStatus(userinfo);
						break;

					case 5.1:
						dbWriteUserCheckin(userinfo, messageText);
						dbWriteUserStory(userinfo, messageText, 1).then(data => {

							const pushdata = {
								...userinfo,
								...data.dataValues
							};
							const socket = io('https://thecodeninjas.net:5001');
							socket.emit('ADD_STORY', pushdata);
						});
						sendTextMessage(userinfo.userid, 'Kwel, I have noted your check-in and I will keep in my list of online people for the next 30mins.');

						userinfo.status = 3;
						updateUserStatus(userinfo);

						break;

					case 6.1:
						sendTextMessage(userinfo.userid, 'You need to respond to the poll ' + (userinfo.gender === 'male' ? 'man' : 'girl'));
						break;

					case 7:
						//Bot is off ATM
						if (messageText.toUpperCase() == 'ON') {
							userinfo.status = 3;
							updateUserStatus(userinfo);

							sendTextMessage(userinfo.userid, 'I was so dying to talk :/ thanks for setting me free :D');
						}
						break

					default:
						console.log('[DEBUG] Unknown status');
				}
		}

	} else if (messageAttachments) {

		if (messageAttachments[0].type === 'location') {
			messageAttachments[0].payload.coordinates.pageid = userinfo.pageid;
			messageAttachments[0].payload.coordinates.userid = userinfo.userid;
			dbWriteUserLocation(messageAttachments[0].payload.coordinates);

			if (userinfo.status <= 1) {
				userinfo.status = 2;
				updateUserStatus(userinfo);
				sendTextMessage(userinfo.userid, 'Thanku.. thankuu.. Can I have your mobile number?');
			} else if (userinfo.status === 2) {
				userinfo.status = 3;
				updateUserStatus(userinfo);
				sendTextMessage(userinfo.userid, 'Kwel, you are all set now, you can msg me anytime to start a conversation.');
			} else {

				sendTextMessage(userinfo.userid, 'Thanks for updating your location information. Much appriciated :)')
			}
		} else {

			console.log(messageAttachments[0].type);
		}
	}
}

const sendTextMessage = (userid, messageText) => {

	const messageData = {

		recipient: {
			id: userid
		},
		message: {

			text: messageText,
			metadata: "DEVELOPER_DEFINED_METADATA"
		}
	};

	SubmitPDU(messageData);
}

const requestUserLocation = (userid, textPrompt) => {

	const messageData = {

		recipient: {
			id: userid
		},
		message: {
			text: textPrompt,
			quick_replies: [{
				'content_type': 'location'
			}]
		}
	};

	SubmitPDU(messageData);
}

const receivedPostback = (event, userinfo) => {

	const senderID = event.sender.id;
	const recipientID = event.recipient.id;
	const timeOfPostback = event.timestamp;
	const payload = event.postback.payload;

	if (userinfo.status == 7) /* Exit if Bot is turned Off */
		return;

	if (userinfo.status < 3) {
		switch (payload) {
			case 'FOORTI_PRIVACY_ACCEPT':
				requestUserLocation(userinfo.userid, 'Awesommme, May I ask for your location?');

				userinfo.status = 1;
				updateUserStatus(userinfo);
				break;

			case 'FOORTI_PRIVACY_REJECT':
				sendTextMessage(userinfo.userid, 'Darn it! You will find me here if you change your mind :) cheers! All information about you in my mind will be removed now.');

				userinfo.status = 0;
				updateUserStatus(userinfo);
				break;

			default:
				sendTextMessage(userinfo.userid, 'Something\'s not right. We should start from scratch. Sorry about that!');
		}

		return;
	}

	switch (payload) {
		case 'FOORTI_PRIVACY_ACCEPT':
			requestUserLocation(userinfo.userid, 'Awesommme, May I ask for your location?');

			userinfo.status = 1;
			updateUserStatus(userinfo);
			break;

		case 'FOORTI_PRIVACY_REJECT':
			sendTextMessage(userinfo.userid, 'Darn it! You will find me here if you change your mind :) cheers');

			userinfo.status = 0;
			updateUserStatus(userinfo);
			break;

		case 'FOORTI_MAIN_CHECKIN':
			sendTextMessage(userinfo.userid, 'Type in something as your shout out..');

			userinfo.status = 5.1;
			updateUserStatus(userinfo);
			break;

		case 'FOORTI_MAIN_MUSIC':
			sendButtonMusic(senderID);

			userinfo.status = 4.1;
			updateUserStatus(userinfo);
			break;

		case 'FOORTI_MAIN_POLL':
			sendPollList(userinfo);
			break;

		case 'FOORTI_MUSIC_REQUEST':
			sendTextMessage(userinfo.userid, 'Ahh ok, just type in the song that you want to hear.');

			userinfo.status = 4.2;
			updateUserStatus(userinfo);
			break;

		case 'FOORTI_MUSIC_ID':
			//getCurrentTrack().then(data => sendPictureCard(userinfo, data.title, data.subtitle));
			sendPictureCard(userinfo, 'Dhua', 'Fuad al Muqtadir feat. Imran Mahmudul');
			break;

		case 'FOORTI_MUSIC_ABORT':
			userinfo.status = 3;
			updateUserStatus(userinfo);
			break;

		default:
			const header = payload.substring(0, 12);

			if (header == 'FOORTI_POLL_' && userinfo.status == 6.1) {
				let bits = payload.match(/([0-9]+)/g);

				dbPostVote(userinfo, bits);
				sendTextMessage(userinfo.userid, 'Thanks for your vote.');

				userinfo.status = 3;
				updateUserStatus(userinfo);
			} else {
				console.log('[ERROR] Unknown payload type:', payload);
			}
	}
}

const sendButtonPrivacy = (userid) => {

	let messageData = {

		recipient: {
			id: userid
		},
		message: {
			text: "Do you agree with the privacy statement?",
			quick_replies: [{
				"content_type": "text",
				"title": "Yes, I agree!",
				"payload": "FOORTI_PRIVACY_ACCEPT"
			}, {
				"content_type": "text",
				"title": "Noop, I dont like!",
				"payload": "FOORTI_PRIVACY_REJECT"
			}]
		}
	};

	SubmitPDU(messageData);
};


const sendButtonMessage = (userid) => {

	let messageData = {

		recipient: {

			id: userid
		},
		message: {

			attachment: {

				type: "template",
				payload: {

					template_type: "button",
					text: "What do you feel like doin'",
					buttons: [{

						type: "postback",
						title: "Check-In",
						payload: "FOORTI_MAIN_CHECKIN"
					}, {

						type: "postback",
						title: "Music",
						payload: "FOORTI_MAIN_MUSIC"
					}, {

						type: "postback",
						title: "Polls",
						payload: "FOORTI_MAIN_POLL"
					}]
				}
			}
		}
	};

	SubmitPDU(messageData);
};

const sendButtonMusic = (userid) => {

	let messageData = {

		recipient: {

			id: userid
		},
		message: {

			attachment: {

				type: "template",
				payload: {

					template_type: "button",
					text: "Ok, what do you want to do now?",
					buttons: [{

						type: "postback",
						title: "Song Request",
						payload: "FOORTI_MUSIC_REQUEST"
					}, {

						type: "postback",
						title: "Whats playing now?",
						payload: "FOORTI_MUSIC_ID"
					}, {

						type: "postback",
						title: "Take me back!",
						payload: "FOORTI_MUSIC_ABORT"
					}]
				}
			}
		}
	};

	SubmitPDU(messageData);
};

const sendPollList = (userinfo) => {

	let x = dbGetPollList(userinfo).then((data) => {

		if (data.length > 0) {
			let item = data[0];
			let messageData = {

				recipient: {

					id: userinfo.userid
				},
				message: {

					attachment: {

						type: "template",
						payload: {

							template_type: "button",
							text: item.details,
							buttons: item.options.map(x => {

								let y = {};

								y.type = 'postback';
								y.title = x.text;
								y.payload = `FOORTI_POLL_${item.id}_${x.id}`;

								return y;
							})
						}
					}
				}
			};

			SubmitPDU(messageData);

			userinfo.status = 6.1;
			updateUserStatus(userinfo);
		} else {

			sendTextMessage(userinfo.userid, 'No more polls left for you to respond. Why don\'t you come back later and check :)');
		}
	});
};

const sendPictureCard = ({ userid }, title, subtitle) => {

	let messageData = {

		recipient: {

			id: userid
		},
		message: {

			attachment: {

				type: "template",
				payload: {

					template_type: "generic",
					elements: [{

						title: title,
						subtitle: subtitle,
						image_url: "https://thecodeninjas.net/fb-img/d01.png"
					}]
				}
			}
		}
	};

	SubmitPDU(messageData);
};

const sendMarkSeen = (userid) => {

	const messageData = {

		recipient: {

			id: userid
		},
		sender_action: "mark_seen"
	};

	SubmitPDU(messageData);
};