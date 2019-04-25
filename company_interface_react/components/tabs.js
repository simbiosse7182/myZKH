import React from "../../../jspm_packages/npm/react@16.2.0";

export default class Tabs  extends React.Component {

    constructor(props){
        super(props);
        this.state = {  activeTab: 0,
            outerIndex: typeof(this.props.activeTab) !== 'undefined' && typeof(this.props.onTabChange) === 'function'
        }
    }

    render(){

        let outerIndex  = this.state.outerIndex,
            activeTab   = outerIndex ? this.props.activeTab : this.state.activeTab,
            onTabChange = typeof(this.props.onTabChange) !== 'undefined' ? this.props.onTabChange : null,
            childrens   = this.props.children

        let changeTab = index => {
            // Вкладка пуста
            if( !childrens[ index ].content ) return;

            if( outerIndex ) {
                // Активная вкладка и функция её смены задаются извне
                onTabChange( index );
            }else{
                // Если не задаются, то обрабатываются внутри
                this.setState( { activeTab: index } );
            }
        }

        return (
            <div>
                { childrens
                    ? childrens['$$typeof'] // Если передан jsx-объект или набор
                        ?   null // Вкладок нет
                        :   <ul className="nav nav-tabs nav-tabs-secondary">
                            { childrens.map( ( tab, index ) =>
                                <li className={ activeTab === index ? 'active' : '' }
                                    onClick={ () => changeTab(index) }
                                    key={ index }>
                                    <a className={ tab.content ? null : 'disabled' }> { tab.title } </a>
                                </li> )
                            }
                        </ul>
                    : null // Children нет
                }


                {
                    childrens
                        ? childrens['$$typeof']
                        ? childrens
                        :    <div className="tab-content">
                            { childrens.map( ( tab, index ) =>
                                <div className={ 'tab-pane ' + ( activeTab === index ? 'active' : '' ) }
                                     key={ index }>
                                    { tab.content }
                                </div> )
                            }
                        </div>
                        :   null
                }

            </div>
        )
    }
}
