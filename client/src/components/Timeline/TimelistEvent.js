import React from 'react';
import 'react-virtualized/styles.css';
import { Link } from 'react-router-dom';
import { DateTime, Interval } from 'luxon';
import EventNoteButton from '../Event/EventNoteButton';
import EventInput from './EventInput';
import update from 'immutability-helper';
import axios from 'axios';
import utils from '../Util/Util.js';
import Dropzone from 'react-dropzone';
import RichTextEditor from '../Editor/RichTextEditor';
import { Form, Text } from 'react-form';

class TimelistEvent extends React.Component {
    constructor(props) {
        super(props);
        // We go ahead and put props into the event because we're
        // gonna change it on edit and we want to reflect that.
        this.state = {
            isBeingEdited: this.props.isBeingEdited,
            event: this.props.event,
            edits: {}
        };
        this.onDrop = this.onDrop.bind(this);
    }

    // Old code, needs refactor.
    showWhenHappened(then, now) {
        if (then) {
            let thenISO = DateTime.fromISO('' + then);
            let nowISO = DateTime.fromISO('' + now);
            let dur = Interval.fromDateTimes(thenISO, nowISO);
            let ct = dur.count('months') - 1;
            if (ct > 0) {
                return (
                    <tr className="dtsince">
                        <td colSpan="3">+ {ct} months </td>
                    </tr>
                );
            }
        }
        return null;
    }

    getImage(e) {
        if (e.with_thumbnail_image) {
            return `${utils.URL}${e.with_thumbnail_image}`;
        }
        if (e.scroll_with_thumbnail) {
            return `${utils.URL}${e.scroll_with_thumbnail}`;
        }
        return null;
    }

    makeImage(e) {
        if (e.with_thumbnail_image || e.scroll_with_thumbnail) {
            return (
                <a href={e.content_url} target="_blank">
                    <img
                        alt=""
                        className="timelist-image"
                        src={this.getImage(e)}
                    />
                </a>
            );
        }
        return null;
    }
    makeDropzoneImage(e) {
        if (e.with_thumbnail_image || e.scroll_with_thumbnail_image) {
            return (
                <a href={e.content_url} target="_blank">
                    <img
                        alt=""
                        className="timelist-image"
                        src={this.getImage(e)}
                    />
                </a>
            );
        }
        return <div className="dropzone-empty" />;
    }
    makeOriginal(e) {
        if (e.when_original) {
            // return ` (${e.when_original})`;
            return '';
        }
        return '';
    }

    makeWhen(e) {
        const o = this.makeOriginal(e);

        if (e.resolution <= 4) {
            return DateTime.fromISO(e.when_happened).toFormat('y G') + o;
        }

        if (e.resolution <= 8) {
            return DateTime.fromISO(e.when_happened).toFormat('MMM y G') + o;
        }

        if (e.resolution <= 10) {
            return DateTime.fromISO(e.when_happened).toFormat('DDDD G') + o;
        }

        if (e.resolution <= 14) {
            return (
                DateTime.fromISO(e.when_happened).toFormat('DDDD G hh:mm') + o
            );
        }
    }

    save(e) {
        e.preventDefault();
        const url = this.state.event.url;
        const _this = this;

        if (
            Object.keys(this.state.edits).length === 0 &&
            this.state.edits.constructor === Object
        ) {
            console.log('No changes, not saving.');
            _this.setState({ isBeingEdited: false });
            return null;
        } else {
            axios({
                method: 'patch',
                url: url,
                headers: utils.getAuthHeaderFromCookie(),
                data: this.state.edits
            })
                .then(resp => {
                    _this.setState({ isBeingEdited: false });
                })
                .catch(err => {
                    console.log('ERROR', err);
                });
        }
        return null;
    }

    edit(key, value) {
        this.setState({
            event: update(this.state.event, { $merge: { [key]: value } }),
            edits: update(this.state.edits, { $merge: { [key]: value } })
        });
    }

    editSeveral(o) {
        this.setState({
            event: update(this.state.event, { $merge: o }),
            edits: update(this.state.edits, { $merge: o })
        });
    }

