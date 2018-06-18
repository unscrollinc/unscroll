import React from 'react';
import ReactDOM from 'react-dom';
import AppContext from '../AppContext';

class TimelineList extends React.Component {

    makeScroll(scrollEntry, i) {
        const context = this;
        const [key, scroll] = scrollEntry;
	return(
            <tr key={key}>
              <th>
	        <span
                  onClick={
                  (e) => {context.loadScroll(scroll);}}>
                  {scroll.title}
                </span>
              </th>
              <td>
	        <button onClick={()=>{context.deleteScroll(scroll.uuid);}}>Del</button>
              </td>
              <td>
		{scroll.is_public ? '*' : '-'}
              </td>
            </tr>
	);
    }
    
    
    render() {
	return (
            <AppContext.Consumer>
              {(context) => {
                  return (
                      <table className="scroll-list">
                        <tbody>
                          {Array.from(context.state.user.scrollList).map(this.makeScroll.bind(context))}
                        </tbody>
                      </table>		      
                  );
	      }}
              </AppContext.Consumer>                  
	);
    }
}

export default TimelineList;
