import { DateTime, Interval } from 'luxon';

const YEAR = 365 * 24 * 60 * 60; 

const toSpan = (interval) => {
    return `start=${interval.start.toISO()}&before=${interval.end.toISO()}`;
}

const frames = 
	this.frames = {
	    'millennium': {
                narrow:'century',
                broaden:'millennium',
                name:'millennium',
                
		getAdjustedDt:(interval) => {
		    const beginYear = 1000 * Math.floor(interval.start.year()/1000, 10);
		    const endYear = beginYear + 999;
		    const i = Interval.fromDateTimes(
                        DateTime.fromISO(beginYear).startOf('year'),
                        DateTime.fromISO(endYear).endOf('year'));
		    return i;
		},
		
		offset:(interval, num) => {
		    const start = interval.start.plus({years: 1000 * num});
		    const end = interval.end.plus({years: 1000 * num});
		    const adjustedInterval = Interval.fromDateTimes(start, end);
		    const title = frames['millennium'].getTitle(adjustedInterval);
		    return {title:title, interval:adjustedInterval};
		},
		
		getColumnCount:()=>{
		    return 10;
		},

                getColumnLink:(i, offset)=>{
                    const start = i.start.plus({years:100*offset});
                    const end = start.endOf('century');
                    const interval = Interval.fromDateTimes(start, end);
                    const span = toSpan(interval);
                    const title = start.toFormat('MMMM');
                    return {span:span, interval:interval, title:title};
                },
                    
		getTitle:(interval)=>{
		    return interval.start.year;
		}

	    },
	    'century': {
                name:'century',
                narrow:'decade',
                broaden:'millennium',
		getColumnCount:()=>{
		    return 10;
		},                
	    },
	    'decade': {
                name:'decade',
                narrow:'year',
                broaden:'century',
		getColumnCount:()=>{
		    return 10;
		},                                
	    },
	    'year': {
                name:'year',                
                narrow:'month',
                broaden:'decade',
                
		getAdjustedDt:(interval) => {
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

                getColumnLink:(i, offset)=>{
                    const start = i.start.plus({months:offset});
                    const end = start.endOf('month');
                    const interval = Interval.fromDateTimes(start, end);
                    const span = toSpan(interval);
                    const title = start.toFormat('MMMM');
                    return {span:span, interval:interval, title:title};
                },
                    
		getTitle:(interval)=>{
		    return interval.start.year;
		}
	    },
	    'month': {
                name:'month',
                narrow:'day',
                broaden:'year',
                
		getAdjustedDt:(interval) => {
		    const i = Interval.fromDateTimes(
			interval.start.startOf('month'),
			interval.start.endOf('month'));
		    return i;
		},
		
		offset:(interval, num) => {
		    const start = interval.start.plus({months: num});
		    const end = interval.end.plus({months: num});
		    const adjustedInterval = Interval.fromDateTimes(start, end);
		    const title = frames['month'].getTitle(adjustedInterval);
		    return {title:title, interval:adjustedInterval};
		},
		
		getColumnCount:(interval)=>{
		    return interval.start.endOf('month').day;
		},

                getColumnLink:(i, offset)=>{
                    const start = i.start.plus({days:offset});
                    const end = start.endOf('day');
                    const interval = Interval.fromDateTimes(start, end);
                    const span = toSpan(interval);
                    const title = start.toFormat('d');
                    return {span:span, interval:interval, title:title};
                },
                    
		getTitle:(interval)=>{
		    return interval.start.toFormat('MMMM kk');
		}
	    },
	    'day': {
                name:'day',                
                narrow:'hour',
                broaden:'month',
		getColumnCount:()=>{
		    return 24;
		},                                                              
	    },
	    'hour': {
                name:'hour',                                
                narrow:'minute',
                broaden:'day',
		getColumnCount:()=>{
		    return 12;
		},                                                              
	    },
	    'minute': {
                name:'minute',                                                
                narrow:'minute',
                broaden:'hour',
		getColumnCount:()=>{
		    return 12;
		},                                                                              
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
