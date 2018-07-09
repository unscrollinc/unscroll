import React from 'react';
import 'react-virtualized/styles.css';
// import {DateTime, Interval} from 'luxon';
// import cachios from 'cachios';
import axios from 'axios';
import TimelistEvent from './TimelistEvent';
import TimelistTitleEditor from './TimelistTitleEditor';
import utils from '../Util/Util';
const API='http://localhost/api/events/';

class Timelist extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            search:{},
            events:[],
            scroll:{},
            doGetNext:false,
            isSaved:true,
            fetchUrl:undefined,
            nextUrl:undefined
        };
    }

    scrollChange(k, v) {
        this.setState({[k]:v, isSaved:false}, ()=>{console.log(this.state);});
    }
    
    makeEls(data) {
        return data.results.map((e, i)=> {
            return (<TimelistEvent
                    key={e.uuid}
                    lastTime={i>0?data.results[i-1].when_happened:undefined}
                    event={e}/>);
        });
    }
    
    getEvents(url) {
        const _this = this;
	const order = '&order=when_happened';
	const ordering_url = url.includes(order) ? url : url + order;
	axios({
            method:'get',
            url:ordering_url,
	    headers:utils.getAuthHeaderFromCookie(),
        })
	    .then(resp => {
                const _els = _this.makeEls(resp.data);
                _this.setState(prevState => ({
		    events: prevState.events.concat(_els),
                    nextUrl: resp.data.next,
                    count: resp.data.count,
                    doGetNext: false
                }));
	    }).catch(err => {
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
        
        if (q && this.state.search.q!==q) {
            this.setState(prevState =>
                          ({events:[],
                            nextUrl:undefined,
                            doGetNext:false,
                            search:this.state.timeline.search}),
                          this.getEvents(`${API}?q=${q}&limit=50`));
        }
        
        return undefined;
    }

    kickoff() {
	const url = this.props.uuid
	      ? `${API}?in_scroll_uuid=${this.props.uuid}&`
	      : `${API}?`;
        this.setState(prevState => ({events:[]}),
                      this.getEvents(`${url}q=&limit=20&offset=0`));
    }
    
    componentDidMount() {
	this.kickoff();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
	if (this.props.uuid !== prevProps.uuid) {
            this.kickoff();
	}
    }
    
    handleScroll(e) {
        let _this = this;        
        let t = e.nativeEvent.target;
        var d = t.scrollHeight - t.scrollTop;
        if (d < 1000) {
            if (!this.state.doGetNext) {
                _this.setState(
                    prevState => ({doGetNext:true}),
                    _this.getEvents(this.state.nextUrl)
                );
            }
        }
    }

    render() {
        return(
	        <div key="timelist" className="Timelist">
                  <div className="list-object">
	            <TimelistTitleEditor key={`tti-${this.props.uuid}`} count={this.state.count} {...this.props}/>
                <table key={`ttit-${this.props.uuid}`} className="list-object-table">
		<tbody>
                  {this.state.events}
   		</tbody>
	        </table>
                </div>
	    </div>
        );
    }
}

export default Timelist;
