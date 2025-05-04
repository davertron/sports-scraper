// Hard code data from the CSV for now, which can be found here:
// https://docs.google.com/spreadsheets/d/1JkeOGc9uHVgrP399IL-4oQEOZk-SPX9Fs-Iq_fNj0Z0/edit?gid=0#gid=0
// Eventually scrape from the website
const tsvGames = `
Date	Time	Home Team	Away Team	Field
Wednesday, May 7, 2025	6:00 PM	Big Fat Nerds	Ye Olde Northenders	TF 9
Wednesday, May 14, 2025	6:00 PM	Swamp Donkeys	Big Fat Nerds	TF 8A
Wednesday, May 21, 2025	7:00 PM	Big Fat Nerds	Gol Lytely	TF 12B
Wednesday, May 28, 2025	7:00 PM	RFC United	Big Fat Nerds	TF 10
Wednesday, June 11, 2025	7:00 PM	Big Fat Nerds	Free Animals	TF 12A
Wednesday, June 18, 2025	6:00 PM	The Old & The Breathless	Big Fat Nerds	TF 8B
Wednesday, July 2, 2025	6:00 PM	Ye Olde Northenders	Big Fat Nerds	TF 12A
Wednesday, July 9, 2025	6:00 PM	Big Fat Nerds	Swamp Donkeys	TF 13A
Wednesday, July 16, 2025	6:00 PM	Gol Lytely	Big Fat Nerds	TF 13A
Wednesday, July 23, 2025	7:00 PM	Big Fat Nerds	RFC United	TF 13B
Wednesday, July 30, 2025	7:00 PM	Big Fat Nerds	Foot Clan FC	TF 8A
Wednesday, August 6, 2025	7:00 PM	Free Animals	Big Fat Nerds	TF 13A
Wednesday, August 13, 2025	6:00 PM	Big Fat Nerds	The Old & The Breathless	TF 12B
`;

const games = tsvGames.split('\n')
    .slice(2)
    .filter(line => line.trim() !== '')
    .map(line => {
        const [date, time, homeTeam, awayTeam, field] = line.split('\t');
        const eventStartTime = new Date(`${date} ${time}`).getTime();
        const eventEndTime = eventStartTime + 60 * 60 * 1000;

        return { 
            eventStartTime,
            eventEndTime,
            opponent: homeTeam === "Big Fat Nerds" ? awayTeam : homeTeam,
            team: "Big Fat Nerds",
            rink: field,
            score: '',
            sourceId: `bigfatnerds-${eventStartTime}`,
        };
});

export function scrapeBigFatNerdsGames() {
    return games;
}