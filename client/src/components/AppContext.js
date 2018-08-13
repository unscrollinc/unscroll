import React from 'react';
import cookie from 'js-cookie';
import update from 'immutability-helper';
import uuidv4 from 'uuid/v4';
import axios from 'axios';
import utils from './Util/Util';
import Log from './Util/Log';

axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.withCredentials = true;

const SWEEP_DURATION_SECONDS = 4;

export const AppContext = React.createContext();

const randomString = () => {
    return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 6);
};

export class AppProvider extends React.Component {
    makeState(c) {
        const hasAuth = c && c.authToken && c.username;
        const authToken = hasAuth ? c.authToken : null;
        const username = hasAuth ? c.username : null;
        //Note = uuid, edits, note
        return {
            username: username,
            authToken: authToken,
            notebook: null,
            notebookEdits: {},
            notebookIsSaved: null,
            notes: [],
            // Maybe that's a hash by UUID, IDK.
            moveFrom: undefined,
            search: null,
            events: []
        };
    }

    constructor(state, context) {
        super(state, context);
        const c = cookie.get();

        this.state = this.makeState(c);

        this.sweep = () => {
            if (this.state.notebook && !this.state.notebookIsSaved) {
                if (!this.state.notebook.url) {
                    this.postNotebook();
                } else {
                    this.patchNotebook();
                }
            }
            this.state.notes.forEach((v, k, m) => {
                if (!v.__isSaved) {
                    if (!v.url) {
                        this.postNote(v, k);
                    } else {
                        this.patchNote(v, k);
                    }
                }
            });
        };

        // Periodically (SWEEP_DURATION_SECONDS) sweep the notebook
        // and notes and see what needs to be saved.
        setInterval(this.sweep, 1000 * SWEEP_DURATION_SECONDS);
    }

    cutNotes(from, to, targetBefore) {
        const _notes = this.state.notebookNotes;
        return _notes;
    }

    markNoteSaved(i) {
        return update(this.state.notes, {
            [i]: {
                $set: update(this.state.notes[i], {
                    $merge: {
                        __edits: {},
                        __isSaved: true
                    }
                })
            }
        });
    }

    patchNote(note, i) {
        const _this = this;
        axios({
            method: 'patch',
            url: note.url,
            headers: utils.getAuthHeaderFromCookie(),
            data: note.__edits
        })
            .then(function(resp) {
                Log.info(resp.data);
                _this.setState({ notes: _this.markNoteSaved(i) });
            })
            .catch(error => {
                Log.error(error, _this.state);
            });
    }

    postNote(note, i) {
        console.log('[@postNote(note)]', note);
        const that = this;
        const noFullEventNote = update(note, {
            $unset: ['event', '__edits', '__isSaved']
        });
        utils
            .webPromise(this, 'POST', 'notes', noFullEventNote)
            .then(resp => {
                const updatedNote = update(note, {
                    $merge: {
                        __isSaved: true,
                        __edits: {},
                        ...resp.data
                    }
                });
                const manyNotes = update(that.state.notes, {
                    [i]: { $set: updatedNote }
                });
                that.setState({ notes: manyNotes });
            })
            .catch(error => {
                console.log('[!postNote()]', {
                    error: error,
                    note: note,
                    i: i
                });
            });
    }

    deleteNote(note) {
        const _this = this;
        axios({
            method: 'DELETE',
            url: note.url,
            headers: utils.getAuthHeaderFromCookie()
        })
            .then(resp => {
                const filtered = this.state.notes.filter(n => {
                    return n.uuid !== note.uuid;
                });
                this.setState({ notes: filtered });
            })
            .finally(() => {});
    }

    patchNotebook() {
        console.log('[@patchNotebook(notebook)]', this.state.notebook);
        const _this = this;
        axios({
            method: 'patch',
            url: this.state.notebook.url,
            headers: utils.getAuthHeaderFromCookie(),
            data: this.state.notebookEdits
        })
            .then(function(resp) {
                _this.setState({
                    notebookIsSaved: true,
                    notebookEdits: {}
                });
            })
            .catch(error => {
                Log.info(error);
            });
    }

    postNotebook() {
        const nb = {
            title: 'Untitled-' + randomString(),
            subtitle: '',
            description: '',
            isSaved: false,
            uuid: uuidv4()
        };
        const _this = this;
        axios({
            method: 'post',
            url: utils.getAPI('notebooks'),
            headers: utils.getAuthHeaderFromCookie(),
            data: nb
        })
            .then(resp => {
                console.log('RESPONSEEEEEEEE', resp);
                _this.setState({
                    notebookIsSaved: true,
                    notebook: resp.data
                });
            })
            .catch(error => {
                console.log({ error: error });
            });
    }

