import React from 'react';
import { DateTime } from 'luxon';
import en from 'chrono-node';
const chrono = en;
const resolutions = {
    0: 'DDDD',
    4: 'y G',
    6: 'MMMM y G',
    8: 'EEEE, d MMMM y G',
    10: 'EEEE, d MMMM y G @ h a',
    12: 'EEEE, d MMMM y G @ h:mm a',
    14: 'EEEE, d MMMM y G @ h:mm:ss a',
    18: 'EEEE, d MMMM y G @ h:mm:ss a'
};

const implyLateStart = incomingParsedDate => {
    let pr = incomingParsedDate;
    pr.start.assign('timezoneOffset', 0);
    pr.start.imply('day', 31);
    pr.start.imply('month', 12);

    if (pr.start.year > 1882) {
        pr.start.imply('hour', 23);
        pr.start.imply('minute', 59);
        pr.start.imply('second', 59);
        pr.start.imply('millisecond', 999);
    }

    console.log('reutrning pr', pr.start.date());
    return pr;
};

var BCParser = new chrono.Parser();
BCParser.pattern = function() {
    return /^(\d+)\s*(bc|b\.?\s*c\.?|before christ)$/i;
};

BCParser.extract = function(text, ref, match, opt) {
    let pr = new chrono.ParsedResult({
        ref: ref,
        text: match[1] + ' ' + match[2],
        index: match.index,
        start: {
            year: 0 - parseInt(match[1], 10)
        }
    });
    return implyLateStart(pr);
};

var NegativeParser = new chrono.Parser();
NegativeParser.pattern = function() {
    return /^(-\d+)\s*$/i;
};
NegativeParser.extract = function(text, ref, match, opt) {
    let pr = new chrono.ParsedResult({
        ref: ref,
        text: match[0],
        index: match.index,
        start: {
            year: parseInt(match[1], 10)
        }
    });
    return implyLateStart(pr);
};

var CenturyParser = new chrono.Parser();
CenturyParser.pattern = function() {
    return /(\d\d)(th|nd|st|rd)\s*(c\.?|cent\.?|century)?\s*/i;
};
CenturyParser.extract = function(text, ref, match, opt) {
    const x = parseInt(match[1] - 1, 10) * 100;
    const bcMatch = text.match(/(bc|b\.?\s*c\.?|before christ)/);
    const isBC = bcMatch ? true : false;
    const adj = isBC ? 0 - x : x;
    let pr = new chrono.ParsedResult({
        ref: ref,
        text: match[0] + ' ' + match[1],
        index: match.index,
        start: {
            year: adj
        }
    });
    return implyLateStart(pr);
};

var PositiveParser = new chrono.Parser();
PositiveParser.pattern = function() {
    return /^(\+\d+)\s*$/;
};
PositiveParser.extract = function(text, ref, match, opt) {
    console.log({ text: text, ref: ref, match: match, opt: opt });
    let pr = new chrono.ParsedResult({
        ref: ref,
        text: match[0],
        index: match.index,
        start: {
            year: parseInt(match[0], 10)
        }
    });
    const x = implyLateStart(pr);
    return x;
};

var custom = new en.Chrono();
custom.parsers.push(BCParser);
custom.parsers.push(NegativeParser);
custom.parsers.push(CenturyParser);
custom.parsers.push(PositiveParser);

class Timelist extends React.Component {
    constructor(props) {
        super(props);
        // update is a function that grabs the state
        this.editSeveral = props.editSeveral;

        this.state = {
            when_original: null,
            when_happened: null,
            resolution: null,
            parsed: null,
            okay: false
        };
    }

    scoreResolution(kp) {
        if (kp.second) return 14;
        if (kp.minute) return 12;
        if (kp.hour) return 10;
        if (kp.day) return 8;
        if (kp.month) return 6;
        if (kp.year) return 4;
        return 0;
    }

    parseDT(e) {
        const possibleDate = e.target.value;
        const prefix = possibleDate.match(/^\d+$/) ? '+' : '';
        const parsedDate = custom.parse(`${prefix}${possibleDate}`);
        const didIt = parsedDate.length > 0;
        const resolution = didIt
            ? this.scoreResolution(parsedDate[0].start.knownValues)
            : 0;
        const justDate = didIt
            ? DateTime.fromJSDate(parsedDate[0].start.date())
            : null;
        const asString = justDate
            ? justDate.toFormat(resolutions[resolution])
            : 'No date';
        this.setState({
            okay: didIt ? true : false,
            when_original: possibleDate,
            parsed: asString,
            resolution: resolution,
            when_happened: justDate
        });
        this.props.updateWhen(asString);
        if (didIt) {
            this.editSeveral({
                resolution: resolution,
                when_original: possibleDate,
                when_happened: justDate.toISO()
            });
        }
    }

    render() {
        return (
            <div className={'event-input passed-' + this.state.okay}>
                <input
                    defaultValue={this.props.when_original}
                    onChange={this.parseDT.bind(this)}
                />
            </div>
        );
    }
}

export default Timelist;
