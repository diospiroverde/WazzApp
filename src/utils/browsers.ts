import { exec, execSync } from "child_process";
import { Interface } from "readline";

export interface BrowserElement {
    label: string,
    exec: string,
    icon?: string,
}

export function getAvailableBrowsers(): Array<BrowserElement> {
    const browsersAvailables: Array<BrowserElement> = [];
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32': cmd = ``; break;
        case 'darwin': cmd = ``; break;
        case 'linux': cmd = `update-alternatives --config x-www-browser 0>/dev/null | grep manual |  awk '{print $2}'`; break;
        default: break;
    }

    try {
        let stdout: string = execSync(cmd, { encoding: 'utf8' });
        const browsersArray = stdout.split('\n');

        browsersArray.forEach(element => {
            let execpath = element;
            element = element.replace(/^.*[\\\/]/, '');
            if (element.endsWith('-stable')) {
                element = element.replace(/-stable/, '');
            }
            if(element && execpath){
                browsersAvailables.push({
                    label: element.replace("-", " "),
                    exec: execpath
                });
            }
        });

    } catch (ex) {

    }
    return browsersAvailables;
}
