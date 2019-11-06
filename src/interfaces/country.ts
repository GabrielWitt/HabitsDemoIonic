import { City } from './city';

export interface Country{
    uid: string;
    name: String;
    city?: City;
}