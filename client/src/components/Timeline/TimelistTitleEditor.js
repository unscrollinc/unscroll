import React from 'react';
import { Link } from 'react-router-dom' ;
import { Form, Text, TextArea, Checkbox } from 'react-form';
import axios from 'axios';
import { DateTime } from 'luxon';
import update from 'immutability-helper';
import utils from '../Util/Util';
const SCROLL_API='http://127.0.0.1:8000/scrolls/';

// This is kind of an experiment in re-localizing some remote state
// and local state management. I still need context for the user
// information and basic auth but it relies much less on the context
// manager and keeps things local.

class TimelistTitleEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing:false,
            isSaved:true,
            isSaving:false
        };
        
	this.sweep = () => {
            const _this = this;
            if (!this.state.isSaved) {
                // save it. Set the saved State to 
                this.setState(
                    {isSaving:true},
                    ()=>{
                        const s = this.state.scroll;
                        axios({
	                    method:'put',
	                    url:this.state.scroll.url,
	                    headers:{Authorization: `Token ${this.props.context.state.user.authToken}`},
	                    data:{title:s.title,
                                  description:s.description,
                                  citation:s.citation,
                                  link:s.link,
                                  is_public:s.is_public}
	                })
	                    .then(resp => {_this.setState({isSaved:true, isSaving:false});})
                            .catch(err => {console.log(err);});
                        ;
                    });
            }
        };

        setInterval(this.sweep, 1000 * 5);
    }

    scrollChange(k, v) {
        this.setState({isSaved:false,
                       scroll:update(this.state.scroll, {$merge: {[k]:v}})},
                      ()=>{console.log(this.state);});
    }

    getScroll() {
        if (this.props.uuid) {
            const _this = this;
            const url = SCROLL_API + '?uuid=' + this.props.uuid;
	    axios({
                method:'get',
                url:url,
                headers:utils.getAuthHeaderFromCookie()})
	        .then(resp => {
                    _this.setState({scroll:resp.data.results[0]}, ()=>{});
	        }).catch(err => {
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
            <div key={s.uuid} className='timelist-meta'>            
                
              <h1><Link to={'/timelines/' + s.uuid}>{s.title}</Link></h1>
              
              {this.editButton()}

              <div className="timelist-meta-content">
              <table className="meta">
                  <tbody>
                    <tr><td colSpan="2"><div className="citation"><a href={s.link} target="_new">{s.citation}</a></div></td></tr>
                    <tr><th>№ events</th><td>{s.event_count ? s.event_count.toLocaleString() : '-'}</td></tr>                    
                    <tr><th>1st event</th><td>{this.quickDate(s.first_event)}</td></tr>
                    <tr><th>Last</th><td>{this.quickDate(s.last_event)}</td></tr>
                    <tr><th>Creator</th><td><a href={'/users/' + s.user_username}>{s.user_username}</a></td></tr>
                    <tr><th>Created</th><td>{this.quickDate(s.when_created)}</td></tr>
                    <tr><th>Modified</th><td>{this.quickDate(s.when_modified)}</td></tr>                    
                  </tbody>
              </table>
              <div class="description">{s.description}</div>
              </div>
              
            </div>
        );
    }
    
    renderForm() {
        return (
            <Form key={'form-' + this.props.uuid} defaultValues={this.state.scroll}>
              {(form) => {
                  // title, description, is_public, is_fiction, is_deleted, citation, link, with_thumbnail
                  return (
		      <form key={'form-inner-' + this.props.uuid}>
			<Link to={`/timelines/${this.props.uuid}`}>Done</Link>
                        <div key='title'>
                          <div key='title-inner'>Title</div>
			  <Text
                            key='title_field'                                                                                                           
                            field="title"
                            onChange={(e)=>this.scrollChange('title', e)}
                            placeholder='Title' />
                        </div>
                        
                        <div key='citation'>
                          <div key='citation-inner'>Citation</div>
			  <Text
                            key='citation_field'                                                                        
                            field="citation"
                            onChange={(e)=>this.scrollChange('citation', e)}
                            placeholder='Citation' />
                        </div>
			
                        <div key='link'>
                          <div key='link-inner'>Link</div>			  
			  <Text
                            key='link_field'                                  
                            field="link"
                            onChange={(e)=>this.scrollChange('link', e)}
                            placeholder='Link' />
                        </div>                                                                                                                              

			<div key='description'>
                          <div key='description-inner'>Description</div>
                          <TextArea
                            key='decription_field'
                            field="description"
                            onChange={(e)=>this.scrollChange('description', e)}
                            placeholder='Description' />
                        </div>
                        
                        <div key='is_public'>
                          <div key='published-inner'>Published?</div>			  
                          <Checkbox
                            key='is_public_checkbox'
                            field="is_public"
                            onChange={(e)=>this.scrollChange('is_public', e)}
                            />
                        </div>
                      </form>
                  );
              }}
            </Form>
        );
    }

    newEvent() {
        console.log('I am making a new event');
    }

    editButton() {
        return (
            <div key='buttons'>
              <button key='edit' onClick={()=>{this.setState({isEditing:!this.state.isEditing})}}>+ Edit</button>
              <button key='new' onClick={this.newEvent}>+ New</button>              
            </div>
        );
    }
    
    render() {
        if (this.state.scroll) {
            if (this.props.edit) {
                return (
                    <div className="timelist-meta">
                      {this.renderForm()}
                      </div>
                );
            }
            return (<div className="timelist-meta">
                    {this.renderMeta()}
                    </div>);
                    
        }
        return (<div className='loading'
                key='loading'>Loading...</div>);
    }
}

export default TimelistTitleEditor;
