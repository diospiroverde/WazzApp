import { BrowserWindow, Menu, shell, webContents } from "electron";
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { SettingWindow } from "../../windows/SettingsWindow/SettingsWindow";
import { getSettings } from "../Settings/Settings";
import { SettingConfigInterface, ValueSettings } from "../Settings/SettingInterface";
import { exec } from "child_process";
import { collapseTextChangeRangesAcrossMultipleVersions, textSpanIsEmpty } from "typescript";
import { executionAsyncId } from "async_hooks";
import { NotificationSound } from "../../windows/UtilWindow/UtilsWindow";
import { Notify } from '../../utils/notifications';
import packa from '../../../package.json';
import { Variant } from "dbus-next";


//const
const SettingController = getSettings();
const Settings = SettingController.getAllConfigs();

var notificationid = 0;
var showingSettings;

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
                nodeIntegration: false,
                preload: path.join(path.resolve(__dirname, "..", "..", "scripts"), Settings.batteryWarning.value ? "preloadwarning.js" : "preload.js"),
                spellcheck: Settings.spellCheck.value ? true : false, 
                /* partition:"persist:main" */
            }
        });

        var languages = this.win.webContents.session.availableSpellCheckerLanguages;
        for(let lang of languages)            
             Settings.lang.options.push({key:lang,text:lang});        

        if(Settings.spellCheck.value)
            if(Settings.lang.value)
                this.win.webContents.session.setSpellCheckerLanguages([Settings.lang.value.toString()])  

       this.SetEvents();

        if(!this.win){
            throw new Error("Browser window was not created");
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
        this.win.loadURL("https://web.whatsapp.com/", {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36'
        });
    }
    reload(): void {
        this.LoadUrl();
    }

    showSettings() : void {
        if(!showingSettings)
        {
            showingSettings = true;
            SettingWindow(this.win);
           
        }
    }

    settingsClosed() : void {
        showingSettings = false;
    }
   
    CloseNotification(): void {
        
        try
        {

            let dbus = require('dbus-next');
            let Message = dbus.Message;                
            let bus = dbus.sessionBus();
                  
            let methodCall = new Message({
                destination: 'org.freedesktop.Notifications',
                path: '/org/freedesktop/Notifications',
                interface: 'org.freedesktop.Notifications',
                member: 'CloseNotification',
                signature: 'u',
                body: [notificationid]
            });

            bus.send(methodCall);
           
        }
        catch(exception)
        {
            console.log(exception);
        }

    }
    
    SetEvents = async() => { 

        
        
        try
        {

            var self = this;
            let dbus = require('dbus-next');                      
            let bus = dbus.sessionBus();
                    
            bus.getProxyObject('org.freedesktop.Notifications', '/org/freedesktop/Notifications').then((obj) => {
                let monitor = obj.getInterface('org.freedesktop.Notifications');
            
            
                monitor.on('ActionInvoked', (id, action) => {             
                    if(id == notificationid && action == 'default')
                        self.win.show();

                });

                monitor.on('NotificationClosed', (id) => {            
                    if(id == notificationid)
                    notificationid = 0;   

                });
                   
            });
           
        }

        catch(exception)
        {
            console.log(exception);
        }

    }

    Notification = async() => {

        this.CloseNotification();
        if(Settings.flashWindow.value) 
            this.win.flashFrame(true);
        this.emit('notification:new'); 

        if(Settings.stickyNotifications.value) {
            try
            {
                // sends sticky notification
                var self = this;      
                var thisapp = this.app;                

                    if(!self.win.isFocused() || !self.win.isVisible())
                    {   
                        const delay = ms => new Promise(res => setTimeout(res, ms));
                        await delay(300);  
                        var home = thisapp.getPath('home');
                        let dbus = require('dbus-next');
                        let Message = dbus.Message;                
                        let bus = dbus.sessionBus();
                              
                        let methodCall = new Message({
                            destination: 'org.freedesktop.Notifications',
                            path: '/org/freedesktop/Notifications',
                            interface: 'org.freedesktop.Notifications',
                            member: 'Notify',
                            signature: 'susssasa{sv}i',
                            body: ['wazzapp', notificationid, '', 'WazzApp', 'Messsages Waiting', ['default', 'Open WazzApp'], {'image-path': new Variant('s', path.resolve(home,'.wazzapp','logo.png')), 'urgency': new Variant('n',2)}, 0]
                        });
                  

                        let reply = await bus.call(methodCall);
                        
                        notificationid = reply.body[0];
                                        
                    }
    
                               
            }
            catch(exception)
            {
                console.log(exception); 
            }

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
                        accelerator: !Settings.disableShortcuts.value ? "CommandOrControl+m" : "",
                        click: async () => {
                           Notify({ title: "WazzApp", body: "Marking all messages as read" });                    
                           await this.win.webContents.executeJavaScript('var checked =  document.getElementById(\'pane-side\');if (typeof(checked) != \'undefined\' && checked != null) { var elem = document.createElement(\'div\');elem.style.cssText = \'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000\';document.body.appendChild(elem);document.getElementById(\'pane-side\').style.overflow = "visible";selector = \'._3OvU8\';selectorforcontact = \'[aria-selected*="true"]\';var selectedlist = document.querySelectorAll(selectorforcontact);messages = (async () => {await timer(1000);for (const message of document.querySelectorAll(selector)) {["mouseover", "mousedown", "mouseup", "click"].map((event) => triggerMouseEvent(message, event));await timer(300);}for (const message1 of selectedlist) {["mouseover", "mousedown", "mouseup", "click"].map((event) => triggerMouseEvent(message1.firstChild, event));await timer(300);}document.getElementById(\'pane-side\').style.overflow = "auto";elem.parentNode.removeChild(elem);})();}');
                           Notify({ title: "WazzApp", body: "Finished" }); 
                        }
                    },

                    {
                        label: 'Mark all as unread',
                        accelerator: !Settings.disableShortcuts.value ? "CommandOrControl+u" : "",
                        click: async () => {
                        Notify({ title: "WazzApp", body: "Marking all messages as unread" });
                           await this.win.webContents.executeJavaScript('var checked =  document.getElementById(\'pane-side\');if (typeof(checked) != \'undefined\' && checked != null) { var elem = document.createElement(\'div\');elem.style.cssText = \'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000\';document.body.appendChild(elem);document.getElementById(\'pane-side\').style.overflow = "visible";selector = \'._3OvU8\';messages = (async () => {await timer(1000);for (const message of document.querySelectorAll(selector)) {var evt = message.ownerDocument.createEvent(\'MouseEvents\');var RIGHT_CLICK_BUTTON_CODE = 2;evt.initMouseEvent(\'contextmenu\', true, true,message.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,false, false, false, RIGHT_CLICK_BUTTON_CODE, null);if (document.createEventObject){element.fireEvent(\'onclick\', evt)}else{!message.dispatchEvent(evt);}await timer(300);selector2 = \'[aria-label*="Mark as unread"]\';for (const message2 of document.querySelectorAll(selector2)) {["mouseover", "mousedown", "mouseup", "click"].map((event) => triggerMouseEvent(message2.parentElement, event));}await timer(300);}document.getElementById(\'pane-side\').style.overflow = "auto";elem.parentNode.removeChild(elem);})()}');
                           Notify({ title: "WazzApp", body: "Finished" }); 
                        }
                    },

                    {
                        label: 'Archive all',
                        accelerator: !Settings.disableShortcuts.value ? "CommandOrControl+f" : "",
                        click: async () => {
                        Notify({ title: "WazzApp", body: "Archiving all messages" });
                           await this.win.webContents.executeJavaScript('var checked =  document.getElementById(\'pane-side\');if (typeof(checked) != \'undefined\' && checked != null) { var elem = document.createElement(\'div\');elem.style.cssText = \'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000\';document.body.appendChild(elem);document.getElementById(\'pane-side\').style.overflow = "visible";selector = \'._3OvU8\';messages = (async () => {await timer(1000);for (const message of document.querySelectorAll(selector)) {var evt = message.ownerDocument.createEvent(\'MouseEvents\');var RIGHT_CLICK_BUTTON_CODE = 2;evt.initMouseEvent(\'contextmenu\', true, true,message.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,false, false, false, RIGHT_CLICK_BUTTON_CODE, null);if (document.createEventObject){element.fireEvent(\'onclick\', evt)}else{!message.dispatchEvent(evt);}await timer(300);selector2 = \'[aria-label*="Archive chat"]\';for (const message2 of document.querySelectorAll(selector2)) {["mouseover", "mousedown", "mouseup", "click"].map((event) => triggerMouseEvent(message2.parentElement, event));}await timer(300);}document.getElementById(\'pane-side\').style.overflow = "auto";elem.parentNode.removeChild(elem);})()}');
                           Notify({ title: "WazzApp", body: "Finished" }); 
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
                        click: () => {
                            this.showSettings() 
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
                label: 'Session',
                submenu: [
                    {
                        label: 'Clear Cache',                        
                        // accelerator: "CommandOrControl+y",                        
                        click: () => {
                            this.win.webContents.session.clearCache();
                        }
                    },
                    {
                        label: 'Clear All Data',
                        // accelerator: "CommandOrControl+d",
                        click: async () => {
                            await this.win.webContents.session.clearStorageData();
                            this.reload();
                        }
                    }
                   
                  
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Toggle Menu',
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
                   this.showAbout();
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

    showAbout() : void
    {
        const options = {
            type: 'info',
            buttons: ['OK', 'Support Project'],
            defaultId: 1,
            title: 'About',
            message: 'WazzApp ' + packa.version,
            icon: path.resolve(__dirname, "..","..","icon", "logo.png")                 
          
          };

        const { dialog } = require('electron')
        const response = dialog.showMessageBox(this.win, options).then( (data) => {
            if(data.response == 1)
            {
                shell.openExternal('https://www.paypal.com/paypalme/diospiroverde');
            }                  
          });
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

        //content eventsdark
        this.win.webContents.on('did-finish-load', async () => {
            //await this.ScriptLoad();

            this.win.webContents.executeJavaScript('const triggerMouseEvent = (node, eventType) => {var clickEvent = document.createEvent("MouseEvents");clickEvent.initEvent(eventType, true, true);node.dispatchEvent(clickEvent);};timer = (ms) => {return new Promise((res) => setTimeout(res, ms));};');
                                      
            this.SendConfigs(); 

            if(Settings.showFull.value)            
                this.win.webContents.executeJavaScript("var checkExist = setInterval(function() {if (document.getElementsByClassName('_1XkO3').length) {document.getElementsByClassName('_1XkO3')[0].style.width = 'auto'; document.getElementsByClassName('_1XkO3')[0].style.height = '100%'; document.getElementsByClassName('_1XkO3')[0].style.top = '2px'; clearInterval(checkExist);}}, 100);");            
            if(Settings.hideNotifications.value)
                this.win.webContents.executeJavaScript('delete window.Notification');  
            if(Settings.muteAudio.value)
                this.win.webContents.setAudioMuted(true);
            if(Settings.theme.value == 'dark')            
                this.win.webContents.executeJavaScript("var checkExist = setInterval(function() {if (!document.getElementsByClassName('dark').length) {var body = document.body;body.classList.add('dark')}}, 100);");       
            else
                this.win.webContents.executeJavaScript("var checkExist = setInterval(function() {if (document.getElementsByClassName('dark').length) {var body = document.body;body.classList.remove('dark');}}, 100);");                      
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
                //case "theme":
                    //this.win.webContents.send('eventsSended', {
                        //type: "changeTheme",
                        //theme: value.value
                    //});
                    //break;
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
                case "showFull":
                    if(value.value)                     
                        this.win.webContents.executeJavaScript("var checkExist = setInterval(function() {if (document.getElementsByClassName('_3QfZd').length) {document.getElementsByClassName('_3QfZd')[0].style.width = 'auto'; document.getElementsByClassName('_3QfZd')[0].style.height = '100%'; document.getElementsByClassName('_3QfZd')[0].style.top = '2px'; clearInterval(checkExist);}}, 100);");
                    //else
                        //this.win.reload();
                    break;                    
                //case "batteryWarning":
                    //if(Settings.batteryWarning.value)
                    //    this.win.webContents.executeJavaScript('{var lastTime = false; var interval = setInterval(() => {if((document.documentElement.textContent || document.documentElement.innerText).indexOf(\'Phone battery low\') > -1){ if(lastTime == false) {const { ipcRenderer:ipcRendererNotification } = require(\'electron\');ipcRendererNotification.send(\'battery-low\');lastTime = true}} else {lastTime = false }},3000)}');
                    //else
                    //    this.win.reload();
                    //break;
                case "hideNotifications":
                    if(Settings.hideNotifications.value)
                        this.win.webContents.executeJavaScript('delete window.Notification');                          
                    //else
                        //this.win.reload();
                    break;
                case "muteAudio":
                    if(Settings.muteAudio.value)
                        this.win.webContents.setAudioMuted(true);
                    else
                        this.win.webContents.setAudioMuted(false);

                    break;
                
            }

            this.win.reload();
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


