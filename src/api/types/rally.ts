export type RallyEventCategory = {
  _id: string;
  title: string;
  key: string;
  image?: string | null;
  description?: string | null;
  max_members?: number;
  navigator_allowed?: boolean;
  consent?: string | null;
  created_at?: string;
  updated_at?: string;
  __v?: number;
};

export type RallyEvent = {
  _id: string;
  name: string;
  edition_number: number;
  category?: RallyEventCategory | string;
  date: string;
  end_date: string;
  registration_start_date?: string;
  registration_end_date?: string;
  rally_start_date?: string;
  location: string;
  organiser: string;
  description: string;
  banner_image: string | null;
  thumbnail_image: string | null;
  status: string;
  is_featured: boolean;
  highlights: string[];
  stats_drivers: number;
  stats_events: number;
  stats_participants: number;
  created_at: string;
  updated_at: string;
  __v: number;
  id?: string;
};

export type RallyChallenge = {
  _id: string;
  event_id: string;
  title: string;
  description: string;
  image: string | null;
  category: string;
  created_at: string;
  updated_at: string;
  __v: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type GetActiveRallyResponse = ApiResponse<RallyEvent>;

export type GetChallengesResponse = ApiResponse<RallyChallenge[]>;

export type RallyEventStatus = "upcoming" | "active" | "completed";
export type RallyEventSort = "date_desc" | "date_asc";

export type GetRallyEventsQuery = {
  /** Comma-separated: upcoming,active,completed */
  status?: string;
  /** Case-insensitive text match on backend */
  search?: string;
  year?: number;
  sort?: RallyEventSort;
};

export type GetRallyEventsResponse = ApiResponse<RallyEvent[]>;
