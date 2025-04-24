export type Game = {
  eventStartTime: number;
  eventEndTime: number;
  rink: string;
  opponent: string;
  score: string;
  team: string;
  sourceId: string;
};

export type CairnsGame = {
  AccountName: string;
  EventStartTime: string;
  EventEndTime: string;
  FacilityName: string;
  EventId: string;
};