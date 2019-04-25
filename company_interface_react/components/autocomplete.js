import React from "react"
import Modal from "react-bootstrap-modal"
import Dimmer from "./dimmer.js"
import ReactDOM from 'react-dom'
/*
*   <Autocomplete> - компонент текстового поля с автодополнением
*
*   @param {bool}       show        - управляет показом диалога

*/
class AutocompleteOptionsList extends React.Component {
    render() {
        return (
          <ul>
              {
                Object.keys( this.props.list )
                //.filter( key => (+key === +this.props.selected ) || ( this.props.exclude.indexOf( +key ) < 0 ) )
                .filter( key => ( this.props.exclude.indexOf( +key ) < 0 ) )
                .sort( (a, b) => {
                    return this.props.sort !== false
                                ? this.props.list[a] > this.props.list[b] ? 1 : this.props.list[a] < this.props.list[b] ? -1 : 0
                                : 0
                })
                .map( (key, index) => {
                        return (<li onMouseDown={ () => this.props.onOptionSelect(key) }  className={ `${index == this.props.hoverIndex ? 'active' : ''}` } key={ key } >
                            <span>
                                { this.props.highlight
                                    ? <span>{ this.props.list[ key ].substring(0, this.props.list[ key ].toLowerCase().indexOf(this.props.highlight.toLowerCase())) }
                                            <b>{ this.props.list[ key ].substring(this.props.list[ key ].toLowerCase().indexOf(this.props.highlight.toLowerCase()), this.props.list[ key ].toLowerCase().indexOf(this.props.highlight.toLowerCase()) + this.props.highlight.length) }</b>
                                            {this.props.list[ key ].substring(this.props.list[ key ].toLowerCase().indexOf(this.props.highlight.toLowerCase()) + this.props.highlight.length, this.props.list[ key ].length)}
                                        </span>
                                    : this.props.list[ key ] }
                            </span>
                        </li> )
                    } )
              }
          </ul>
        );
    }
}

class AutocompleteOptionsGroup extends React.Component {
    render() {
        return (
            <ul>
                {
                    this.props.list.map( group => [
                            <span className="select3-optgroup" key="title">{ group.title }</span>,
                            <AutocompleteOptionsList    list={ group.list }
                                                        onOptionSelect={ this.props.onOptionSelect }
                                                        sort={ this.props.sort }
                                                        selected={ this.props.value }
                                                        exclude={ this.props.exclude }
                                                        />
                        ]
                    )
                }
            </ul>
        );
    }
}
class Autocomplete extends React.Component {

    constructor(props){
        super(props);
        this.state = {
                searchString: '',
                focused: false,
                list: Array.isArray( this.props.list ) ? [] : {},
                values: {},
                isEmpty: false,
                timer: null,
                hoverIndex: 0,
        }

        this.filterList = (list, criteria) => {
            let finalList = {};

            Object.keys(list).map( item => {
                    if ( list[ item ].toLowerCase().indexOf( criteria.toLowerCase() ) >= 0 || !criteria ) {
                        finalList[ item ] = list[ item ]
                    }
                }
            )

            return finalList;
        }

    }

    componentDidMount() {
        let values = {},
            list = Array.isArray( this.props.list ) ? [] : {};

        if( Array.isArray(this.props.list) ){
            // todo: groups
        }else{
            Object.keys( this.props.list ).map( key => {
                values[key] = this.props.list[key]
            })
            list = this.filterList( this.props.list, '');
        }
        this.setState( { list, values, isEmpty: !Object.keys(list).length > 0 } );
    }
    /*




    componentDidUpdate(){
    }

    */

    componentWillUnmount() {
        let timer;
        if( this.state.timer ){
            timer = clearTimeout( this.state.timer );
            this.setState({ timer });
        }
    }

