function formatTime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return `${hours}h ${minutes}m ${seconds}s`; // Возвращает строку в формате "xh ym zs"
}

function CreateListOfProjects(response) {
	let data = response.data;
	let bodyElement = document.getElementById('body');
	bodyElement.innerHTML = '';

	let mainFrameContainer = _frames.CreateContainer("ProjectsFrame");

	data.forEach(function (projectName) {
		let button = _frames.CreateContainerListButton(projectName, projectName);
		mainFrameContainer.appendChild(button);
	});


	bodyElement.appendChild(mainFrameContainer);
}


function CreateListOfFiles(response) {
	let data = response.data;
	let bodyElement = document.getElementById('body');
	bodyElement.innerHTML = '';

	let filesFrameContainer = _frames.CreateContainer("FilesFrame");
	bodyElement.appendChild(filesFrameContainer);
	// let chartContainer = _frames.CreateContainer("ChartContainerFrame");
	// chartContainer.className = 'container chartContainer';
	// filesFrameContainer.appendChild(chartContainer);

	let totalTimeSpent = 0;

	// Считаем общее время, затраченное на все файлы
	for (const filePath in data) {
		if (data.hasOwnProperty(filePath)) {
			let fileContents = data[filePath];
			totalTimeSpent += fileContents.reduce((total, entry) => total + entry.timeSpend, 0);
		}
	}

	// Массив для хранения времени и пути
	let fileTimeDataArray = [];

	for (const filePath in data) {
		if (data.hasOwnProperty(filePath)) {
			let filePathData = data[filePath];
			let timeSpendInMilisec = filePathData.reduce((total, entry) => total + entry.timeSpend, 0);
			let timeSpend = formatTime(timeSpendInMilisec);
			let percent = Math.round(((timeSpendInMilisec / totalTimeSpent) * 100) * 10) / 10;
			let fileName = filePath.split('/').pop();

			// Добавляем данные в массив
			fileTimeDataArray.push({
				filePath: filePath,
				fileName:fileName,
				timeSpend: timeSpend,
				percent: percent,
				timeSpendInMilisec: timeSpendInMilisec
			});
		}
	}

	// Сортируем массив по времени (в миллисекундах) в порядке убывания
	fileTimeDataArray.sort((a, b) => b.timeSpendInMilisec - a.timeSpendInMilisec);

	fileTimeDataArray.forEach(fileData => {
		let button = _frames.CreateContainerListButton(fileData.filePath, fileData.filePath, `${fileData.timeSpend} (${fileData.percent}%)`);
		filesFrameContainer.appendChild(button);
	});


	bodyElement.appendChild(filesFrameContainer);
}

// eslint-disable-next-line no-unused-vars
function updateBody(response) {
	try {
		CreateListOfProjects(response);
		console.log(response);
	} catch (error) {
		console.error(error);
	}
}


function updateBodyMainFrameRequest() {
	_requests.Send("GetRootPathMapDataRequest");
}

