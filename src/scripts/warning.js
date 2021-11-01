var lastTime = false;
var interval = setInterval(() => {if((document.documentElement.textContent || document.documentElement.innerText).indexOf('Phone battery low') > -1){
if(lastTime == false) {const { ipcRenderer:ipcRendererNotification } = require('electron');
ipcRendererNotification.send('battery-low');
lastTime = true}} else {lastTime = false }},3000)
