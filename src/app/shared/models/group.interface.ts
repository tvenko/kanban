import { User } from "./user.interface";

export interface GroupMember{
    id:number;
    name:string;
    surname:string;
    email:string;
    password:string;
    is_active:boolean;
    allowed_group_roles:number[];
    group_active:boolean;
}

export interface Group {
    id:number;
    title:string;
    users:GroupMember[];
}