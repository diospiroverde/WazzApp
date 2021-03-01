import { app, BrowserWindow } from 'electron';
import { getSettings,Settings } from './Settings';


describe('Settings', function () {
    let settings = getSettings();
    it('create', function () {
        expect(settings).toBeInstanceOf(Settings)
    })
    it('getData',function(){
        let data = settings.getAllConfigs();
        expect(data).toBeDefined()
    })
    it('saveConfig',function(){
        
        expect(()=>{
            settings.saveConfig("sadasd","SADasd")
        }).toThrowError("config not defined");
        expect(()=>{
            settings.saveConfig("closeExit",false)
        }).not.toThrow();
    })
});