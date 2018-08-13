import React from 'react';
import 'react-virtualized/styles.css';
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
            return `http://localhost/${e.with_thumbnail_image}`;
        }
        if (e.scroll_with_thumbnail) {
            return `http://localhost/${e.scroll_with_thumbnail}`;
        }
        return null;
    }

    makeImage(e) {
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
        return null;
    }
    makeWhen(e) {
        if (e.when_original) {
            return (
                <div title={'Date parsed as: ' + e.when_happened}>
                    {e.when_original}
                </div>
            );
        }
        if (e.resolution <= 10) {
            return DateTime.fromISO(e.when_happened).toFormat('DDDD');
        }
        if (e.resolution <= 8) {
            return DateTime.fromISO(e.when_happened).toFormat('MM YYYY');
        }
        if (e.resolution <= 4) {
            return 'ca. ' + DateTime.fromISO(e.when_happened).toFormat('YYYY');
        }
    }

    save(e) {
        e.preventDefault();
        console.log('SAVING NOW', this.state.edits);
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
                            <td colSpan="3">
                                <form>
                                    <div>
                                        <div>{e.scroll_title}</div>

                                        <div>Title</div>
                                        <RichTextEditor
                                            field="title"
                                            upEdit={this.edit.bind(this)}
                                            content={e.title}
                                        />
                                    </div>

                                    {this.makeImage(e)}

                                    <div className="eventNoteButton">
                                        <button onClick={this.save.bind(this)}>
                                            Done
                                        </button>
                                    </div>

                                    <div>
                                        <div>When?</div>
                                        <EventInput
                                            when_original={e.when_original}
                                            when_happened={e.when_happened}
                                            resolution={e.resolution}
                                            editSeveral={this.editSeveral.bind(
                                                this
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <div>URL</div>
                                        <Text
                                            field="source_url"
                                            defaultValue={e.source_url}
                                            onChange={e =>
                                                this.edit('source_url', e)
                                            }
                                            placeholder="URL"
                                        />
                                    </div>

                                    <div>
                                        <div>Description</div>
                                        <RichTextEditor
                                            field="text"
                                            upEdit={this.edit.bind(this)}
                                            content={e.text}
                                        />
                                    </div>
                                </form>

                                <Dropzone onDrop={this.onDrop.bind(this)}>
                                    <p>
                                        Try dropping some files here, or click
                                        to select files to upload.
                                    </p>
                                </Dropzone>
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
        if (utils.isAuthed()) {
            return (
                <div className="eventNoteButton">
                    <EventNoteButton event={this.state.event} />
                    <button
                        onClick={() => this.setState({ isBeingEdited: true })}
                    >
                        Edit
                    </button>
                </div>
            );
        }
        return null;
    }
    renderEvent() {
        const e = this.state.event;
        return (
            <React.Fragment>
                {/*this.showWhenHappened(this.props.lastTime, e.when_happened)*/}

                <tr className="timelist">
                    <td className="meta">
                        {this.makeImage(e)}
                        <div className="collection">
                            <div className="scroll-title">
                                <a
                                    className="title"
                                    href={`/timelines/${e.scroll_uuid}`}
                                >
                                    {e.scroll_title}
                                </a>
                            </div>

                            <div className="author">
                                <a className="title" href={`/by/${e.username}`}>
                                    @{e.username}
                                </a>
                            </div>
                        </div>
                    </td>

                    <td className="content">
                        {this.renderLoggedInButtons()}

                        <div className="dt">{this.makeWhen(e)}</div>

                        <a href={e.content_url} target="_blank">
                            <div
                                className="event-title"
                                dangerouslySetInnerHTML={{ __html: e.title }}
                            />
                        </a>
                        {this.renderText(e.text)}
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
