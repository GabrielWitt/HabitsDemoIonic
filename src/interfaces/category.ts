export interface Category {
    uid: string;
    name: string;
    description: string;
    picture: string;
    subcategory: string[];
    subcategories?: string[]
}