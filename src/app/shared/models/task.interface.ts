import { User } from "./user.interface";
import { Card } from "./card.interface";

export interface Task {
    assigned_user_id:User;
    card_id:Card;
    description:String;
    done:boolean;
    estimated_hours:number;
    id:number;
}