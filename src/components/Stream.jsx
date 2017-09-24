import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind'

import { easeInOut } from '../util/easingFunction';
import { moveStream, removeStream, refreshStream, allowSoundStream, disallowSoundStream, streamDoneLoading } from '../actions/streams'
import { setTransform } from '../actions/transforms'


import styles from './stream.scss';
const cx = classnames.bind(styles);

class Stream extends Component {
  constructor(props) {
    super(props);
    this.tempStream = props.stream;
    this.tempTransform = props.transform;
    this.state = {
      stream: props.stream,
      localTransform: props.transform,
      animationState: 'done',
      editMode: false,
      loading: false,
      hidden: true,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.player && !this.props.stream && this.state.animationState !== 'fading') {
      this.setState({ animationState: 'fading' });
      setTimeout(() => {
        this.player && this.player.destroy();
        this.player = null;
        this.tempStream = null;
        this.tempTransform = null;
        this.setState({ animationState: 'done' })
      }, 500);
    } else if (
      (!prevProps.stream && this.props.stream) ||
      (prevProps.stream && this.props.stream && prevProps.stream.twitch !== this.props.stream.twitch)
    ) {
      this.initTwitch();
    }
    if (prevProps.stream && this.props.stream) {
      if (prevProps.stream.refresh !== this.props.stream.refresh) {
        this.player.play();
      }
      if (prevProps.stream.position === 'loading' && this.props.stream.position !== 'loading') {
        this.setState({ animationState: 'appearing' });
        setTimeout(() => this.setState({ animationState: 'alive' }), 500);
      }
      if (prevProps.muted != this.props.muted) {
        const startVolume = this.player.getVolume();
        const targetVolume = this.props.muted ? 0 : 1;
        let startTime = null;
        const step = timestamp => {
          if (startTime === null) startTime = timestamp;
          const fraction = (timestamp - startTime) / 200;
          if (fraction < 1) {
            this.player.setVolume(startVolume + easeInOut(fraction) * (targetVolume - startVolume));
            this.callbackID = requestAnimationFrame(step);
          } else {
            this.player.setVolume(targetVolume);
          }
        };
        cancelAnimationFrame(this.callbackID);
        this.callbackID = requestAnimationFrame(step);
      }
    }
  }

  componentWillReceiveProps(props) {
    if (!this.state.editMode && this.props.transform !== props.transform) {
      this.setState({ localTransform: props.transform });
    }

    if (props.stream) this.tempStream = props.stream;
    if (props.transform) this.tempTransform = props.transform;
  }

  componentDidMount() {
    if (this.props.stream) {
      this.initTwitch();
    }
  }

  componentWillUnmount() {
    this.player && this.player.destroy();
  }

  initTwitch() {
    try {
      this.setState({ loading: false });
      if (this.player) this.player.destroy();
      this.player = new Twitch.Player(
        this.props.stream.twitch,
        { channel: this.props.stream.twitch },
      );
      this.player.setVolume(this.props.stream.position !== 'loading' && !this.props.muted ? 1 : 0);
      this.player.setMuted(false);
      // this.player.addEventListener(Twitch.Player.READY, () => console.log('ready'));
      // this.player.addEventListener(Twitch.Player.ONLINE, () => console.log('online'));
      this.player.addEventListener(Twitch.Player.PLAY, () => {
        if (this.props.view) this.props.streamDoneLoading(this.props.stream.twitch);
        this.setState({ hidden: false });
      });
      this.player.addEventListener(Twitch.Player.OFFLINE, () => this.setState({ hidden: true }));
      this.player.addEventListener(Twitch.Player.PAUSE, () => this.setState({ hidden: true }));
      this.player.addEventListener(Twitch.Player.ENDED, () => this.setState({ hidden: true }));
    } catch (err) {

    }
  }

  loadingOnClick = func => async () => {
    this.setState({ loading: true });
    await func();
    this.setState({ loading: false });
  }

  onMoveClick = position => () => this.props.moveStream(this.props.stream.twitch, position);

  onCloseClick = () => {
    this.setState({ loading: true });
    this.props.removeStream(this.props.stream.twitch);
  }

