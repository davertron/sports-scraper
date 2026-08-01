// Minimal ambient types for the Temporal global (Node 26+).
// TypeScript doesn't ship official Temporal lib types yet, so only the
// small slice of the API this project actually uses is declared here.
declare namespace Temporal {
  interface ZonedDateTimeFields {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    timeZone: string;
  }

  class ZonedDateTime {
    static from(fields: ZonedDateTimeFields): ZonedDateTime;
    readonly epochMilliseconds: number;
  }

  class PlainDateTime {
    static from(isoString: string): PlainDateTime;
    toZonedDateTime(timeZone: string): ZonedDateTime;
  }
}
