// tooling
const plugin = require('postcss-write-svg');

// update <style>
const updateStyle = (style) => {
	plugin.process(style.textContent).then(
		(result) => {
			style.textContent = result.css;
		},
		console.error
	);
};

// update any <style> in <head>
const styles = document.head.getElementsByTagName('style');

if (styles.length) {
	Array.prototype.forEach.call(styles, updateStyle);
}

// update any new <style> in <head>
(new MutationObserver(
	(mutations) => mutations.forEach(
		(mutation) => Array.prototype.filter.call(
			mutation.addedNodes || [],
			(node) => node.nodeName === 'STYLE'
		).forEach(updateStyle)
	)
)).observe(
	document.head,
	{
		childList: true
	}
);
