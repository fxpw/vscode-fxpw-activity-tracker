import * as vscode from 'vscode';
import { trackerViewProvider } from './trackerViewProvider';

export async function activate(context: vscode.ExtensionContext) {
	try {
		await trackerViewProvider.Init(context);
		const version = context.extension.packageJSON.version;
		console.log(`vscode-fxpw-activity-tracker version: ${version}`);
	} catch (error) {
		console.error(error);
	}

}

// This method is called when your extension is deactivated
export function deactivate() { }
