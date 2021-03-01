const triggerMouseEvent = (node, eventType) => {var clickEvent = document.createEvent("MouseEvents");
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
};
timer = (ms) => {
    return new Promise((res) => setTimeout(res, ms));
};

function finished()
{
    const { ipcRenderer:ipcRendererNotification } = require('electron');
    ipcRendererNotification.send('finished');
}