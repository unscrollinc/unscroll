import { DateTime, Interval } from 'luxon';

const YEAR = 365 * 24 * 60 * 60; 

const frames = 
	this.frames = {
	    'millennium': {
		years: 1000,
		resolution:1,
		getTitle:(interval)=>{
		    return interval.start.year();
		},
		offset:(interval, num) => {
		    const value = num * 1000 + ' years';
		    const start = interval.start.plus(value);
		    const end = interval.end.plus(value);
		    const adjustedInterval = Interval.fromDateTimes(start, end);
		    const title = this.getTitle(adjustedInterval);
		    return {title:title, interval:adjustedInterval};
		},
		getAdjustedDt:(dt) => {
		    const beginYear = 1000 * Math.floor(dt.year()/1000, 10);
		    const endYear = beginYear + 999;
		    const span = `start=${beginYear}-01-01T00:00:00&until=${endYear}-12-31T23:59:59`;
		    return span;
		},
		getColumnCount:()=>{
		    return 10;
		},
		getColumnSpan:(begin, ct)=>{
		    const beginYear = begin + (ct * 100); // years;
		    const endYear = beginYear + 999;
		    const span = `start=${beginYear}-01-01T00:00:00&until=${endYear}-12-31T23:59:59`;
		    return span;
		},
		getInterval:(dt) => {
		    const i = Interval.fromDateTimes(dt.startOf('year'), dt.endOf('year'));
		    const span = `start=${i.start.toISO()}&until=${i.end.toISO()}`;
		    return span;
		}
	    },
	    'century': {
	    },
	    'decade': {
	    },
	    'year': {
		getAdjustedDt:(interval) => {
		    console.log('I N T E R V A L', interval.start.startOf('year'));
		    const i = Interval.fromDateTimes(
			interval.start.startOf('year'),
			interval.start.endOf('year'));
		    // const span = `start=${i.start.year}-01-01T00:00:00&until=${i.end.year}-12-31T23:59:59`;
		    return i;
		},
		
		offset:(interval, num) => {
		    const start = interval.start.plus({years: num});
		    const end = interval.end.plus({years: num});
		    const adjustedInterval = Interval.fromDateTimes(start, end);
		    const title = frames['year'].getTitle(adjustedInterval);
		    return {title:title, interval:adjustedInterval};
		},
		getColumnCount:()=>{
		    return 12;
		},		
		getTitle:(interval)=>{
		    return interval.start.year;
		}
	    },
	    'month': {
	    },
	    'week': {
	    },
	    'day': {
	    },
	    'hour': {
	    },
	    'minute': {
	    }
	};

class TimeFrames {
    constructor(interval) {
	this.interval = interval;
	this.seconds = interval.length('seconds');
	this.frame = this.getTimeFrameObject();
    }
    
    getTimeFrameObject() {
	return frames[this.getTimeFrame()];
    }

    getTimeFrame() {
	if (this.seconds > (100 * YEAR)) return 'millennium';
	if (this.seconds > (10 * YEAR)) return 'century';
	if (this.seconds > (YEAR)) return 'decade';
	if (this.seconds > (YEAR/12)) return 'year';
	if (this.seconds > (YEAR/52)) return 'decade';
	if (this.seconds > (YEAR/365)) return 'month';
	if (this.seconds > (YEAR/365 * 60)) return 'day';
	if (this.seconds > (YEAR/365 * 60 * 60)) return 'hour';
	return 'minute';    
    }
}
// The above but `key`ed by `frame`.
// const frames = this.timeFrames.reduce(function(allFrames, frame) {
//    allFrames[frame.frame]=frame;
//    return allFrames;
//},{});

export default TimeFrames;
