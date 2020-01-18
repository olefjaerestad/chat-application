import { User } from "./classes/User";
import { user } from './user';
import { Message } from './classes/Message';
import { socket } from './websocket';
import { disableMessageEditing, enableMessageEditing, deleteMessage } from './edit-message';
import { convertBlobToDataUri } from './string-utilities';
import imageIcon from '../ts/icons/image';

/**
 * populate users list in frontend.
 * @param {User[]} users
 * by ole fjarestad.
 */
export const populateUsers = (users: User[]): void => {
    let usersEl = document.getElementById('js--users'),
        userCounterEl = document.getElementById('js--userCounter'),
        html = '';

    usersEl.innerHTML = '';

    if ( users.length ) {
        userCounterEl.innerHTML = '(' + users.length + ')';
    }

    users.forEach((user, i) => {
        html += `<li>${user.username}</li>`;
    });

    usersEl.innerHTML = html;
}

/**
 * populate messages list in frontend.
 * @param {Message[]} messages
 * by ole fjarestad.
 */
export const populateMessages = (messages: Message[]): void => {
    let messagesEl = document.getElementById('js--messages'),
        html = '',
        currentMessageCount = document.querySelectorAll('#js--messages .message').length,
        iPostedLatest = messages.length && messages[messages.length-1].userId == user.id,
        someoneElsePostedLatest = messages.length && messages[messages.length-1].userId != user.id,
        scrolledFromBottom = messagesEl.scrollHeight - messagesEl.offsetHeight - messagesEl.scrollTop,
        scrollToBottom = messages.length > currentMessageCount && ( iPostedLatest || (someoneElsePostedLatest && scrolledFromBottom < 100) ); // [ole] logic to determine whether or not to automatically scroll to bottom of chat

    messagesEl.innerHTML = '';

    messages.forEach((message: Message, i) => {
        let formattedMessage = message.message.replace(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9-][a-zA-Z0-9-]+[a-zA-Z0-9-]\.[^\s]{2,}(?=[.*^,.!^"'])|www\.[a-zA-Z0-9-][a-zA-Z0-9-]+[a-zA-Z0-9-]\.[^\s]{2,}(?=[.*^,.!^"'])|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9-]+\.[^\s]{2,}(?=)|www\.[a-zA-Z0-9-]+\.[^\s]{2,}(?=[.*^,.!^"']))/g, '<a href="$1" title="Open link in a new tab" target="_blank">$1</a>'); // [ole] regex for replacing urls with anchor elements. pattern taken from here: https://stackoverflow.com/a/17773849, tweaked to take into account punctuation directly after the url, so for example dots and commas aren't added to the url. todo: https://url.com? shows up as <a href="https://url.com?">https://url.com?</a>, want <a href="https://url.com">https://url.com</a>?

        // [ole] allow editing your own messages.
        let editHtml = '';
        if (message.userId === user.id) {
            editHtml += `
                <div class="message__edit">
                    <button class="message__edit__toggle js--editToggle" data-id="${message.id}">...</button>
                    <ul class="message__edit__actions linklist js--editActions" data-id="${message.id}">
                        <li><button class="js--editMessage" data-id="${message.id}">Edit</button></li>
                        <li><button class="js--deleteMessage" data-id="${message.id}">Delete</button></li>
                    </ul>
                </div>
            `
        }

        const imageHtml = 'image' in message && message.image ? `<br><img src="${message.image}" alt="">` : '';

        html += `
            <li class="message ${message.userId === user.id ? 'message--editable' : ''}">
                <div class="message__meta">
                    <span class="message__meta__username">${message.username}</span>&ensp;<span class="message__meta__time">${message.time}</span>
                </div>
                <p class="message__text ${message.userId === 0 ? 'message__text--faded' : ''} js--messageText" data-id="${message.id}">
                    ${formattedMessage}
                    ${imageHtml}
                </p>
                ${editHtml}
            </li>
        `;
    });

    messagesEl.innerHTML = html;

    // [ole] handle toggling of edit panels.
    document.querySelectorAll('.js--editToggle').forEach((el: HTMLElement, i: number): void => {
        el.addEventListener('click', (): void => {
            // close other open edit panels...
            document.querySelectorAll(`.js--editActions.isActive:not([data-id="${el.getAttribute('data-id')}"])`).forEach((el:HTMLElement) => {
                el.classList.remove('isActive');
            });
            // ...then toggle correct edit panel.
            document.querySelector(`.js--editActions[data-id="${el.getAttribute('data-id')}"]`).classList.toggle('isActive');
        });
    });

    // [ole] handle clicks on edit link.
    document.querySelectorAll('.js--editMessage').forEach((el: HTMLElement, i: number): void => {
        el.addEventListener('click', (): void => {
            disableMessageEditing();
            enableMessageEditing(el.getAttribute('data-id'));
        });
    });

    // [ole] handle clicks on delete link.
    document.querySelectorAll('.js--deleteMessage').forEach((el: HTMLElement, i: number): void => {
        el.addEventListener('click', (): void => {
            deleteMessage(el.getAttribute('data-id'));
        });
    });

    // [ole] url preview.
    document.querySelectorAll('.js--messageText a').forEach((el: HTMLElement, i: number): void => {
        el.addEventListener('mouseover', (e:MouseEvent): void => {
            previewUrl(el.getAttribute('href'), e.pageX-e.offsetX, e.pageY-e.offsetY);
        });
    });
    document.querySelectorAll('.js--messageText a').forEach((el: HTMLElement, i: number): void => {
        el.addEventListener('mouseleave', (): void => {
            hideUrlPreview();
        });
    });

    // [ole] ensure we always see the last message.
    if ( scrollToBottom ) {
        document.querySelector('#js--messages > li:last-child').scrollIntoView({
            behavior: 'smooth',
        });
    }
}

