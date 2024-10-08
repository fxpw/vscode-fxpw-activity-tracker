function formatTime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return `${hours}h ${minutes}m ${seconds}s`; // Возвращает строку в формате "xh ym zs"
}

function CreateListOfProjects(response) {
	let { data } = response;
	let bodyElement = document.getElementById('body');
	bodyElement.innerHTML = '';

	let mainFrameContainer = _frames.CreateContainer("ProjectsFrame");
	data.sort((a, b) => b.totalTime - a.totalTime);
	data.forEach((projectData) => {
		let button = _frames.CreateContainerListButton(
			"GetRootPathAllDataRequest",
			{
				projectName: projectData.projectName,
			},
			projectData.projectName,
			formatTime(projectData.totalTime)
		);
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
	let totalTimeSpent = 0;

	let projectTimeByDate = {};

	for (const filePath in data) {
		if (data.hasOwnProperty(filePath)) {
			let fileContents = data[filePath];
			totalTimeSpent += fileContents.reduce((total, entry) => total + entry.timeSpend, 0);

			fileContents.forEach(entry => {
				let date = new Date(entry.createdAt).toLocaleDateString();
				let timeSpend = entry.timeSpend;

				if (!projectTimeByDate[date]) {
					projectTimeByDate[date] = 0;
				}
				projectTimeByDate[date] += timeSpend; // Суммируем время для этой даты
			});
		}
	}

	let fileTimeDataArray = [];

	for (const filePath in data) {
		if (data.hasOwnProperty(filePath)) {
			let filePathData = data[filePath];
			let timeSpendInMilisec = filePathData.reduce((total, entry) => total + entry.timeSpend, 0);
			let timeSpend = formatTime(timeSpendInMilisec);
			let percent = Math.round(((timeSpendInMilisec / totalTimeSpent) * 100) * 10) / 10;
			let fileName = filePath.split('/').pop();

			fileTimeDataArray.push({
				filePath: filePath,
				fileName: fileName,
				timeSpend: timeSpend,
				percent: percent,
				timeSpendInMilisec: timeSpendInMilisec
			});
		}
	}

	let labels = Object.keys(projectTimeByDate).sort((a, b) => {
		const [dayA, monthA, yearA] = a.split('.').map(Number);
		const [dayB, monthB, yearB] = b.split('.').map(Number);

		const dateA = new Date(yearA, monthA - 1, dayA);
		const dateB = new Date(yearB, monthB - 1, dayB);

		return dateA - dateB;
	});
	const totalTimes = labels.map(date => {
		// Получаем время для текущей даты
		return projectTimeByDate[date] / 1000 / 60; // Преобразуем в минуты
	});

	const ctx = document.createElement('canvas');
	filesFrameContainer.appendChild(ctx);

	new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [
				{
					label: 'Общее время, проведенное в проекте (минуты)',
					data: totalTimes,
					backgroundColor: 'rgba(75, 192, 192, 0.2)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1,
					fill: true,
				}
			]
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: 'Время (минуты)'
					}
				},
				x: {
					title: {
						display: true,
						text: 'Дата'
					}
				}
			}
		}
	});

	fileTimeDataArray.sort((a, b) => b.timeSpendInMilisec - a.timeSpendInMilisec);

	fileTimeDataArray.forEach(fileData => {
		let button = _frames.CreateContainerListButton(
			"GetRootPathAndFilePathDataRequest",
			{
				projectName: response.projectName,
				filePath: fileData.filePath,
			},
			fileData.filePath,
			`${fileData.timeSpend} (${fileData.percent}%)`
		);
		filesFrameContainer.appendChild(button);
	});

	bodyElement.appendChild(filesFrameContainer);
}


