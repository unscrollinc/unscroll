import React from 'react';
import { Link } from 'react-router-dom' ;
import { DateTime } from 'luxon';
import axios from 'axios';
import AppContext from '../AppContext.js';
import util from '../Util/Util.js';

class TimelineList extends React.Component {

    constructor(props, context) {
        super(props);
        this.state = {timelines:[],
                      auth:util.getAuthHeaderFromCookie()};
    }
    
    makeScroll(scroll) {
        const formatDate = (dt) => {
            const luxonDt = DateTime.fromISO(dt);
            return luxonDt.toLocaleString(DateTime.DATE_SHORT);
        };

        const privacy = scroll.is_public ? 'Public' : 'Private';
        
	return(
            <tr className="list-object-tr" key={scroll.uuid}>

                <td className="list-object-date-td">

                {formatDate(scroll.when_created)}
              </td>
              
              <td className="list-object-meta-td">
	        <div className="list-object-title"><Link to={'/timelines/' + scroll.uuid}>{scroll.title}</Link></div>
                <div>By <Link to={'/timelines/by/' + scroll.user_username}>{scroll.user_username}</Link></div>
                <div className="list-object-description">{scroll.description}</div>
              </td>
              
                <td className={`list-object-published-td`}>
		<div className={`list-object-published-${privacy}`}>{privacy}</div>
             </td>

            </tr>

            
	);
    }

    getTimelines() {
        const _this = this;
        axios({
            method:'get',
            headers:this.state.auth,
            url:(this.props.my === true)
                ? 'http://127.0.0.1:8000/scrolls/?by_user__username=ford'
                : 'http://127.0.0.1:8000/scrolls/'
        })
            .then(resp => {
                _this.setState({timelines:resp.data.results});
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
                        <div className="list-object">
                          <div className="list-object-header">
                            <h1>Timelines</h1>
                            <Link className="list-object-button" to="/my/timelines">Mine</Link>
                            <Link className="list-object-button" to="/timelines">All</Link>
	                    <button onClick={context.addScroll}>+ New</button>
                            
                            
			    <table className="list-object-table">
                              <tbody>
                                <tr className="list-object-tr">
                                  <th className='list-object-date-th'>Date</th>
                                  <th className='list-object-meta-th'>Timeline</th>
                                  <th className='list-object-published-th'>Published</th>
                                </tr>
                              
                                {this.state.timelines.map(this.makeScroll)}
                                
                              </tbody>
                            </table>
                          </div>
                        </div>                        
                    );
		}}
                </AppContext.Consumer>
	  </div>
	);
    }
}


export default TimelineList;
    
