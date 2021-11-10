var interval = setInterval(() => {if(document.body.innerHTML.search('version-title') != -1){
const { ipcRenderer:ipcRendererNotification } = require('electron');
ipcRendererNotification.send('alert-update');
}},100)