import React from 'react';
import 'react-virtualized/styles.css';
import { DateTime, Interval } from 'luxon';
import EventNoteButton from '../Event/EventNoteButton';
import update from 'immutability-helper';
import axios from 'axios';
import util from '../Util/Util.js';
import RichTextEditor from '../Editor/RichTextEditor';
import { Form, Text } from 'react-form';

class TimelistEvent extends React.Component {
  constructor(props) {
    super(props);
    // We go ahead and put props into the event because we're
    // gonna change it on edit and we want to reflect that.
    this.state = {
      edit: false,
      event: this.props.event,
      edits: {}
    };
  }

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
          <img alt="" className="timelist-image" src={this.getImage(e)} />
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
    return e.when_happened;
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
      _this.setState({ edit: false });
      return null;
    } else {
      axios({
        method: 'patch',
        url: url,
        headers: util.getAuthHeaderFromCookie(),
        data: this.state.edits
      })
        .then(resp => {
          _this.setState({ edit: false });
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

                  <input type="file" />

                  <div className="eventNoteButton">
                    <button onClick={this.save.bind(this)}>Done</button>
                  </div>

                  <div>
                    <div>Datetime</div>
                    <Text
                      field="when_happened"
                      onChange={e => this.edit('when_happened', e)}
                      placeholder="when"
                    />
                  </div>

                  <div>
                    <div>URL</div>
                    <Text
                      field="url"
                      onChange={e => this.edit('url', e)}
                      placeholder="when"
                    />
                  </div>

                  <div>
                    <div>Resolution</div>
                    <Text
                      field="resolution"
                      onChange={e => this.edit('resolution', e)}
                      placeholder="res"
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
        <div className="text" dangerouslySetInnerHTML={{ __html: text }} />
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
                <a className="title" href={`/timelines/${e.scroll_uuid}`}>
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
            <div className="eventNoteButton">
              <EventNoteButton event={this.state.event} />
              <button onClick={() => this.setState({ edit: true })}>
                Edit
              </button>
            </div>

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
    if (this.state.edit === true) {
      return this.renderEditor();
    }
    return this.renderEvent();
  }
}

export default TimelistEvent;
