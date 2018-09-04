import React from 'react';
import 'react-virtualized/styles.css';
import { DateTime, Interval } from 'luxon';
// import cachios from 'cachios';
import axios from 'axios';
import TimelistEvent from './TimelistEvent';
import TimelistTitleEditor from './TimelistTitleEditor';
import utils from '../Util/Util';
import { Scrollbars } from 'react-custom-scrollbars';
import uuidv4 from 'uuid/v4';
// import qs from 'qs';
import Slider from 'react-rangeslider';

class Timelist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: {},
            events: [],
            scroll: {},
            interval: undefined,
            doGetNext: false,
            rangeMouseDown: false,
            rangeTouching: false,
            rangeLeft: '0%',
            isSaved: true,
            slide: 0,
            fetchUrl: undefined,
            nextUrl: undefined
        };
    }
    scrollChange(k, v) {
        this.setState({ [k]: v, isSaved: false }, () => {
            console.log(this.state);
        });
    }

    renderEvent(event, isBeingEdited) {
        return (
            <TimelistEvent
                key={event.uuid}
                deleteEvent={this.deleteEvent.bind(this)}
                isBeingEdited={isBeingEdited ? true : false}
                event={event}
            />
        );
    }
    makeEvents(data, edit) {
        return data.results.map((event, i) => {
            return this.renderEvent(event, edit);
        });
    }

    deleteEvent(e) {
        const _this = this;
        const url = e.url;
        axios({
            method: 'delete',
            url: url,
            headers: utils.getAuthHeaderFromCookie()
        }).then(resp => {
            const events = _this.state.events.filter(
                ev => ev.props.event.url !== url
            );
            this.setState({ events: events });
        });
    }

    getSeconds(firstEvent, lastEvent) {
        const s = DateTime.fromISO(firstEvent);
        const e = DateTime.fromISO(lastEvent);
        const i = Interval.fromDateTimes(s, e);
        const seconds = i.length('seconds') / 100;
        return {
            interval: i,
            seconds: seconds,
            currentRangePosition: s.toFormat('kkkk / MMM')
        };
    }

    setPosition(dt) {
        const newInterval = Interval.fromDateTimes(
            this.state.interval.start,
            DateTime.fromISO(dt)
        );
        const perc = Math.floor(
            100 *
                (newInterval.length('seconds') /
                    this.state.interval.length('seconds'))
        );
        this.setState({ slide: perc });
    }

    getMinMax(qs) {
        const _this = this;
        axios({
            method: 'get',
            url: utils.getAPI('events/minmax'),
            headers: utils.getAuthHeaderFromCookie(),
            params: qs
        })
            .then(resp =>
                _this.setState(
                    this.getSeconds(resp.data.first_event, resp.data.last_event)
                )
            )
            .catch(err => {
                console.log('Error', err);
            });
    }

    getEvents(url) {
        console.log('PROPS PROPS', this.props);
        const _this = this;
        const params = url
            ? {}
            : {
                  in_scroll__slug: this.props.slug,
                  start: this.props.start,
                  end: this.props.end,
                  q: this.props.searchQuery,
                  order: 'when_happened'
              };
        axios({
            method: 'GET',
            url: url ? url : utils.getAPI('events'),
            headers: utils.getAuthHeaderFromCookie(),
            params: params
        })
            .then(resp => {
                console.log('RESP', resp.data.results[0].when_happened);
                _this.setPosition(resp.data.results[0].when_happened);
                const _els = _this.makeEvents(resp.data, false);
                _this.setState(prevState => ({
                    events: prevState.events.concat(_els),
                    nextUrl: resp.data.next,
                    count: resp.data.count,
                    doGetNext: false
                }));
            })
            .catch(err => {
                console.log('Error', err);
            });
    }

    replaceEvents() {
        const _this = this;
        const params = {
            in_scroll__slug: this.props.slug,
            start: this.state.startDateTime.toISO(),
            limit: 50,
            offset: 0,
            q: this.props.searchQuery,
            order: 'when_happened'
        };
        axios({
            method: 'GET',
            url: utils.getAPI('events'),
            headers: utils.getAuthHeaderFromCookie(),
            params: params
        })
            .then(resp => {
                const els = _this.makeEvents(resp.data, false);
                _this.setState(prevState => ({
                    events: els,
                    nextUrl: resp.data.next,
                    count: resp.data.count,
                    doGetNext: false
                }));
            })
            .catch(err => {
                console.log('Error', err);
            });
    }

    manageSearch() {
        const q = this.state.search;

        // I want to assign local state from the App `context`.

        // You can't really call a component.setState() inside
        // `context` change because it gets called a zillion
        // times. And a `shouldComponentUpdate()` would make sense but
        // it's not aware of `context`.

        // So we just do a string comparison filter, which'll always
        // be pretty fast.

        // (TODO there are some ways to read context as props.)

        if (q && this.state.search.q !== q) {
            this.setState(
                prevState => ({
                    events: [],
                    nextUrl: undefined,
                    doGetNext: false,
                    search: this.state.timeline.search
                }),
                this.getEvents()
            );
        }

        return undefined;
    }

    kickoff() {
        if (!this.props.new) {
            this.getMinMax({ in_scroll__slug: this.props.slug });
            this.setState(prevState => ({ events: [] }));
            this.getEvents();
        }
    }

    componentDidMount() {
        this.kickoff();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.slug !== prevProps.slug) {
            this.kickoff();
        }

        if (this.props.searchQuery !== prevProps.searchQuery) {
            this.kickoff();
        }

        if (
            (this.state.rangeMouseDown !== prevState.rangeMouseDown &&
                this.state.rangeMouseDown === false) ||
            (this.state.rangeTouching !== prevState.rangeTouching &&
                this.state.rangeTouching === false)
        ) {
            this.replaceEvents();
        }
    }

    insertEvent(scroll) {
        const _this = this;
        const template = {
            uuid: uuidv4(),
            when_happened: '2010-01-01T23:59:59',
            with_thumbnail: null,
            with_resolution: 10,
            in_scroll: scroll.url,
            with_creator: null,
            title: '[Untitled event #' + utils.randomString() + ']',
            text: ''
        };
        utils
            .webPromise(this, 'POST', 'events', template)
            .then(resp => {
                _this.setState(prevState => ({
                    events: this.makeEvents(
                        { results: [resp.data] },
                        true
                    ).concat(prevState.events)
                }));
            })
            .catch(err => console.log(err));
    }

    handleScroll(e) {
        const _this = this;
        const t = e.target;
        const d = t.scrollHeight - t.scrollTop;

        if (d < 2000) {
            if (!this.state.doGetNext && this.state.nextUrl) {
                _this.setState(
                    prevState => ({ doGetNext: true }),
                    _this.getEvents(this.state.nextUrl)
                );
            }
        }
    }
    handleRange(value) {
        this.setState({ slide: value });
        const loc = this.state.interval.start.plus({
            seconds: this.state.seconds * value
        });
        this.setState({
            startDateTime: loc,
            currentRangePosition: loc.toFormat('kkkk MMM d')
        });
    }

    renderRange() {
        if (this.state.interval) {
            return (
                <div className="timelist-range">
                    <Slider
                        className="slider"
                        value={this.state.slide}
                        style={{ height: '80%' }}
                        orientation="vertical"
                        reverse={true}
                        format={() => this.state.currentRangePosition}
                        onChange={this.handleRange.bind(this)}
                        onChangeComplete={this.replaceEvents.bind(this)}
                    />
                </div>
            );
        }
        return null;
    }

    renderTitleEditor() {
        if (this.props.slug) {
            return (
                <TimelistTitleEditor
                    key={`tti-${this.props.uuid}`}
                    insertEvent={this.insertEvent.bind(this)}
                    count={this.state.count}
                    {...this.props}
                />
            );
        } else {
            return <h1>{this.props.searchQuery}</h1>;
        }
    }
    render() {
        return (
            <div className="Timelist">
                <Scrollbars
                    autoHide
                    style={{ width: '100%', height: '100%' }}
                    onScroll={this.handleScroll.bind(this)}
                >
                    <div className="list-object">
                        {this.renderRange()}
                        {this.renderTitleEditor()}
                        <table
                            key={`ttit-${this.props.uuid}`}
                            className="list-object-table"
                        >
                            <tbody>
                                <tr>
                                    <td colSpan="3">RANGE WAS HERE</td>
                                </tr>

                                {this.state.events}
                            </tbody>
                        </table>
                    </div>
                </Scrollbars>
            </div>
        );
    }
}

export default Timelist;
