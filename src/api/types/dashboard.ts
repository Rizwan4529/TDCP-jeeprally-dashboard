import type { ApiResponse } from "@/api/types/rally";
import type { Category } from "@/utils/constants";

export type DashboardEventRef = {
  _id: string;
  name: string;
  date: string;
  end_date: string;
  location: string;
  status: string;
  edition_number: number;
  banner_image?: string | null;
  thumbnail_image?: string | null;
};

export type DashboardVehicleRef = {
  _id: string;
  model: string;
  engine: string;
  category: string;
  class: string;
  power: number;
  image: string | null;
};

export type DashboardCards = {
  last_event: DashboardEventRef;
  ranking: number;
  total_time: string;
  total_penalty: string;
  total_points: number;
  team_name: string;
  team_number: string;
  category: Category | string;
  vehicle: DashboardVehicleRef;
};

export type DashboardRanking = {
  position: number;
  after_stage: number;
  total_time: string;
  total_penalty: string;
  points: number;
};

export type DashboardCategoryRef = {
  _id: string;
  title: string;
  key: string;
};

export type DashboardRallyEntry = {
  event: DashboardEventRef;
  team_name: string;
  team_number: string;
  category_id?: string;
  category: DashboardCategoryRef | Category | string;
  ranking: DashboardRanking;
};

export type DriverDashboardData = {
  cards: DashboardCards;
  best_rallies: DashboardRallyEntry[];
  overall_rallies: DashboardRallyEntry[];
};

export type GetDriverDashboardResponse = ApiResponse<DriverDashboardData>;
