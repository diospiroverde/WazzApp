export enum ValueTypes{
    CHECKBOX="CHECKBOX",
    INPUT="INPUT",
    FILE="FILE",
    TEXTAREA="TEXTAREA",
    SELECT="SELECT"
}
export enum TabSections{
    GENERAL="GENERAL",
    SOUND="SOUND",
    BETA="BETA",
}
export interface ValueSettings {
    value: string | boolean;
    section: TabSections;
    type: ValueTypes;
    text: string;
    options?: Array<{key:string,text:string}>;
    tinytext?: string;
    warning?: string;
}
export interface SettingConfigInterface {
    [K: string]: ValueSettings;
}
export interface SettingsInterface {
    version?: string;
    configs?: SettingConfigInterface;
}