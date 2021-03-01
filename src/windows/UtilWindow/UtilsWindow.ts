import { ipcMain, BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs';
import { getSettings } from '../../components/Settings/Settings';

var win: Promise<Electron.BrowserWindow> | undefined;
const soundSetting = getSettings().getConfig('SoundNotification');

interface NotificationSettings {
    title: string;
    body: string;
    onclick?: Function;
    onclose?: Function;
}
let notify_n: number = 0;
export async function Notification(n: NotificationSettings): Promise<void> {
    let w: Electron.BrowserWindow = await initWindow();
    w.webContents.send('notification', {
        id:notify_n,
        title: n.title,
        body: n.body,
        icon:path.resolve(__dirname, "..","..","icon", "logo.png")
    });
    ipcMain.once(`notification_${notify_n}:click`, _ => {
        ipcMain.removeAllListeners(`notification_${notify_n}:close`);
        if(typeof n.onclick == "function"){
            n.onclick();
        }
    });
    ipcMain.once(`notification_${notify_n}:close`, _ => {
        ipcMain.removeAllListeners(`notification_${notify_n}:click`);
        if(typeof n.onclose == "function"){
            n.onclose();
        }
    });
    notify_n++;
    //playSound();
}

export async function NotificationSound(): Promise<void>{
    let w: Electron.BrowserWindow = await initWindow();
    let src = path.resolve(__dirname,"sound.mp3");
    if(soundSetting && typeof soundSetting == "string"){
        src = soundSetting;

    }
    let ext = path.parse(src).ext;
    ext = ext.replace(".","");
    let audio = base64_encode(src);

    w.webContents.send('sound', `data:audio/${ext};base64,${audio}`);
}


function initWindow(): Promise<Electron.BrowserWindow> {
    if (win) return win;
    win = new Promise(done => {
        let w = new BrowserWindow({
            show: false,
            webPreferences: {
                experimentalFeatures: true,
                nodeIntegration: true
            }
        })
        w.loadURL('file://' + path.join(__dirname, '/fake-browser.html'))
        w.on('ready-to-show', () => {
            done(w);
        })
    });
    return win;
}

function base64_encode(file:string): string{
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap).toString('base64');
} 
