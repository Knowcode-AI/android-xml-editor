
<div align="center"> <a href="https://totalcross.com/" target="_blank"> <img src="https://github.com/TotalCross/totalcross/blob/master/totalcross.gif" alt="totalcross logo"/></a></div>

<div align="center"> 
<h1> xml_editor </h1> </div>
<p align="center"> Editor for XML files in VSCode </strong></em></p>

<div align="center">
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="http://learn.totalcross.com/" target="_blank">Docs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://medium.com/totalcross-community" target="_blank">Blog</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://forum.totalcross.com" target="_blank">Forum</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.youtube.com/c/totalcross" target="_blank">Videos</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://totalcross.com/community/" target="_blank">Community</a>
</div>

Extension that interprets the XML file - transforming it into HTML - and displays it in a web view in VSCode, which is lighter than Android Studio and InteliJ

## :sparkles: Features
* Read and XML file
* Displaying the XML file in the webview
* Real-time webview editing

## :rotating_light: Requirements
* VS Code 1.47+
* Have an .xml file inside the `src/main/resources` directory

## :woman_technologist: Usage

To start the development:
1. Clone
2. Open this project in VS Code 1.47+
3. `npm install`
4. `npm run watch` or `npm run compile`
5. `F5` to start debugging


## `vscode` modules

See more about the modules used:
- [`window.createWebviewPanel`](https://code.visualstudio.com/api/references/vscode-api#window.createWebviewPanel)
- [`window.registerWebviewPanelSerializer`](https://code.visualstudio.com/api/references/vscode-api#window.registerWebviewPanelSerializer)
