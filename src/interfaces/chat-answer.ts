export interface ChatAnswer {
    type?: string;
    text?: string;
    buttons?: string[];
    action?: string;
    lastUpdate?:string;
    url?:string;
}