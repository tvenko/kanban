import { Group } from "../../groups/extraClasses";

export interface Project{
    id_project:string;
    title:string;
    started_at:string;
    ended_at:string;
    active:boolean;
    developer_group_id:string;
    board_id:string;
    group_data:Group;
}
