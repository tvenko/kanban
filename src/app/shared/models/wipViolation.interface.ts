import { Card } from "./card.interface";
import { Column } from "./column.interface";
import { User } from "./user.interface";

export interface WipViolation {
    id:number;
    date:string;
    card_id:Card;
    column_id:Column;
    user_id:User;
    wip_violation_reason_id:{
        id:number;
        description:string;
    }
}