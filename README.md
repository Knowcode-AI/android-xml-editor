
<div align="center"> <img src="https://i.imgur.com/zcQ1Z6r.png" alt="android and totalcross logo together" width="150" height="150"/> </div>

<div align="center"> 
<h1> Android-XML-Editor </h1> </div>
<p align="center">Fork of <a href=https://github.com/Knowcode-AI/android-xml-editor>Knowcode-AI/android-xml-editor</a> that works.<br>It consists in an editor for Android XML files in VSCode powered by TotalCross</p>

<div align="center">
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://developer.android.com/guide/topics/ui" target="_blank">Docs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.youtube.com/c/totalcross" target="_blank">Videos</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://t.me/guiembedded" target="_blank">GUI for Embedded community</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/Knowcode-AI/android-xml-editor/" target="_blank">Source Code</a>
</div>


Extension that interprets the XML file - transforming it into HTML - and displays it in a web view in VSCode, which is lighter than Android Studio and InteliJ. You can see the [source code on GitHub](https://github.com/Knowcode-AI/android-xml-editor/).

## 🤘 Suggestion
- Download the [TotalCross SDK Plugin](https://marketplace.visualstudio.com/items?itemName=totalcross.vscode-totalcross) for GUI construction;

## ✨ Features
* Read and XML file;
* Displaying the XML file in the webview;
* Real-time webview editing.

## 🚨 Requirements
* VS Code 1.47+;
* All images and media (assets) must be in this `src/main/resources/drawable` directory;
* **As this is an alpha version, the plugin only supports `content-layout`**.

## 👩‍💻 Using Android-XML-Editor plugin

1. Open your XML file on VSCode
![](https://i.imgur.com/i7wzQFI.jpg)

1. Press `F1` or `cmd + shift + p` and search for `Android XML Editor: Open`.
![](https://i.imgur.com/hrdNrwB.jpg)

1. You can start making changes to your XML file and follow the result through the webview
![](https://i.imgur.com/6dcCXu2.jpeg)

## 🚧 Contributing to Android-XML-Editor:
Choose the way to contribute and follow these steps:

### With code:
1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

### Help us to improve:
* Find bugs and let us know by creating a [bug report](https://github.com/Knowcode-AI/android-xml-editor/issues);
* Create [features request](https://github.com/Knowcode-AI/android-xml-editor/issues) to indicate the features you want to see working in this plugin;
* Join [GUI for embedded community](https://t.me/guiembedded) 

## 💻 Moderators
* 💡 [Allan C.M Lira](https://github.com/acmlira)
* 👨‍💻 [Mateus Lima](https://github.com/mateuslimax22)
* 👨‍💻 [Patrick Lima](https://github.com/pattrickx)
* 📚 [Iaggo Quezado](https://github.com/Iaggoq)
* 📚 [Vaneska Sousa](https://github.com/VaneskaSousa)

## 🤔 About TotalCross

TotalCross is a technology company aimed at **facilitating the development of Graphical User Interfaces for embedded systems** offering services, [computer vision technology](http://yourapp.totalcross.com/knowcode-app) for GUI construction and, mainly, **supporting Open Source** technologies and their communities.

Today totalcross is moderator of the [Embedded GUI community](https://t.me/guiembedded) and sponsor of [TotalCross SDK](totalcross.com).

## 📢 Contact
* [Community](https://t.me/guiembedded);
* [Twitter](https://twitter.com/totalcross);
* [Linkedin](https://linkedin.com/company/totalcross);
* [Instagram](https://www.instagram.com/totalcross/);
* [Facebook](www.facebook.com/TotalCross/);
* [Email](mailto:vaneska.sousa@totalcross.com).

## 📝 `vscode` modules

See more about the modules used:
- [`window.createWebviewPanel`](https://code.visualstudio.com/api/references/vscode-api#window.createWebviewPanel)
- [`window.registerWebviewPanelSerializer`](https://code.visualstudio.com/api/references/vscode-api#window.registerWebviewPanelSerializer)
