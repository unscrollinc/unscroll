import React from 'react';
import AppContext from '../AppContext.js';
import RichTextEditor from '../Editor/RichTextEditor';
import update from 'immutability-helper';
import { Scrollbars } from 'react-custom-scrollbars';

class NotebookEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isMoving: false };
  }

  renderCount() {
    const status = this.props.__isSaved ? ' saved' : ' unsaved';
    const ct = this.props.index + 1;
    const moving = this.props.context.state.moveFrom !== undefined;
    if (!moving) {
      return (
        <span
          title={status}
          className={'count ' + status}
          onClick={() => this.props.context.startMove(this.props)}
        >
          {ct}
        </span>
      );
    } else if (
      moving &&
      this.props.context.state.moveFrom === this.props.index
    ) {
      return (
        <span
          title={status}
          className={'count ' + status + ' moving'}
          onClick={() => this.props.context.forgetMove()}
        >
          {ct}
        </span>
      );
    } else {
      return (
        <span
          title={status}
          className={'count ' + status + ' target'}
          onClick={() => this.props.context.endMove(this.props)}
        >
          {ct}
        </span>
      );
    }
  }

  deleteNote() {
    this.props.context.deleteNote(this.props);
  }

  edit(k, v) {
    const _note = this.props.context.state.notes[this.props.index];
    if (_note[k] !== v) {
      const edits = _note.__edits;
      const updatedEdits = update(edits, { $merge: { [k]: v } });
      const note = update(_note, {
        $merge: {
          [k]: v,
          __edits: updatedEdits,
          __isSaved: false
        }
      });
      const notes = update(this.props.context.state.notes, {
        [this.props.index]: { $set: note }
      });
      this.props.context.setState(
        { notes: notes }
        //, ()=>{console.log('AAAAAAAAAAA', this.props.index, this.props.context.state.notes[this.props.index]);}
      );
    }
  }

  renderEvent() {
    const e = this.props.event;
    function getText() {
      if (e.text) {
        return (
          <div
            className="note-event-text"
            dangerouslySetInnerHTML={{ __html: e.text }}
          />
        );
      }
      return null;
    }
    if (e) {
      return (
        <Scrollbars
          className="note-event-scroll"
          style={{ width: '100%', height: '10em' }}
          autoHide
        >
          <div className="note-event">
            <div className="note-event-title">
              <a target="_new" href={e.content_url}>
                {e.title}
              </a>
            </div>
            {getText()}
          </div>
        </Scrollbars>
      );
    }
    return undefined;
  }

  renderDelete() {
    console.log(this.props.context.state.moveFrom);
    if (this.props.context.state.moveFrom === undefined) {
      return (
        <div
          className="delete"
          onClick={() => {
            this.deleteNote(this.props);
          }}
        >
          ╳
        </div>
      );
    }
    return null;
  }

  renderNotebookEvent(context) {
    const moving = this.state.isMoving ? ' moving' : ' not-moving';
    const status = this.props.__isSaved ? ' saved' : ' unsaved';
    return (
      <div key={this.props.uuid} className="Note">
        <div className="note-inner">
          <div className="note-nav">
            {this.renderCount()}
            {this.renderDelete()}
          </div>
          <div className="rte-note-text-editor">
            <RichTextEditor
              field="text"
              content={this.props.text}
              upEdit={this.edit.bind(this)}
            />
          </div>
          <div className="input-title">Note text</div>
          {this.renderEvent()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <AppContext.Consumer>
        {context => {
          return this.renderNotebookEvent(context);
        }}
      </AppContext.Consumer>
    );
  }
}

export default NotebookEvent;
