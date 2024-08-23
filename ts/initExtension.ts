import * as vscode from 'vscode';
import { trackerViewProvider } from './trackerViewProvider';

export async function activate(context: vscode.ExtensionContext) {
	try {
		await trackerViewProvider.Init(context);
		console.log("init vscode-fxpw-activity-tracker version 1.0.11");
	} catch (error) {
		console.error(error);
	}

}

// This method is called when your extension is deactivated
export function deactivate() { }
