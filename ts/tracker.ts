import * as vscode from 'vscode';
import { _trackerData, fileTimeDataInterface } from './trackerData';

export class _tracker {
	private static activeEditor: vscode.TextEditor | null = null;
	private static startTime: number | null = null;
	private static context: vscode.ExtensionContext | null;

	// когда меняется активный редактор
	static async InitActiveTextEditorEvent(): Promise<boolean> {
		if (this.context) {
			this.context.subscriptions.push(
				vscode.window.onDidChangeActiveTextEditor(async editor => {
					await this.LogFileData("onDidChangeActiveTextEditor");
					if (editor) {
						this.startTime = new Date().getTime();
						this.activeEditor = editor;
					} else {
						this.startTime = null;
						this.activeEditor = null;
					}
				})
			);
			return true;
		}
		return false;
	}

	static async InitCloseTextDocumentEvent(): Promise<boolean> {
		if (this.context) {
			this.context.subscriptions.push(
				vscode.workspace.onDidCloseTextDocument(async document => {
					if (document && this.activeEditor && document === this.activeEditor.document) {
						await this.LogFileData("onDidCloseTextDocument");
						this.activeEditor = null;
						this.startTime = null;
					}
				})
			);
			return true;
		}
		return false;
	}

	static async InitChangeWindowState(): Promise<boolean> {
		if (this.context) {
			this.context.subscriptions.push(
				vscode.window.onDidChangeWindowState(async windowState => {
					if (windowState.focused) {
						this.startTime = new Date().getTime();
					} else {
						await this.LogFileData("onDidChangeWindowState");
						this.startTime = null;
					}
				})
			);
			return true;
		}
		return false;
	}

	static async InitTestCommand(): Promise<boolean> {
		if (this.context) {
			vscode.commands.registerCommand('vscode-fxpw-activity-tracker.showTimeSpent', async () => {
				console.log(await _trackerData.GetAllData());
			});
			vscode.commands.registerCommand('vscode-fxpw-activity-tracker.clearData', async () => {
				console.log(await _trackerData.DeleteAllChatsData());
			});
			return true;
		}
		return false;
	}

	static async GetWorkspaceFolderForFile(fileUri: vscode.Uri): Promise<vscode.WorkspaceFolder | null> {
		const folders = vscode.workspace.workspaceFolders;
		if (!folders) {
			return null;
		}
		let bestMatch: vscode.WorkspaceFolder | null = null;
		for (const folder of folders) {
			if (fileUri.fsPath.startsWith(folder.uri.fsPath)) {
				if (!bestMatch || folder.uri.fsPath.length > bestMatch.uri.fsPath.length) {
					bestMatch = folder;
				}
			}
		}

		return bestMatch;
	}

	static async LogFileData(event: string): Promise<boolean> {
		if (this.startTime && this.activeEditor) {
			let endTime = new Date().getTime();
			let timeInCurrentFile = endTime - this.startTime;
			let document = this.activeEditor.document;
			let filePath = document.uri.path;
			let languageID = document.languageId;
			let rootPath = await this.GetWorkspaceFolderForFile(this.activeEditor.document.uri);
			let newData: fileTimeDataInterface = {
				languageID:languageID,
				timeSpend: timeInCurrentFile,
				createdAt: endTime,
				updatedAt: endTime,
			};
			if(rootPath && filePath){
				await _trackerData.AddTrackerData(rootPath.name,filePath,newData);
			}else if(filePath){
				await _trackerData.AddTrackerData("no-projects",filePath,newData);
			}else{
				console.error("LogFileData no filePath");
				return false;
			}
			this.startTime = null;
			return true;
		}
		return false;
	}


	static async Init(context: vscode.ExtensionContext): Promise<boolean> {
		try {
			this.context = context;
			_trackerData.Init(context);
			this.InitActiveTextEditorEvent();
			this.InitChangeWindowState();
			this.InitCloseTextDocumentEvent();
			this.InitTestCommand();
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}
