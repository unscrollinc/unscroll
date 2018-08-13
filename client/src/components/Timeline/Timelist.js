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

const API = 'http://localhost/api/events/';

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
            rangeLeft: '0%',
            isSaved: true,
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

    getMaxMin(qs) {
        const _this = this;
        axios({
            method: 'get',
            url: utils.getAPI('events/minmax'),
            headers: utils.getAuthHeaderFromCookie(),
            params: qs
        })
            .then(resp => {
                const s = DateTime.fromISO(resp.data.first_event);
                const e = DateTime.fromISO(resp.data.last_event);
                const i = Interval.fromDateTimes(s, e);
                const seconds = i.length('seconds') / 1000;
                _this.setState(
                    {
                        interval: i,
                        seconds: seconds,
                        currentRangePosition: s.toFormat('kkkk / MMM')
                    },
                    console.log('THIS STATE IS', _this.state, resp)
                );
            })
            .catch(err => {
                console.log('Error', err);
            });
    }

    getEvents(url) {
        const _this = this;
        const order = '&order=when_happened';
        const ordering_url = url.includes(order) ? url : url + order;
        axios({
            method: 'get',
            url: ordering_url,
            headers: utils.getAuthHeaderFromCookie()
        })
            .then(resp => {
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

    replaceEvents(url) {
        const _this = this;
        const order = '&order=when_happened';
        const ordering_url = url.includes(order) ? url : url + order;
        axios({
            method: 'get',
            url: ordering_url,
            headers: utils.getAuthHeaderFromCookie()
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
                this.getEvents(`${API}?q=${q}&limit=50`)
            );
        }

        return undefined;
    }

    kickoff() {
        this.getMaxMin({ in_scroll__slug: this.props.slug });
        const url = this.props.slug
            ? `${API}?in_scroll__slug=${this.props.slug}&`
            : `${API}?`;
        this.setState(
            prevState => ({ events: [] }),
            this.getEvents(`${url}q=&limit=20&offset=0`)
        );
    }

    componentDidMount() {
        this.kickoff();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.slug !== prevProps.slug) {
            this.kickoff();
        }

        if (
            this.state.rangeMouseDown !== prevState.rangeMouseDown &&
            this.state.rangeMouseDown === false
        ) {
            console.log('RANGE MOUSE DOWN', this.state.rangeMouseDown);
            this.replaceEvents(
                `${API}?in_scroll__slug=${
                    this.props.slug
                }&start=${this.state.startDateTime.toISO()}&limit=50`
            );
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
        console.log(this.template);
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

    renderRange() {
        if (this.state.interval) {
            return (
                <div className="timelist-range">
                    <div style={{ marginLeft: this.state.rangeLeft }}>
                        {this.state.currentRangePosition}
                        &nbsp;
                    </div>
                    <input
                        style={{ width: '100%' }}
                        type="range"
                        min="0"
                        max="1000"
                        defaultValue="0"
                        step="1"
                        onMouseDown={() =>
                            this.setState({ rangeMouseDown: true })
                        }
                        onMouseUp={() =>
                            this.setState({ rangeMouseDown: false })
                        }
                        onInput={this.handleRange.bind(this)}
                    />
                </div>
            );
        }
        return null;
    }

    handleRange(e) {
        const v = e.target.value;
        const loc = this.state.interval.start.plus({
            seconds: this.state.seconds * v
        });
        this.setState({
            startDateTime: loc,
            rangeLeft: v / 10 - 5 + '%',
            currentRangePosition: loc.toFormat('kkkk MMM d')
        });
        console.log(this.state.mouseDown);
    }

    render() {
        return (
            <div className="Timelist">
                {this.renderRange()}
                <Scrollbars
                    autoHide
                    style={{ width: '100%', height: '100%' }}
                    onScroll={this.handleScroll.bind(this)}
                >
                    <div className="list-object">
                        <TimelistTitleEditor
                            key={`tti-${this.props.uuid}`}
                            insertEvent={this.insertEvent.bind(this)}
                            count={this.state.count}
                            {...this.props}
                        />
                        <table
                            key={`ttit-${this.props.uuid}`}
                            className="list-object-table"
                        >
                            <tbody>{this.state.events}</tbody>
                        </table>
                    </div>
                </Scrollbars>
            </div>
        );
    }
}

export default Timelist;
