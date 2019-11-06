import { Company } from './company';
import { Country } from './country';

export interface User {
    uid?: string;
    document_id?: string;
    create_date?: Date;
    name?: string;
    last_name?: string;
    name_first?: string;
    last_name_first?: string;
    nick_name?: string;
    points?: number;
    habits_percent?: number;
    wellness?: number;
    gender?: string;
    status?: string;
    address?: string;
    phone?: string;
    cell_phone?: string;
    born_date?: string;
    photo?: string;
    mail?: string;
    mail_verified?: boolean;
    test?: string;
    rol?: string;
    country?: Country;
    company?: Company;
    chat_bot_room?: any;
    city?: string;
    is_online?: boolean;
    picture?: string;
    diet?: string;
    steps_goal?: number;
    language?: string;
    tester?:boolean;
    seven_days?: number;
    old_week?: number;
}
