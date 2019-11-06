export interface Context {
    lifespan?: string;
    name?: string;
}

export interface ChatContext {
    lastUpdate:string;
    contexts?:ChatContext[];
}
