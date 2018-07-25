import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import { DateTime, Interval } from 'luxon';
import WheelReact from '../../ext/wheel-react';
import Panel from './Panel';
import TimeFrames from './TimeFrames';

class Timeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialize(props);
    }

    initialize(props) {
        const interval = props.interval;
        const timeframes = new TimeFrames(interval);
        const frame = timeframes.getTimeFrameObject();
        console.log('F R A M E', frame);
        const adjusted = frame.getAdjustedDt(interval);
        const title = frame.getTitle(adjusted);
        const width = frame.getColumnCount(interval);
        return {
            title: title,
            frame: frame,
            interval: adjusted,
            width: width,
            height: 8,
            offset: 0,
            center: 0,
            mouseDown: false
        };
    }

    widen() {
        console.log('-1 timeframe');
    }

    narrow() {
        console.log('+1 timeframe');
    }

    shouldComponentUpdate(nextProps, nextState) {
        const newInterval = !this.props.interval.equals(nextProps.interval);
        const positionChanged =
            this.state.position !== undefined &&
            this.state.position.x !== nextState.position.x;

        const wasClickedOrTouched =
            this.state.mouseDown || this.state.isTouchDetected;

        return newInterval || (positionChanged && wasClickedOrTouched);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            this.state.mouseDown ||
            (this.state.isTouchDetected && this.state.isActive)
        ) {
            // [-1][0][1]

            // We don't want to keep an infinite timeline in memory.
            // We have a window of three panels. When we go left the
            // panels move rightward. When the leftmost panel is in
            // the viewport, that means it's the center panel and we
            // need to load another panel to the left, hit the API,
            // load it up, etc. We use the number as a multiplier to
            // pull dates and times. We end up at:

            // [-2][-1][0]

            // We are measuring two things: How far we've moved to the
            // left and right, and what our center is. Our center is a
            // small integer on the number line.

            // Mouse dragging feels better at 2X touch speed.

            const mult = this.state.mouseDown ? 200 : 100;
            const w = this.state.elementDimensions.width;
            const delta = this.state.position.x / w - prevState.position.x / w;
            const center = 0 - Math.round(this.state.offset / 100);
            this.setState({
                offset: this.state.offset + delta * mult,
                center:
                    center !== this.state.center ? center : this.state.center
            });
        }
    }

    componentWillUnmount() {
        // This causes some setState issues that occasionally get flagged.
        WheelReact.clearTimeout();
    }

    renderPanel(i) {
        const { title, interval } = this.state.frame.offset(
            this.state.interval,
            this.state.center + i
        );
        return (
            <Panel
                key={this.state.center + i}
                center={this.state.center + i}
                frame={this.state.frame}
                width={this.state.width}
                height={this.state.height}
                offset={this.state.offset}
                title={title}
                interval={interval}
            />
        );
    }

    renderPanels() {
        return (
            <div key="Timeline" id="Panels">
                {this.renderPanel(-1)}
                {this.renderPanel(0)}
                {this.renderPanel(1)}
            </div>
        );
    }

    render() {
        WheelReact.config({
            left: e => {
                console.log('wheel left detected.');
            },
            right: e => {
                console.log('wheel right detected.');
            },
            up: e => {
                this.widen();
            },
            down: e => {
                this.narrow();
            }
        });

        return (
            <ReactCursorPosition
                key="Timeline"
                isActivatedOnTouch
                {...{
                    onPositionChanged: props => this.setState(props),
                    onDetectedEnvironmentChanged: props => this.setState(props),
                    onActivationChanged: props => this.setState(props)
                }}
            >
                <div
                    className="Timeline"
                    {...WheelReact.events}
                    onMouseDown={() => this.setState({ mouseDown: true })}
                    onMouseUp={() => this.setState({ mouseDown: false })}
                >
                    {this.renderPanels()}
                </div>
            </ReactCursorPosition>
        );
    }
}

export default Timeline;
