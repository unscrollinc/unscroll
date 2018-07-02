import React from 'react';
import cookie from 'js-cookie';
import update from 'immutability-helper';
import uuidv4 from 'uuid/v4';
import axios from 'axios';

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

const SWEEP_DURATION_SECONDS = 5;
const API = 'http://127.0.0.1:8000/';

export const AppContext = React.createContext();

const randomString = () => {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
}
      

export class AppProvider extends React.Component {
    constructor(state, context) {
        super(state, context);
        const c = cookie.get();        

        this.state = this.makeState(c);
        this.loadNotebookList();
        // this.loadScrollList();

	this.sweep = () => {
	    if (this.state.user.notebookCurrent && !this.state.notebook.isSaved) {
		if (this.state.notebook.url)  {
		    this.putNotebook();
		}
		else {
		    this.saveNotebook();
		}
	    }
	    this.state.notebook.notes.forEach((v,k,m) => {
		if (!v.isSaved) {
		    if (!v.url) {
		        this.saveNote(v);
                    }
                    else {
                        this.patchNote(v);
                    }
		}
	    });

	    if (this.state.user.notebookCurrent && !this.state.notebook.isSaved) {
		if (this.state.notebook.url)  {
		    this.putNotebook();
		}
		else {
		    this.saveNotebook();
		}
	    }            
	}

        // Periodically (SWEEP_DURATION_SECONDS) sweep the notebook
        // and notes and see what needs to be saved.
	setInterval(this.sweep, 1000 * SWEEP_DURATION_SECONDS);
    }

    makeState(c) {
	const hasAuth = (c && c.authToken && c.username);
        const authToken = hasAuth ? c.authToken : null;
        const username = hasAuth ? c.username : null; 	
        
        return {
	    user: {
                hasAuth:hasAuth,
                id:undefined,
                authToken:authToken,
                username:username,
                password:undefined,
                profile:undefined,
                notebookCurrent:undefined,
                notebookList:[],
                scrollCurrent:undefined,                
                scrollList:[]
	    },
	    notebook: {
                moveFrom:undefined,
                targetNote:undefined,
		notes:new Map(),
                noteCurrent:undefined
	    },
	    scroll: {},
	    eventEditor: {
                on:false,
                currentEvent:{}
	    },
	    timeline: {
                isHorizontal:true,
                search: {
                    q:undefined,
		    from:undefined,
		    to:undefined,
		    creator:undefined,
		    scroll:undefined,
		    topic:undefined
                },
                frame:undefined,
                span:undefined,
                position:undefined
	    }
        }
    }
    
    modifyNote(uuid, o) {
        // const _this = this;
	this.setState(
            {notebook:
	     update(this.state.notebook,
		    {$merge: {                        notes: update(
                            this.state.notebook.notes,
			    {$add: [[uuid,
				     update(this.state.notebook.notes.get(uuid),
					    {$merge: o})]]})}})},
		    () => {
                        console.log('[@modifyNote:uuid,o]', uuid, o);
                    }
		);        
    }

    cutNotes(from, to, targetBefore) {
        const _notes = this.state.notebook.notes;
        return _notes;
    }
    
    patchNote(note) {
        const _this = this;
        axios({
	    method:'patch',
	    url:note.url,
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:{text:note.text,
                  order:note.order,
                  kind:note.kind}
	})
            .then(function(resp) {
		console.log("[@patchNote()]", resp.data);
                _this.modifyNote(note.uuid, {isSaved:true});
	    })
            .catch(error => {
                console.log('[!patchNote()]', error, _this.state);
            });
        
    }
    
    saveNote(note) {
        console.log('[@saveNote(note)]',note);
        const _this = this;
        axios({
	    method:'post',
	    in_notebook:this.state.notebook.url,
	    url:API+'notes/',
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:note
	})
            .then(function(resp) {
		console.log("[@saveNote():resp.data]", resp.data);
                const _uuid = resp.data.uuid;
                _this.modifyNote(_uuid, {url:resp.data.url,
                                         isSaved:true});
	    })
            .catch(error => {
                console.log('[!saveNote()]', error, _this.state);
            });
	
    }
    
