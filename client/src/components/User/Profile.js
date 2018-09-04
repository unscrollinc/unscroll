import React from 'react';
import { Link } from 'react-router-dom';
//import validator from 'email-validator';
//import { Form, Text } from 'react-form';
import axios from 'axios';
import utils from '../Util/Util';
import { Scrollbars } from 'react-custom-scrollbars';

class UserProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrolls: [],
            notebooks: []
        };
    }

    getAList(kindOfThing) {
        axios({
            method: 'get',
            url: utils.getAPI(kindOfThing),
            params: { by_user__username: this.props.username }
        })
            .then(resp => this.setState({ [kindOfThing]: resp.data.results }))
            .catch(err => console.log(err));
    }

    componentDidMount() {
        this.getAList('scrolls');
        this.getAList('notebooks');
    }

    renderNotebook(s) {
        return (
            <p>
                <Link
                    className="list"
                    to={`/notebooks/${s.user_username}/${s.id}`}
                >
                    <span>{s.title}</span>
                </Link>
                <div>{s.when_created}</div>
                <blockquote
                    dangerouslySetInnerHTML={{ __html: s.description }}
                />
            </p>
        );
    }
    renderScroll(s) {
        return (
            <p>
                <Link
                    to={`/timelines/${s.user_username}/${s.slug}?view=vertical`}
                >
                    <span>{s.title}</span>
                </Link>
                <div>{s.when_created}</div>
                <blockquote
                    dangerouslySetInnerHTML={{ __html: s.description }}
                />
            </p>
        );
    }
    render() {
        return (
            <div className="Meta">
                <Scrollbars autoHide style={{ height: '100%' }}>
                    <div className="Profile">
                        <h1>{this.props.username}</h1>
                        <h2>Notebooks</h2>
                        {this.state.notebooks.map(this.renderNotebook)}

                        <h2>Timelines</h2>
                        {this.state.scrolls.map(this.renderScroll)}
                    </div>
                </Scrollbars>
            </div>
        );
    }
}

export default UserProfile;
