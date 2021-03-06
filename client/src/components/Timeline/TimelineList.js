import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DateTime } from 'luxon';
import AppContext from '../AppContext.js';
import utils from '../Util/Util.js';
import { Scrollbars } from 'react-custom-scrollbars';

class TimelineList extends React.Component {
    constructor(props, context) {
        super(props);
        this.state = { scrolls: [] };
        this.getThumbnail = this.getThumbnail;
    }

    makeScroll(scroll) {
        const formatDate = dt => {
            const luxonDt = DateTime.fromISO(dt);
            return luxonDt.toLocaleString(DateTime.DATE_SHORT);
        };
        const getLink = scroll => {
            return (
                '/timelines/' +
                scroll.user_username +
                '/' +
                scroll.slug +
                '?view=vertical'
            );
        };
        const getThumbnail = scroll => {
            if (scroll.with_thumbnail_image) {
                return (
                    <Link to={getLink(scroll)}>
                        <img
                            className="timelist-image"
                            src={`${utils.URL}/${scroll.with_thumbnail_image}`}
                        />
                    </Link>
                );
            }
            return null;
        };

        const privacy = scroll.is_public ? 'Public' : 'Private';

        return (
            <tr className="list-object-tr" key={scroll.uuid}>
                <td className="list-object-date-td">
                    <div>{getThumbnail(scroll)}</div>
                    <div>{formatDate(scroll.when_created)}</div>
                    <div>
                        <Link to={'/users/' + scroll.user_username}>
                            {scroll.user_full_name}
                        </Link>

                        <div>
                            {scroll.meta_event_count
                                ? scroll.meta_event_count.toLocaleString()
                                : '-'}
                        </div>

                        <div>{privacy}</div>
                    </div>
                </td>

                <td className="list-object-meta-td">
                    <div className="list-object-title">
                        <Link
                            to={getLink(scroll)}
                            dangerouslySetInnerHTML={{ __html: scroll.title }}
                        />
                    </div>

                    <div
                        className="list-object-description"
                        dangerouslySetInnerHTML={{ __html: scroll.description }}
                    />
                </td>
            </tr>
        );
    }

    getTimelines() {
        if (this.props.my === true) {
            document.title = 'My Timelines (Unscroll)';
            utils.GET(this, 'scrolls', { by_user__username: 'ford' });
        } else {
            document.title = 'Timelines (Unscroll)';
            utils.GET(this, 'scrolls', { is_public: true });
        }
    }

    componentDidMount() {
        this.getTimelines();
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
            <AppContext.Consumer>
                {context => {
                    return (
                        <div className="TimelineList">
                            <Scrollbars autoHide style={{ height: '100%' }}>
                                <div className="list-object">
                                    <div className="list-object-header">
                                        <h1>Timelines</h1>
                                        {this.authedButton(
                                            '/my/timelines',
                                            'Mine'
                                        )}
                                        {this.authedButton(
                                            '/timelines',
                                            'Public'
                                        )}
                                        {this.authedButton(
                                            '/timelines/new',
                                            '+ New'
                                        )}

                                        <table className="list-object-table">
                                            <tbody>
                                                {this.state.scrolls.map(
                                                    this.makeScroll
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Scrollbars>
                        </div>
                    );
                }}
            </AppContext.Consumer>
        );
    }
}

export default TimelineList;
