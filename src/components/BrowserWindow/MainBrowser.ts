import { BrowserWindow, Menu, shell } from "electron";
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { SettingWindow } from "../../windows/SettingsWindow/SettingsWindow";
import { getSettings } from "../Settings/Settings";
import { SettingConfigInterface, ValueSettings } from "../Settings/SettingInterface";
import { exec } from "child_process";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { executionAsyncId } from "async_hooks";
import { NotificationSound } from "../../windows/UtilWindow/UtilsWindow";
import { Notify } from '../../utils/notifications';


//const
const SettingController = getSettings();
const Settings = SettingController.getAllConfigs();

var notificationid = 0;


export class MainBrowser extends EventEmitter {
    private win: Electron.BrowserWindow | undefined;
    private app: Electron.App;
    constructor(app) {
        super();
        this.app = app;
        this.init();
       
    }
    init(): void {
        
        const contextMenu = require('electron-context-menu');
        contextMenu({
            showInspectElement :false           
        });
        let icon:string | undefined;
        if(fs.existsSync(path.resolve(__dirname, "..", "..", "icon", "logo.png"))){
            icon = path.resolve(__dirname, "..", "..", "icon", "logo.png");
        }
        this.win = new BrowserWindow({
            show: Settings.startMinimized.value ? false : true,
            icon,
            webPreferences: {
                experimentalFeatures: true,
                nodeIntegration: true,
                spellcheck: false,
                /* partition:"persist:main" */
            }
        });

        //sticky notification event handling
        var self = this;
        var dbus = require('dbus-native');
                var sessionBus = dbus.sessionBus();
                sessionBus.getService('org.freedesktop.Notifications').getInterface(
                '/org/freedesktop/Notifications',
                'org.freedesktop.Notifications', function(err, notifications) {                                 
                      notifications.on('ActionInvoked', function() {          
                          if(arguments[0] == notificationid &&  arguments[1] == 'default')                          
                            self.win.show();                      
                      });

                      notifications.on('NotificationClosed', function() {  
                        if(arguments[0] == notificationid)   
                            notificationid = 0;                                         
                      });
                });

        if(!this.win){
            throw new Error("Browser window is not create");
        }        

        if (Settings.skipTaskbar.value) {
            this.win.setSkipTaskbar(true);
        }

        if (process.env.DEBUG) {
            this.win.webContents.openDevTools();
        }
        this.EventsInit();
        this.LoadUrl();
        this.CreateMenu();

        if(!Settings.showMenuBar.value)
            this.win.setMenuBarVisibility(false);

    }
    
    getBrowser(): Electron.BrowserWindow{
        return this.win;
    }
    LoadUrl(): void {
        this.win.loadURL("https://web.whatsapp.com?v=" + Math.floor((Math.random() * 1000) + 1).toString(), { // this is used to avoid caching
            userAgent: this.win.webContents.getUserAgent().replace(/(Electron|wazzapp)\/([0-9\.]+)\ /gi, "").replace(/\-(beta|alfa)/gi,"")
        });
    }
    reload(): void {
        this.LoadUrl();
    }

    CloseNotification(): void {
        
        var dbus = require('dbus-native');
        var sessionBus = dbus.sessionBus();
        sessionBus.getService('org.freedesktop.Notifications').getInterface(
        '/org/freedesktop/Notifications',
        'org.freedesktop.Notifications', function(err, notifications) {                                              
              notifications.CloseNotification(notificationid);             
            });   

    }
    
