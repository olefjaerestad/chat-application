import { user } from './user';
import { socket } from './websocket';
import { removeLoginForm, addChatForm } from './dom-manipulation';

/**
 * login form submission.
 * by ole fjarestad.
 */
document.getElementById('js--loginForm').addEventListener('submit', (event: Event): void => {
    let username = (<HTMLInputElement>document.getElementById('username')).value;

    if ( username && socket.readyState ) {
        user.username = username;
        socket.send(JSON.stringify(user.username));
        removeLoginForm();
        addChatForm();
    }

    event.preventDefault();
});

/**
 * close actions (edit message) panel when clicking outside of it.
 * by ole fjarestad.
 */
document.addEventListener('click', (event: Event): void => {
    if ( !(<HTMLElement>event.target).matches('.js--editToggle, .js--editMessage, .js--deleteMessage') ) {
        document.querySelectorAll('.js--editActions.isActive').forEach((el:HTMLElement) => {
            el.classList.remove('isActive');
        });
    }
});