function CreateFileInfoFrame(response) {
	let data = response.data;
	let bodyElement = document.getElementById('body');
	bodyElement.innerHTML = '';

	let fileFrameContainer = _frames.CreateContainer("FileFrame");
	bodyElement.appendChild(fileFrameContainer);

	const fileInfo = document.createElement('h2');
	fileInfo.innerText = `Файл: ${response.filePath}`; // или другой текст описания
	fileFrameContainer.appendChild(fileInfo);

	let timeSpendData = [];

	data.forEach(entry => {
		// Преобразование времени в локальный формат даты
		let date = new Date(entry.createdAt).toLocaleDateString();
		let timeSpent = entry.timeSpend; // Время, проведенное в файле

		// Если запись по данной дате ещё не существует, создаем новую
		if (!timeSpendData[date]) {
			timeSpendData[date] = { totalTime: 0, visits: 0, createdAt: entry.createdAt, entries: [] }; // Сохраняем время и количество заходов
		}

		// Увеличиваем общее время и счетчик заходов
		timeSpendData[date].totalTime += timeSpent;
		timeSpendData[date].visits += 1; // Увеличиваем счетчик заходов
		timeSpendData[date].entries.push({
			timeSpent: entry.timeSpend,
			createdAt: entry.createdAt
		});
	});

	// Преобразование объекта в массив для построения графика
	let visitCountData = [];
	for (let date in timeSpendData) {
		visitCountData.push({
			date: date,
			totalTime: timeSpendData[date].totalTime / 1000 / 60, // Преобразуем в минуты
			visits: timeSpendData[date].visits,
			createdAt: timeSpendData[date].createdAt // Сохраняем для сортировки
		});
	}

	// Сортировка массива visitCountData по созданной дате (createdAt)
	visitCountData.sort((a, b) => a.createdAt - b.createdAt); // Сравнение по времени

	// Заполнение массивов для графика
	let labels = visitCountData.map(entry => entry.date);
	let totalTimes = visitCountData.map(entry => entry.totalTime);
	let visits = visitCountData.map(entry => entry.visits);

	// Создание графика
	const ctx = document.createElement('canvas');
	fileFrameContainer.appendChild(ctx);

	new Chart(ctx, {
		type: 'line', // Или 'bar' для столбчатой диаграммы
		data: {
			labels: labels,
			datasets: [
				{
					label: 'Общее время, проведенное за день (минуты)',
					data: totalTimes,
					backgroundColor: 'rgba(75, 192, 192, 0.2)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1,
					yAxisID: 'y1'
				},
				{
					label: 'Количество заходов в файл',
					data: visits,
					backgroundColor: 'rgba(255, 99, 132, 0.2)',
					borderColor: 'rgba(255, 99, 132, 1)',
					borderWidth: 1,
					yAxisID: 'y2'
				}
			]
		},
		options: {
			scales: {
				y1: {
					type: 'linear',
					position: 'left',
					beginAtZero: true,
					title: {
						display: true,
						text: 'Время (минуты)'
					}
				},
				y2: {
					type: 'linear',
					position: 'right',
					beginAtZero: true,
					grid: {
						drawOnChartArea: false // Добавляем отступ между осями
					},
					title: {
						display: true,
						text: 'Количество заходов'
					}
				},
				x: {
					title: {
						display: true,
						text: 'Дата'
					}
				}
			}
		}
	});

	let dayButtonsContainer = _frames.CreateContainer("DaysFrame");
	bodyElement.appendChild(dayButtonsContainer);

	Object.keys(timeSpendData).forEach(date => {
		let button = document.createElement('button');
		button.textContent = date;
		button.className = 'containerListButton';
		button.onclick = () => {
			CreateHourlyGraphFrame(date, timeSpendData[date].entries, response);
		};
		dayButtonsContainer.appendChild(button);
	});
	bodyElement.appendChild(dayButtonsContainer);

}

function CreateHourlyGraphFrame(selectedDate, entries, response) {
	updateHeader(
		`${response.filePath}`,
		"GetRootPathAndFilePathDataRequest",
		{
			projectName: response.projectName,
			filePath: response.filePath,
		}
	);

	let bodyElement = document.getElementById('body');
	bodyElement.innerHTML = '';

	let dayFrameContainer = _frames.CreateContainer("DayFrame");
	bodyElement.appendChild(dayFrameContainer);

	const fileInfo = document.createElement('h2');
	fileInfo.innerText = `Активность в файле ${response.filePath}`;
	dayFrameContainer.appendChild(fileInfo);



	const minuteData = Array(144).fill(0); // 144 интервала по 10 минут

	entries.forEach(entry => {
		const entryDate = new Date(entry.createdAt);
		const hour = entryDate.getHours();
		const minute = entryDate.getMinutes();
		const timeIndex = hour * 6 + Math.floor(minute / 10); // Индекс для каждых 10 минут (6 интервалов в часе)

		// Суммируем время, проведенное в 10-минутном интервале
		minuteData[timeIndex] += entry.timeSpent;
	});

	const labels = [];
	for (let i = 0; i < 144; i++) {
		const hour = Math.floor(i / 6);
		const minute = (i % 6) * 10;
		labels.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
	}

	const totalTimes = labels.map((label, index) => minuteData[index] / 1000 / 60); // Преобразуем в минуты

	const ctx = document.createElement('canvas');
	dayFrameContainer.appendChild(ctx);

	const dateInfo = document.createElement('h2');
	dateInfo.innerText = `${selectedDate}`;
	dayFrameContainer.appendChild(dateInfo);

	new Chart(ctx, {
		type: 'line', // Изменяем на линейный график
		data: {
			labels: labels,
			datasets: [{
				label: 'Время (минуты)',
				data: totalTimes,
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 1,
				fill: true,
				tension: 0.4
			}]
		},
		options: {
			scales: {
				y: {
					title: {
						display: true,
						text: 'Время (минуты)',
					},
					beginAtZero: true,
				},
				x: {
					title: {
						display: true,
						text: 'Время (HH:mm)',
					},
					ticks: {
						autoSkip: true,
						maxTicksLimit: 12 // Ограничте количество меток по оси X
					}
				}
			}
		}
	});
}
// eslint-disable-next-line no-unused-vars
function updateBody(response) {
	try {
		CreateListOfProjects(response);
	} catch (error) {
		console.error(error);
	}
}


function updateBodyMainFrameRequest() {
	_requests.Send("GetRootPathMapDataRequest");
}

