import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import { DateTime, Interval } from 'luxon';
import WheelReact from '../../ext/wheel-react';
import Panel from './Panel';
import TimeFrames from './TimeFrames';

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        const start = props.start
            ? DateTime.fromISO(props.start)
            : DateTime.fromObject({ year: 1900, month: 1 }).startOf('month');

        const before = props.start
            ? DateTime.fromISO(props.before)
            : DateTime.fromObject({ year: 1900, month: 1 }).endOf('month');
        const interval = Interval.fromDateTimes(start, before);

        this.state = this.initialize(interval);
    }

    initialize(interval) {
        const timeframes = new TimeFrames(interval);
        const frame = timeframes.getTimeFrameObject();
        const adjusted = frame.getAdjustedDt(interval);
        const title = frame.getTitle(adjusted);
        const width = frame.getColumnCount(interval);
        return {
            title: title,
            frame: frame,
            span: adjusted,
            width: width,
            height: 5,
            offset: 0,
            center: 0,
            atMouseDown: undefined,
            atTouchDown: null,
            mouseDown: false
        };
    }

    getXPercentage() {
        return this.state.position.x / this.state.elementDimensions.width;
    }

    onPositionChanged(param) {
        console.log(param);
    }

    handleMouseMove(e) {
        if (this.state.mouseDown) {
            const delta = this.getXPercentage() - this.state.atMouseDown;
            const center = 0 - Math.round(this.state.offset / 100);
            this.setState({
                offset: this.state.offset + 50 * delta,
                center:
                    center !== this.state.center ? center : this.state.center
            });
        }
    }

    handleMouseDown(e) {
        this.setState({
            mouseDown: true,
            atMouseDown: this.getXPercentage()
        });
    }

    handleMouseUp(e) {
        this.setState({
            mouseDown: false,
            atMouseDown: undefined
        });
    }

    widen() {
        console.log('-1 timeframe');
    }

    narrow() {
        console.log('+1 timeframe');
    }

    toProps(num) {
        return {
            center: this.state.center + num,
            span: this.state.span,
            frame: this.state.frame,
            width: this.state.width,
            height: this.state.height,
            offset: this.state.offset
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.state.position &&
            this.state.position.x !== nextState.position.x &&
            (this.state.mouseDown || this.state.isTouchDetected)
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.state.isTouchDetected, this.state.isActive);
        if (this.state.isTouchDetected && this.state.isActive) {
            const w = this.state.elementDimensions.width;
            const delta = this.state.position.x / w - prevState.position.x / w;
            const center = 0 - Math.round(this.state.offset / 100);
            this.setState({
                offset: this.state.offset + delta * 100,
                center:
                    center !== this.state.center ? center : this.state.center
            });
        }

        if (
            prevProps.start !== this.props.start &&
            prevProps.before !== this.props.before
        ) {
            const start = DateTime.fromISO(this.props.start);
            const before = DateTime.fromISO(this.props.before);
            const interval = Interval.fromDateTimes(start, before);
            this.setState(this.initialize(interval));
        }
    }

    componentWillUnmount() {
        // This causes some setState issues that occasionally get flagged.
        WheelReact.clearTimeout();
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
                isActivatedOnTouch
                {...{
                    onPositionChanged: props => this.setState(props),
                    onDetectedEnvironmentChanged: props => this.setState(props),
                    onActivationChanged: props => this.setState(props)
                }}
            >
                <div
                    key="TimelineWrapper"
                    className="Timeline"
                    {...WheelReact.events}
                    onMouseDown={this.handleMouseDown.bind(this)}
                    onMouseUp={this.handleMouseUp.bind(this)}
                    onMouseMove={this.handleMouseMove.bind(this)}
                >
                    <div key="Timeline" id="Panels">
                        <Panel
                            key={this.state.center - 1}
                            {...this.toProps(-1)}
                        />
                        <Panel key={this.state.center} {...this.toProps(0)} />
                        <Panel
                            key={this.state.center + 1}
                            {...this.toProps(1)}
                        />
                    </div>
                </div>
            </ReactCursorPosition>
        );
    }
}

export default Timeline;
