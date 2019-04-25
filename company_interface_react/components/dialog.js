import React from "react"
import Modal from "react-bootstrap-modal"
import Dimmer from "./dimmer.js"
import ReactDOM from 'react-dom'

/*
*   <Dialog> - компонент
*
*   @param {bool}       show        - управляет показом диалога
*   @param {string}     title       - Заголовок
*   @param {number}     activeTab   - активная вкладка, заданная извне. Опциональна.
*
*   @param {bool}       loader      - показывает экран загрузки пока true
*   @param {string}     loadMessage - сообщение на экране загрузки
*   @param {function}   onLoadCancel- действие по нажатию кнопки Отмена на экране загрузки
*
*   @param {function}   onHide      - функция, скрывающая диалог. Меняет внешний параметр show
*   @param {function}   onTabChange - функция смены activeTab, заданная извне. Опциональна
*                                     принимает параметром номер новой вкладки
*
*   @param {object}     children    - передаётся в теле <Dialog></Dialog>
*                                       может быть одним jsx-элементом или объектом из них, в таком
*                                       случае показываются вкладки
*/

class Dialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 0,
            outerIndex: typeof(this.props.activeTab) !== 'undefined' && typeof(this.props.onTabChange) === 'function',
            reachedBottom: false
        }

    }

    /*
    componentDidMount() {
        const tesNode = this.refs.test
        console.log('mount');
        tesNode.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        const tesNode = ReactDOM.findDOMNode(this.refs.test)
        console.log('un_mount');
        tesNode.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll(event) {
        console.log('scroll');
        if (window.scrollY === 0) {
            console.log( 'top' );
            //this.setState({scrolling: false});
        }
        else if (window.scrollY !== 0) {
            console.log( 'not a top' );
            //this.setState({scrolling: true});
        }
    }
    */

    componentDidMount() {
        //this.handleScroll();
    }

    componentDidUpdate() {
        //this.handleScroll();
    }

    handleScroll() {
        // return; // Пока что вот так.
        // if (!this.refs || !this.refs.modal) return;
        // let el = ReactDOM.findDOMNode(this.refs.modal);
        // if (!el) return;
        //
        // let scroll_gap = 50, // За сколько пикселей до низа придавать модалке класс modal-dialog_bottom
        //     total_height = el.childNodes[1].childNodes[0].clientHeight,
        //     scroll_offset = +el.childNodes[1].scrollTop + el.childNodes[1].clientHeight - 47
        //
        // this.setState({reachedBottom: total_height < scroll_offset + scroll_gap})
        // console.log('reachedBottom', total_height < scroll_offset + scroll_gap);
    }

    render() {

        let changeTab = index => {
            // Вкладка пуста
            if (!this.props.children[index].content) return;

            if (this.state.outerIndex) {
                // Активная вкладка и функция её смены задаются извне
                this.props.onTabChange(index);
            } else {
                // Если не задаются, то обрабатываются внутри
                this.setState({activeTab: index});
            }
        }

        return <Modal className="show"
                      show={this.props.show}
                      onHide={this.props.onHide} large={true}

        >

            {/*onScroll={this.handleScroll.bind(this)}*/}
            {this.props.loader ?
                <Dimmer onHide={this.props.onHide}
                        block={true}
                        loadMessage={this.props.loadMessage}
                        onLoadCancel={this.props.onLoadCancel}/>
                : null}

            {!this.props.loader ?
                <Modal.Header>
                    <button type="button" className="btn-close" onClick={this.props.onHide}/>
                    <span>{this.reachedBottom ? 'reached_bottom' : 'not_reached_bottom'} / {this.props.title}</span>
                </Modal.Header>
                : null}

            {!this.props.loader && this.props.children
                ? this.props.children['$$typeof'] // Если передан jsx-объект или набор
                    ? null // Вкладок нет
                    : <ul className="nav nav-tabs has-secondary">
                        {this.props.children.map((tab, index) =>
                            <li className={this.state.outerIndex
                                ? this.props.activeTab === index
                                    ? 'active' : ''
                                : this.state.activeTab === index ? 'active' : ''}
                                onClick={() => changeTab(index)}
                                key={index}>
                                <a className={tab.content ? null : 'disabled'}> {tab.title} </a>
                            </li>)
                        }
                    </ul>
                : null // Children нет
            }

            <Modal.Body>
                {
                    !this.props.loader && this.props.children
                        ? this.props.children['$$typeof']
                        ? this.props.children
                        : <div className="tab-content">
                            {this.props.children.map((tab, index) =>
                                <div className={'tab-pane ' +
                                (this.state.outerIndex
                                    ? this.props.activeTab === index
                                        ? 'active' : ''
                                    : this.state.activeTab === index ? 'active' : '')}
                                     key={index}>
                                    {tab.content}
                                </div>)
                            }
                        </div>
                        : null
                }
            </Modal.Body>
        </Modal>
    };
}

export default Dialog
