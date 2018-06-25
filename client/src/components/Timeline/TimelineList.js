import React from 'react';
import { Link } from 'react-router-dom' ;
import AppContext from '../AppContext.js';
import { DateTime } from 'luxon';


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
                {formatDate(scroll.when_created)}
              </td>
              
              <td className="timeline-list-title">
	        <Link to={'/timelines/' + scroll.uuid}>{scroll.title}</Link>
              </td >

              <td>
	        <button onClick={()=>{context.deleteScroll(scroll.uuid);}}>Del</button>
              </td>              

              <td>
		{scroll.is_public ? 'Published' : 'Private'}
              </td>
              
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
                                <th>Date</th>
                                <th>Title</th>
                                <th>Delete</th>
                                <th>Public?</th>                                          
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

