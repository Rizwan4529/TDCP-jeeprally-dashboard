export type RallyEvent = {
  _id: string;
  name: string;
  edition_number: number;
  date: string;
  end_date: string;
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
export type RallyEventType = "upcoming" | "past";

export type GetRallyEventsQuery = {
  /** Valid values: upcoming | active | completed */
  status?: RallyEventStatus;
  /** Valid values: upcoming | past */
  type?: RallyEventType;
  /** Case-insensitive text match / regex on backend */
  search?: string;
};

export type GetRallyEventsResponse = ApiResponse<RallyEvent[]>;

