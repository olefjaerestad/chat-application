import { user } from './user';
import { populateUsers, populateMessages, showPopup } from './dom-manipulation'
declare const LOCAL_IP: string; // [ole] passed in webpack.config.js. declaring it here to be explicit (and to avoid ts compile errors).
const myIP = LOCAL_IP || 'localhost';

/**
 * establish websocket connection.
 * by ole fjarestad.
 */
export const socket = new WebSocket('ws://' + myIP + ':8080'); // [ole] myIP has to be an actual ip (and not just 'localhost') to be accessible from other devices on same network.

/**
 * connection closed.
 * by ole fjarestad.
 */
socket.addEventListener('close', (event: CloseEvent): void => {
    showPopup('Lost connection to the server. You\'ll have to refresh your browser and log in again. Your messages will still be available in the chat. Sorry for the inconvenience!'); // [ole] we could use event.code to define more specific error messages.
});

/**
 * listen for data from server.
 * by ole fjarestad.
 */
socket.addEventListener('message', (event: MessageEvent): void => {
    let data = JSON.parse(event.data);

    if (data.action === 'users') {
        if ( user.username && !user.id ) { // [ole] checking for user.username makes sure a client only assigns id to himself, not to all other clients as well.
            user.id = data.payload[data.payload.length-1].id; // [ole] on registration, assign user id.
        }
        if ( user.id ) { // [ole] only display users if registered.
            populateUsers(data.payload);
        }
    } else if (data.action === 'messages') {
        if ( user.id ) { // [ole] only display messages if registered.
            populateMessages(data.payload);
        }
    }
});