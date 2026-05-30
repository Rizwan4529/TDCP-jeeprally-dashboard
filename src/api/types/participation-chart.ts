import type { ApiResponse } from "@/api/types/rally";

export type ParticipationChartMeta = {
  title: string;
  x_axis: string;
  y_axis: string;
};

export type ParticipationTdcpEvent = {
  registration_id: string;
  event_id: string;
  name: string;
  date: string;
  status: string;
  registration_status: string;
};

export type ParticipationTdcpYear = {
  year: number;
  count: number;
  events: ParticipationTdcpEvent[];
};

export type ParticipationOtherEntry = {
  _id: string;
  team: string;
  position: string;
  vehicle: string;
  year: number;
  role: string;
};

export type ParticipationOtherYear = {
  year: number;
  count: number;
  entries: ParticipationOtherEntry[];
};

export type ParticipationSeriesPoint = {
  year: number;
  count: number;
};

export type ParticipationSeries = {
  key: string;
  label: string;
  description?: string;
  color_hint: string;
  data: ParticipationSeriesPoint[];
};

export type ParticipationChartTotals = {
  tdcp: number;
  other: number;
  all: number;
};

export type ParticipationChartData = {
  chart: ParticipationChartMeta;
  years: number[];
  tdcp_races: ParticipationTdcpYear[];
  other_races: ParticipationOtherYear[];
  series: ParticipationSeries[];
  totals: ParticipationChartTotals;
};

export type GetParticipationChartResponse = ApiResponse<ParticipationChartData>;
