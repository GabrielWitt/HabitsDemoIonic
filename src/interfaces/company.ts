import { Department } from './department'
import { Position } from './position'
import { Country } from './country';

export interface Company {
    uid?: string;
    key?: string;
    tax_id?: string;
    name?: string;
    phone?: string;
    mail?: string;
    address?: string;
    quota?: number;
    status?: string;
    country?: Country;
    department?: Department;
    position?: Position;
    test?: string;
    logo?: string;
}