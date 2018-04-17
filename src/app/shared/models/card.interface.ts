
export interface Card {
  card_id: number;
  title: string;
  description: string;
  size: number;
  number: number;
  type_silver: boolean;
  type_rejected: boolean;
  created_at: Date;
  completed_at: Date;
  started_at: Date;
  deadline: Date;
  display_offset: number;
  assigned_user_id: number;
  delete_reason_id: number;
  project_id: number;
  card_priority_id: number;
}
