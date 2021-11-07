var lastTime = false;
var interval = setInterval(() => {if(document.body.innerHTML.search('alert-battery') != -1){
if(lastTime == false) {const { ipcRenderer:ipcRendererNotification } = require('electron');
ipcRendererNotification.send('battery-low');
lastTime = true}} else {lastTime = false }},3000)
