import React from 'react';

class Editor extends React.Component {
    render() {
        return (
            <div style={{display:this.props.status? 'block' : 'none'}}
                 className="Editor">
              Editor
            </div>
        );
    }
}

export default Editor;
