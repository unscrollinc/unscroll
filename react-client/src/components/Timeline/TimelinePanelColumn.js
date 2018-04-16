import React from 'react';


class Column extends React.Component {

    makeNewEvent() {
    }
    
    render() {
        return (
            <div className="column"
                 style={{float:'left',
                         height:'90%',
                         width:100/12 + '%'
                 }}
                 >
                <a href={'/whatever-' + (this.props.count)}>{this.props.count}</a>
                <button onClick={this.makeNewEvent} className='new'>+New</button>
            </div>
        );
    }
}
export default Column;
