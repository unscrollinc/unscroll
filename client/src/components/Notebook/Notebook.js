import React from 'react';
import { Redirect } from 'react-router';
import { Scrollbars } from 'react-custom-scrollbars';

import Note from './Note';
import TitleEditor from './TitleEditor';
import Manuscript from './Manuscript';
import AppContext from '../AppContext';
import utils from '../Util/Util';

class Notebook extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: this.props.edit
        };

        if (this.props.new) {
            this.props.context.postNotebook();
        }
    }
    getNotes() {
        utils.getNotes(this.props.context, this.props.id);
    }

    getNotebook() {
        utils.GET(
            this.props.context,
            'notebooks',
            {},
            this.props.id,
            'notebook'
        );
    }

    componentDidMount() {
        if (this.props.id) {
            this.getNotebook();
            this.getNotes();
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.id !== prevProps.id) {
            this.getNotebook();
            this.getNotes();
        }
    }
    renderAddNoteButton() {
        return (
            <button onClick={() => this.props.context.addNote()}>+ Note</button>
        );
    }
    renderNote(note, i) {
        return (
            <Note
                context={this.props.context}
                key={note.uuid}
                index={i}
                {...note}
            />
        );
    }
    renderManuscriptTitle() {
        const nb = this.props.context.state.notebook;
        if (
            this.props.context.state.notebook &&
            this.props.context.state.notebook.url
        ) {
            return (
                <div className="manuscript-title">
                    <h1 dangerouslySetInnerHTML={{ __html: nb.title }} />
                    <h2 dangerouslySetInnerHTML={{ __html: nb.subtitle }} />
                    <div
                        className="description"
                        dangerouslySetInnerHTML={{ __html: nb.description }}
                    />
                </div>
            );
        }
        return null;
    }
    renderManuscriptBody() {
        const notes = this.props.context.state.notes;
        return (
            <div className="manuscript-body">
                {Array.from(notes).map(this.renderManuscriptText.bind(this))}
            </div>
        );
    }

    renderManuscriptText(note, i) {
        if (note) {
            return (
                <React.Fragment key={note.uuid}>
                    <Manuscript {...note} />
                    <span> </span>
                </React.Fragment>
            );
        }
        return null;
    }

    renderTitleEditor() {
        if (
            this.props.context.state.notebook &&
            this.props.context.state.notebook.url
        ) {
            return <TitleEditor context={this.props.context} />;
        }
        return <div>Loading</div>;
    }

    renderManuscriptEvents() {
        const notes = this.props.context.state.notes;
        const filtered = notes.filter(n => {
            return n && n.with_event !== null;
        });
        const mapped = filtered.map((n, i) => {
            return (
                <div key={i} className="manuscript-sidebar-event">
                    <h3>{n.event.title}</h3>
                    <p>{n.event.text}</p>
                </div>
            );
        });
        return <div className="manuscript-sidebar">{mapped}</div>;
    }

    render() {
        if (this.props.new && this.props.context.state.notebook) {
            return (
                <Redirect
                    to={`/notebooks/${this.props.context.state.username}/${
                        this.props.context.state.notebook.id
                    }/edit`}
                />
            );
        }
        if (!this.state.edit) {
            return (
                <Scrollbars
                    className="ManuscriptReader"
                    autoHide
                    style={{ height: '100%' }}
                >
                    <div
                        key="manuscript-preview"
                        className="manuscript-inner reader"
                    >
                        <button
                            onClick={() => this.setState({ edit: true })}
                            className="notebook-preview list-object-button button"
                        >
                            Edit
                        </button>
                        {this.renderManuscriptEvents()}
                        {this.renderManuscriptTitle()}
                        {this.renderManuscriptBody()}
                    </div>
                </Scrollbars>
            );
        }
        return (
            <AppContext.Consumer>
                {context => {
                    return (
                        <React.Fragment>
                            <div className="Editor">
                                <Scrollbars autoHide style={{ height: '100%' }}>
                                    <div className="notebook-inner">
                                        <button
                                            onClick={() =>
                                                this.setState({ edit: false })
                                            }
                                            className="notebook-preview list-object-button button"
                                        >
                                            Preview
                                        </button>
                                        {this.renderAddNoteButton()}
                                        {this.renderTitleEditor()}
                                        {Array.from(context.state.notes).map(
                                            this.renderNote.bind(this)
                                        )}
                                    </div>
                                </Scrollbars>
                            </div>
                            {/*
                            <div className="Manuscript">
                                <Scrollbars autoHide style={{ height: '100%' }}>
                                    <div className="manuscript-inner">
                                        {this.renderManuscriptTitle()}
                                        {this.renderManuscriptBody()}
                                    </div>
                                </Scrollbars>
                            </div>
			     */}
                        </React.Fragment>
                    );
                }}
            </AppContext.Consumer>
        );
    }
}
export default props => (
    <AppContext.Consumer>
        {context => <Notebook {...props} context={context} />}
    </AppContext.Consumer>
);
