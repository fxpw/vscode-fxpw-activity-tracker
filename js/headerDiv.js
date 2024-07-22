
// eslint-disable-next-line no-unused-vars
function updateHeader() {
	try {
		let headerDiv = document.getElementById('header');
		headerDiv.innerHTML = "";

		let toHomeButton = _frames.CreateHeaderButton("ftoHomeButton",  "M3 9.5V21H21V9.5L12 2L3 9.5ZM11 12V18H13V12H11Z");

		toHomeButton.addEventListener('click', () => {
			updateBodyMainFrameRequest();
		});

		let spacer = _frames.CreateSpacer();

		headerDiv.appendChild(toHomeButton);
		headerDiv.appendChild(spacer);

	} catch (error) {
		console.error(error);
	}
}


