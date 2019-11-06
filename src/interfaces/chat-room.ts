import { ChatMessage } from "./chat-message";

export interface ChatRoom {
    uid?: string;
    type?: string;
    create_date?: number;
    description?: string;
    picture?: string;
    members?: any;
    name?: string;
    NotRead?: number;
    messages?: ChatMessage[];
    total_messages?: number;
    joined?: boolean;
    category?: string;
    company?: string;
    firstData?:boolean;
    createdBy?:string;
    goal?:string;
    lastMessage?:any;
    chatBotRoom?:boolean;
    sincronizando?:boolean;
    changeType?:string;
    lastVisible?:any;
    ultimos?:boolean;
    BotUid?:string;
}