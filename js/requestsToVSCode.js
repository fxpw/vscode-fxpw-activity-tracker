

class _requests {

	static vscode = acquireVsCodeApi();

	static Send(event, data = null) {
		try {
			console.log(event, data);
			this.vscode.postMessage({
				event: event,
				data: data,
			});

		} catch (error) {
			console.error(error);
		}
	}
}

class _eventListener {
	static InitEventResponse() {
		window.addEventListener('message', async response => {
			try {
				let data = response.data;
				console.log(data);
				switch (data.event) {
					case 'GetRootPathMapDataResponse':
						updateHeader("/");
						CreateListOfProjects(data);
						break;
					case 'GetRootPathAllDataResponse':
						updateHeader(
							`/${data.projectName}`,
							"GetRootPathMapDataRequest",
							{}
						);
						CreateListOfFiles(data);
						break;
					case 'GetRootPathAndFilePathDataResponse':
						updateHeader(
							`${data.filePath}`,
							"GetRootPathAllDataRequest",
							{
								projectName: data.projectName,
							}
						);
						CreateFileInfoFrame(data);
						break;
					case 'GetAllDataResponse':
						// GetAllDataResponse(message);
						break;
					default:
						console.error(response);
						break;
				}
			} catch (error) {
				console.error(error);
			}
		});
	}

	static Init() {
		this.InitEventResponse();
		document.addEventListener('DOMContentLoaded', function () {
			try {
				updateHeader();
				updateBodyMainFrameRequest();
			} catch (error) {
				console.error(error);
			}
		});
	}
}