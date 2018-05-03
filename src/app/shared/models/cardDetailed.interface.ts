import { User } from "./user.interface";
import { Column } from "./column.interface";
import { Project } from "./project.interface";
import { Priority } from "./priority.interface";
import { Task } from "./task.interface";
import { WipViolation } from "./wipViolation.interface";
import { Log } from "./log.interface";

export interface CardDetailed {
    card_id: number;
    active: boolean;
    title: string;
    description: string;
    size: number;
    number: number;
    type_silver: boolean;
    type_rejected: boolean;
    created_at: string;
    completed_at: string;
    started_at: string;
    deadline: string;
    display_offset: number;
    assigned_user_id: User;
    delete_reason_id:{
        description:string
    }
    column_id:Column;
    project_id:Project;
    violation_user: number;
    card_priority_id: Priority;
    tasks:Task[];
    wip_violations:WipViolation[];
    logs:Log[];
  }
  