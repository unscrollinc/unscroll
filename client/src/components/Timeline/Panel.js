import React from 'react';
import Column from './Column';
import Event from './PanelEvent';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import axios from 'axios';
import cachios from 'cachios';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

class Panel extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.buffer = document.getElementById('buffer');        
        
        this.state = {
            grid:{
                width:12,
                height:10
            },
            events:[]
        };
        
        this.bitsGrid = this.makeGrid();

        this.state.cell = {
            width:100/this.state.grid.width,
            height:100/this.state.grid.height
        };

    }
    
    renderColumn(i) {
        const { span, interval, title } = this.props.frame.getColumnLink(this.props.interval, i);
        return(
                <Column
                  columnCount={this.props.columnCount} 
	          span={span}
                  title={title}
                  key={title + '-' + i}/>
        );
    }

    makeGrid() {

        // Makes an associative array of false values that is
	// `this.state.grid.height` long and each value is an array
	// `this.state.grid.height` wide. I.e. a 2D bitmap.
        
	var grid = new Array(this.state.grid.height);
	for (var i = 0; i < this.state.grid.height; i++) {
	    var row = [];
	    for (var j = 0; j < this.state.grid.width; j++) {
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
		    if (this.bitsGrid[_y][_x]) {
			return this.doReservation(x, y + 1, w, h);
		    }
		    else {
			success = true;
		    }
		}
		else {
		    success = false;
		}
	    }
	}
        
	if (success) {
	    for (let _y = y; _y < y + h; _y++) {
		for (let _x = x; _x < x + w; _x++) {
                    this.bitsGrid[_y][_x] = true;
		}
	    }
	}
        
	return {
            success:success,
	    x:x,
	    y:y,
	    w:w,
	    h:h
        };
    }

    bufferEl(event, dt, month) {

        // This is an ironic function.
        //
        // React uses a virtual DOM and so it can't see the real size
        // of things.
        //
        // This makes a real version and drops it into an offscreen
        // buffer to get its real sizing.
        //
        // Then we re-make it virtually.

        let d = document.createElement('div');
        d.className='event';
        d.innerHTML = `<button>Note</button><button>Edit</button>
                       <h3>${month}/${event.title}</h3>
                       <p>${event.text}</p>
                       `;
                         
        d.style.width = (3 * this.state.cell.width) + '%';        
        this.buffer.append(d);
        var b = window.innerHeight;
        var r = d.getBoundingClientRect();
        var h = Math.ceil(((r.height/b) * 100) / this.state.cell.height, 10);
        var w = 3;
        this.buffer.removeChild(d);
        return {
            width:w,
            height:h
        };
    }
    
    makeEls(data) {
        let els = [];
        for (var i=0;i<data.results.length;i++) {
	    let event = data.results[i];
	    let dt = DateTime.fromISO(event.when_happened);
            let month = dt.month;

            let buffered =
                this.bufferEl(event, dt, month);
            
            let res =
                this.doReservation(
                    month,
                    0,
                    buffered.width,
                    buffered.height
                );

            if (res.success) {
                let el = (
                    <Event
                      key={Math.random()}
		      
                      width={res.w * this.state.cell.width + '%'}
                      left={(-1 + res.x) * this.state.cell.width + '%'}
		      
                      height={res.h * this.state.cell.height + '%'}
                      top={10 + res.y * this.state.cell.height + '%'}
		      
                      month={month}
                      dt={dt}
		      event={event}
		      title={event.title}
		      text={event.text}/>);
		
                els.push(el);
            }
        }
        return els;
    }

    getSpan() {
        let _this = this;
	cachios.get(`http://127.0.0.1:8000/events/?${_this.props.timeSpan}`)
	    .then(resp => {
                _this.setState(prevState => ({
		    events: _this.makeEls(resp.data)
                }));
	    }).catch(err => {
	        console.log('Error', err.response.status);
	    });
    }
    
    componentDidMount() {
        this.getSpan();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.timeSpan !== this.props.timeSpan) {
            this.bitsGrid = this.makeGrid();
            this.getSpan();
        }
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        return {
	    center: nextProps.center,
	    offset: nextProps.offset,
            timeSpan: nextProps.timeSpan
        };
    }

    render() {
        const title = this.props.title;
        
        let columns = [];
        for (var i=0;i<this.props.columnCount;i++) {
            columns.push(this.renderColumn(i));
        }
        
        const left = `${((this.props.center * 100) + this.props.offset)}%`;

	const mapped = this.props.title.map((o, i, a) => {
	    const breadSpacer = ((i+1)<a.length) ? ' ▶ ' : '';

	    return (<span key={i} ><Link to={`/timelines?${o.timeSpan}`}>{o.title}</Link>{breadSpacer}</span>)});
	
        return (
            <div className="Panel"
                 id={this.props.center}
            style={{left:left}}>
		<h1>
		{mapped}
		 </h1>
              {columns}
              {this.state.events}
            </div>
        );
    }
}
export default Panel;
