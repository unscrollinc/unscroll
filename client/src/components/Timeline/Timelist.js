import React from 'react';
import 'react-virtualized/styles.css';
//import {DateTime, Interval} from 'luxon';
import cachios from 'cachios';
import AppContext from '../AppContext';
import TimelistEvent from './TimelistEvent';

const API='http://127.0.0.1:8000/events/';

class Timelist extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            search:{},
            events:[],
            doGetNext:false,
            fetchUrl:undefined,
            nextUrl:undefined,
	    ...props
        };
	console.log(props);
	console.log('GOT ALL INSTANTIATED AGAIN');
	
    }

    makeEls(data) {
        return data.results.map((e, i)=> {
            return (<TimelistEvent
                    key={e.uuid}
                    lastTime={i>0?data.results[i-1].when_happened:undefined}
                    event={e}/>);
        });
    }
    
    getSpan(url) {
        const _this = this;
	cachios.get(url)
	    .then(resp => {
                const _els = _this.makeEls(resp.data);
                _this.setState(prevState => ({
		    events: _this.state.events.concat(_els),
                    nextUrl: resp.data.next,
                    doGetNext: false
                }));
	    }).catch(err => {
	        console.log('Error', err.response.status);
	    });
    }

    manageSearch(context) {
        const q = context.state.timeline.search.q;

        // I want to assign local state from the App `context`.
        
        // You can't really call a component.setState() inside
        // `context` change because it gets called a zillion
        // times. And a `shouldComponentUpdate()` would make sense but
        // it's not aware of `context`.

        // So we just do a string comparison filter, which'll always
        // be pretty fast.

	// (TODO there are some ways to read context as props.)
        
        if (q && this.state.search.q!==q) {
	    console.log('made it to manageSearch comparison');
	    
            this.setState(prevState =>
                          ({events:[],
                            nextUrl:undefined,
                            doGetNext:false,
                            search:context.state.timeline.search}),
                          this.getSpan(`${API}?q=${q}&limit=50`));
        }
        
        return undefined;
    }

    kickoff() {
	const url = this.state.uuid
	      ? `${API}?in_scroll=${this.state.uuid}&`
	      : `${API}?`;
        this.setState(prevState => ({events:[]}),
                      this.getSpan(`${url}q=&limit=20&offset=0`));
    }
    componentDidMount() {
	this.kickoff();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
	if (this.state.uuid !== this.props.uuid) {
	    this.setState({uuid:this.props.uuid}, this.kickoff);
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
                    _this.getSpan(this.state.nextUrl)
                );
            }
        }
    }
    
    render() {
        return(
            <div className="Timelist" onScroll={this.handleScroll.bind(this)}>
              <div>
                <AppContext.Consumer>
                  {(context)=>this.manageSearch(context)}
		</AppContext.Consumer>
		<table className="timelist">
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