    onDrop(acceptedFiles, rejectedFiles) {
        let fd = new FormData();
        acceptedFiles.forEach(file => {
            fd.append('file', file);
            axios({
                method: 'post',
                url: utils.getAPI('thumbnails/upload'),
                data: fd,
                headers: {
                    ...utils.getAuthHeaderFromCookie(),
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(resp => {
                    this.editSeveral({
                        with_thumbnail_image: resp.data.image,
                        with_thumbnail: resp.data.url
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        });
    }

    renderEditor() {
        const e = this.state.event;
        return (
            <Form defaultValues={this.state.event}>
                {form => {
                    return (
                        <tr className="timelist">
                            <td colSpan="1">
                                <Dropzone
                                    className="event-image-upload"
                                    multiple={false}
                                    maxSize={4000000}
                                    onDrop={this.onDrop.bind(this)}
                                >
                                    {this.makeDropzoneImage(e)}
                                </Dropzone>
                            </td>
                            <td colSpan="2" className="event-editor-td">
                                <button
                                    className="event-note-button"
                                    onClick={this.save.bind(this)}
                                >
                                    Done
                                </button>
                                <button
                                    className="event-delete-button"
                                    onClick={e => {
                                        this.props.deleteEvent(
                                            this.state.event
                                        );
                                    }}
                                >
                                    Delete
                                </button>

                                <div>Timeline: {e.scroll_title}</div>

                                <div className="event-editor-title">
                                    <RichTextEditor
                                        field="title"
                                        upEdit={this.edit.bind(this)}
                                        content={e.title}
                                    />
                                </div>
                                <div className="input-title">Title</div>

                                <div className="event-editor-event-input">
                                    <EventInput
                                        when_original={e.when_original}
                                        when_happened={e.when_happened}
                                        resolution={e.resolution}
                                        editSeveral={this.editSeveral.bind(
                                            this
                                        )}
                                        updateWhen={w =>
                                            this.setState({ when: w })
                                        }
                                    />
                                    <div className="input-title">
                                        When? {this.state.when}
                                    </div>
                                </div>

                                <div className="event-url">
                                    <Text
                                        field="content_url"
                                        defaultValue={e.content_url}
                                        onChange={e =>
                                            this.edit('content_url', e)
                                        }
                                    />
                                    <div className="input-title">URL</div>
                                </div>

                                <div className="event-editor-text">
                                    <RichTextEditor
                                        field="text"
                                        upEdit={this.edit.bind(this)}
                                        content={e.text}
                                    />
                                </div>
                                <div className="input-title">Description</div>
                            </td>
                        </tr>
                    );
                }}
            </Form>
        );
    }

    renderText(text) {
        if (text !== '') {
            return (
                <div
                    className="text"
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            );
        }
        return null;
    }

    renderLoggedInButtons() {
        if (utils.isLoggedIn()) {
            return (
                <span className="eventNoteButton">
                    <EventNoteButton event={this.state.event} />
                    <button
                        onClick={() => this.setState({ isBeingEdited: true })}
                    >
                        Edit
                    </button>
                </span>
            );
        }
        return null;
    }

    renderEvent() {
        const e = this.state.event;
        return (
            <React.Fragment>
                <tr className="timelist">
                    <td className="meta">{this.makeImage(e)}</td>

                    <td className="content">
                        <div className="dt">{this.makeWhen(e)}</div>

                        <a href={e.content_url} target="_blank">
                            <div
                                className="event-title"
                                dangerouslySetInnerHTML={{ __html: e.title }}
                            />
                        </a>
                        {this.renderText(e.text)}
                        <div className="timelist-event-meta">
                            <span className="collection">
                                <span className="scroll-title">
                                    <Link
                                        className="title"
                                        to={`/timelines/${e.in_scroll_user}/${
                                            e.in_scroll_slug
                                        }`}
                                    >
                                        {e.scroll_title}
                                    </Link>
                                </span>

                                <span className="author">
                                    <Link
                                        className="title"
                                        to={`/users/${e.username}`}
                                    >
                                        {e.user_full_name}
                                    </Link>
                                </span>
                            </span>

                            {this.renderLoggedInButtons()}
                        </div>
                    </td>
                </tr>
            </React.Fragment>
        );
    }
    render() {
        if (this.state.isBeingEdited === true) {
            return this.renderEditor();
        }
        return this.renderEvent();
    }
}

export default TimelistEvent;
