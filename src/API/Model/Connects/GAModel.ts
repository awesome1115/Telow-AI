export interface GAConnect {
  id: number;
  created_at: string;
  updated_at: string;
  refresh_token: string;
  code: string;
  user_id: string;
  instance_id: string;
  view_id: string;
}

export interface GAParams {
  metrics: string[];
  dimensions: string[];
  startDate: string;
  endDate: string;
}