/**
 * remove login form from dom.
 * by ole fjarestad.
 */
export const removeLoginForm = (): void => {
    document.getElementById('js--loginForm').remove(); // no IE support for remove(). use .parentNode.removeChild() if you need to support IE
}

/**
 * add chat form to dom.
 * by ole fjarestad.
 */
export const addChatForm = (): void => {
    let form = document.createElement('form');
    form.setAttribute('action', '');
    form.id = 'js--chatForm';
    form.classList.add('app__form'); // [ole] if you need IE support, you might want to look into the support for classList.
    form.innerHTML = `
        <div class="meta">
            <label for="image" class="meta__icon icon medium" aria-label="Upload image" title="Upload image">${imageIcon}</label>
            <input type="file" name="image" placeholder="Upload image" class="showForSr" id="image" />
            <button class="meta__filename" id="js--filename"></button>
        </div>
        <label for="message" class="showForSr">Message</label>
        <input type="text" name="message" placeholder="Write your message" autocomplete="off" id="message" />
        <input type="submit" value="Submit">
    `;
    let handleChatFormSubmission = async (event: Event) => {
        event.preventDefault();
        const messageEl = <HTMLInputElement>document.getElementById('message');
        const imageEl = <HTMLInputElement>document.getElementById('image');
        const fileNameContainer = <HTMLButtonElement>document.getElementById('js--filename');
        const imageBlob = imageEl.files[0] ? (<HTMLInputElement>document.getElementById('image')).files[0] : null;
        const message = messageEl.value;
        const image = await convertBlobToDataUri(imageBlob);
        
        if ( (message || image) && socket.readyState ) {
            // [ole] ready the inputs for a new message
            messageEl.value = ''; 
            imageEl.value = '';
            fileNameContainer.innerHTML = '';
            socket.send(JSON.stringify({
                message,
                image,
            }));
        }

        messageEl.focus(); // [ole] in case we use the submit button to send, set focus back to messageEl. just for practicality.
        
    }

    document.getElementById('js--form').appendChild(form);
    document.getElementById('message').focus();
    document.getElementById('js--chatForm').removeEventListener('submit', handleChatFormSubmission); // [ole] cleanup, in case function accidentally gets called more than once.
    document.getElementById('js--chatForm').addEventListener('submit', handleChatFormSubmission);

    // https://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
    document.getElementById('image').addEventListener( 'change', e => {
        const fileNameContainer = document.getElementById('js--filename');
        let fileName = (<HTMLInputElement>e.target).value.split( '\\' ).pop();
        fileName = fileName || '';
        fileNameContainer.innerHTML = fileName;
        fileNameContainer.setAttribute('title', fileName);
    });
    document.getElementById('js--filename').addEventListener( 'click', e => {
        (<HTMLInputElement>document.getElementById('image')).value = '';
        (<HTMLButtonElement>e.target).innerHTML = '';
	});
}

/**
 * show popup, displaying a message.
 * if popup already exists, remove it before displaying the new one.
 * @param {string} msg
 * by ole fjarestad.
 */
export const showPopup = (msg: string): void => {
    if ( document.getElementById('js--popup') ) {
        document.getElementById('js--popup').remove(); // no IE support for remove(). use .parentNode.removeChild() if you need to support IE
    }
    let popup = document.createElement('div');
    popup.id = 'js--popup';
    popup.classList.add('popup');
    popup.innerHTML = `<div class="popup__inner"><span class="symbol symbol--error">i</span><p>${msg}</p></div>`;
    document.getElementById('js--app').appendChild(popup);
}

/**
 * Preview a url.
 * Displays the preview in a dialog.
 * @param {string} url
 * @param {number} x - Where in the viewport to display the dialog. In px.
 * @param {number} y - Where in the viewport to display the dialog. In px.
 * By Ole Fjarestad.
 */
const previewUrl = (url: string, x: number, y: number): void => {
    if ( document.getElementById('js--dialog') ) {
        document.getElementById('js--dialog').remove(); // no IE support for remove(). use .parentNode.removeChild() if you need to support IE
    }
    let dialog = document.createElement('dialog');
    dialog.id = 'js--dialog';
    dialog.classList.add('urlPreview');
    dialog.innerHTML = `<embed src="${url}">`;
    document.getElementById('js--app').appendChild(dialog);
    dialog.show();
    dialog.style.top = `${y-10}px`;
    dialog.style.left = `${x}px`;
    dialog.style.transform = 'translate3d(0, -100%, 0)';
}

/**
 * hide url preview.
 * by ole fjarestad.
 */
const hideUrlPreview = (): void => {
    if ( document.getElementById('js--dialog') ) {
        document.getElementById('js--dialog').remove(); // no IE support for remove(). use .parentNode.removeChild() if you need to support IE
    }
}