  onRefreshClick = () => this.props.refreshStream(this.props.stream.twitch);

  onAllowSoundClick = () => this.props.shouldHaveSound ?
    this.props.disallowSoundStream(this.props.stream.twitch) :
    this.props.allowSoundStream(this.props.stream.twitch);

  onEditClick = () => this.setState({ editMode: true });

  onUneditClick = async () => {
    await this.props.setTransform(this.props.stream.twitch, this.state.localTransform);
    this.setState({ editMode: false });
  }

  onTransformChange = prop => e => {
    this.setState({ localTransform: this.state.localTransform.set(prop, e.target.value)})
  }

  renderButtons() {
    if (this.props.view || !this.props.stream || !this.props.transform) return null;
    if (this.state.editMode) {
      return (
        <div className={styles.overlay}>
          <button onClick={this.loadingOnClick(this.onUneditClick)}>
            <i className="material-icons">undo</i>
          </button>
          <div>
            Scale:
            <input type="number" value={this.state.localTransform.scale} onChange={this.onTransformChange('scale')} step={0.01} />
          </div>
          <div>
            Stretch:
            <input type="number" value={this.state.localTransform.stretch} onChange={this.onTransformChange('stretch')} step={0.01} />
          </div>
          <div>
            X:
            <input type="number" value={this.state.localTransform.x} onChange={this.onTransformChange('x')} step={1} />
          </div>
          <div>
            Y:
            <input type="number" value={this.state.localTransform.y} onChange={this.onTransformChange('y')} step={1} />
          </div>
        </div>
      );
    }
    return (
      <div className={styles.overlay}>
        <div className="row">
          <button className={styles.close} onClick={this.onCloseClick}>
            <i className="material-icons">clear</i>
          </button>
          <button className={styles.refresh} onClick={this.loadingOnClick(this.onRefreshClick)}>
            <i className="material-icons">refresh</i>
          </button>
          <button className={styles.mute} onClick={this.loadingOnClick(this.onAllowSoundClick)}>
            {
              this.props.shouldHaveSound ?
                <i className="material-icons">volume_off</i> :
                <i className="material-icons">volume_up</i>
            }
          </button>
          <button className={styles.edit} onClick={this.onEditClick}>
            <i className="material-icons">edit</i>
          </button>
        </div>
        <div className={styles.move}>
          <span>Move Stream</span>
          <div>
            {['tl', 'tr', 'bl', 'br'].map(pos => (
              <div className={pos} key={pos}>
                 <button disabled={this.props.stream.position === pos} onClick={this.loadingOnClick(this.onMoveClick(pos))} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (!this.tempStream) return <div></div>;
    let { scale, stretch, x, y } = this.state.editMode ? this.state.localTransform : this.tempTransform;
    const transformString = `scale(${scale}) scaleX(${stretch}) translate(${x / 10}%, ${y / 10}%)`;
    return (
      <div
        className={cx({
          stream: true,
          edit: this.state.editMode,
          [this.tempStream.position]: true,
        })}
      >
        <div className={cx(['flipper', this.state.animationState])}>
          <div className={styles.title}>
            {this.tempStream.twitch}
            {this.props.muted ? null : <i className="material-icons">volume_up</i>}
          </div>
          <div className={styles.padder}>
            <div
              id={this.tempStream.twitch}
              className={cx({
                transformer: true,
                hidden: this.props.view && this.state.hidden,
              })}
              style={{
                transform: transformString,
              }}
            />
            {this.renderButtons()}
            {!this.props.view && (
              <div
                className={cx({
                  loadingOverlay: true,
                  hidden: !this.tempStream.loading && !this.state.loading
                })}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    const stream = state.streams.list.get(props.index);
    const transform = stream && state.transforms.get(stream.twitch);
    const shouldHaveSound = stream && state.streams.twitchShouldHaveSound.get(stream.twitch);
    const muted = stream && state.streams.soundStream !== stream.twitch;
    return { stream, transform, muted, shouldHaveSound };
  },
  { moveStream, removeStream, allowSoundStream, disallowSoundStream, refreshStream, setTransform, streamDoneLoading }
)(Stream);
