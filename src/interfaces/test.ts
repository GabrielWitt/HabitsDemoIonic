import { Question } from './question';

export interface Test {
    uid?: string;
    name?: string;
    type?: string
    questions?: Question[];    
    results?: any[];    
}