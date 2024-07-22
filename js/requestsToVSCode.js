

class _requests {

	static vscode = acquireVsCodeApi();

	static Send(event,data=null) {
		try {
			this.vscode.postMessage({
				event: event,
				data:data,
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
						CreateListOfProjects(data);
						break;
					case 'GetRootPathAllDataResponse':
						CreateListOfFiles(data);
						break;
					case 'GetRootPathAndFilePathDataResponse':
						// GetRootPathAndFilePathDataResponse(message);
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
		document.addEventListener('DOMContentLoaded', function() {
			try {
				updateHeader();
				updateBodyMainFrameRequest();
			} catch (error) {
				console.error(error);
			}
		});
	}
}