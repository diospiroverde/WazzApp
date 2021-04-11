import { Tray, app, Menu, shell } from "electron";
import path from 'path';
import { MainBrowser } from "../BrowserWindow/MainBrowser";
import { SettingWindow } from "../../windows/SettingsWindow/SettingsWindow";
import { getSettings } from "../Settings/Settings";


let appIcon:Electron.Tray | any = null;

const SettingController = getSettings();
const Settings = SettingController.getAllConfigs();

export function TrayIcon(win:MainBrowser,app:Electron.App):Electron.Tray | undefined{
    
    appIcon = new Tray(path.resolve(__dirname, "..","..","icon", Settings.monoTray.value ? "tray-icon-off.png" : "tray-icon-off3.png"));
    
    win.on('title-updated', (title:string) => {
        appIcon.setToolTip(title);
    })
    win.on('notification:new', (title:string) => {
        appIcon.setImage(path.resolve(__dirname, "..","..","icon", Settings.monoTray.value ? "tray-icon-on.png" : "tray-icon-on3.png"))        
    })
    win.on('notification:clear', (title:string) => {
        appIcon.setImage(path.resolve(__dirname, "..","..","icon", Settings.monoTray.value ? "tray-icon-off.png" : "tray-icon-off3.png"))
        
    })

    win.getBrowser().on('hide', () => { appIcon.setContextMenu(contextMenuShow); });
    // win.getBrowser().on('minimize', () => { appIcon.setContextMenu(contextMenuShow); });
    // win.getBrowser().on('blur', () => { appIcon.setContextMenu(contextMenuShow); });
    win.getBrowser().on('show', () => { appIcon.setContextMenu(contextMenuHide); });  
    // win.getBrowser().on('focus', () => { appIcon.setContextMenu(contextMenuHide); });

    appIcon.on('click', () => {
        win.toogleVisibility();
    })

    const contextMenuShow = Menu.buildFromTemplate([
        {
            label: 'Show WazzApp', click: function () {
                win.show();
            }
        },       
        {
            label: 'Settings', click: function () {
                SettingWindow();
            }
        },
        {
            label: 'Reload', click: function () {
                win.LoadUrl();
            }
        },
        {
            label: 'About', click: function () {
                win.showAbout();
            }
        },
        {
            label: 'Quit', click: function () {
                win.destroy();
                app.quit();
                process.exit(0);
            }
        }
    ]);

    const contextMenuHide = Menu.buildFromTemplate([
        {
            label: 'Hide WazzApp', click: function () {
                win.hide();
            }
        },
        {
            label: 'Toggle Menu bar', click: function () {
                win.getBrowser().setMenuBarVisibility(!win.getBrowser().isMenuBarVisible());
            }
        },
        {
            label: 'Settings', click: function () {
                SettingWindow();
            }
        },
        {
            label: 'Reload', click: function () {
                win.LoadUrl();
            }
        },
        {
            label: 'About', click: function () {
                win.showAbout();
            }
        },
        {
            label: 'Quit', click: function () {
                win.destroy();
                app.quit();
                process.exit(0);
            }
        }
    ]);

    
    if(Settings.startMinimized.value)
        appIcon.setContextMenu(contextMenuShow);
    else
        appIcon.setContextMenu(contextMenuHide);
   
    return appIcon;
}

