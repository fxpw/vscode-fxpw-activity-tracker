import { ExtensionContext } from "vscode";

export interface fileTimeDataInterface {
	languageID: string | null;
	timeSpend: number;
	createdAt: number;
	updatedAt: number;

}

export interface languaageTimeDatanterface {

}


export class _trackerData {
	public static fileTimeData: Array<{ rootPath: string, files: Array<{ filePath: string, data: fileTimeDataInterface[] }> }> = []; private static context: ExtensionContext | null = null;

	static async SaveTrackerData(): Promise<void> {
		try {
			if (this.context) {
				await this.context.globalState.update('fileTimeData', this.fileTimeData);
			}
		} catch (error) {
			console.error(error);
		}
	}

	static async DeleteAllChatsData(): Promise<void> {
		try {
			this.fileTimeData = [];
			await this.SaveTrackerData();
		} catch (error) {
			console.error(error);
		}
	}

	static async AddTrackerData(rootPath: string, filePath: string, data: fileTimeDataInterface): Promise<boolean> {
		try {
			const rootEntry = this.fileTimeData.find(entry => entry.rootPath === rootPath);
			if (!rootEntry) {
				this.fileTimeData.push({ rootPath, files: [{ filePath, data: [data] }] });
			} else {
				const fileEntry = rootEntry.files.find(entry => entry.filePath === filePath);
				if (!fileEntry) {
					rootEntry.files.push({ filePath, data: [data] });
				} else {
					fileEntry.data.push(data);
				}
			}
			await this.SaveTrackerData();
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	static async GetAllData(): Promise<any[]> {
		try {
			return this.fileTimeData;
		} catch (error) {
			return [];
		}
	}

	static async GetRootPathMapData(): Promise<{ projectName: string, totalTime: number }[]> {
		try {
			return this.fileTimeData.map(entry => {
				const totalTime = entry.files.reduce((acc, file) => {
					return acc + file.data.reduce((fileAcc, data) => fileAcc + data.timeSpend, 0);
				}, 0);
				return { projectName: entry.rootPath, totalTime };
			});
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	static async GetRootPathAllData(rootPath: string): Promise<any> {
		try {
			const rootEntry = this.fileTimeData.find(entry => entry.rootPath === rootPath);
			if (rootEntry) {
				const result: { [key: string]: fileTimeDataInterface[] } = {};

				// Перебираем файлы и добавляем их данные в новый объект
				rootEntry.files.forEach(file => {
					result[file.filePath] = file.data;
				});
				return result;
			}
			return [];
		} catch (error) {
			console.log(error);
			return [];
		}
	}


	static async GetRootPathAndFilePathData(rootPath: string, filePath: string): Promise<fileTimeDataInterface[] | null> {
		try {
			const rootEntry = this.fileTimeData.find(entry => entry.rootPath === rootPath);
			if (rootEntry) {
				const fileEntry = rootEntry.files.find(entry => entry.filePath === filePath);
				if (fileEntry) {
					return fileEntry.data;
				}
			}
			return null;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	static async Init(context: ExtensionContext): Promise<void> {
		this.context = context;
		const loadedfileTimeData = this.context.globalState.get<any[]>('fileTimeData', []);
		if (Array.isArray(loadedfileTimeData)) {
			this.fileTimeData = loadedfileTimeData;
		} else {
			console.warn('Global state did not return a valid array for fileTimeData. Initializing to a new array.');
			this.fileTimeData = [];
		}
	}
}