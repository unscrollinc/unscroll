import React from 'react';
import { Link } from 'react-router-dom' ;
import { DateTime } from 'luxon';
import AppContext from '../AppContext.js';
import utils from '../Util/Util.js';

class TimelineList extends React.Component {

    constructor(props, context) {
        super(props);
        this.state = {scrolls:[]}
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

                  <div>{formatDate(scroll.when_created)}</div>
                  <div><Link to={'/users/' + scroll.user_username}>{scroll.user_full_name}</Link></div>
                </td>
                
                <td className="list-object-meta-td">
	          <div className="list-object-title"><Link to={'/timelines/' + scroll.uuid}>{scroll.title}</Link></div>
                  <div className="list-object-description"
		       dangerouslySetInnerHTML={{__html:scroll.description}}/>
                </td>
                
              <td className={`list-object-published-td`}>
		<div className={`list-object-published-${privacy}`}>{privacy}</div>
              </td>
              
            </tr>

            
	);
    }

    getTimelines() {
        if (this.props.my === true) {
            utils.GET(this, 'scrolls', {'by_user__username':'ford'});
        }
        else {
            utils.GET(this, 'scrolls', {'is_public':true});
        }
    }

    componentDidMount() {
        this.getTimelines();
    }
    
    render() {
	return (
	    <div className="TimelineList">
	      
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
                              
                                {this.state.scrolls.map(this.makeScroll)}
                                
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
    
