import {Card} from './card.interface';


export interface Column {
  id: number;
  title: string;
  wip_restriction: number;
  display_offset: number;
  parent_column_id: number;
  board_id: number;
  subcolumns: Column[];
  column_cards: Card[];
}
