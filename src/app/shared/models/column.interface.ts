

export interface Column {
  id: number;
  name: string;
  wip: number;
  leftColumn: boolean;
  rightColumn: boolean;
  highPriority: boolean;
  testColumn: boolean;
  parent: Column;
  offset: number;
}
