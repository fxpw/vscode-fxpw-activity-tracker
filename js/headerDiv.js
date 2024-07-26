
// eslint-disable-next-line no-unused-vars
function updateHeader(text = null, requestName = null, requestData = null) {
	try {
		let headerDiv = document.getElementById('header');
		headerDiv.innerHTML = "";
		if (text) {
			let textElement = document.createElement('span'); // Можно использовать 'div' или другой элемент при необходимости
			textElement.textContent = text; // Установка текста
			textElement.className = "headerText";
			// textElement.style.marginRight = '10px'; // Установка отступа справа (опционально) для пробела между текстом и spacer
			headerDiv.appendChild(textElement); // Добавление текста в заголовок
		}
		let spacer = _frames.CreateSpacer();

		headerDiv.appendChild(spacer);
		if (requestName) {
			let backButton = _frames.CreateHeaderButton("backButton", requestName, requestData, "M3 12L11 4L11 10H21V14H11V20L3 12Z");
			headerDiv.appendChild(backButton);
		}

	} catch (error) {
		console.error(error);
	}
}


