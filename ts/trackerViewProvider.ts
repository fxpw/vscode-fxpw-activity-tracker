import * as vscode from 'vscode';

import { _tracker } from './tracker';
import { _trackerData } from './trackerData';


export class trackerViewProvider implements vscode.WebviewViewProvider {
	public _extensionUri: vscode.Uri;
	public _context: vscode.WebviewViewResolveContext<{}> | undefined;
	public _token: vscode.CancellationToken | undefined;
	public _webviewView: vscode.WebviewView | undefined;

	async getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri): Promise<string> {
		const homeFilePath: vscode.Uri = vscode.Uri.joinPath(extensionUri, "html", 'index.html');
		const cssUri: vscode.Uri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'css'));
		const jsUri: vscode.Uri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'js'));
		try {
			const uint8ArrayContent: Uint8Array = await vscode.workspace.fs.readFile(homeFilePath);
			const decoder = new TextDecoder('utf-8');
			let htmlContent: string = decoder.decode(uint8ArrayContent);
			htmlContent = htmlContent.replace(/<link rel="stylesheet" href="\.\.\/css\//g, `<link rel="stylesheet" href="${cssUri.toString()}/`);
			htmlContent = htmlContent.replace(/<script src="\.\.\/js\//g, `<script src="${jsUri.toString()}/`);
			return htmlContent;
		} catch (error) {
			console.error('Error reading HTML file:', error);
			return `<!DOCTYPE html><html><body><p>Error loading content...</p></body></html>`;
		}
	}

	constructor(context: vscode.ExtensionContext) {
		this._extensionUri = context.extensionUri;
	}

	public async resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<{}>, token: vscode.CancellationToken): Promise<void> {
		this._context = context;
		this._token = token;
		this._webviewView = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this._extensionUri, 'css'),
				vscode.Uri.joinPath(this._extensionUri, 'js'),
				vscode.Uri.joinPath(this._extensionUri, 'images'),
			]
		};
		try {
			const htmlContent: string = await this.getHtmlForWebview(this._webviewView.webview, this._extensionUri);
			webviewView.webview.html = htmlContent;
		} catch (error) {
			console.error(error);
		}
		this.initializeMessageListener(webviewView);
	}

	private initializeMessageListener(webviewView: vscode.WebviewView): void {
		webviewView.webview.onDidReceiveMessage(async message => {
			try {

				switch (message.event) {
					case 'GetRootPathMapDataRequest':
						webviewView.webview.postMessage({
							event:"GetRootPathMapDataResponse",
							data:await _trackerData.GetRootPathMapData(),
						});
						break;
					case 'GetRootPathAllDataRequest':
						if(message.data && message.data.requestData && message.data.requestData.projectName){
							webviewView.webview.postMessage({
								event:"GetRootPathAllDataResponse",
								data:await _trackerData.GetRootPathAllData(message.data.requestData.projectName),
								projectName: message.data.requestData.projectName,
							});
						}
						break;
					case 'GetRootPathAndFilePathDataRequest':
						if(message.data && message.data.requestData && message.data.requestData.projectName && message.data.requestData.filePath){
							webviewView.webview.postMessage({
								event:"GetRootPathAndFilePathDataResponse",
								data:await _trackerData.GetRootPathAndFilePathData(message.data.requestData.projectName,message.data.requestData.filePath),
								projectName: message.data.requestData.projectName,
								filePath:message.data.requestData.filePath
							});
						}
						break;
					case 'GetAllDataRequest':
						break;
					default:
						console.error(message);
						break;
				}
			} catch (error) {
				console.error(error);
			}
		});
	}

	public static async Init(context: vscode.ExtensionContext): Promise<void> {
		await _tracker.Init(context);
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				'vscode-fxpw-activity-tracker-view',
				new trackerViewProvider(context)
			)
		);
	}
}