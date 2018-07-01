import React from 'react';
import { Link } from 'react-router-dom' ;
import { DateTime } from 'luxon';
import axios from 'axios';
import AppContext from '../AppContext.js';

class TimelineList extends React.Component {
    constructor(props, context) {
        super(props);
        this.state = {timelines:[],
                      auth:this.props.context.getAuthHeaderFromCookie};
    }
    
    makeScroll(scroll) {
        const formatDate = (dt) => {
            const luxonDt = DateTime.fromISO(dt);
            return luxonDt.toLocaleString(DateTime.DATE_SHORT);
        };
        
	return(
            <tr key={scroll.uuid}>
              <td>
		{scroll.is_public ? 'X' : '-'}
             </td>
                
              <td>
                {formatDate(scroll.when_created)}
              </td>
              
              <td className="timeline-list-title">
	        <Link to={'/timelines/' + scroll.uuid}>{scroll.title}</Link>
                <div className="description">{scroll.description}</div>
              </td >

            </tr>
	);
    }

    getTimelines() {

        const _this = this;
        console.log('called getTimelines');
        axios({
            method:'get',
            url:'http://localhost:8000/scrolls/',
            header:this.state.auth
        })
            .then(resp => {
                _this.setState({timelines:resp.data});
            })
            .catch(err => {
                console.log(err);
            });
    }

    componentDidMount() {
        this.getTimelines();
    }
    
    render() {
	return (
	    <div className="Editor">
	      
              <AppContext.Consumer>
		{(context) => {
                    return (
                        <React.Fragment>

                          <table className="notebook-header">
                            <tbody>
                              <tr>
                                <td>Timelines</td>
                                <td>
	                          <button onClick={context.addScroll}>+ New</button>
                                </td>
                                <td><Link to="/my/timelines">Mine</Link></td>
                                <td><Link to="/timelines">All</Link></td>
                              </tr>
                            </tbody>
                          </table>
                          
			  <table className="timeline-list">
                            <tbody>
                              <tr>
                            <th>Public?</th>
                            <th>Date</th>
                            <th>Title</th>

                              </tr>
                              {this.state.timelines.map(this.makeScroll.bind(context))}
                            </tbody>
                          </table>
			  
                        </React.Fragment>                        
                    );
		}}
                </AppContext.Consumer>
	  </div>
	);
    }
}


export default props => (
  <AppContext.Consumer>
    {context => <TimelineList {...props} context={context} />}
  </AppContext.Consumer>
);


