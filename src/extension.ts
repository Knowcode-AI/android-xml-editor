import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('android-xml-editor.open', () => {
			AppPanel.createOrShow(context.extensionUri)
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('app.doRefactor', () => {
			if (AppPanel.currentPanel) {
				AppPanel.currentPanel.doRefactor();
			}
		})
	);

	if(vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(AppPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				// console.log(`Got state: ${state}`);
				AppPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}

}

/**
 * Manages cat coding webview panels
 */
class AppPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: AppPanel | undefined;

	public static readonly viewType = 'app';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		const editor = vscode.window.activeTextEditor;
		const selection = editor.document.uri;
		let workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
		let rootUri = workspaceFolder?.uri	
		
		const fse = require('fs-extra');
		var sourceDir = path.join(rootUri?.path, "/drawable");
		var destinationDir = path.join(extensionUri.path, "/media/drawable")
									
		// To copy a folder or file  
		fse.copySync(sourceDir, destinationDir)


		const panel = vscode.window.createWebviewPanel(
			AppPanel.viewType,
			'App',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,
				

				// And restrict the webview to only loading content from our extension's `media` directory.
				localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
				
			}
		);

	const updateWebview = () => {
		

		if (editor) {		
			const htmlPathOnDisk = vscode.Uri.joinPath(extensionUri, 'media', 'main.html');
			const xml = fs.readFileSync(selection.path,'utf8')
			
			//parser xml to json*******
			var convert = require('xml-js');

			var json = convert.xml2json(xml, {compact: true, spaces: 4});
			// var json = convert.xml2json(xml, {compact: false, spaces: 4});

			//fs.writeFileSync(htmlPathOnDisk.path,"<p>\n"+json+"\n</p>");
			json = JSON.parse(json);
			let xmlinfo = [];
			let xmlcode = [];
			let xmlTmgBtn = [];
			let xmlImg = [];
	
			for (var prop in json["androidx.constraintlayout.widget.ConstraintLayout"]) {
				if(prop == "_attributes"){
					let string = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:background"].replace(/@drawable\//gi , '')
					if(string.substr(0, 1) === "#") {
						let layout_height = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_height"].replace("dp", "px")
						let layout_width = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_width"].replace("dp", "px")
						let background = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:background"].replace(/@drawable\//gi , '')
						
						let resolution = `<div style="height: `+ layout_height +` ;background-color: `+ background+ `; width:` + layout_width +`;"> `
						xmlinfo.push(resolution)

					}else{

						let layout_height = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_height"].replace("dp", "px")
						let layout_width = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_width"].replace("dp", "px")
						let background = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:background"].replace(/@/gi , '/')
						let uri = vscode.Uri.joinPath(extensionUri, "media", background+".png");
						let img = panel.webview.asWebviewUri(uri);
						
						let resolution = `<div style="height: `+ layout_height +` ;background: url('`+ img+ `'); width:` + layout_width +` ; background-position: center; background-size: cover;"> `
						xmlinfo.push(resolution)

					}
					
				}

				if(prop == "ImageView"){
					let ImageView = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
					for (let IMGprop in ImageView){

						let id = ImageView[IMGprop]["_attributes"]["android:id"].replace('@+id\/', '')
						let layout_width = ImageView[IMGprop]["_attributes"]["android:layout_width"].replace("dp", "px")
						let layout_height = ImageView[IMGprop]["_attributes"]["android:layout_height"].replace("dp", "px")
						let layout_editor_absoluteX = ImageView[IMGprop]["_attributes"]["tools:layout_editor_absoluteX"].replace("dp", "px")
						let layout_editor_absoluteY = ImageView[IMGprop]["_attributes"]["tools:layout_editor_absoluteY"].replace("dp", "px")
						let background = ImageView[IMGprop]["_attributes"]["android:background"].replace(/@/gi , '/')
						let uri = vscode.Uri.joinPath(extensionUri, "media", background+".png");
						let  img = panel.webview.asWebviewUri(uri);

						let code = `<img src= "`+ img+ `" id="`+ id +`" style=" position: absolute;left: `+ layout_editor_absoluteX + `; top: ` +
						layout_editor_absoluteY + `; width:`+ layout_width + `; height:`+ layout_height + `;"></img>`
						xmlImg.push(code) 					
					}

				}if(prop == 'TextView'){
					let TextView = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
					for (let Txtprop in TextView){
						let textColor = TextView[Txtprop]["_attributes"]["android:textColor"]
						let textSize = TextView[Txtprop]["_attributes"]["android:textSize"].replace("dp", "px")
						let text = TextView[Txtprop]["_attributes"]["android:text"]
						let layout_editor_absoluteX = TextView[Txtprop]["_attributes"]["tools:layout_editor_absoluteX"].replace("dp", "px")
						let layout_editor_absoluteY = TextView[Txtprop]["_attributes"]["tools:layout_editor_absoluteY"].replace("dp", "px")

						let code = `<p style="position: absolute;left: `+ layout_editor_absoluteX + `; top: ` +
						layout_editor_absoluteY + `; color:`+ textColor +`; font-size:`+ textSize + `;">` +text+`</p>`
						xmlcode.push(code)
					}

				}if(prop == "ImageButton"){
					let ImageButton = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
					for (let ImgBprop in ImageButton){
						let id = ImageButton[ImgBprop]["_attributes"]["android:id"].replace('@+id\/', '')
						let layout_width = ImageButton[ImgBprop]["_attributes"]["android:layout_width"].replace("dp", "px")
						let layout_height = ImageButton[ImgBprop]["_attributes"]["android:layout_height"].replace("dp", "px")
						let layout_editor_absoluteX = ImageButton[ImgBprop]["_attributes"]["tools:layout_editor_absoluteX"].replace("dp", "px")
						let layout_editor_absoluteY = ImageButton[ImgBprop]["_attributes"]["tools:layout_editor_absoluteY"].replace("dp", "px")
						let background = ImageButton[ImgBprop]["_attributes"]["android:background"].replace(/@/gi , '/')
						
						let uri = vscode.Uri.joinPath(extensionUri, "media", background+".png");
						let img = panel.webview.asWebviewUri(uri);

						let code = `<img src= "`+ img + `" id="`+ id +`" style=" position: absolute;left: `+ layout_editor_absoluteX + `; top: ` +
						layout_editor_absoluteY + `; width:`+ layout_width + `; height:`+ layout_height + `;"></img>`
						xmlTmgBtn.push(code)					
					}
				}
				
			}
			
			let main = `<!DOCTYPE html>
			<html>
			<head>
			<meta charset="UTF-8"/>
			<title>Document</title>
			</head>
			<body>` + xmlinfo.join('')
			+xmlcode.join('')+
			xmlTmgBtn.join('')+
			xmlImg.join('') +
			`</div></body>
			</html>`

			fs.writeFileSync(htmlPathOnDisk.path,main);
			
			//parser json to html*****s**
			//fs.writeFileSync(htmlPathOnDisk.path,"<p>\n"+name+"\n</p>");

			const html = json
            // ***********
			

			// fs.writeFileSync(htmlPathOnDisk.path,html);

			// if (AppPanel.currentPanel) {
			// 	AppPanel.currentPanel._panel.reveal(column);
			// 	return;
			// }
	
			// Otherwise, create a new panel.
	
			AppPanel.currentPanel = new AppPanel(panel, extensionUri);
		}
		

		
	};   

	const interval = setInterval(updateWebview, 500);

	panel.onDidDispose(
	  () => {
		// When the panel is closed, cancel any future updates to the webview content
		clearInterval(interval);
	  })

		

	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		AppPanel.currentPanel = new AppPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		AppPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;

		this._panel.title = "Android Xml";

		const htmlPathOnDisk =  vscode.Uri.joinPath(this._extensionUri, 'media', 'main.html');
		let html = fs.readFileSync(htmlPathOnDisk.path).toString();

		const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css');
		const styleUri = webview.asWebviewUri(stylePathOnDisk);
		html = html.replace('${styleUri}', styleUri.toString());

		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
		html = html.replace('${scriptUri}', scriptUri.toString());

		const jqueryPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'jquery.js');
		const jqueryUri = webview.asWebviewUri(jqueryPathOnDisk);
		html = html.replace('${jqueryUri}', jqueryUri.toString());

		html = html.replace('${webview.cspSource}', webview.cspSource.toString());

		html = html.replace('${nonce}', getNonce().toString());

		this._panel.webview.html = html;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
