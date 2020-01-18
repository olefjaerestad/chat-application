const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
let users = [];
let messages = [];
let userCounter = 0; // [ole] keep track of how many users there are. this value increases every time a new user registers. it does not decrease on disconnect.

wss.on('connection', ws => {
	console.log('connection');
	let userId = 0;
	let username = false;

	ws.on('message', message => {
		let date = new Date();
		message = JSON.parse(message);

		if ( username === false ) { // add user.
			++userCounter;
			userId = userCounter;
			username = message;

			users.push({
				id: userId,
				username,
			});

			messages.push({ // [ole] inform about user joining.
				id: messages.length+1, // [ole] we never delete messages so this is fine.
				message: `${username} joined.`,
				userId: 0, // [ole] unique id for Meetingbot.
				username: 'Meetingbot',
				time: `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`, // [ole] ensure minutes are always two digits.
			})

			broadcast({
				action: 'users',
				payload: users, // [ole] todo: room for improvement by only sending the latest user instead of all.
			});
			broadcast({
				action: 'messages',
				payload: messages, // [ole] todo: room for improvement by only sending the latest message instead of all.
			});

			console.log('username:%s is logging in with userId:%s', username, userId);

		} else { // add message.
			if ( message.action == 'deleteMessage' && message.hasOwnProperty('id') ) {
				deleteMessageById(message.id, userId);
			} else if ( message.action == 'editMessage' && message.hasOwnProperty('id') && message.hasOwnProperty('message') ) {
				editMessageById(message.id, message.message, userId);
			} else {
				let newMessage = {
					id: messages.length+1, // [ole] we never delete messages so this is fine.
					message: message.message,
					image: message.image,
					userId,
					username,
					time: `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`, // [ole] ensure minutes are always two digits.
				};

				messages.push(newMessage); // ...add message to all messages.

				console.log('userId:%s is posting a message:', userId, newMessage);
			}

			broadcast({
				action: 'messages',
				payload: messages
			});
		}
	});

	// user disconnected.
	ws.on('close', function(connection) {
		// [ole] if the disconnecting client is a registered user, delete user from the list of connected users. we don't remove any messages, so we can still see deleted users' messages.
		if ( username ) {
			let date = new Date();

			deleteUserById(userId);

			messages.push({ // [ole] inform about user leaving.
				id: messages.length+1, // [ole] don't need any fancy logic to increment, since we never delete messages.
				message: `${username} left.`,
				userId: 0, // [ole] unique id for Meetingbot.
				username: 'Meetingbot',
				time: `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`, // [ole] ensure minutes are always two digits.
			});
			
			broadcast({
				action: 'users',
				payload: users
			});

			broadcast({
				action: 'messages',
				payload: messages
			});

			console.log('username:%s with userId:%s left', username, userId);
		}
	});
});

/**
 * send data to all clients connected through websocket.
 * @param {any} data - will be stringified before sending.
 * by ole fjarestad
 */
let broadcast = data => {
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send( JSON.stringify(data) );
		}
	})
}

/**
 * delete a user based on user id.
 * @param {number} id
 * by ole fjarestad
 * 
 * this function takes care of the following scenario:
 * userId	index
 * 1		0
 * 2		1
 *
 * userId:1 disconnects, we then have:
 *
 * userId	index
 * 2		1
 *
 * if we try to remove by index, we fail, since there is no index:1 in users array.
 */
let deleteUserById = id => {
	for (let i = 0; i < users.length; ++i) {
		if (users[i].id === id) {
			users.splice(i, 1);
			break;
		}
	}
}

/**
 * edit a message based on message id.
 * @param {number} id
 * @param {string} message
 * @param {number} userId - which user is trying to edit. used for permission checking.
 * by ole fjarestad
 */
let editMessageById = (id, message, userId) => {
	for (let i = 0; i < messages.length; ++i) {
		if (messages[i].id == id && messages[i].userId == userId) {
			messages[i].message = message;
			break;
		}
	}
}

/**
 * delete a message based on message id.
 * @param {number} id
 * @param {number} userId - which user is trying to delete. used for permission checking.
 * by ole fjarestad
 */
let deleteMessageById = (id, userId) => {
	for (let i = 0; i < messages.length; ++i) {
		if (messages[i].id == id && messages[i].userId == userId) {
			messages.splice(i, 1);
			break;
		}
	}
}