    Notification(): void {

        this.CloseNotification();
        if(Settings.flashWindow.value) 
            this.win.flashFrame(true);
        this.emit('notification:new'); 

        if(Settings.stickyNotifications.value) {

            // sends sticky notification
            var self = this;      

            setTimeout(function () {

                 if(!self.win.isFocused() || !self.win.isVisible())
                {                                                     
                    var dbus = require('dbus-native');
                    var sessionBus = dbus.sessionBus();
                    sessionBus.getService('org.freedesktop.Notifications').getInterface(
                    '/org/freedesktop/Notifications',
                    'org.freedesktop.Notifications', function(err, notifications) {                                                       
                        notifications.Notify('wazzapp', notificationid, '', 'WazzApp', 'Messsages Waiting', ['default', 'Open wazzapp'], [['urgency', ['n', 2]],['image-path', ['s', path.resolve(__dirname, "..","..","icon", "logo.png")]]],  0, function(err, id) {
                        notificationid = id;
                        });
                    });                           
                }
 
             
            },300); // wait for 300 miliseconds to let whatsapp webapi notification be sent.

        }
                     
    }

    
    NotificationClear(): void {  
        if(Settings.flashWindow.value) 
            this.win.flashFrame(false);
        this.emit('notification:clear');
    }
    getFocus(): void {
        if (!this.win.isVisible()) this.win.show();
        if (this.win.isMinimized()) this.win.restore()
        this.win.focus()      

    }
    CreateMenu(): void {
        const menu = Menu.buildFromTemplate([

            {
                label: 'WazzApp',
                submenu: [ // this was done in this way to avoid whatsapp mistakenly detecting this as a spam bot by mimicking human behaviour. 

                    {
                        label: 'Mark all as read',
                        accelerator: "CommandOrControl+m",
                        click: () => {
                           Notify({ title: "WazzApp", body: "Marking all messages as read" });                    
                           this.win.webContents.executeJavaScript('var elem = document.createElement(\'div\');elem.style.cssText = \'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000\';document.body.appendChild(elem);document.getElementById(\'pane-side\').style.overflow = "visible";selector = \'._38M1B\';selectorforcontact = \'[aria-selected*="true"]\';var selectedlist = document.querySelectorAll(selectorforcontact);messages = (async () => {await timer(1000);for (const message of document.querySelectorAll(selector)) {["mouseover", "mousedown", "mouseup", "click"].map((event) => triggerMouseEvent(message, event));await timer(300);}for (const message1 of selectedlist) {["mouseover", "mousedown", "mouseup", "click"].map((event) => triggerMouseEvent(message1.firstChild, event));await timer(300);}document.getElementById(\'pane-side\').style.overflow = "auto";elem.parentNode.removeChild(elem);finished();})();');
                        }
                    },

                    {
                        label: 'Mark all as unread',
                        accelerator: "CommandOrControl+u",
                        click: () => {
                        Notify({ title: "WazzApp", body: "Marking all messages as unread" });
                           this.win.webContents.executeJavaScript('var elem = document.createElement(\'div\');elem.style.cssText = \'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000\';document.body.appendChild(elem);document.getElementById(\'pane-side\').style.overflow = "visible";selector = \'._2Z4DV\';messages = (async () => {await timer(1000);for (const message of document.querySelectorAll(selector)) {var evt = message.ownerDocument.createEvent(\'MouseEvents\');var RIGHT_CLICK_BUTTON_CODE = 2;evt.initMouseEvent(\'contextmenu\', true, true,message.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,false, false, false, RIGHT_CLICK_BUTTON_CODE, null);if (document.createEventObject){element.fireEvent(\'onclick\', evt)}else{!message.dispatchEvent(evt);}await timer(300);selector2 = \'[aria-label*="Mark as unread"]\';for (const message2 of document.querySelectorAll(selector2)) {["mouseover", "mousedown", "mouseup", "click"].map((event) => triggerMouseEvent(message2.parentElement, event));}await timer(300);}document.getElementById(\'pane-side\').style.overflow = "auto";elem.parentNode.removeChild(elem);finished();})()');
                        }
                    },

                    {
                        label: 'Archive all',
                        accelerator: "CommandOrControl+f",
                        click: () => {
                        Notify({ title: "WazzApp", body: "Archiving all messages" });
                           this.win.webContents.executeJavaScript('var elem = document.createElement(\'div\');elem.style.cssText = \'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000\';document.body.appendChild(elem);document.getElementById(\'pane-side\').style.overflow = "visible";selector = \'._2Z4DV\';messages = (async () => {await timer(1000);for (const message of document.querySelectorAll(selector)) {var evt = message.ownerDocument.createEvent(\'MouseEvents\');var RIGHT_CLICK_BUTTON_CODE = 2;evt.initMouseEvent(\'contextmenu\', true, true,message.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,false, false, false, RIGHT_CLICK_BUTTON_CODE, null);if (document.createEventObject){element.fireEvent(\'onclick\', evt)}else{!message.dispatchEvent(evt);}await timer(300);selector2 = \'[aria-label*="Archive chat"]\';for (const message2 of document.querySelectorAll(selector2)) {["mouseover", "mousedown", "mouseup", "click"].map((event) => triggerMouseEvent(message2.parentElement, event));}await timer(300);}document.getElementById(\'pane-side\').style.overflow = "auto";elem.parentNode.removeChild(elem);finished();})()');
                        }
                    }

                ]
            },
            {
                label: 'Tools',
                submenu: [
                    {
                        label: 'Settings',                        
                        accelerator: "CommandOrControl+s",                        
                        click() {
                            SettingWindow();
                        }
                    },
                    {
                        label: 'Reload',
                        accelerator: "CommandOrControl+r",
                        click: () => {
                            this.reload();
                        }
                    }
                   
                  
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Show/Hide Menu',
                        accelerator: "CommandOrControl+h",
                        click: _ => {
                            this.win.setMenuBarVisibility(!this.win.isMenuBarVisible())
                            this.win.setAutoHideMenuBar(!this.win.isMenuBarVisible())
                        }
                    }
                ]
            },

            {
                label: 'About',
                click: () => {

                    const options = {
                        type: 'info',
                        buttons: ['OK'],
                        defaultId: 1,
                        title: 'About',
                        message: 'WazzApp V0.1',
                        icon: path.resolve(__dirname, "..","..","icon", "logo.png")                 
                      
                      };

                    const { dialog } = require('electron')
                    const response = dialog.showMessageBox(this.win, options);
                }
            }
        ])
        this.win.setMenu(menu);
    }
    toogleVisibility(): void {
        this.win.isVisible() ? this.win.hide() : this.win.show()
    }
    destroy(): void {
        this.CloseNotification();      
        this.win.destroy();
    }
    isVisible(): void {
        this.win.isVisible();
    }
    hide(): void {
        this.win.hide();
    }
    show(): void {
        this.win.show();
    }
    EventsInit(): void {
        //window events
        this.win.on('page-title-updated', (evt: any, title: string) => {
            evt.preventDefault()    
            title = title.replace(/(\([0-9]+\) )?.*/, "$1WazzApp");
            this.win.setTitle(title);
            this.emit('title-updated', title);
            if (!/\([0-9]+\)/.test(title)) {
                this.emit('clear-title');
                this.NotificationClear();
            }
        })
        this.win.on('close', (event: any) => {
            if (Settings.closeExit.value) {              
                this.app.quit();
                process.exit(0);
            } else {
                event.preventDefault();
                this.win.hide();
            }
        });

        //content events
        this.win.webContents.on('did-finish-load', async () => {
            await this.ScriptLoad();
            this.SendConfigs();
        })

        this.win.on('focus', (event: any) => {           
            this.CloseNotification();                 
        });

        this.win.on('restore', (event: any) => {            
            this.CloseNotification();               
        });

        this.win.on('show', (event: any) => {           
            this.CloseNotification();
        });



        this.win.webContents.on('will-navigate', this.HandleRedirect)
        this.win.webContents.on('new-window', this.HandleRedirect)

        //internal events
        SettingController.on('updateSettings', (name: string, value: ValueSettings) => {
            switch (name) {
                case "theme":
                    this.win.webContents.send('eventsSended', {
                        type: "changeTheme",
                        theme: value.value
                    });
                    break;
                case "skipTaskbar":
                    if (value.value) {
                        this.win.setSkipTaskbar(true);
                    }else{
                        this.win.setSkipTaskbar(false);
                    }
                    break;
                case "showMenuBar":
                    if (value.value) {
                        this.win.setMenuBarVisibility(true);
                    }else{
                        this.win.setMenuBarVisibility(false);
                    }
                    break;
            }
        })
    }
    SendConfigs(): void {
        this.win.webContents.send('settings', SettingController.getAllConfigs());
    }
    HandleRedirect(e: any, url: string): void {
        if (!Settings.openInternal.value) {
            if (!url.startsWith("https://web.whatsapp.com/")) {
                e.preventDefault()
                if (Settings.BrowserOpen.value == "default") {
                    shell.openExternal(url)
                } else {
                    exec(`${Settings.BrowserOpen.value} ${url}`);
                }
            }
        }
    }
    async ScriptLoad(): Promise<void> {
        let injectScripts: Array<string> = fs.readdirSync(path.resolve(__dirname, "..", "..", "scripts"));
        for (let scriptName of injectScripts) {
            let script = fs.readFileSync(path.resolve(__dirname, "..", "..", "scripts", scriptName), "utf8");
            try {
                await this.win.webContents.executeJavaScript(script);
            } catch (ex) {
                console.error("Error in load script [%s]: %s", scriptName, ex);
            }
        }
    }
    
}

