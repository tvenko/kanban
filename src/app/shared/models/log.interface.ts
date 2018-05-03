import { Card } from "./card.interface";
import { Column } from "./column.interface";

export interface Log{
    id:number;
    date:string;
    card_id:Card;
    from_column_id:Column;
    to_column_id:Column;
}
