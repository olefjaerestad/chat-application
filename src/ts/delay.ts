/** 
 * helper function for delaying execution of code.
 * useful e.g. when running code on resize or scroll events, to boost performance, as the 
 * code will only run _after_ the event has finished (e.g. after resizing or scrolling stops).
 * 
 * basic usage:
 * delay(() => {
		myFunc();
	}, 300);
 *
 * attached to window resize:
 * window.onresize = () => {
		delay(myFunc, 300);
	}
 * or, if you need to do more than calling a function
 * window.onresize = () => {
		delay(() => {
			let param1 = 1;
			let param2 = 2;
			myFirstFunc(param1);
			mySecondFunc(param1, param2);
		}, 300);
	}
 *
 * by ole fjarestad.
 */
export let delay = ((): Function => {
	let timer: any = 0;
	
	return (callback: Function, ms: number) => {
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	}
})();