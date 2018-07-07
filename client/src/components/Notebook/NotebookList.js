import React from 'react';
import { Link } from 'react-router-dom' ;
import { DateTime } from 'luxon';
import axios from 'axios';
import utils from '../Util/Util';
class NotebookList extends React.Component {

    constructor(props, context) {
	super(props);
	this.state = {
	    notebooks:[],
            username:utils.getUsernameFromCookie()
	};
    }

    getEditLink(notebook) {
        if (notebook.user_username===this.state.username) {
            return (<Link
                    className="button"
                    to={'/notebooks/' + notebook.user_username + '/' + notebook.id + '/edit'}>Edit</Link>);
        }
        return null;
    }
    
    getNotebooks() {
        if (this.props.my === true) {
            utils.GET(this, 'notebooks', {'by_user__username':'ford'});
        }
        else {
            utils.GET(this, 'notebooks', {'is_public':true});
        }
    }

    componentDidMount() {
        this.getNotebooks();
    }
    
    renderNotebook(notebook) {

        const formatDate = (dt) => {
            const luxonDt = DateTime.fromISO(dt);
            return luxonDt.toLocaleString(DateTime.DATE_SHORT);
        };

        const privacy = notebook.is_public ? 'Public' : 'Private';

	return(
            <tr className='list-object-tr' key={notebook.uuid}>
	      
              <td className='list-object-date-td'>
                <div>{formatDate(notebook.when_created)}</div>
                <div><Link to={'/users/' + notebook.user_username}>{notebook.user_full_name}</Link></div>
              </td>
              
              <td className='list-object-meta-td'>
                
	        <div className='list-object-title'>
                  <Link to={'/notebooks/'
                            + notebook.user_username
                            + '/'
                            + notebook.id
                        }>{notebook.title}</Link>
                </div>
                
		<div>

		  <span className='list-object-description'>{notebook.description}</span>
		</div>
                
	      </td>

              <td className='list-object-published-td'>
		<div className={`list-object-published-${privacy}`}>{privacy}</div>
                {this.getEditLink(notebook)}
              </td>
	      
            </tr>
	);
    }
    
    render() {
        return (
	    <div className="NotebookList">                
              <div className="list-object">
                <div className="notebook-header">
                  <div className="list-object-header">
		    <h1>Notebooks</h1>
                    
		    <Link className="list-object-button" to='/my/notebooks'>Mine</Link>
		    <Link className="list-object-button" to='/notebooks'>All</Link>
	            <button onClick={this.addNotebook}>+ New</button>
                  </div>
                  
		  <table className="list-object-table">
		    <tbody>
                      
                      <tr className='list-object-tr'>
                        <th className='list-object-date-th'>Date</th>
                        <th className='list-object-meta-th'>Notebook</th>
                        <th className='list-object-published-th'>Published</th>
                      </tr>
                      
                      {Array.from(this.state.notebooks).map(this.renderNotebook.bind(this))}
                      
                    </tbody>
                  </table>
                </div>
              </div>
            </div>                    
        );
    }
}

export default NotebookList;
