import { delay } from './delay';

/**
 * set app height to equal viewport height.
 * we use this instead of 100vh in scss, to work around the 
 * bottom browser bar in e.g. mobile safari.
 * by ole fjarestad
 */
let setAppHeight = (): void => {
	document.getElementById('js--app').style.height = window.innerHeight + 'px';
}

setAppHeight();

window.onresize = (): void => {
	delay(setAppHeight, 300);
}