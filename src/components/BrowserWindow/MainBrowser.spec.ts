import { MainBrowser } from "./MainBrowser";
import { app, BrowserWindow } from 'electron';


describe('MainBrowser', function () {
    
    it('create', function () {
        let w
        expect(_ => {
            w = new MainBrowser(app)
        }).not.toThrow();
        expect(w).toBeInstanceOf(MainBrowser);
    })
    it('Exists window',function(){
        let w = new MainBrowser(app);
        expect(w.getBrowser()).toBeInstanceOf(BrowserWindow);
    })
});