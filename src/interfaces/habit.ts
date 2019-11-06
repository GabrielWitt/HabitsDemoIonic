import { HabitGoal } from './habit-goal';

export interface Habit {
    uid: string;
    name: string;
    //description: string;
    picture?: string;
    habitGoals: HabitGoal[];
}