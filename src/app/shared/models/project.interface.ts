import { Group } from "./group.interface";

export interface Project{
    id:number;
    project_id:string;
    title:string;
    started_at:string;
    ended_at:string;
    active:boolean;
    developer_group_id:string;
    board_id:string;
    group_data:Group;
    subscriber_name:string;
    card_active:boolean;
}
