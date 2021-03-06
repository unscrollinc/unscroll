import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DateTime } from 'luxon';
// import axios from 'axios';
import utils from '../Util/Util';
import { Scrollbars } from 'react-custom-scrollbars';

class NotebookList extends React.Component {
    constructor(props, context) {
        super(props);
        this.state = {
            notebooks: [],
            username: utils.getUsernameFromCookie()
        };
    }

    renderEditLink(notebook) {
        if (notebook.user_username === this.state.username) {
            return (
                <Link
                    className="button edit-link"
                    to={
                        '/notebooks/' +
                        notebook.user_username +
                        '/' +
                        notebook.id +
                        '/edit'
                    }
                >
                    Edit
                </Link>
            );
        }
        return null;
    }

    addNotebook() {
        console.log('ADDING NOTEBOOK');
    }

    getNotebooks() {
        if (this.props.my === true) {
            document.title = 'My Notebooks (Unscroll)';
            utils.GET(this, 'notebooks', { by_user__username: 'ford' });
        } else {
            document.title = 'Notebooks (Unscroll)';
            utils.GET(this, 'notebooks', { is_public: true });
        }
    }

    componentDidMount() {
        this.getNotebooks();
    }

    renderNotebook(notebook) {
        const formatDate = dt => {
            const luxonDt = DateTime.fromISO(dt);
            return luxonDt.toLocaleString(DateTime.DATE_SHORT);
        };

        const privacy = notebook.is_public ? 'Public' : 'Private';

        return (
            <tr className="list-object-tr" key={notebook.uuid}>
                <td className="list-object-date-td">
                    <div>{formatDate(notebook.when_created)}</div>
                    <div>
                        <Link to={'/users/' + notebook.user_username}>
                            {notebook.user_full_name}
                        </Link>
                    </div>
                </td>

                <td className="list-object-meta-td">
                    <div className="list-object-title">
                        <Link
                            to={
                                '/notebooks/' +
                                notebook.user_username +
                                '/' +
                                notebook.id
                            }
                        >
                            {notebook.title}
                        </Link>{' '}
                        {this.renderEditLink(notebook)}
                    </div>

                    <div>
                        <span className="list-object-description">
                            {notebook.description}
                        </span>
                    </div>
                </td>

                <td className="list-object-published-td">
                    <div className={`list-object-published-${privacy}`}>
                        {privacy}
                    </div>
                </td>
            </tr>
        );
    }

    authedButton(to, text) {
        if (utils.isLoggedIn()) {
            return (
                <NavLink className="list-object-button" to={to}>
                    {text}
                </NavLink>
            );
        }
        return null;
    }

    render() {
        return (
            <div className="NotebookList">
                <Scrollbars autoHide style={{ height: '100%' }}>
                    <div className="list-object">
                        <div className="notebook-header">
                            <div className="list-object-header">
                                <h1>Notebooks</h1>
                                {this.authedButton('/my/notebooks', 'Mine')}
                                {this.authedButton('/notebooks', 'Public')}
                                {this.authedButton('/notebooks/new', '+ New')}
                            </div>

                            <table className="list-object-table">
                                <tbody>
                                    <tr className="list-object-tr">
                                        <th className="list-object-date-th">
                                            Date
                                        </th>
                                        <th className="list-object-meta-th">
                                            Notebook
                                        </th>
                                        <th className="list-object-published-th">
                                            Published
                                        </th>
                                    </tr>

                                    {Array.from(this.state.notebooks).map(
                                        this.renderNotebook.bind(this)
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Scrollbars>
            </div>
        );
    }
}

export default NotebookList;
