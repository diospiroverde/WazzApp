//imports
import { app, ipcMain, } from 'electron';
import { MainBrowser } from './components/BrowserWindow/MainBrowser';
import { TrayIcon } from './components/TrayIcon/TrayIcon';
import { checkUpdates } from './utils/updates';
import { Notify } from './utils/notifications';
import { getSettings } from './components/Settings/Settings';
import { getEnvironment } from './utils/environment';
import { isTypeOnlyImportOrExportDeclaration } from 'typescript';

const envConfig = getEnvironment();

//Vars 
let win: MainBrowser;
let appIcon: Electron.Tray | any = null;
let SettingsController = getSettings();

//Process name
process.title = envConfig.name;

app.on("ready", _ => {
    
    win = new MainBrowser(app);
    appIcon = TrayIcon(win, app);
    if(!SettingsController.getConfig('multiInstance')){
        if(!app.requestSingleInstanceLock()){
            app.quit();
            process.exit(1020);
            return;
        }
        app.on('second-instance', (event, argv, cwd) => {
            if(!SettingsController.getConfig('multiInstance')){
                win.getFocus();
            }
        })
    }
    
    checkUpdates().then(hasUpdate => {
        if (hasUpdate) {
            Notify({ title: "Update", body: "Update available", url: "https://github.com/diospiroverde/WazzApp/" });
        }
    })

    initEvents();
})

function initEvents(): void {
    ipcMain.on('notifications', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();
        win.Notification();
        event.sender.send('notification:new', true);
    })

    ipcMain.on('finished', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();
        Notify({title: "WazzApp", body: "Finished"});
    })

    ipcMain.on('notification:click', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();        
        win.show();
    })

    ipcMain.on('settings-closed', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();        
        win.settingsClosed();
    })

    ipcMain.on('battery-low', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();      
        win.UpdateHeight();  
        if(SettingsController.getConfig('batteryWarning'))
            Notify({title: "WazzApp", body: "Battery Low"});
    })

    ipcMain.on('alert-update', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();        
        win.reload();
    })

    /*
    ipcMain.on('send-message', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();     
        if(!isNaN(arg) && arg > 0)   
            win.NavigateToSendMessage(arg);
        else
            win.showInvalid();
    })

    */

    ipcMain.on('navigate-to-number', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();           
        if(!isNaN(arg) && arg > 0)   
            win.NavigateToSendMessage(arg);
        else
            win.showInvalid();
    })

    ipcMain.on('sendwindow-closed', (event, arg) => {
        //TODO: Resolver doble notificacion
        //NotificationSound();        
        win.SendWindowClosed();
    })

   
}
