import { ipcMain, BrowserWindow } from 'electron';
import { electron } from 'process';
import path from 'path';
var window: BrowserWindow | undefined;

export function SendWindow(win: BrowserWindow) {
  
    window = new BrowserWindow({
        show: false,
        icon: path.join(__dirname, "..", "..", "icon", "logo.png"),
        height: 130,
        width: 640,
        parent: win,
        modal: true,
        resizable: true,    
        webPreferences:{
            nodeIntegration:true
        }
    })
    window.setMenu(null);

    ipcMain.once("send-message", (event, arg) => {              
        window.close();
    })
  
    if(process.env.DEBUG){
        window.webContents.openDevTools();
    }

    window.setSkipTaskbar(true);

    window.once('ready-to-show', () => {
        window.show();
      })

    window.loadURL('file://' + path.join(__dirname, 'sendwindow.html'))

}
