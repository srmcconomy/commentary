import dispatcher from './dispatcher';
import http from 'http';
import { List } from 'immutable';

type SRLType = {
  count: number,
  races: Array<{
    id: string,
    game: {
      id: number,
      name: string,
      abbrev: string,
      popularity: number,
      popularityrank: number,
    },
    goal: string,
    time: number,
    state: number,
    statetext: string,
    filename: string,
    numentrants: number,
    entrants: {
      [name: string]: {
        displayname: string,
        place: number,
        time: number,
        message: ?string,
        statetext: string,
        twitch: string,
        trueskill: string,
      }
    }
  }>
}

const token = dispatcher.register(payload => {
  if (payload.type !== 'load-race') return;
  http.get('http://api.speedrunslive.com/races', res => {
    let body = '';
    res.on('data', (chunk: string) => {
      body += chunk;
    });
    res.on('end', () => {
      const srl: SRLType = JSON.parse(body);
      const race = srl.races.find(race => race.id === payload.id);
      if (race) {
        let entrants = List();
        for (let name in race.entrants) {
          if (race.entrants.hasOwnProperty(name) && race.entrants[name].twitch.length > 0) {
            entrants = entrants.push(race.entrants[name].twitch);
          }
        }
        entrants = entrants.sort((a, b) => a.toUpperCase() - b.toUpperCase());
        dispatcher.dispatch({
          type: 'set-race',
          entrants,
        });
      }
    });
  });
});
