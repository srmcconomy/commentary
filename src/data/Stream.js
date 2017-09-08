import { Record } from 'immutable';

export default class Stream extends new Record({
  twitch: '',
  position: '',
  refresh: false,
  allowSound: false,
  loading: true,
}) { }


