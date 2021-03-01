import { shell } from 'electron';
import { Notification } from '../windows/UtilWindow/UtilsWindow';

interface NotificationInterface{
    title:string,
    body:string,
    url?:string
}
export function Notify(Opts:NotificationInterface) :void{
    Notification({ 
        title:Opts.title, 
        body: Opts.body,
        onclick:() => {
            if(Opts.url){
                shell.openExternal(Opts.url);
            }          
        }
    });
}
