// tooling
const Dacoda  = require('dacoda').Dacoda;
const dacoda  = new Dacoda();
const postcss = require('postcss');
const prism   = require('./prism');
const plugins = [
	require('postcss-write-svg')
];

// on document ready
document.addEventListener(
	'DOMContentLoaded',
	() => {
		// dacoda container
		const container = document.createElement('span');

		container.className = 'dacoda-container';

		// dacoda output
		const output = document.createElement('span');

		output.className = 'dacoda-output';

		// on keydown
		dacoda.observe('keydown').then(
			(event) => {
				// if TAB is pressed
				if (event.keyCode === 9) {
					// prevent default action
					event.preventDefault();

					// get current values
					const input = dacoda.element.input;
					const end   = dacoda.current.end;
					const value = dacoda.current.value;

					// update value with TAB
					input.value = `${ value.slice(0, end) }\t${ value.slice(end) }`;

					// update selection range
					input.selectionStart = input.selectionEnd = end + 1;

					// dispatch value change event
					dacoda.dispatch('input', event);
				}

				// if CMD+S is pressed
				if (event.metaKey && event.keyCode === 83) {
					// prevent default action
					event.preventDefault();

					// update hash with current value
					location.hash = toHash(dacoda.current.value);
				}
			}
		);

		// on input
		dacoda.observe('input').then(
			(event) => {
				let before = dacoda.current.value;
				let after  = before;

				return postcss(plugins).process(before, {
					from:   location.pathname,
					to:     location.pathname,
					syntax: require('postcss-scss')
				}).then(
					(result) => {
						dacoda.element.style.innerHTML  = Prism.highlight(before, Prism.languages.cssnext);

						output.innerHTML = Prism.highlight(result.css, Prism.languages.cssnext);
					}
				);
			}
		);

		// update input
		dacoda.element.input.value = location.hash.slice(1) ? fromHash(location.hash.slice(1)) : require('./defaultCSS');

		// dispatch input event
		dacoda.dispatch('input');

		// put dacoda elements on document
		container.appendChild(dacoda.element.block);
		container.appendChild(output);

		document.body.appendChild(container);

		// hash conversions
		const fromHash = (string) => decodeURIComponent(string.replace(/\+/g, ' '));
		const toHash   = (string) => encodeURIComponent(string).replace(/%20/g, '+').replace(/%24/g, '$').replace(/%26/g, '&').replace(/%3A/g, ':').replace(/%3B/g, ';').replace(/%40/g, '@');
	}
);
