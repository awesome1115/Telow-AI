import { Bug } from './BugsModel';

export interface DataStream {
  id: string | null;
  object: Bug | GoogleAnalytic;
  type: string;
  date: string;
}

export interface GoogleAnalytic {
  active_users: number;
  date: string;
  new_users: number;
  bounce_rate: number;
  sessions: number;
}

export interface DimensionValue {
  value: string; // Assuming value is always a string, adjust if necessary
}

export interface MetricValue {
  value: string; // Assuming value is a string that can be parsed to a number, adjust if necessary
}

export interface GAPIResponseRow {
  dimensionValues: DimensionValue[];
  metricValues: MetricValue[];
}
