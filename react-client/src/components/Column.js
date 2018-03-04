import React from 'react';

class Column extends React.Component {
    render() {
        return (
            <div className="column"
                 style={{float:'left',
                         height:'90%',
                         width:100/12 + '%'
                 }}
                 >
              <a href={'whatever-' + (this.props.count)}>{this.props.count}</a>
            </div>
        );
    }
}
export default Column;
