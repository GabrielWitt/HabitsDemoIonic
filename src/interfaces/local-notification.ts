export interface LocalNotification {
    id?: number;
    text?: string;
    trigger?: any;
    title?: string;
    icon?: string;
    attachment?: string;
    actions?: any
    led?: any;
    vibrate?: any;
    sound?: string;
  }