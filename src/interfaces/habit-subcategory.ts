import { Habit } from './habit';

export interface HabitSubcategory {
    uid: string;
    name: string;
    description?: string;
    picture?: string;
    habits: Habit[];
}