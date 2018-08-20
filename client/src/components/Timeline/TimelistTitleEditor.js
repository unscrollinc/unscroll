import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DateTime } from 'luxon';
import update from 'immutability-helper';
import RichTextEditor from '../Editor/RichTextEditor';
import utils from '../Util/Util';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

const SCROLL_API = 'http://localhost/api/scrolls/';

// This is kind of an experiment in re-localizing some remote state
// and local state management. I still need context for the user
// information and basic auth but it relies much less on the context
// manager and keeps things local.

class TimelistTitleEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            edits: {},
            isSaved: true,
            isSaving: false
        };

        this.sweep = () => {
            const _this = this;
            if (!this.state.isSaved) {
                this.setState({ isSaving: true }, _this.patchScroll);
            }
        };

        setInterval(this.sweep, 1000 * 15);
    }

    edit(key, value) {
        this.setState({
            isSaved: false,
            scroll: update(this.state.scroll, { $merge: { [key]: value } }),
            edits: update(this.state.edits, { $merge: { [key]: value } })
        });
    }

    done(e) {
        const _this = this;
        _this.sweep();
        _this.setState({ edit: false });
    }

    patchScroll() {
        const _this = this;
        axios({
            method: 'patch',
            url: this.state.scroll.url,
            headers: utils.getAuthHeaderFromCookie(),
            data: this.state.edits
        })
            .then(resp => {
                _this.setState({ isSaved: true, isSaving: false });
            })
            .catch(err => {
                console.log(err);
            });
    }

    getScroll() {
        if (this.props.slug) {
            const _this = this;
            const url = SCROLL_API + '?slug=' + this.props.slug;
            axios({
                method: 'get',
                url: url,
                headers: utils.getAuthHeaderFromCookie()
            })
                .then(resp => {
                    _this.setState({ scroll: resp.data.results[0] }, () => {});
                })
                .catch(err => {
                    console.log('Error', err);
                });
        }
    }

    componentDidMount() {
        this.getScroll();
    }

    quickDate(iso) {
        return DateTime.fromISO(iso).toFormat('d MMM kkkk');
    }

    renderMeta() {
        const s = this.state.scroll;
        return (
            <div key={s.uuid} className="timelist-meta">
                <h1>
                    <Link
                        to={'/timelines/' + s.uuid}
                        dangerouslySetInnerHTML={{ __html: s.title }}
                    />
                </h1>
                {this.editButtons()}
                <div className="timelist-meta-content">
                    <table className="meta">
                        <tbody>
                            <tr>
                                <td colSpan="2">
                                    <div className="citation">
                                        <a href={s.link} target="_new">
                                            {s.citation}
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>No. items</th>
                                <td>
                                    {s.meta_event_count
                                        ? s.meta_event_count.toLocaleString()
                                        : '-'}
                                </td>
                            </tr>
                            <tr>
                                <th>1st event</th>
                                <td>{this.quickDate(s.meta_first_event)}</td>
                            </tr>
                            <tr>
                                <th>Last</th>
                                <td>{this.quickDate(s.meta_last_event)}</td>
                            </tr>
                            <tr>
                                <th>Creator</th>
                                <td>
                                    <a href={'/users/' + s.user_username}>
                                        {s.user_username}
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th>Created</th>
                                <td>{this.quickDate(s.when_created)}</td>
                            </tr>
                            <tr>
                                <th>Modified</th>
                                <td>{this.quickDate(s.when_modified)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div
                        className="description"
                        dangerouslySetInnerHTML={{ __html: s.description }}
                    />
                </div>
            </div>
        );
    }

    renderForm() {
        return (
            <div>
                <div className="button-nav">
                    <div className="is-published-toggle-wrapper">
                        <div className="is-published-toggle">
                            <button
                                className="timeline-meta-done-button"
                                onClick={this.done.bind(this)}
                            >
                                Done
                            </button>

                            <label htmlFor="is-published">Published: </label>
                            <Toggle
                                id="is-published"
                                defaultChecked={this.state.scroll.is_public}
                                onChange={event => {
                                    this.edit(
                                        'is_public',
                                        event.target.checked
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="rte-title-editor">
                    <RichTextEditor
                        field="title"
                        content={this.state.scroll.title}
                        upEdit={this.edit.bind(this)}
                    />
                </div>
                <div className="input-title">Title</div>

                <div className="rte-description-editor">
                    <RichTextEditor
                        field="description"
                        content={this.state.scroll.description}
                        upEdit={this.edit.bind(this)}
                    />
                </div>
                <div className="input-title">Description</div>

                <div className="rte-citation-editor">
                    <RichTextEditor
                        field="citation"
                        content={this.state.scroll.citation}
                        upEdit={this.edit.bind(this)}
                    />
                </div>
                <div className="input-title">Citation</div>

                <div className="rte-link-editor">
                    <RichTextEditor
                        field="link"
                        plain={true}
                        content={this.state.scroll.link}
                        upEdit={this.edit.bind(this)}
                    />
                </div>
                <div className="input-title">Link</div>
            </div>
        );
    }

    newEvent() {
        console.log('I am making a new event');
    }

    editButtons() {
        if (utils.isAuthed(this.state.scroll.user_username)) {
            return (
                <div key="buttons">
                    <button
                        key="edit"
                        onClick={() => {
                            this.setState({ edit: !this.state.edit });
                        }}
                    >
                        Edit Timeline
                    </button>
                    <button
                        key="new"
                        onClick={() =>
                            this.props.insertEvent(this.state.scroll)
                        }
                    >
                        + New Event
                    </button>
                </div>
            );
        }
        return null;
    }

    render() {
        if (this.state.scroll) {
            if (this.state.edit || this.props.edit) {
                return <div className="timelist-meta">{this.renderForm()}</div>;
            }
            return <div className="timelist-meta">{this.renderMeta()}</div>;
        }
        return (
            <div className="loading" key="loading">
                Loading...
            </div>
        );
    }
}

export default TimelistTitleEditor;
