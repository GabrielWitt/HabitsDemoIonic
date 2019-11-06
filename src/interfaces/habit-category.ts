import { HabitSubcategory } from './habit-subcategory';

export interface HabitCategory {
    uid: string;
    name: string;
    description: string;
    picture: string;
    habitSubcategories: HabitSubcategory[]
}