import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createStream, allowSoundStream, disallowSoundStream } from '../actions/streams';
import { setRace } from '../actions/srl';

import styles from './srlTool.scss';

class SRLTool extends Component {
  constructor() {
    super();
    this.state = { value: '', streams: null, loading: false };
  }

  componentWillMount() {
    if (this.props.race.length > 0) {
      this.loadRace(this.props.race);
    }
  }

  onChange = e => {
    this.setState({ value: e.target.value });
  }

  onKeyPress = e => {
    if (e.key === 'Enter') {
      this.onClick();
    }
  }

  onClick = () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    this.props.setRace(this.state.value);
  }

  componentWillReceiveProps(props) {
    if (props.race !== this.props.race) {
      this.loadRace(props.race);
    }
  }


  async loadRace(race) {
    this.setState({ loading: true });
    const response = await fetch(`http://api.speedrunslive.com/races?id=${race}`);
    try {
      const json = await response.json();
      this.setState({
        streams: Object.keys(json.entrants)
          .map(key => json.entrants[key].twitch)
          .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1),
        loading: false,
      });
    } catch (err) {}
  }

  onPlayerClick = stream => async () => {
    await this.props.createStream(stream);
  }

  onPlayerMuteClick = stream => async () => {
    await this.props.disallowSoundStream(stream);
  }

  onPlayerUnmuteClick = stream => async () => {
    await this.props.allowSoundStream(stream);
  }

  render() {
    return (
      <div className={styles.srlTool}>
        <label>Choose a race</label>
        <div className={styles.input}>
          <input value={this.state.value} onChange={this.onChange} onKeyPress={this.onKeyPress} placeholder="eg. 8ql31"/>
          <button disabled={this.state.loading} onClick={this.onClick}>go</button>
        </div>
        <div className={styles.streams}>
          { this.state.streams && this.state.streams.map(player => (
            <div key={player}>
              <button onClick={this.onPlayerClick(player)}>{player}</button>
              {this.props.twitchShouldHaveSound.get(player) ?
                <button className={styles.on} onClick={this.onPlayerMuteClick(player)}><i className="material-icons">volume_up</i></button> :
                <button onClick={this.onPlayerUnmuteClick(player)}><i className="material-icons">volume_up</i></button>
              }
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    race: state.race,
    twitchShouldHaveSound: state.streams.twitchShouldHaveSound,
  }),
  { setRace, createStream, allowSoundStream, disallowSoundStream },
)(SRLTool);
