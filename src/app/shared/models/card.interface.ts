export interface Card {
  violation_user: number;
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
  assigned_user_id: number;
  delete_reason_id: number;
  column_id: number;
  project_id: number;
  card_priority_id: number;
}
