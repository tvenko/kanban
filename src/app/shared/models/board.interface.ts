import {Column} from './column.interface';

export interface Board {
  id: number;
  title: string;
  notify_overdue_n_days: number;
  display_priority: boolean;
  display_size: boolean;
  display_deadline: boolean;
  type_priority_column_id: number;
  type_acceptance_testing_column_id: number;
  type_left_border_column_id: number;
  type_right_border_column_id: number;
  columns: Column[];
}
