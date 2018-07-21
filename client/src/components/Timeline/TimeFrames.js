import { DateTime, Interval } from 'luxon';

const YEAR = 365 * 24 * 60 * 60;

const toSpan = interval => {
  return `start=${interval.start.toISO()}&before=${interval.end.toISO()}`;
};

const frames = {
  millennium: {
    narrow: 'century',
    broaden: 'millennium',
    name: 'millennium',

    getAdjustedDt: interval => {
      const beginYear = 1000 * Math.floor(interval.start.year / 1000, 10);
      const endYear = beginYear + 999;
      const by = DateTime.fromObject({ year: beginYear }).startOf('year');
      const ey = DateTime.fromObject({ year: endYear }).endOf('year');
      const i = Interval.fromDateTimes(by, ey);
      return i;
    },

    format(interval) {
      const c = Math.floor(interval.start.year / 1000) + 1;
      const adjusted = c < 1 ? c - 1 : c;
      const label = adjusted > 0 ? 'A.D.' : 'B.C.';
      const mil = Math.abs(adjusted);
      const first = adjusted.toString().split('')[0];
      if (first === '1') {
        return mil + 'st millennium ' + label;
      }
      if (first === '2') {
        return mil + 'nd millennium ' + label;
      }
      if (first === '3') {
        return mil + 'rd millennium ' + label;
      }
      return mil + 'th millennium ' + label;
    },

    offset: (interval, num) => {
      const start = interval.start.plus({ years: 1000 * num });
      const end = interval.end.plus({ years: 1000 * num });
      const adjustedInterval = Interval.fromDateTimes(start, end);
      const title = frames.century.getTitle(adjustedInterval);
      return {
        title: title,
        interval: adjustedInterval
      };
    },

    getColumnCount: () => {
      return 10;
    },

    getColumnLink: (i, offset) => {
      const start = i.start.plus({ years: 100 * offset });
      const end = i.start.plus({ years: 100 * offset + 99 }).endOf('year');
      const interval = Interval.fromDateTimes(start, end);
      const span = toSpan(interval);
      const title = start.toFormat('kkkk');
      return { span: span, interval: interval, title: title };
    },

    getTitle: interval => {
      const adj = frames.millennium.getAdjustedDt(interval);
      return [
        {
          title: frames.millennium.format(interval),
          timeSpan: toSpan(adj)
        }
      ];
    }
  },

  century: {
    name: 'century',

    narrow: 'decade',

    broaden: 'millennium',

    getAdjustedDt: interval => {
      const beginYear = 100 * Math.floor(interval.start.year / 100, 10);
      const endYear = beginYear + 99;
      const i = Interval.fromDateTimes(
        DateTime.fromObject({ year: beginYear }).startOf('year'),
        DateTime.fromObject({ year: endYear }).endOf('year')
      );
      return i;
    },

    offset: (interval, num) => {
      const start = interval.start.plus({ years: 100 * num });
      const end = interval.end.plus({ years: 100 * num });
      const adjustedInterval = Interval.fromDateTimes(start, end);
      const title = frames.century.getTitle(adjustedInterval);
      return { title: title, interval: adjustedInterval };
    },

    format(interval) {
      const c = Math.floor(interval.start.year / 100) + 1;
      const last = c
        .toString()
        .split('')
        .pop();
      if (last === '1') {
        return c + 'st century';
      }
      if (last === '2') {
        return c + 'nd century';
      }
      if (last === '3') {
        return c + 'rd century';
      }
      return c + 'th century';
    },

    elOffset: dt => {
      return (dt.year - 100 * Math.floor(dt.year / 100, 10)) / 10;
    },

    getColumnCount: () => {
      return 10;
    },

    getColumnLink: (i, offset) => {
      const start = i.start.plus({ years: offset });
      const end = start.endOf('year');
      const interval = Interval.fromDateTimes(start, end);
      const span = toSpan(interval);
      const title = start.year;
      return { span: span, interval: interval, title: title };
    },

    getTitle: interval => {
      const i1 = frames.century.getAdjustedDt(interval);
      return frames.millennium.getTitle(interval).concat({
        title: frames.century.format(interval),
        timeSpan: toSpan(i1)
      });
    }
  },

  decade: {
    name: 'decade',
    narrow: 'year',
    broaden: 'century',
    getAdjustedDt: interval => {
      const beginYear = 10 * Math.floor(interval.start.year / 10, 10);
      const endYear = beginYear + 9;
      const i = Interval.fromDateTimes(
        DateTime.fromISO(beginYear).startOf('year'),
        DateTime.fromISO(endYear).endOf('year')
      );
      return i;
    },
    offset: (interval, num) => {
      const start = interval.start.plus({ years: 10 * num });
      const end = interval.end.plus({ years: 10 * num });
      const adjustedInterval = Interval.fromDateTimes(start, end);
      const title = frames['decade'].getTitle(adjustedInterval);
      return { title: title, interval: adjustedInterval };
    },

    elOffset: dt => {
      return dt.year - 10 * Math.floor(dt.year / 10, 10);
    },

    format(interval) {
      return Math.floor(interval.start.year / 10) * 10 + 's';
    },

    getColumnCount: () => {
      return 10;
    },

    getColumnLink: (i, offset) => {
      const start = i.start.plus({ years: offset });
      const end = start.endOf('year');
      const interval = Interval.fromDateTimes(start, end);
      const span = toSpan(interval);
      const title = start.toFormat('kkkk');
      return { span: span, interval: interval, title: title };
    },

    getTitle: interval => {
      const i1 = frames.decade.getAdjustedDt(interval);
      return frames['century'].getTitle(interval).concat({
        title: frames.decade.format(interval),
        timeSpan: toSpan(i1)
      });
    }
  },

  year: {
    name: 'year',
    narrow: 'month',
    broaden: 'decade',

    getAdjustedDt: interval => {
      const i = Interval.fromDateTimes(
        interval.start.startOf('year'),
        interval.start.endOf('year')
      );
      // const span = `start=${i.start.year}-01-01T00:00:00&until=${i.end.year}-12-31T23:59:59`;
      return i;
    },

    offset: (interval, num) => {
      const start = interval.start.plus({ years: num });
      const end = interval.end.plus({ years: num });
      const adjustedInterval = Interval.fromDateTimes(start, end);
      const title = frames['year'].getTitle(adjustedInterval);
      return { title: title, interval: adjustedInterval };
    },

    elOffset: dt => {
      return dt.month - 1;
    },

    getColumnCount: () => {
      return 12;
    },

    getColumnLink: (i, offset) => {
      const start = i.start.plus({ months: offset });
      const end = start.endOf('month');
      const interval = Interval.fromDateTimes(start, end);
      const span = toSpan(interval);
      const title = start.toFormat('MMMM');
      return { span: span, interval: interval, title: title };
    },

    getTitle: interval => {
      const i1 = frames.year.getAdjustedDt(interval);
      return frames['decade'].getTitle(interval).concat({
        title: interval.start.year,
        timeSpan: toSpan(i1)
      });
    }
  },

  month: {
    name: 'month',
    narrow: 'day',
    broaden: 'year',

    getAdjustedDt: interval => {
      const i = Interval.fromDateTimes(
        interval.start.startOf('month'),
        interval.start.endOf('month')
      );
      return i;
    },

    offset: (interval, num) => {
      const start = interval.start.plus({ months: num });
      const end = interval.end.plus({ months: num });
      const adjustedInterval = Interval.fromDateTimes(start, end);
      const title = frames['month'].getTitle(adjustedInterval);
      return { title: title, interval: adjustedInterval };
    },

    getColumnCount: interval => {
      return interval.start.endOf('month').day;
    },

    elOffset: dt => {
      return dt.day - 1;
    },

    getColumnLink: (i, offset) => {
      const start = i.start.plus({ days: offset });
      const end = start.endOf('day');
      const interval = Interval.fromDateTimes(start, end);
      const timeSpan = toSpan(interval);
      const title = start.toFormat('d');
      return {
        timeSpan: timeSpan,
        interval: interval,
        title: title
      };
    },

    getTitle: interval => {
      const i1 = frames.month.getAdjustedDt(interval);
      return frames.year.getTitle(interval).concat({
        title: interval.start.toFormat('MMMM'),
        timeSpan: toSpan(i1)
      });
    }
  },

  day: {
    name: 'day',
    narrow: 'hour',
    broaden: 'month',

    getAdjustedDt: interval => {
      const i = Interval.fromDateTimes(
        interval.start.startOf('day'),
        interval.start.endOf('day')
      );
      return i;
    },

    offset: (interval, num) => {
      const start = interval.start.plus({ days: num });
      const end = interval.end.plus({ days: num });
      const adjustedInterval = Interval.fromDateTimes(start, end);
      const title = frames['day'].getTitle(adjustedInterval);
      return { title: title, interval: adjustedInterval };
    },

    getColumnCount: interval => {
      return 24;
    },

    getColumnLink: (i, offset) => {
      const start = i.start.plus({ hours: offset });
      const end = start.endOf('hour');
      const interval = Interval.fromDateTimes(start, end);
      const span = toSpan(interval);
      const title = start.toFormat('ha');
      return { span: span, interval: interval, title: title };
    },
    format: date => {
      return DateTime.fromISO(date).toFormat('DDDD');
    },
    getTitle: interval => {
      return frames['month'].getTitle(interval).concat({
        title: interval.start.toFormat('DDDD'),
        timeSpan: toSpan(interval)
      });
    }
  },

  hour: {
    name: 'hour',
    narrow: 'minute',
    broaden: 'day',
    getAdjustedDt: interval => {
      const i = Interval.fromDateTimes(
        interval.start.startOf('hour'),
        interval.start.endOf('hour')
      );
      return i;
    },

    offset: (interval, num) => {
      const start = interval.start.plus({ hours: num });
      const end = interval.end.plus({ hours: num });
      const adjustedInterval = Interval.fromDateTimes(start, end);
      const title = frames['hour'].getTitle(adjustedInterval);
      return { title: title, interval: adjustedInterval };
    },

    getColumnCount: interval => {
      return 12;
    },

    getColumnLink: (i, offset) => {
      const start = i.start.plus({ minutes: offset * 5 });
      const end = start.plus({ minutes: 5 + offset * 5 }).endOf('minute');
      const interval = Interval.fromDateTimes(start, end);
      const span = toSpan(interval);
      const title = start.toFormat('m');
      return { span: span, interval: interval, title: title };
    },

    getTitle: interval => {
      return frames['month'].getTitle(interval).concat({
        title: interval.start.toFormat('DDDD hma'),
        timeSpan: toSpan(interval)
      });
    }
  },
  minute: {
    name: 'minute',
    narrow: 'minute',
    broaden: 'hour',
    getColumnCount: () => {
      return 12;
    }
  }
};

class TimeFrames {
  // Give me a luxon Interval and I'll pick a timeframe for you.

  constructor(interval) {
    this.interval = interval;
    this.seconds = interval.length('seconds');
    this.frame = this.getTimeFrameObject();
  }

  getTimeFrameObject() {
    return frames[this.getTimeFrame()];
  }

  getTimeFrame() {
    if (this.seconds > 100 * YEAR) return 'millennium';
    if (this.seconds > 10 * YEAR) return 'century';
    if (this.seconds > YEAR) return 'decade';
    if (this.seconds > YEAR / 11) return 'year';
    if (this.seconds > YEAR / 365) return 'month';
    if (this.seconds > YEAR / (365 * 24)) return 'day';
    if (this.seconds > YEAR / (365 * 24 * 60)) return 'hour';
    return 'minute';
  }
}
// The above but `key`ed by `frame`.
// const frames = this.timeFrames.reduce(function(allFrames, frame) {
//    allFrames[frame.frame]=frame;
//    return allFrames;
//},{});
export { frames };
export default TimeFrames;