    deleteNotebook(uuid) {
        console.log('[@deleteNotebook:uuid]', uuid);
        const nb = this.state.notebookList.get(uuid);
        console.log(nb);
        axios({
            method: 'delete',
            url: nb.url,
            headers: utils.getAuthHeaderFromCookie()
        })
            .then(response => {
                this.setState(
                    {
                        user: update(this.state.user, {
                            $merge: {
                                notebookList: update(this.state.notebookList, {
                                    $remove: [uuid]
                                })
                            }
                        })
                    },
                    () => console.log(this.state.user)
                );
            })
            .catch(error => {
                console.log('ERROR!!!!!', error);
            });
    }

    render() {
        return (
            <AppContext.Provider
                value={{
                    state: this.state,

                    setState: (o, f) => {
                        this.setState(o, f);
                    },

                    deleteNotebook: uuid => {
                        this.deleteNotebook(uuid);
                    },

                    notebookChange: (field, value) => {
                        this.setState({
                            notebook: update(this.state.notebook, {
                                $merge: {
                                    isSaved: false,
                                    [field]: value
                                }
                            })
                        });
                    },

                    deleteNote: note => {
                        this.deleteNote(note);
                    },
                    postNotebook: this.postNotebook.bind(this),
                    addNote: event => {
                        const _this = this;

                        console.log('[@addNote(event)]', event);

                        if (!this.state.notebook) {
                            alert('NO NOTEBOOK!');
                            return null;
                        }

                        const following_uuid =
                            _this.state.notes.length > 0
                                ? _this.state.notes[0].uuid
                                : null;
                        const newNote = {
                            uuid: uuidv4(),
                            text: '',
                            order: 0,
                            following_uuid: following_uuid,
                            in_notebook: _this.state.notebook.url,
                            event: event ? event : null,
                            with_event: event ? event.url : null,
                            __isSaved: false,
                            __edits: {}
                        };
                        const notes = update(_this.state.notes, {
                            $unshift: [newNote]
                        });
                        const sorted = utils.sortNotes(notes);
                        _this.setState({ notes: sorted });
                    },

                    startMove: note => {
                        console.log('gonna start it now!!!!', note.index);
                        this.setState({ moveFrom: note.index });
                        // this.setState({notebook: update(this.state.notebook, {$merge: {moveFrom:uuid}})});
                    },

                    forgetMove: () => {
                        this.setState({ moveFrom: undefined });
                    },

                    endMove: note => {
                        function immutableMove(arr, from, to) {
                            return arr.reduce((prev, current, idx, self) => {
                                if (from === to) {
                                    prev.push(current);
                                }
                                if (idx === from) {
                                    return prev;
                                }
                                if (from < to) {
                                    prev.push(current);
                                }
                                if (idx === to) {
                                    prev.push(self[from]);
                                }
                                if (from > to) {
                                    prev.push(current);
                                }
                                return prev;
                            }, []);
                        }

                        const reduced = immutableMove(
                            this.state.notes,
                            this.state.moveFrom,
                            note.index
                        );
                        console.log('REDUCED', {
                            reduced: reduced,
                            notes: this.state.notes,
                            moveFrom: this.state.moveFrom,
                            moveTo: note.index,
                            index: note.index
                        });
                        const sorted = utils.sequenceNotes(reduced);
                        this.setState({ notes: sorted, moveFrom: undefined });
                    },

                    doEventSearch: (e, searchTerm) => {
                        e.preventDefault();
                        this.setState({ search: searchTerm });
                    },

                    editEvent: e => {
                        this.setState({
                            eventEditor: { on: true, event: e }
                        });
                    },

                    newEvent: time => {
                        this.setState({
                            eventEditor: {
                                on: true,
                                event: { id: uuidv4(), time: time }
                            }
                        });
                    },

                    addScroll: () => {
                        console.log('OKAY', this);
                        this.setState(
                            {
                                scroll: {
                                    on: true,
                                    isSaved: false,
                                    title: 'Untitled-' + randomString(),
                                    description: 'Un-summarized',
                                    uuid: uuidv4(),
                                    events: []
                                }
                            },
                            this.saveScroll
                        );
                    }
                }}
            >
                {this.props.children}
            </AppContext.Provider>
        );
    }
}

export default AppContext;
