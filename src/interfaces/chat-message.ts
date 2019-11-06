export interface ChatMessage {
    uid?: string;
    message?: any;
    timestamp?: any;
    member?: string;
    member_name?: string;
    type?: string;
    user?: string;
    chat_room?: string;
    metadata?:any;
}