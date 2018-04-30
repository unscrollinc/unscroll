import React from 'react';
import 'react-virtualized/styles.css';
import { InfiniteLoader, List } from 'react-virtualized';
import {DateTime, Interval} from 'luxon';
import cachios from 'cachios';
import TimelistEvent from './TimelistEvent';

class Timelist extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            events:[],
            doGetNext:false,
            nextUrl:undefined
        };
    }

    makeEls(data) {
        return data.results.map((e, i)=> {
            return (<TimelistEvent lastTime={i>0?data.results[i-1].when_happened:undefined} event={e}/>);
        });
    }
    
    getSpan(url) {
        let _url = url ? url : `http://127.0.0.1:8000/events/?limit=100`;
        let _this = this;
	cachios.get(_url)
	    .then(resp => {
                let els = _this.makeEls(resp.data);
                _this.setState(prevState => ({
		    events: _this.state.events.concat(_this.makeEls(resp.data)),
                    nextUrl: resp.data.next,
                    doGetNext: false
                }));
	    }).catch(err => {
	        console.log('Error', err.response.status);
	    });
    }

    componentDidMount() {
        this.getSpan();
    }

    handleScroll(e) {
        let _this = this;        
        let t = e.nativeEvent.target;
        var d = t.scrollHeight - t.scrollTop;
        if (d < 1000) {
            if (!this.state.doGetNext) {
                _this.setState(
                    prevState => ({doGetNext:true}),
                    _this.getSpan(this.state.nextUrl)
                );
            }
        }
    }
    render() {
        return(
            <div className="Timelist" onScroll={this.handleScroll.bind(this)}>
              <h1>Timelist</h1>
              Start: <input type="range" min="1968" max="2018"/>
              <div>
                {this.state.events}
              </div>
            </div>
        );
    }
}

export default Timelist;
