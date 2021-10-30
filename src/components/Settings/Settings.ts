import path from 'path';
import fs from 'fs';
import { app } from 'electron'
import { ValueSettings, SettingsInterface, SettingConfigInterface, ValueTypes, TabSections } from './SettingInterface';
import { EventEmitter } from 'events';
import { getAvailableBrowsers, BrowserElement } from '../../utils/browsers';

export class Settings extends EventEmitter {
    private data: SettingsInterface = {
        configs:{}
    };
    constructor() {
        super();
        this.loadSetting();
    }

    private loadSetting(): void {
        let configDir: string = getwazzappPath();
        let data = {}
        let loaddefaults = false;
        try {
            
            if(fs.existsSync(path.resolve(configDir, "settings.json"))){
                data = JSON.parse(fs.readFileSync(path.resolve(configDir, "settings.json"), "utf8"));
            }
            else
                loaddefaults = true;
            
        } catch (ex) {
            
        }
        this.loadDefaultConfigValue(data);


        if(loaddefaults)
        {
            this.saveConfig("stickyNotifications", true);   
            this.saveConfig("showMenuBar", true);  
            this.saveConfig("showFull", true);
        } 
    }
    private saveSetting(): void {
        let configDir: string = getwazzappPath();
        let dataToSave = {
            version:this.data.version,
            configs:this.ConfigurationToSave()
        };

        fs.writeFileSync(path.resolve(configDir, "settings.json"), JSON.stringify(dataToSave), "utf8");
    }

    private ConfigurationToSave(): any{
        let d:any = {};
        for(let k in this.data.configs){
            d[k] = this.data.configs[k].value;
        }
        return d;
    }

    updateVersion(version: string) {
        this.data.version = version;
        this.saveSetting();
    }

    saveConfig(key: string, value: string | boolean): void {
        if(!this.data.configs[key]){
            throw new Error('config not defined');
        }
        this.data.configs[key].value = value;
        this.saveSetting();
        this.emit('updateSettings',key,this.data.configs[key]);
    }

    getConfig(key: string): string | boolean {
        return this.data.configs[key] && this.data.configs[key].value;
    }

    getAllConfigs(): SettingConfigInterface {
        return this.data.configs;
    }

    loadDefaultConfigValue(data: any): void {
        let AvailableBrowsers = getAvailableBrowsers().map((e:BrowserElement)=>({key:e.exec,text:e.label}))
        let defaultConfigs: SettingConfigInterface = {
            closeExit: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Close window and Exit",
                tinytext: null
            },
            stickyNotifications: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Sticky Notifications",
                tinytext: "Keep showing a notification on new messagens when WhastDesk is minimized"
            },            
            flashWindow: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Flash Window",
                tinytext: "Flash window in the Taskbar."
            },
            showMenuBar: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Show Menu Bar",
                tinytext: "Show the Menu Bar."
            },
            showFull: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Use Whole Window",
                tinytext: "Use Whole Window."
            },
            startMinimized: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Start Minimized",
                tinytext: "Start Minimized."
            },
            hideNotifications: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Hide Notifications",
                tinytext: "Hide Notifications."
            },
            muteAudio: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Mute Audio",
                tinytext: "Mute Audio."
            },
            skipTaskbar: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Skip Taskbar",
                tinytext: "Makes the window not show in the taskbar."
            },
            batteryWarning: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Low Battery Warning (requires restart)",
                tinytext: "Show a notification when battery is low."
            },
            monoTray: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Monochrome Tray Icon (requires restart)",
                tinytext: "Show a Monochrome tray Icon."
            },
            spellCheck: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Spell Check (requires restart)",
                tinytext: "Use Spell Checking."
            },
            lang: {
                section: TabSections.GENERAL,
                type: ValueTypes.SELECT,
                value: "",
                text: "Language (requires restart)",
                options:[                   
                ]
            },
            disableShortcuts: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Disable Shortcuts (requires restart)",
                tinytext: "Disable Shortcuts",                  
            },
            multiInstance: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Multi instance"
            },
            openInternal: {
                section: TabSections.GENERAL,
                type: ValueTypes.CHECKBOX,
                value: false,
                text: "Open links internal",
                tinytext: "Open links in internal windows"
            },
            BrowserOpen: {
                section: TabSections.GENERAL,
                type: ValueTypes.SELECT,
                value: "default",
                text: "Open external links with",
                tinytext: "Select which browser will open external links.",
                options:[
                    {key:"default",text:"default"},
                    ...AvailableBrowsers
                ]
            },
            SoundNotification: {
                section: TabSections.GENERAL,
                type: ValueTypes.FILE,
                value: "",
                text: "Sound notification",
                tinytext: "Sound of notification"
            },
            theme: {
                section: TabSections.GENERAL,
                type: ValueTypes.SELECT,
                value: "",
                text: "Theme",
                options:[
                    {key:"",text:"Light"},
                    {key:"dark",text:"Dark"},
                ]
            },
        }
        this.data.configs = this.mergeData(defaultConfigs, data.configs);
    }
    mergeData(def: SettingConfigInterface, data: any): SettingConfigInterface {
        let merge:SettingConfigInterface = {}
        if(!data){
            data = {};
        }
        for (let k in def) {
            def[k].value = data[k] || def[k].value;
            merge[k] = def[k];
        }
        return merge;
    }
}

let settingsInit: Settings | undefined;

export function getSettings(): Settings {
    if (!settingsInit) {
        settingsInit = new Settings();
    }
    return settingsInit;
}


export function getwazzappPath(): string {
    let home = app.getPath('home');
    if (home.indexOf("/snap/") != -1) {
        home = home.substring(0, home.indexOf("/wazzapp/") + 9) + "current";
    }
    home = path.resolve(home, ".wazzapp");
    if (!fs.existsSync(home)) {
        fs.mkdirSync(home);
        try
        {
        fs.copyFileSync( path.resolve(__dirname, "..","..","icon", "logo.png"), path.resolve(home,'logo.png') )
        }
        catch(error)
        {
            console.log(error);
        }
    }
    return home;
}

/* function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
} */

/* function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return mergeDeep(target, ...sources);
} */