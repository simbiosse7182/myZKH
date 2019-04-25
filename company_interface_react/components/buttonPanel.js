import React from "react"

class ButtonPanel extends React.Component {
    constructor(props){
        super(props);
        this.state = { scrolling: false }
    }

    /*
    componentDidMount() {
        console.log('mount');
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        console.log('un_mount');
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll(event) {
        console.log('scroll');
        if (window.scrollY === 0) {
            console.log( 'top' );
            this.setState({scrolling: false});
        }
        else if (window.scrollY !== 0) {
            console.log( 'not a top' );
            this.setState({scrolling: true});
        }
    }

    */



    render() {
        return ( <div className="button-panel" > { this.props.children } </div> );
        // ref="panel"
    }
}

export default ButtonPanel