    saveNotebook() {
        const _this = this;
        axios({
	    method:'post',
	    url:API+'notebooks/',
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:update(this.state.notebook, {$unset: ['notes']})
	})
            .then(function(resp) {
                
		_this.setState(
		    {notebook: update(
			_this.state.notebook, {$merge: {
		            isSaved: true,
		            notes:new Map(),
		            ...resp.data}})
		    },
                    _this.loadNotebookList);
            })
            .catch(error => {
                console.log(`saveNotebook: There is already a notebook by you with that name! ${error}`);
            });
    }

    putNotebook() {
        const _this = this;
        axios({
	    method:'put',
	    url:this.state.notebook.url,
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:update(this.state.notebook,
			{$unset: ['notes', 'isOnServer', 'isSaved']})
	})
            .then(function(resp) {
                _this.loadNotebookList();
		_this.setState({notebook: update(
                    _this.state.notebook, {$merge: {
		        isSaved: true
			

		    }})});

            })
            .catch(error => {
                console.log(`saveNotebook: There is already a notebook by you with that name! ${error}`);
            });
    }

    saveScroll() {
        const _this = this;
        axios({
	    method:'post',
	    url:API+'scrolls/',
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:update(this.state.scroll, {$unset: ['events']})
	})
            .then(function(resp) {
		_this.setState(
		    {scroll: update(
			_this.state.scroll, {$merge: {
		            isSaved: true,
		            events:new Map(),
		            ...resp.data}})
		    }
		    // , _this.loadScrollList
		);
            })
            .catch(error => {
                console.log(`saveScroll: There is already a scroll by you with that name! Your scrolls each need their own name. ${error}`);
            });
    }

    
    loadScrollList() {
        const _this = this;	
        axios({method:'get',
	       url:API+'scrolls/',
               headers: this.makeAuthHeader(_this.state.user.authToken)
	      })
	    .then(function(response) {
		// console.log("Load scroll list", response);
		_this.setState(
                    {user: update(_this.state.user,
                                  {$merge:
                                   {scrollList:new Map(response.data.map((n)=>[n.uuid, n]))}})}
//                   , ()=>{console.log(_this.state.user);}
		);
	    });
    }
    

    loadNotebookList() {
        const _this = this;	
        axios({method:'get',
	       url:API+'notebooks/',
               headers:this.makeAuthHeader(_this.state.user.authToken)
	      })
	    .then(function(response) {
		_this.setState(
                    {user: update(_this.state.user,
                                  {$merge:
                                   {notebookList:new Map(response.data.results.map((n)=>[n.uuid, n]))}})}
		    ,()=>{console.log('[@loadNotebookList() logged in user]',_this.state.user);}
		);
	    });
    }

    deleteNotebook(uuid) {
        console.log('[@deleteNotebook:uuid]', uuid);
        const nb = this.state.user.notebookList.get(uuid);
        console.log(nb);
        axios({method:'delete',
               url:nb.url,
               headers: this.makeAuthHeader(this.state.user.authToken)               
              })
            .then(response=>{
                this.setState({
                    user:
                      update(this.state.user,
                             {$merge:
                              {notebookList:
                               update(this.state.user.notebookList,
                                      {$remove:
                                       [uuid]})                                                             
                              }})}, ()=>console.log(this.state.user))})
            .catch(error=>{
                console.log("ERROR!!!!!", error);
            });
    }
    
    
    sequenceNotes(notes) {
        console.log('[@sequenceNotes:notes]', notes);
        return new Map(
            Array.from(notes).map((v, i) => {
                if (i!==v.order) {
                    return [v.uuid, update(v, {$merge: {isSaved:false, order:i}})];
                }
                else {
                    return [v.uuid, update(v, {$merge: {isSaved:true}})];
                }
            }));
    }

    
    sortNotes(notes) {
        const _sorted =
              Array.from(notes)
              .sort((a,b) => {
                  if (a.order > b.order) {
                      return 1;
                  }
                  else if (a.order < b.order) {
                      return -1;
                  }
                  return 0;
              });
        return _sorted;
    }
    
