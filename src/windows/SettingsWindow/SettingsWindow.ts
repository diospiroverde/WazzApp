import { ipcMain, BrowserWindow } from 'electron';
import { electron } from 'process';
import path from 'path';
import { getSettings } from '../../components/Settings/Settings';

var window: BrowserWindow | undefined;

export function SettingWindow(win: BrowserWindow) {
    let settings = getSettings();
    window = new BrowserWindow({
        show: false,
        icon: path.join(__dirname, "..", "..", "icon", "logo.png"),
        height: 660,
        width: 640,
        parent: win,
        modal: true,
        resizable: false,
        webPreferences:{
            nodeIntegration:true
        }
    })
    window.setMenu(null);
    window.once("close", () => {     
        ipcMain.emit('settings-closed');
        window = undefined;
        ipcMain.removeAllListeners("send");        

    })
    
    if(process.env.DEBUG){
        window.webContents.openDevTools();
    }

    window.setSkipTaskbar(true);

    window.once('ready-to-show', () => {
        window.show();
      })

    window.loadURL('file://' + path.join(__dirname, 'settings.html'))

    ipcMain.once("send", (event: any, arg: any) => {
        if (arg) {
            for(let k in arg){
                settings.saveConfig(k,arg[k]);
            }
        }
        window.close();
    })

    ipcMain.once("getData", (event: any, arg: any) => {
        window.webContents.send('settings',{
            settings:settings.getAllConfigs()
        });
    })
}
