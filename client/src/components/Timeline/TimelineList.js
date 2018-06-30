import React from 'react';
import { Link } from 'react-router-dom' ;
import { DateTime } from 'luxon';

import AppContext from '../AppContext.js';

class TimelineList extends React.Component {
    
    makeScroll(scrollEntry, i) {

	const context = this;
	
        const formatDate = (dt) => {
            const luxonDt = DateTime.fromISO(dt);
            return luxonDt.toLocaleString(DateTime.DATE_SHORT);
        };
        
        const [key, scroll] = scrollEntry;

	return(
            <tr key={key}>
              <td>
		{scroll.is_public ? 'X' : '-'}
             </td>
                
              <td>
                {formatDate(scroll.when_created)}
              </td>
              
              <td className="timeline-list-title">
	        <Link to={'/timelines/' + scroll.uuid + '/edit'}>{scroll.title}</Link>
                <div className="description">{scroll.description}</div>
              </td >

            </tr>
	);
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
                              {Array.from(context.state.user.scrollList).map(this.makeScroll.bind(context))}
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

export default TimelineList;