    makeAuthHeader(token) {
        if (token) {
            return {Authorization: `Token ${token}`};
        }
        return null;
    }
    
    render() {
        return (
            <AppContext.Provider value={{

                state:this.state,

                getAuthHeaderFromCookie:() => {
                    const c = cookie.get();
	            const hasAuth = (c && c.authToken && c.username);
                    const authToken = hasAuth ? c.authToken : null;
                    const username = hasAuth ? c.username : null;
                    return this.makeAuthHeader(authToken);
                },
                
                handleUsernameUpdate:(event) => {
                    this.setState({user: update(this.state.user, {username: {$set: event.target.value}})});
                },
                
                handlePasswordUpdate:(event) => {
                    this.setState({user: update(this.state.user, {password: {$set: event.target.value}})});                    
                },

                makeAuthHeader: (token) => { return this.makeAuthHeader(token) } ,
                
                doLogout:() => {
                    const _this = this;
                    axios(
			{method:'post',
                         url:API+'auth/logout/',
                         headers: this.makeAuthHeader(this.state.user.authToken)
                        })
                        .then(function(response) {
                            _this.setState(_this.makeState());
                        })
                        .catch(function(error) {
                            console.log(error);
                        })
                        .finally(function(x) {
                            cookie.remove('authToken');
                            cookie.remove('username');                            
                            _this.setState(_this.makeState());
                        });

                    
                },
                
                
                doLogin:(event) => {
                    event.preventDefault();
                    const _this = this;
                    axios.post(
                        API + 'auth/login/',
                        {
                            username: this.state.user.username,
                            password: this.state.user.password
                        })
                        .then(function(response) {
                            const u1 = update(_this.state.user, {
				$merge: 
				{
				    authToken: response.data.auth_token,
                                    password: undefined,
                                    hasAuth: true
				}});
                            cookie.set('authToken', response.data.auth_token);
                            cookie.set('username', _this.state.user.username);
                            _this.setState({user: u1},
                                           () => {
                                               _this.loadNotebookList();
                                               _this.loadScrollList();
                                           });
                        })
                        .catch(function(error) {
                            console.log('ERROR', error);
                        });
                },
                
                addNotebook:() => {
                    this.setState({notebook: {
                        on:true,
			isSaved:false,
                        title:'Untitled-'
                            + randomString(),
                        subtitle:'Un-subtitled',
                        description:'Un-summarized',
                        uuid: uuidv4(),
                        notes:[]
                    }}, this.saveNotebook);
                },

                loadNotebook:(notebook)=>{
                    const _this = this;
                    axios({method:'get',
	                   headers:this.makeAuthHeader(this.state.user.authToken),
                           url:`${API}users/${notebook.uuid}/notebook`
                          }).then((response) => {
                              this.setState({user: update(this.state.user,
                                                          {$merge: {notebookCurrent: notebook.uuid}})});
                              console.log('[@response]', response);
                              this.setState({notebook:
                                             {...response.data,
                                              movingNote:undefined,                                                 
                                              isSaved:true,
                                              isOnServer:true,
                                              notes:_this.sequenceNotes(_this.sortNotes(response.data.full_notes)),
                                             }}
                                            // , ()=>{console.log('[@this.state.notebook]', this.state.notebook)}
                                           )});
                },

		listNotebooks:()=>{
		    this.loadNotebookList();
		},
                
                deleteNotebook:(uuid)=> {
                    this.deleteNotebook(uuid);
                },

                notebookChange:(field, value)=>{
                    this.setState(
                        {notebook:update(this.state.notebook,
                                         {$merge: {
                                             isSaved:false,
                                             [field]: value}})});
                },

                addNote:(event) => {
		    console.log('[@addNote(event)]', event);
                    const newNote = {
                        uuid: uuidv4(),                    
			text: 'Blank',
                        order: undefined,
			in_notebook: this.state.notebook.url,
                        event:event.uuid ? event : undefined,
			with_event:event.url
                    };
                    const _notes = update(this.state.notebook.notes, {$add: [[newNote.uuid, newNote]]});
                    const _sorted = new Map(this.sequenceNotes(Array.from(_notes).map(([k,v])=>v)));
		    console.log('[@addNote:_sorted]', _sorted);                    
                    this.setState({
                        notebook:update(this.state.notebook, {$merge: { notes:  _sorted}})
                    });
                },

                doEventEditor:(event) => {
                    
                },

                startMove:(uuid) => {
                    console.log('gonna start it now!!!!', uuid);
                    this.setState({notebook: update(this.state.notebook, {$merge: {moveFrom:uuid}})});
                },

                endMove:(uuid) => {
                    const nb = this.state.notebook;
                    const _keys = Array.from(nb.notes.keys());
                    const _from = _keys.indexOf(nb.moveFrom);
//                    const _to = _keys.indexOf(nb.moveFrom);                    
                    const _target = _keys.indexOf(uuid);

                    // https://stackoverflow.com/questions/2440700/reordering-arrays
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
                    
                    const _reduced = immutableMove(_keys, _from, _target);
                    const _rebuilt = _reduced.map(u=>nb.notes.get(u))
                    const _resequenced = this.sequenceNotes(_rebuilt);
                    this.setState({notebook:update(this.state.notebook, {$merge:
                                                                         {moveFrom:undefined,
                                                                          notes: _resequenced}})});
                },
                
                updateNote:(newState) => {
                    const nb = this.state.notebook;
                    this.setState({
                        notebook:update(nb, {$merge: {currentNote:newState.uuid,
                                                      notes:update(nb.notes,
                                                                   {$add:
                                                                    [[newState.uuid,
                                                                      update(nb.notes.get(newState.uuid),
                                                                             {$merge: {isSaved: false, ...newState}})]]})}})},
                                  ()=>{}
                                  );

                },
                
                editNote:(e) => {
                    this.setState({
                        eventEditor:{on:true, event:e}
                    });
                },
                
                deleteNote:(note) => {
                    const _this = this;
                    axios({
                        method:'delete',
                        url:note.url,
	                headers:this.makeAuthHeader(this.state.user.authToken)})
                        .then(
                            (response)=> {
                                _this.setState({notebook:
                                               update(_this.state.notebook,
                                                      { $merge:
                                                        { notes:
                                                          update(_this.state.notebook.notes,
                                                                 { $remove: [note.uuid]})}})}
                                               // ,()=>{console.log(_this.state.notebook);}
                                              );
                            });
                },
                
                
                doEventSearch:(e, searchTerm) => {
                    e.preventDefault();
                    this.setState({timeline:
                                   update(this.state.timeline,
                                          {$merge: {search:
                                                    update(this.state.timeline.search, {$merge: {q:searchTerm}})}})},
                                  ()=>{console.log(this.state.timeline.search)});
                },

                editEvent:(e) => {
                    this.setState({
                        eventEditor:{on:true, event:e}
                    });
                },

                newEvent:(time) => {
                    this.setState({
                        eventEditor:{on:true, event:{id:uuidv4(), time:time}}
                    });
                },                                

                addScroll:() => {
                    console.log('OKAY', this);
                    this.setState({scroll: {
                        on:true,
			isSaved:false,
                        title:'Untitled-' + randomString(),
                        description:'Un-summarized',
                        uuid: uuidv4(),
                        events:[]
                    }}, this.saveScroll);
                },

                
                eventWindowClose:() => {
                    this.setState({eventEditor:{on:false, event:undefined}});
                }
                
            }}>
            {this.props.children}
            </AppContext.Provider>

        );
    }
}

export default AppContext;

