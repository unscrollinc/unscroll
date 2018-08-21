import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import { DateTime, Interval } from 'luxon';
import WheelReact from '../../ext/wheel-react';
import { withRouter } from 'react-router-dom';

import axios from 'axios';

import Panel from './Panel';
import TimeFrames from './TimeFrames';
import utils from '../Util/Util';
import AppContext from '../AppContext';

const PANEL_WIDTH_PERCENTAGE = utils.PANEL_WIDTH_PERCENTAGE;
const WIDTH_MULT = PANEL_WIDTH_PERCENTAGE / 100;
class Timeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            interval: null,
            searchWorked: null
        };
    }

    urlParamsToState() {
        // Take a look at our state and then either do some server
        // calls to figure out where we are in time or just go with
        // the params. In all cases we make a call to initialize() and
        // then return null.
        const _this = this;
        // If we have `start` and `before` params then we don't need to figure out our timebox.
        if (
            !this.props.hasInterval &&
            (this.props.isSpecificScroll || this.props.isSearchQuery)
        ) {
            axios
                .get(
                    `${utils.getAPI('events')}minmax?in_scroll__slug=${
                        this.props.slug
                    }&q=${
                        this.props.isSearchQuery ? this.props.searchQuery : ''
                    }`
                )
                .then(resp => {
                    const rd = resp.data;
                    if (rd.first_event === null || rd.last_event === null) {
                        _this.setState({ searchWorked: false });
                    } else {
                        const s = DateTime.fromISO(rd.first_event);
                        const b = DateTime.fromISO(rd.last_event);
                        const rawInterval = Interval.fromDateTimes(s, b);
                        const interval = rawInterval.divideEqually(5)[3];
                        _this.initialize(
                            interval,
                            this.props.searchQuery,
                            this.props.slug
                        );
                    }
                });
        } else if (this.props.hasInterval) {
            const s = DateTime.fromISO(this.props.start);
            const b = DateTime.fromISO(this.props.before);
            const interval = Interval.fromDateTimes(s, b);
            if (s.invalid === null && b.invalid === null) {
                this.initialize(
                    interval,
                    this.props.searchQuery,
                    this.props.slug
                );
            }
        } else {
            // This is the default state
            const s = DateTime.fromObject({ year: 2010, month: 1 }).startOf(
                'month'
            );
            const b = DateTime.fromObject({ year: 2019, month: 12 }).endOf(
                'month'
            );
            const interval = Interval.fromDateTimes(s, b);
            this.initialize(interval, null);
        }
        return null;
    }

    initialize(interval, q, slug) {
        const timeframes = new TimeFrames(interval);
        const frame = timeframes.getTimeFrameObject();
        const adjusted = frame.getAdjustedDt(interval);
        console.log('@initialize', {
            interval: interval,
            adjusted: adjusted,
            q: q,
            slug: slug
        });

        const title = frame.getTitle(adjusted);
        const width = frame.getColumnCount(interval);

        const init = {
            hasInterval: true,
            interval: adjusted,
            query: q,
            slug: slug,
            user: this.props.user,
            title: title,
            frame: frame,
            width: width,
            height: 8,
            offset: 0,
            center: 0,
            mouseDown: false
        };
        this.setState(init);
    }

    widen() {
        console.log('-1 timeframe');
    }

    narrow() {
        console.log('+1 timeframe');
    }

    shouldComponentUpdate(nextProps, nextState) {
        const searchWorked = this.state.searchWorked !== nextState.searchWorked;

        const searchChanged =
            this.props.location.search !== nextProps.location.search;

        const initializedInterval =
            this.state.interval === null && nextState.interval !== null;

        const newInterval =
            this.state.interval &&
            !this.state.interval.equals(nextState.interval);

        const positionChanged =
            this.state.position !== undefined &&
            this.state.position.x !== nextState.position.x;

        const wasClickedOrTouched =
            this.state.mouseDown || this.state.isTouchDetected;

        return (
            searchWorked ||
            initializedInterval ||
            newInterval ||
            searchChanged ||
            (positionChanged && wasClickedOrTouched)
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location.search !== prevProps.location.search) {
            this.urlParamsToState();
        }

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

            const mult = this.state.mouseDown ? 200 : PANEL_WIDTH_PERCENTAGE;
            const w = this.state.elementDimensions.width;
            const delta = this.state.position.x / w - prevState.position.x / w;
            const center =
                0 - Math.round(this.state.offset / PANEL_WIDTH_PERCENTAGE);
            this.setState({
                offset: this.state.offset + delta * mult,
                center:
                    center !== this.state.center ? center : this.state.center
            });
        }
    }

    componentDidMount() {
        this.urlParamsToState();
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
                query={this.state.query}
                slug={this.state.slug}
                user={this.state.user}
                width={this.state.width}
                height={this.state.height}
                offset={this.state.offset}
                title={title}
                interval={interval}
            />
        );
    }

    renderPanels() {
        if (this.state.interval) {
            return (
                <div key="Timeline" id="Panels">
                    {this.renderPanel(-1)}
                    {this.renderPanel(0)}
                    {this.renderPanel(1)}
                </div>
            );
        }
        return <h1>Loading...</h1>;
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
                pressMoveThreshold={150}
                pressDuration={0}
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

export default props => {
    const TL = withRouter(Timeline);
    return (
        <AppContext.Consumer>
            {context => <TL {...props} context={context} />}
        </AppContext.Consumer>
    );
};
