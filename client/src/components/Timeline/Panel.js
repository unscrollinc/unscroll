import React from 'react';
import Column from './Column';
import Event from './PanelEvent';
import { Link } from 'react-router-dom';
import { Interval, DateTime } from 'luxon';
import axios from 'axios';
import cachios from 'cachios';
import utils from '../Util/Util';
import { frames } from './TimeFrames';
axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.withCredentials = true;

/*

  THERE IS A BIG BAD GLOBAL VARIABLE IN HERE CALLED GRID.
             _     _
   __ _ _ __(_) __| |
  / _` | '__| |/ _` |
 | (_| | |  | | (_| |
  \__, |_|  |_|\__,_|
  |___/

  I wanted you to know about that.

*/

class Panel extends React.Component {
    constructor(props) {
        super(props);
        this.grid = this.makeGrid();
        this.state = this.initialize(props);
    }

    initialize(props) {
        const breadcrumbTitle = props.title.map((o, i, a) => {
            const breadSpacer = i + 1 < a.length ? ' ▶ ' : '';
            return (
                <span key={i}>
                    <Link to={`?${o.timeSpan}`}>{o.title}</Link>
                    {breadSpacer}
                </span>
            );
        });
        return {
            grid: {
                width: props.width,
                height: props.height
            },
            frame: props.frame,
            title: breadcrumbTitle,
            interval: props.interval,
            events: [],
            cell: {
                width: 100 / props.width,
                height: 90 / props.height
            },
            columns: [...Array(this.props.width).keys()].map(ct =>
                this.renderColumn.bind(this)(ct, props.interval)
            )
        };
    }

    makeGrid() {
        const w = this.props.width;
        const h = this.props.height;
        // Makes an associative array of `false` values that is
        // `this.state.grid.height` long and each value is an array
        // `this.state.grid.height` wide. I.e. a 2D bitmap.

        var grid = new Array(h);
        for (var i = 0; i < h; i++) {
            var row = [];
            for (var j = 0; j < w; j++) {
                row.push(false);
            }
            grid[i] = row;
        }
        return grid;
    }

    doReservation(x, y, w, h) {
        // Answers the question: If I've got an object `w` wide and
        // `h` high, can you put it (1) on the x axis at position `x`
        // exactly and (2) position `y` or greater? Lightly recursive.

        let success = undefined;
        let xmax = this.state.grid.width;
        let ymax = this.state.grid.height;

        // measure once
        for (let _y = y; _y < y + h; _y++) {
            for (let _x = x; _x < x + w; _x++) {
                if (_y < ymax && _x < xmax) {
                    if (this.grid[_y][_x]) {
                        return this.doReservation(x, y + 1, w, h);
                    } else {
                        success = true;
                    }
                } else {
                    success = false;
                }
            }
        }

        if (success) {
            for (let _y = y; _y < y + h; _y++) {
                for (let _x = x; _x < x + w; _x++) {
                    this.grid[_y][_x] = true;
                }
            }
        }

        return {
            success: success,
            x: x,
            y: y,
            w: w,
            h: h
        };
    }

    renderEvent(event) {
        const dt = DateTime.fromISO(event.when_happened);
        const left = this.state.frame.elOffset(dt);
        return (
            <Event
                key={event.uuid}
                width={this.state.cell.width + '%'}
                cell={this.state.cell}
                dt={dt}
                columnCount={this.state.frame.getColumnCount(
                    this.state.interval
                )}
                whenTitle={this.props.frame.format(
                    Interval.fromDateTimes(
                        DateTime.fromISO(event.when_happened),
                        DateTime.fromISO(event.when_happened)
                    )
                )}
                doReservation={this.doReservation.bind(this)}
                left={left}
                event={event}
            />
        );
    }

    getSpan() {
        utils.GET(this, 'events', {
            events: 25,
            start: this.state.interval.start.toISO(),
            before: this.state.interval.end.toISO()
        });
        this.grid = this.makeGrid();
    }

    componentDidMount() {
        this.getSpan();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.interval.equals(this.props.interval)) {
            this.setState(this.initialize(this.props), this.getSpan);
        }
    }

    renderColumn(ct, interval) {
        // Avoiding destructuring to keep ESLint happy.
        const columnLink = this.props.frame.getColumnLink(interval, ct);
        const span = columnLink.span;
        const title = columnLink.title;
        return (
            <Column
                width={100 / this.props.width + '%'}
                span={span}
                title={title}
                key={ct}
            />
        );
    }

    render() {
	
        const left = this.props.center * 100 + this.props.offset + '%';
/*
	const getPosition = () => {
	    const adj = this.props.offset/100 + this.props.center;
	    if (adj > 0.5) {
		return {position:'fixed', left:0, width:'10%'};
	    }	    
	    return {position:'relative', left:0, width:'100%'};
	};
*/
        return (
            <div
                className="Panel"
                id={this.props.center}
                key={this.props.interval}
                style={{ left: left }}
		>
		<div className="breadcrumbs">
                <h1>{this.state.title}</h1>
		</div>
                {this.state.columns}

                {this.state.events.map(this.renderEvent.bind(this))}
            </div>
        );
    }
}
export default Panel;
