let tabs = document.querySelectorAll('.js--tab');

/**
 * clicking a tab makes it active and other tabs inactive.
 * also displays the corresponding part/content of the app.
 * by ole fjarestad
 */
tabs.forEach((el, i): void => {
	el.addEventListener('click', (event: Event): void => {
		let displayArea: number = parseFloat( (<HTMLElement>event.target).getAttribute('data-area') );
		document.getElementById('js--content').style.transform = 'translate3d(-' + (100 * displayArea) + '%, 0, 0)';

		tabs.forEach((el2, j): void => {
			el2.classList.remove('isActive');
		});

		(<HTMLElement>event.target).classList.add('isActive');
	});
});