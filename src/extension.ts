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

	if (vscode.window.registerWebviewPanelSerializer) {
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
		vscode.commands.executeCommand('workbench.action.moveEditorToRightGroup')



		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		const editor = vscode.window.activeTextEditor;
		//@ts-ignore.
		const selection = editor.document.uri;
		//@ts-ignore.
		let workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
		let rootUri = workspaceFolder?.uri

		let extensionConfig = vscode.workspace.getConfiguration('xmlEditor');
		let resourcesPath = extensionConfig?.resourcesPath;
		if(!resourcesPath || resourcesPath == "") {
			// fall back to hard-coded path
			resourcesPath = "src/main/res/drawable";
		}
		
		const fse = require('fs-extra');
		//@ts-ignore.
		var sourceDir = path.join(rootUri?.path, resourcesPath)
		var destinationDir = path.join(extensionUri.path, "/media/drawable")
		if (fs.existsSync(destinationDir)) {
			fs.rmdirSync(destinationDir, { recursive: true });
		} else {
			// Create cache location
			fs.mkdirSync(destinationDir, { recursive: true });
		}
		// To copy a folder or file  
		fse.copySync(sourceDir, destinationDir)

		const Jimp = require("jimp")


		fs.readdir(destinationDir, function (err, files) {
			//handling error
			if (err) {
				return console.log('Unable to scan directory: ' + err);
			}
			//listing all files using forEach
			for (let file of files) {
				//@ts-ignore
				if (file.match(".jpg")) {
					//@ts-ignore
					Jimp.read(destinationDir + "\/" + file, function (err, image) {
						if (err) {
							console.log(err)
						} else {
							image.write(destinationDir + "\/" + file.replace('.jpg', '.png'))
							fs.unlink(path.join(destinationDir, file), err => {
								if (err) throw err;
							});
						}
					})

				}

			}

		});

		function porcent(size: string) {
			let porcent = parseInt(size) / 100 * 10
			let newSize = parseInt(size) - porcent
			return newSize
		}

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

		const updateWebview = async () => {

			if (editor) {
				const htmlPathOnDisk = vscode.Uri.joinPath(extensionUri, 'media', 'main.html');
				const xml = fs.readFileSync(selection.path, 'utf8')

				//parser xml to json*******
				var convert = require('xml-js');

				var json = convert.xml2json(xml, { compact: true, spaces: 4 });
				// var json = convert.xml2json(xml, {compact: false, spaces: 4});
				json = JSON.parse(json);
				//let ht = JSON.stringify(json["androidx.constraintlayout.widget.ConstraintLayout"])
				//fs.writeFileSync(htmlPathOnDisk.path,"<p>\n"+ht+"\n</p>");

				let xmlinfo = [];
				let xmlcode = [];
				let xmlTmgBtn = [];
				let xmlImg = [];
				let xmlBtn = [];
				let xmlProg = [];
				let xmlSwt = [];


				for (var prop in json["androidx.constraintlayout.widget.ConstraintLayout"]) {
					if (prop == "_attributes") {
						let string0 = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:background"]

						if (String(string0) == "undefined") {
							let layout_height = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_height"].replace("dp", "px")
							let layout_width = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_width"].replace("dp", "px")
							let resolution = `<div style=" position: absolute;left: 0px; top: 0px; height: ` + layout_height + ` ;background-color: #FFFFFF; width:` + layout_width + `;"> `
							xmlinfo.push(resolution)
						}

						let string = String(string0).replace(/@drawable\//gi, '')


						if (string.substr(0, 1) === "#") {
							let layout_height = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_height"].replace("dp", "px")
							let layout_width = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_width"].replace("dp", "px")
							let background = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:background"].replace(/@drawable\//gi, '')

							let resolution = `<div style=" position: absolute;left: 0px; top: 0px; height: ` + layout_height + ` ;background-color: ` + background + `; width:` + layout_width + `;"> `
							xmlinfo.push(resolution)

						} else if (string.substr(0, 1) === "\/") {

							let layout_height = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_height"].replace("dp", "px")
							let layout_width = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:layout_width"].replace("dp", "px")
							let background = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]["android:background"].replace(/@/gi, '/')
							let uri = vscode.Uri.joinPath(extensionUri, "media", background + ".png");
							let img = panel.webview.asWebviewUri(uri);

							let resolution = `<div style=" position: absolute;left: 0px; top: 0px; height: ` + layout_height + ` ;background: url('` + img + `'); width:` + layout_width + ` ; background-position: center; background-size: cover;"> `
							xmlinfo.push(resolution)
						}



					}

					if (prop == "ImageView") {
						let ImageView = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
						const propOwn = Object.getOwnPropertyNames(ImageView);
						let size = String(propOwn.length);
						
						if (size == "1") {

							for (let IMGprop in ImageView) {
								let id = ImageView[IMGprop]["android:id"].replace('@+id\/', '')
								let layout_width = ImageView[IMGprop]["android:layout_width"].replace("dp", "px")
								let layout_height = ImageView[IMGprop]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = ImageView[IMGprop]["tools:layout_editor_absoluteX"]
								let layout_editor_absoluteY = ImageView[IMGprop]["tools:layout_editor_absoluteY"]
								let background = ImageView[IMGprop]["android:background"].replace(/@/gi, '/')
								let uri = vscode.Uri.joinPath(extensionUri, "media", background + ".png");
								let img = panel.webview.asWebviewUri(uri);

								if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) == "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0px; top: 0px; width:` + layout_width + `; height:` + layout_height + `;"></img>`
									xmlImg.push(code)
								} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) == "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `; top:0; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlImg.push(code)
								} else if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) != "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0; top: ` + layout_editor_absoluteY.replace("dp", "px") + `; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlImg.push(code)
								} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) != "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `
									; top: `+ layout_editor_absoluteY.replace("dp", "px") + `; width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlImg.push(code)
								}

							}


						} else {

							for (let IMGprop in ImageView) {
								let id = ImageView[IMGprop]["_attributes"]["android:id"].replace('@+id\/', '')
								let layout_width = ImageView[IMGprop]["_attributes"]["android:layout_width"].replace("dp", "px")
								let layout_height = ImageView[IMGprop]["_attributes"]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = ImageView[IMGprop]["_attributes"]["tools:layout_editor_absoluteX"]
								let layout_editor_absoluteY = ImageView[IMGprop]["_attributes"]["tools:layout_editor_absoluteY"]
								let background = ImageView[IMGprop]["_attributes"]["android:background"].replace(/@/gi, '/')
								let uri = vscode.Uri.joinPath(extensionUri, "media", background + ".png");
								let img = panel.webview.asWebviewUri(uri);

								if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) == "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0px; top: 0px; width:` + layout_width + `; height:` + layout_height + `;"></img>`
									xmlImg.push(code)
								} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) == "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `; top:0; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlImg.push(code)
								} else if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) != "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0; top: ` + layout_editor_absoluteY.replace("dp", "px") + `; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlImg.push(code)
								} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) != "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `
								; top: `+ layout_editor_absoluteY.replace("dp", "px") + `; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlImg.push(code)
								}
							}
						}

					} if (prop == "TextView") {
						let TextView = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
						const propOwn = Object.getOwnPropertyNames(TextView);
						let size = String(propOwn.length);
						if (size == "1") {
							for (let Txtprop in TextView) {
								let textStyle = TextView[Txtprop]["android:textStyle"]
								let gravity = TextView[Txtprop]["android:gravity"]
								let textColor = TextView[Txtprop]["android:textColor"]
								let textSize = TextView[Txtprop]["android:textSize"].replace("dp", "px")
								let text = TextView[Txtprop]["android:text"]
								let layout_width = TextView[Txtprop]["android:layout_width"].replace("dp", "px")
								let layout_height = TextView[Txtprop]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = TextView[Txtprop]["tools:layout_editor_absoluteX"].replace("dp", "px")
								let layout_editor_absoluteY = TextView[Txtprop]["tools:layout_editor_absoluteY"].replace("dp", "px")
								let newSize = porcent(textSize)


								if (String(textStyle) == "undefined" && String(gravity) == "undefined") {
									let code = `<p style="  font-family: 'Roboto', sans-serif; position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; margin-top: 1.2%; margin-bottom: auto; color:` + textColor + `; font-size:` + String(newSize) + "px" + `; width:` + layout_width + `; height:` + layout_height + `;-webkit-transform: translateY( 0% );-moz-transform: translateY( 0% );transform: translateY( 0% );">` + text + `</p>`
									xmlcode.push(code)
								} else if (String(textStyle) != "undefined" && String(gravity) == "undefined") {
									let code = `<p style="  font-family: 'Roboto', sans-serif; position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; font-weight:` + textStyle + `; margin-top: 1.2%; margin-bottom: auto; color:` + textColor + `; font-size:` + String(newSize) + "px" + `; width:` + layout_width + `; height:` + layout_height + `;-webkit-transform: translateY( 0% );-moz-transform: translateY( 0% );transform: translateY( 0% );">` + text + `</p>`
									xmlcode.push(code)
								} else if (String(textStyle) == "undefined" && String(gravity) != "undefined") {
									let code = `<p style="  font-family: 'Roboto', sans-serif; position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; text-align:` + gravity + `; margin-top: 1.2%; margin-bottom: auto; color:` + textColor + `; font-size:` + String(newSize) + "px" + `; width:` + layout_width + `; height:` + layout_height + `;-webkit-transform: translateY( 0% );-moz-transform: translateY( 0% );transform: translateY( 0% );">` + text + `</p>`
									xmlcode.push(code)
								} else if (String(textStyle) != "undefined" && String(gravity) != "undefined") {
									let code = `<p style="  font-family: 'Roboto', sans-serif; position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; font-weight:` + textStyle + `; text-align:` + gravity + `; margin-top: 1.2%; margin-bottom: auto; color:` + textColor + `; font-size:` + String(newSize) + "px" + `; width:` + layout_width + `; height:` + layout_height + `;-webkit-transform: translateY( 0% );-moz-transform: translateY( 0% );transform: translateY( 0% );">` + text + `</p>`
									xmlcode.push(code)
								}
							}

						} else {
							for (let Txtprop in TextView) {

								let textStyle = TextView[Txtprop]["_attributes"]["android:textStyle"]
								let gravity = TextView[Txtprop]["_attributes"]["android:gravity"]
								let textColor = TextView[Txtprop]["_attributes"]["android:textColor"]
								let textSize = TextView[Txtprop]["_attributes"]["android:textSize"].replace("dp", "px")
								let text = TextView[Txtprop]["_attributes"]["android:text"]
								let layout_width = TextView[Txtprop]["_attributes"]["android:layout_width"].replace("dp", "px")
								let layout_height = TextView[Txtprop]["_attributes"]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = TextView[Txtprop]["_attributes"]["tools:layout_editor_absoluteX"].replace("dp", "px")
								let layout_editor_absoluteY = TextView[Txtprop]["_attributes"]["tools:layout_editor_absoluteY"].replace("dp", "px")
								let newSize = porcent(textSize)


								if (String(textStyle) == "undefined" && String(gravity) == "undefined") {
									let code = `<p style=" font-family: 'Roboto', sans-serif; position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; margin-top: 1.2%; margin-bottom: auto; color:` + textColor + `; font-size:` + String(newSize) + "px" + `; width:` + layout_width + `; height:` + layout_height + `; -webkit-transform: translateY( 0% );-moz-transform: translateY( 0% );transform: translateY( 0% );">` + text + `</p>`
									xmlcode.push(code)
								} else if (String(textStyle) != "undefined" && String(gravity) == "undefined") {
									let code = `<p style=" font-family: 'Roboto', sans-serif; position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; font-weight:` + textStyle + `; margin-top: 1.2%; margin-bottom: auto; color:` + textColor + `; font-size:` + String(newSize) + "px" + `; width:` + layout_width + `; height:` + layout_height + `;-webkit-transform: translateY( 0% );-moz-transform: translateY( 0% );transform: translateY( 0% );">` + text + `</p>`
									xmlcode.push(code)
								} else if (String(textStyle) == "undefined" && String(gravity) != "undefined") {
									let code = `<p style=" font-family: 'Roboto', sans-serif; position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; text-align:` + gravity + `; margin-top: 1.2%; margin-bottom: auto; color:` + textColor + `; font-size:` + String(newSize) + "px" + `; width:` + layout_width + `; height:` + layout_height + `;-webkit-transform: translateY( 0% );-moz-transform: translateY( 0% );transform: translateY( 0% );">` + text + `</p>`
									xmlcode.push(code)
								} else if (String(textStyle) != "undefined" && String(gravity) != "undefined") {
									let code = `<p style=" font-family: 'Roboto', sans-serif; position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; font-weight:` + textStyle + `; text-align:` + gravity + `; margin-top: 1.2%; margin-bottom: auto; color:` + textColor + `; font-size:` + String(newSize) + "px" + `; width:` + layout_width + `; height:` + layout_height + `;-webkit-transform: translateY( 0% );-moz-transform: translateY( 0% );transform: translateY( 0% );">` + text + `</p>`
									xmlcode.push(code)
								}
							}

						}

					} if (prop == "ImageButton") {
						let ImageButton = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
						const propOwn = Object.getOwnPropertyNames(ImageButton);
						let size = String(propOwn.length);


						if (size == "1") {
							for (let ImgBprop in ImageButton) {
								let id = ImageButton[ImgBprop]["android:id"].replace('@+id\/', '')
								let layout_width = ImageButton[ImgBprop]["android:layout_width"].replace("dp", "px")
								let layout_height = ImageButton[ImgBprop]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = ImageButton[ImgBprop]["tools:layout_editor_absoluteX"]
								let layout_editor_absoluteY = ImageButton[ImgBprop]["tools:layout_editor_absoluteY"]
								let background = ImageButton[ImgBprop]["android:background"].replace(/@/gi, '/')
								let uri = vscode.Uri.joinPath(extensionUri, "media", background + ".png");
								let img = panel.webview.asWebviewUri(uri);

								if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) == "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0px; top: 0px; width:` + layout_width + `; height:` + layout_height + `;"></img>`
									xmlTmgBtn.push(code)
								} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) == "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `; top:0; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlTmgBtn.push(code)
								} else if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) != "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0; top: ` + layout_editor_absoluteY.replace("dp", "px") + `; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlTmgBtn.push(code)
								} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) != "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `
								; top: `+ layout_editor_absoluteY.replace("dp", "px") + `; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlTmgBtn.push(code)
								}


							}

						} else {
							for (let ImgBprop in ImageButton) {
								let id = ImageButton[ImgBprop]["_attributes"]["android:id"].replace('@+id\/', '')
								let layout_width = ImageButton[ImgBprop]["_attributes"]["android:layout_width"].replace("dp", "px")
								let layout_height = ImageButton[ImgBprop]["_attributes"]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = ImageButton[ImgBprop]["_attributes"]["tools:layout_editor_absoluteX"]
								let layout_editor_absoluteY = ImageButton[ImgBprop]["_attributes"]["tools:layout_editor_absoluteY"]
								let background = ImageButton[ImgBprop]["_attributes"]["android:background"].replace(/@/gi, '/')
								let uri = vscode.Uri.joinPath(extensionUri, "media", background + ".png");
								let img = panel.webview.asWebviewUri(uri);

								if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) == "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0px; top: 0px; width:` + layout_width + `; height:` + layout_height + `;"></img>`
									xmlTmgBtn.push(code)
								} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) == "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `; top:0; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlTmgBtn.push(code)
								} else if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) != "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0; top: ` + layout_editor_absoluteY.replace("dp", "px") + `; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlTmgBtn.push(code)
								} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) != "undefined") {
									let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `
								; top: `+ layout_editor_absoluteY.replace("dp", "px") + `; 
								width:`+ layout_width + `; height:` + layout_height + `;"></img>`
									xmlTmgBtn.push(code)
								}

							}
						}

					}
					if (prop == "Button") {
						let Button = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
						const propOwn = Object.getOwnPropertyNames(Button);
						let size = String(propOwn.length);
						
						if (size == "1") {
							for (let Bprop in Button) {

								let string = Button[Bprop]["android:background"]
								
								if (String(string) == "undefined") {
									
									let id = Button[Bprop]["android:id"].replace('@+id\/', '')
									let layout_width = Button[Bprop]["android:layout_width"].replace("dp", "px")
									let layout_height = Button[Bprop]["android:layout_height"].replace("dp", "px")
									let layout_editor_absoluteX = Button[Bprop]["tools:layout_editor_absoluteX"]
									let layout_editor_absoluteY = Button[Bprop]["tools:layout_editor_absoluteY"]
									let text = Button[Bprop]["android:text"]
									
									if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) == "undefined") {
										let code = `<button id="` + id + `" style=" text-align: center; cursor: pointer; font-size: 14px; color: black;border: none; background-color: #d8dada;position: absolute;left: 0px; top: 0px; width:` + layout_width + `; height:` + layout_height + `;"> `+text +`</button>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) == "undefined") {
										let code = `<button  id="` + id + `" style=" text-align: center; cursor: pointer; font-size: 14px; color: black; border: none; background-color: #d8dada; position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `; top:0; 
										width:`+ layout_width + `; height:` + layout_height + `;">`+text +`</button>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) != "undefined") {
										let code = `<button  id="` + id + `" style=" text-align: center;cursor: pointer; font-size: 14px; color: black; border: none; background-color: #d8dada ;position: absolute;left: 0; top: ` + layout_editor_absoluteY.replace("dp", "px") + `; 
										width:`+ layout_width + `; height:` + layout_height + `;">`+text +`</button>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) != "undefined") {
										let code = `<button  id="` + id + `" style=" text-align: center; cursor: pointer; font-size: 14px; color: black; border: none; background-color: #d8dada; position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `
										; top: `+ layout_editor_absoluteY.replace("dp", "px") + `; 
										width:`+ layout_width + `; height:` + layout_height + `;">`+text +`</button>`
										xmlBtn.push(code)
									}

								} else if(String(string) != "undefined") {

									let id = Button[Bprop]["android:id"].replace('@+id\/', '')
									let layout_width = Button[Bprop]["android:layout_width"].replace("dp", "px")
									let layout_height = Button[Bprop]["android:layout_height"].replace("dp", "px")
									let layout_editor_absoluteX = Button[Bprop]["tools:layout_editor_absoluteX"]
									let layout_editor_absoluteY = Button[Bprop]["tools:layout_editor_absoluteY"]
									let background = Button[Bprop]["android:background"].replace(/@/gi, '/')
									let uri = vscode.Uri.joinPath(extensionUri, "media", background + ".png");
									let img = panel.webview.asWebviewUri(uri);

									if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) == "undefined") {
										let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0px; top: 0px; width:` + layout_width + `; height:` + layout_height + `;"></img>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) == "undefined") {
										let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `; top:0; 
										width:`+ layout_width + `; height:` + layout_height + `;"></img>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) != "undefined") {
										let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0; top: ` + layout_editor_absoluteY.replace("dp", "px") + `; 
										width:`+ layout_width + `; height:` + layout_height + `;"></img>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) != "undefined") {
										let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `
										; top: `+ layout_editor_absoluteY.replace("dp", "px") + `; 
										width:`+ layout_width + `; height:` + layout_height + `;"></img>`
										xmlBtn.push(code)
									}


								}

							}
						} else {

							for (let Bprop in Button) {
								
								let string = Button[Bprop]["_attributes"]["android:background"]
								
								if (String(string) == "undefined") {
									let id = Button[Bprop]["_attributes"]["android:id"].replace('@+id\/', '')
									let layout_width = Button[Bprop]["_attributes"]["android:layout_width"].replace("dp", "px")
									let layout_height = Button[Bprop]["_attributes"]["android:layout_height"].replace("dp", "px")
									let layout_editor_absoluteX = Button[Bprop]["_attributes"]["tools:layout_editor_absoluteX"]
									let layout_editor_absoluteY = Button[Bprop]["_attributes"]["tools:layout_editor_absoluteY"]
									let text = Button[Bprop]["_attributes"]["android:text"]
									
									
									if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) == "undefined") {
										let code = `<button id="` + id + `" style=" text-align: center; cursor: pointer; font-size: 14px; color: black;border: none; background-color: #d8dada;position: absolute;left: 0px; top: 0px; width:` + layout_width + `; height:` + layout_height + `;"> `+text +`</button>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) == "undefined") {
										let code = `<button  id="` + id + `" style=" text-align: center; cursor: pointer; font-size: 14px; color: black; border: none; background-color: #d8dada; position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `; top:0; 
										width:`+ layout_width + `; height:` + layout_height + `;">`+text +`</button>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) != "undefined") {
										let code = `<button  id="` + id + `" style=" text-align: center;cursor: pointer; font-size: 14px; color: black; border: none; background-color: #d8dada ;position: absolute;left: 0; top: ` + layout_editor_absoluteY.replace("dp", "px") + `; width:`+ layout_width + `; height:` + layout_height + `;">`+text +`</button>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) != "undefined") {
										let code = `<button  id="` + id + `" style=" text-align: center; cursor: pointer; font-size: 14px; color: black; border: none; background-color: #d8dada; position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `
										; top: `+ layout_editor_absoluteY.replace("dp", "px") + `; width:`+ layout_width + `; height:` + layout_height + `;">`+text +`</button>`
										xmlBtn.push(code)
									}

								} else  {
									let id = Button[Bprop]["_attributes"]["android:id"].replace('@+id\/', '')
									let layout_width = Button[Bprop]["_attributes"]["android:layout_width"].replace("dp", "px")
									let layout_height = Button[Bprop]["_attributes"]["android:layout_height"].replace("dp", "px")
									let layout_editor_absoluteX = Button[Bprop]["_attributes"]["tools:layout_editor_absoluteX"]
									let layout_editor_absoluteY = Button[Bprop]["_attributes"]["tools:layout_editor_absoluteY"]
									let background = Button[Bprop]["_attributes"]["android:background"].replace(/@/gi, '/')
									let uri = vscode.Uri.joinPath(extensionUri, "media", background + ".png");
									let img = panel.webview.asWebviewUri(uri);

									if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) == "undefined") {
										let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0px; top: 0px; width:` + layout_width + `; height:` + layout_height + `;"></img>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) == "undefined") {
										let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `; top:0; 
										width:`+ layout_width + `; height:` + layout_height + `;"></img>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) == "undefined" && String(layout_editor_absoluteY) != "undefined") {
										let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: 0; top: ` + layout_editor_absoluteY.replace("dp", "px") + `; 
										width:`+ layout_width + `; height:` + layout_height + `;"></img>`
										xmlBtn.push(code)
									} else if (String(layout_editor_absoluteX) != "undefined" && String(layout_editor_absoluteY) != "undefined") {
										let code = `<img src= "` + img + `" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX.replace("dp", "px") + `
										; top: `+ layout_editor_absoluteY.replace("dp", "px") + `; 
										width:`+ layout_width + `; height:` + layout_height + `;"></img>`
										xmlBtn.push(code)
									}


								}
							
							}

						}

					}

					if (prop == "ProgressBar") {
						let ProgressBar = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
						const propOwn = Object.getOwnPropertyNames(ProgressBar);
						let size = String(propOwn.length);
						if (size == "1") {
							for (let Bprop in ProgressBar) {

								let id = ProgressBar[Bprop]["android:id"].replace('@+id\/', '')
								let layout_width = ProgressBar[Bprop]["android:layout_width"].replace("dp", "px")
								let indeterminateTint = ProgressBar[Bprop]["android:indeterminateTint"]
								let layout_height = ProgressBar[Bprop]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = ProgressBar[Bprop]["tools:layout_editor_absoluteX"].replace("dp", "px")
								let layout_editor_absoluteY = ProgressBar[Bprop]["tools:layout_editor_absoluteY"].replace("dp", "px")
								let style = ProgressBar[Bprop]["style"]

								if (String(style) == "?android:attr/progressBarStyle") {
									let code = `<svg id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; width:` + layout_width + `; height:` + layout_height + `;"><circle cx="50%" cy="50%" r="` + String(parseInt(layout_width) / 3) + `" stroke="` + indeterminateTint + `" stroke-width="20" fill="#000000" fill-opacity="0.0"/></svg>`
									xmlProg.push(code)

								}


							}
						} else {
							for (let Bprop in ProgressBar) {
								let id = ProgressBar[Bprop]["_attributes"]["android:id"].replace('@+id\/', '')
								let layout_width = ProgressBar[Bprop]["_attributes"]["android:layout_width"].replace("dp", "px")
								let layout_height = ProgressBar[Bprop]["_attributes"]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = ProgressBar[Bprop]["_attributes"]["tools:layout_editor_absoluteX"].replace("dp", "px")
								let layout_editor_absoluteY = ProgressBar[Bprop]["_attributes"]["tools:layout_editor_absoluteY"].replace("dp", "px")
								let indeterminateTint = ProgressBar[Bprop]["android:indeterminateTint"]
								let style = ProgressBar[Bprop]["_attributes"]["style"]

								if (String(style) == "?android:attr/progressBarStyle") {
									let code = `<svg id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
										layout_editor_absoluteY + `; width:` + layout_width + `; height:` + layout_height + `;"><circle cx="50%" cy="50%" r="` + String(parseInt(layout_width) / 3) + `" stroke="` + indeterminateTint + `" stroke-width="20" fill="#000000" fill-opacity="0.0"/></svg>`
									xmlProg.push(code)

								}

							}

						}

					}

					if (prop == "Switch") {
						let Switch = json["androidx.constraintlayout.widget.ConstraintLayout"][prop]
						const propOwn = Object.getOwnPropertyNames(Switch);
						let size = String(propOwn.length);
						if (size == "1") {
							for (let Sprop in Switch) {

								let id = Switch[Sprop]["android:id"].replace('@+id\/', '')
								let layout_width = Switch[Sprop]["android:layout_width"].replace("dp", "px")
								let layout_height = Switch[Sprop]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = Switch[Sprop]["tools:layout_editor_absoluteX"].replace("dp", "px")
								let layout_editor_absoluteY = Switch[Sprop]["tools:layout_editor_absoluteY"].replace("dp", "px")
								let code = `<label class="switch" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
									layout_editor_absoluteY + `; width:` + layout_width + `; height:` + layout_height + `;"><input type="checkbox"><span class="slider round"></span></label>`
								xmlSwt.push(code)

							}
						} else {
							for (let Sprop in Switch) {
								let id = Switch[Sprop]["_attributes"]["android:id"].replace('@+id\/', '')
								let layout_width = Switch[Sprop]["_attributes"]["android:layout_width"].replace("dp", "px")
								let layout_height = Switch[Sprop]["_attributes"]["android:layout_height"].replace("dp", "px")
								let layout_editor_absoluteX = Switch[Sprop]["_attributes"]["tools:layout_editor_absoluteX"].replace("dp", "px")
								let layout_editor_absoluteY = Switch[Sprop]["_attributes"]["tools:layout_editor_absoluteY"].replace("dp", "px")
								let code = `<label class="switch" id="` + id + `" style=" position: absolute;left: ` + layout_editor_absoluteX + `; top: ` +
									layout_editor_absoluteY + `; width:` + layout_width + `; height:` + layout_height + `;"><input type="checkbox"><span class="slider round"></span></label>`
								xmlSwt.push(code)
							}

						}

					}

				}

				let main = `<!DOCTYPE html>
			<html>
			<head>
			<link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
			<meta charset="UTF-8"/>
			<title>Document</title>
			<style>
				svg {
				transform: rotate(-90deg);
				stroke-dasharray: 800; /* (2PI * 40px) */
				stroke-dashoffset: 800;
				animation: offsettozero 2s linear forwards;
			  }
			  
			  @keyframes offsettozero {
				to {
				  stroke-dashoffset: 0;
				}
			  }

			  .switch {
				position: relative;
				display: inline-block;
				width: 60px;
				height: 34px;
			  }
			  
			  .switch input { 
				opacity: 0;
				width: 0;
				height: 0;
			  }
			  
			  .slider {
				position: absolute;
				cursor: pointer;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background-color: #ccc;
				-webkit-transition: .4s;
				transition: .4s;
			  }
			  
			  .slider:before {
				position: absolute;
				content: "";
				top: 0; bottom: 0;
				left: 0; right: 0;
				margin-left: 10%;
				margin-top: auto;
				margin-bottom: auto;
				height: 70%;
				width: 38%;
				background-color: white;
				-webkit-transition: .4s;
				transition: .4s;
			  }
			  
			  input:checked + .slider {
				background-color: #2196F3;
			  }
			  
			  input:focus + .slider {
				box-shadow: 0 0 1px #2196F3;
			  }
			  
			  input:checked + .slider:before {
				-webkit-transform: translateX(26px);
				-ms-transform: translateX(26px);
				transform: translateX(26px);
			  }
			  
			  /* Rounded sliders */
			  .slider.round {
				border-radius: 34px;
			  }
			  
			  .slider.round:before {
				border-radius: 50%;
			  }

			</style>
			</head>
			<body>` + xmlinfo.join('') +
					xmlImg.join('') +
					xmlTmgBtn.join('') +
					xmlBtn.join('') +
					xmlcode.join('') +
					xmlProg.join('') +
					xmlSwt.join('') +
					`</div></body>
			</html>`
				fs.writeFileSync(htmlPathOnDisk.path, main);

				//parser json to html*****s**
				//fs.writeFileSync(htmlPathOnDisk.path,"<p>\n"+name+"\n</p>");

				const html = json
				// ***********


				//fs.writeFileSync(htmlPathOnDisk.path,html);

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

		const htmlPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.html');
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
