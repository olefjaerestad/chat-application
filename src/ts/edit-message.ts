import { socket } from './websocket';

/**
 * make a message editable.
 * @param {number|string} messageId
 * by ole fjarestad.
 */
export let enableMessageEditing = (messageId: number|string): void => {
	const textEl = <HTMLElement>document.querySelector(`.js--messageText[data-id="${messageId}"]`);
	let form = document.createElement('form');
	form.action = '';
	form.id = 'js--editMessageForm';
	form.classList.add('message__editor');
	form.innerHTML = `
		<label for="js--editedMessage" class="showForSr">Edit message</label>
		<input type="text" name="newMessage" autocomplete="off" id="js--editedMessage">
		<input type="reset" name="cancelMessageEdit" value="Cancel">
		<input type="submit" name="saveMessage" value="Save">
	`;

	textEl.parentElement.insertBefore(form, textEl.nextSibling); // [ole] display edit form.
	document.getElementById('js--editedMessage').focus();
	(<HTMLInputElement>document.getElementById('js--editedMessage')).value = textEl.textContent.trim(); // [ole] fill with old message. this technique ensures cursor is at last pos.
	textEl.classList.add('isHidden'); // [ole] (temporarily) hide original message.

	// [ole] ensure we see the whole edit form.
	form.scrollIntoView({
		block: 'nearest',
	});

	// [ole] handle form submission.
	form.addEventListener('submit', (event: KeyboardEvent): void => {
		editMessage(messageId, (<HTMLInputElement>document.getElementById('js--editedMessage')).value);
		event.preventDefault();
	});

	// [ole] handle form reset.
	form.addEventListener('reset', (event: KeyboardEvent): void => {
		disableMessageEditing();
	});

	// [ole] hide all edit panels.
	document.querySelectorAll(`.js--editActions.isActive`).forEach((el:HTMLElement) => {
		el.classList.remove('isActive');
	});
}

/**
 * make messages uneditable. closes the editor for currently editable message.
 * by ole fjarestad.
 */
export let disableMessageEditing = (): void => {
	if (document.getElementById('js--editMessageForm')) {
		document.getElementById('js--editMessageForm').remove();
	}
	// [ole] display message.
	if (document.querySelector('.js--messageText.isHidden')) {
		document.querySelector('.js--messageText.isHidden').classList.remove('isHidden');
	}
}

/**
 * edit message. inform server.
 * @param {number|string} messageId
 * @param {number|string} message - the new text.
 * by ole fjarestad.
 */
export let editMessage = (messageId: number|string, message: string): void => {
    if (socket.readyState) {
        let data = {
            action: 'editMessage',
            id: messageId,
            message,
		}
		socket.send(JSON.stringify(data));
    }
}

/**
 * delete message. inform server.
 * @param {number|string} messageId
 * by ole fjarestad.
 */
export let deleteMessage = (messageId: number|string): void => {
    if (socket.readyState) {
        let data = {
            action: 'deleteMessage',
            id: messageId,
        }
        socket.send(JSON.stringify(data));
    }
}