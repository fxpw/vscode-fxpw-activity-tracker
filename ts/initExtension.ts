import * as vscode from 'vscode';
import { trackerViewProvider } from './trackerViewProvider';

export function activate(context: vscode.ExtensionContext) {
	try {
		trackerViewProvider.Init(context);
	} catch (error) {
		console.error(error);
	}

}

// This method is called when your extension is deactivated
export function deactivate() { }