    render() {

        let setSearch = event => {
            let list = this.filterList( this.props.list, event.target.value );
            if( typeof(this.props.onSearchChange) === 'function' ){
                this.props.onSearchChange( event.target.value );
            }
            this.setState( { searchString: event.target.value, list, isEmpty: !Object.keys(list).length > 0, hoverIndex: 0 })
        };

        let setFocus = () => {
            let timer;
            if( !this.refs.input ) return;
            this.refs.input.focus();
            if( this.state.timer ){
                timer = clearTimeout( this.state.timer );
                this.setState({ timer });
            }

        }

        let actionFocus = () => {
            this.setState( { focused: true, hoverIndex: 0 })
        }

        let actionBlur = () => {
            //let timer = setTimeout( () => this.setState( { focused: false, searchString: '' }), 100 );
            this.setState( { focused: false, searchString: '' })
            let timer = null;
            this.setState( { timer } );
        }

        let onOptionSelect = id => {
            if( Array.isArray(this.props.value) ){
                let _arr = [...this.props.value];
                if( _arr.indexOf( +id == id ? +id : id ) < 0 ) {
                    _arr.splice( _arr.length, 0, +id == id ? +id : id );
                    this.props.onSelect( _arr );
                    if( !!this.refs.input ) this.refs.input.focus();
                }
            }else{
                this.props.onSelect( id );
            }
            if( !!this.refs.input ) this.refs.input.focus();
        }

        let removeOption = id => {
            let _arr = [...this.props.value]
            _arr.splice( _arr.indexOf( +id == id ? +id : id ), 1)
            this.props.onSelect( _arr );
            if( !!this.refs.input ) this.refs.input.focus();
        }

        let handleKeyPress = event => {
            let hoverIndex = this.state.hoverIndex;
                //sorted_list =
            if(event.key === 'ArrowUp'   && this.state.hoverIndex > 0 ){
                hoverIndex--;
                this.setState( { hoverIndex } );
            }else if(event.key === 'ArrowDown' && this.state.hoverIndex < Object.keys(this.state.list).length && this.state.hoverIndex < 7){
                hoverIndex++;
                this.setState( { hoverIndex } );
            }else if(event.key === 'Enter'){
                let selected = null,
                    sorted_list = [];

                // Сортируем, если надо
                Object.keys(this.state.list)
                .filter( key => (+key === +this.props.selected ) || ( this.props.exclude.indexOf( +key ) < 0 ) )
                .sort( (a, b) => {
                    return this.props.sort !== false
                            ? this.props.list[a] > this.props.list[b] ? 1 : this.props.list[a] < this.props.list[b] ? -1 : 0
                            : 0
                }).map( key => sorted_list.push(key) );

                selected = sorted_list[this.state.hoverIndex];

                if( selected ){
                    onOptionSelect(selected);
                    this.refs.input.blur();
                }else if( this.props.createAction){
                    this.props.createAction( this.state.searchString );
                }
            }


        }

        return  (<div className={`select3 ${ this.state.focused ? 'is-focused' : '' } ${ this.props.hasError ? 'has-error' : '' } ${ this.props.label ? 'form-group' : '' }  ${ this.props.label && ( !this.props.value || ( Array.isArray(this.props.value) && this.props.value.length <= 0 ) )? 'is-empty' : '' }`}>
                    <div className="select3-selection">
                        {
                            !Array.isArray(this.props.value)
                                ? !this.state.focused
                                    ?   <span title="" onClick={ setFocus }>{ this.props.value && this.state.values[this.props.value] || '' }</span>
                                    :   null
                                :   null
                        }
                        {   this.props.label
                            ? <label className="control-label" onClick={ setFocus }><span>{ this.props.label }</span></label>
                            : null
                        }
                        <span>&nbsp;</span>
                        <ul>
                            {
                                Array.isArray(this.props.value)
                                    ?   this.props.value.map( key => <li key={ key }>
                                                                        <span>{ this.props.list[key] }</span>
                                                                        <button className="btn btn-default btn-icon-sm btn-clear au-target" onClick={ () => removeOption(key) } />
                                                                    </li>)
                                    :   null
                            }
                            <li className="select3-search">
                                <input  type="text"
                                        value={ this.state.searchString }
                                        onChange={ event => setSearch(event) }
                                        onFocus={ actionFocus }
                                        onBlur={ actionBlur }
                                        onKeyDown={ handleKeyPress }
                                        placeholder={ this.props.placeholder && !( !this.state.focused && this.props.value && this.state.values[this.props.value] )
                                                        ? this.props.placeholder
                                                        : null }
                                        />
                                { this.props.onReset && typeof(this.props.onReset) === 'function' ?  <button type="reset" className="btn btn-default btn-icon-sm btn-clear input-control" onClick={ actionReset }/> : null }
                                <button type="button" className="btn btn-default btn-icon-sm btn-dropdown input-control"  onClick={ setFocus }/>
                            </li>
                        </ul>
                    </div>
                    <div className="select3-dropdown">
                        {
                            !this.state.isEmpty && this.state.focused
                                ? Array.isArray( this.props.list )
                                    ? <AutocompleteOptionsGroup list={ this.state.list }
                                                                onOptionSelect={ onOptionSelect }
                                                                sort={ this.props.sort }
                                                                highlight={ this.state.searchString }
                                                                selected={ this.props.value }
                                                                exclude={ this.props.exclude || [] }
                                                                />
                                    : <AutocompleteOptionsList  list={ this.state.list }
                                                                onOptionSelect={ onOptionSelect }
                                                                sort={ this.props.sort }
                                                                highlight={ this.state.searchString }
                                                                exclude={ this.props.exclude || [] }
                                                                selected={ this.props.value }
                                                                hoverIndex={ this.state.hoverIndex }
                                                                />
                                :   <ul>
                                        <li className="select3-alert text-left">
                                            <i className="material-icons">warning</i>
                                            { this.state.searchString ? 'Поиск не дал результатов' : 'Нет данных для отображения' }
                                            { this.props.createAction ? <button type="button" className="btn btn-primary btn-icon btn-add" onClick={ () => this.props.createAction(this.state.searchString) }>{ this.props.createLabel || 'Добавить'}</button> : null }
                                        </li>
                                    </ul>
                        }
                    </div>
                </div>);
    }
}
export default Autocomplete
