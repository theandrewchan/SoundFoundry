import React, { Component, PropTypes } from "react";
import CustomSeekBar from "../components/CustomSeekBar";

import { fetchSongWaveform } from "../actions/SongActions";
import { changeCurrentPercent, setIsSeeking } from "../actions/PlayerActions";

import { getWaveformImageUrl, plotWaveform } from "../utils/WaveformUtils";

const propTypes = {
    dispatch: PropTypes.func.isRequired,
    initialProgress: PropTypes.number,
    player: PropTypes.object,
    playSong: PropTypes.func.isRequired, //the function to load the song from the given playlist and play it.
    song: PropTypes.object.isRequired,
    songId: PropTypes.number.isRequired
};

class WaveformSeekBar extends Component {
    constructor(props) {
        super(props);
        const { dispatch, initialProgress, song, songId } = this.props;
        if (!song.waveform) {
            dispatch(fetchSongWaveform(songId, song));
        }

        this.state = {
            waveformImage: null, //TODO: placeholder waveform image?
            percent: (initialProgress ? initialProgress : 0),
            mousePercent: 0
        };
        this.handleOnSeek = this.handleOnSeek.bind(this);
        this.handleSeekFinished = this.handleSeekFinished.bind(this);
        this.updateCanvas = this.updateCanvas.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
    }
    componentDidMount() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.updateCanvas();
    }
    componentDidUpdate(prevProps, prevState) {
        this.updateCanvas();
    }
    componentWillReceiveProps(nextProps) {
        const { song, songId, player, initialProgress } = nextProps;

        // are we receiving a new song entirely?
        if (songId !== this.props.songId) {
            this.setState({
                percent: (initialProgress ? initialProgress : 0),
                mousePercent: 0
            });
        } else {
            // otherwise we know we have received new information about the current song
            const { percent } = this.state;
            const { waveform } = song;
            if (this.props.song.waveform !== waveform && waveform) {
                // handle receiving a waveform for the current song
                plotWaveform(waveform, this.canvas);
            }
            if (!player.isSeeking && initialProgress !== percent) {
                this.setState({
                    percent: initialProgress
                });
            }
        }
    }
    componentWillUpdate(nextProps, nextState) {
        const { dispatch, song, songId, player, initialProgress } = nextProps;
        if (songId !== this.props.songId) {
            // fetch the new song's waveform if not already present
            if (!song.waveform) {
                dispatch(fetchSongWaveform(songId, song));
            }
        }
    }

    handleMouseOver(percent) {
        this.setState({
            mousePercent: percent
        });
    }

    handleOnSeek(percent) {
        const { dispatch, playSong, player, song } = this.props;
        if (!player.isSeeking) {
            dispatch(setIsSeeking(true));
        }
        if (isNaN(percent)) {
            throw new Error("encountered NaN on seek");
        }
        this.setState({
            percent: percent
        });
    }

    handleSeekFinished(percent) {
        const { dispatch, playSong, player, songId } = this.props;
        playSong(percent);
        dispatch(setIsSeeking(false));
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { initialProgress, song } = nextProps;
        const { percent, mousePercent } = nextState;
        return (percent !== this.state.percent) ||
            (initialProgress !== percent) ||
            (song.waveform !== this.props.song.waveform) ||
            (mousePercent !== this.state.mousePercent && mousePercent >= percent);
    }

    updateCanvas() {
        const { song } = this.props;
        const { waveform } = song;
        const { percent, mousePercent } = this.state;
        if (waveform) {
            const ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            plotWaveform(waveform, this.canvas);

            ctx.save();
            ctx.globalCompositeOperation = "source-atop";
            if (mousePercent) {
                ctx.fillStyle = "#72d3be";
                ctx.fillRect(0, 0, this.canvas.width * mousePercent, this.canvas.height);
            }
            ctx.fillStyle = "#5bad9b";
            ctx.fillRect(0, 0, this.canvas.width * percent, this.canvas.height);
            ctx.restore();
        }
    }

    render() {
        const { player, song } = this.props;
        const { percent } = player;
        return (
            <CustomSeekBar
                className="song-waveform"
                initialProgress={percent}
                isVertical={false}
                onMouseOver={this.handleMouseOver}
                onSeek={this.handleOnSeek}
                seekFinished={this.handleSeekFinished}
            >
                <canvas
                    className="song-waveform-canvas"
                    ref={(canvas) => {
                        this.canvas = canvas;
                    }}
                />
            </CustomSeekBar>
        );
    }
}

WaveformSeekBar.propTypes = propTypes;

export default WaveformSeekBar;
