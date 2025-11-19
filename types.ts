export interface DataTask {
  id: string;
  title: string;
  sqlQuery: string;
  lastUpdated: Date | null;
  created_at: string;
}