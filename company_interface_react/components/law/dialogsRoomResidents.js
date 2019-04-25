import React            from 'react';
import {nameFormatValueConverter, DateToTextValueConverter} from "../../../../dist/components/global-converter";

import dateFormat       from 'dateformat'
import Autocomplete from "../autocomplete";
import fetchData from "../../actions/fetchData";

/*

Что нужно доделать:
-   Из автокомплитов исключать уже выбранных людей
-   Предупреждение об отсутствии паспортных данных:
    - Выводить в развёрнутой табличке
    - По нажатию выводить диалог заполнения паспортных данных
-   Если ФИО длинные, что-то с этим надо сделать

*/

// Лицевые счета
const RoomResidents = (props) => {
    // Здесь должен быть цикл по Object.keys(props.data.room.documents)[0], но на данный момент документ только один.
    return (
        <div className="panel panel-default">
            <div className="panel-heading panel-toggle-sm">
                <h4 className="panel-title">
                    Жильцы <span className="badge">{ props.data.room.dwellers.length }</span>&nbsp;
                    Зарегистрированные <span className="badge">{ props.data.room.residents.length }</span>
                </h4>
                {   !props.isEditing
                    ? <button type="button" className="btn btn-icon btn-primary btn-raised btn-edit pull-right" onClick={ () => props.enableEditor('residents') }>Редактировать</button>
                    : <button type="button" className="btn btn-default btn-clear btn-icon" title="Отменить" onClick={ () => props.disableEditor('residents') }>Закрыть</button>
                }
            </div>
            {!props.isEditing
                ? <RoomResidentsTable       data={ props.data } />
                : <RoomResidentsEditor      disableEditor={ props.disableEditor }
                                            storeRoomResidents={ props.storeRoomResidents }
                                            data={ props.data } />
            }
        </div>
    )
};

class RoomResidentsTable extends React.Component {
    constructor( props ){
        super(props);
        this.state = {
            opened: {},
            editing: {},
            show_history: false,
        }
    }

    render(){

        let toggleOpened = index => {
            let opened = {...this.state.opened};
            opened[index] = !opened[index];

            this.setState( { opened } );
        }

        let toggleEdit = index => {
            console.log('call');
            let editing = {...this.state.opened};
            editing[index] = !editing[index];

            this.setState( { editing } );
        }

        let toggleHistory = () => {
            this.setState( { show_history: !this.state.show_history } );
        }

        return (
            <table className="table table-bordered table-striped">
                <colgroup>
                    <col width="3%"/>
                    <col width="33%"/>
                    <col width="12%"/>
                    <col width="12%"/>
                    <col width="12%"/>
                    <col width="28%"/>
                </colgroup>
                {[ ...this.props.data.room.dwellers, ...this.props.data.room.residents ].length
                    ? [ <thead key={0} className="thead">
                    <tr>
                        <th colSpan={2}>ФИО
                            <span className="pull-right text-muted">Дата рождения</span>
                        </th>
                        <th className="text-center">Регистрация</th>
                        <th className="text-center">Дата начала</th>
                        <th className="text-center">Дата окончания</th>
                        <th className="text-center">Примечание</th>
                    </tr>
                    </thead>,
                        <tbody key={1}>
                        {[ ...this.props.data.room.dwellers.map( key => this.props.data.dwellers[ key ] ), ...this.props.data.room.residents.map( key => this.props.data.residents[ key ] ) ]
                            .filter( el => !!el )
                            .filter( el => !el.end_date || !Date.parse(el.end_date) || (+Date.parse(el.end_date) - +Date.now() + 86400000 ) >= 0 )
                            .sort( (a,b) => {
                                /* СОРТИРОВКА ПО ИМЕНИ */
                                if( !a.person ) return 0;
                                if( !b.person ) return 0;
                                let a_name = [a.person.last_name, a.person.first_name, a.person.middle_name ].join(' '),
                                    b_name = [b.person.last_name, b.person.first_name, b.person.middle_name ].join(' ');

                                return a_name > b_name ? 1 : a_name < b_name ? -1 : 0;

                                /* Сортировка по дате
                                let a_date = +Date.parse( a.start_date ),
                                    b_date = +Date.parse( b.start_date )
                                if( !a_date || !b_date ) return 0;

                                return a_date > b_date ? 1 : a_date < b_date ? -1 : 0;
                                */
                            })
                            .map( ( key, index ) =>     key.person
                                ?   <RoomResidentsRow    data={this.props.data}
                                                         toggleOpened={toggleOpened}
                                                         toggleEdit={toggleEdit}
                                                         item={key}
                                                         index={index}
                                                         opened={ !!this.state.opened[index] }
                                                         editing={ !!this.state.editing[index] }
                                                         key={index}/>
                                :   null
                            )}
                            {
                                (   [ ...this.props.data.room.dwellers.map( key => this.props.data.dwellers[ key ] ), ...this.props.data.room.residents.map( key => this.props.data.residents[ key ] ) ]
                                    .filter( el => !!el )
                                    .filter( el => el.end_date && Date.parse(el.end_date) && (+Date.parse(el.end_date) - +Date.now() + 86400000 ) < 0 ).length > 0 )
                                    ?   <tr onClick={ toggleHistory }>
                                            <td colSpan={6} className="text-right" style={{ padding: '4px', cursor: 'pointer' }}>
                                                { this.state.show_history ? <span className="pull-left text-bold" style={{padding: '2px'}}>История жильцов</span> : null }
                                                { this.state.show_history ? 'Скрыть' : 'Показать' } историю жильцов
                                                &nbsp;
                                                { this.state.show_history
                                                    ? <i className="material-icons">expand_less</i>
                                                    : <i className="material-icons">expand_more</i>
                                                }
                                            </td>
                                        </tr>
                                    :   null
                            }
                            {
                                !this.state.show_history
                                    ? null
                                    : [ ...this.props.data.room.dwellers.map( key => this.props.data.dwellers[ key ] ), ...this.props.data.room.residents.map( key => this.props.data.residents[ key ] ) ]
                                        .filter( el => !!el )
                                        .filter( el => el.end_date && Date.parse(el.end_date) && (+Date.parse(el.end_date) - +Date.now() + 86400000 ) < 0 )
                                        .sort( (a,b) => {
                                            /* СОРТИРОВКА ПО ИМЕНИ */
                                            if( !a.person ) return 0;
                                            if( !b.person ) return 0;
                                            let a_name = [a.person.last_name, a.person.first_name, a.person.middle_name ].join(' '),
                                                b_name = [b.person.last_name, b.person.first_name, b.person.middle_name ].join(' ');

                                            return a_name > b_name ? 1 : a_name < b_name ? -1 : 0;

                                            /* Сортировка по дате
                                            let a_date = +Date.parse( a.start_date ),
                                                b_date = +Date.parse( b.start_date )
                                            if( !a_date || !b_date ) return 0;

                                            return a_date > b_date ? 1 : a_date < b_date ? -1 : 0;
                                            */
                                        })
                                        .map( ( key, index ) =>     key.person
                                            ?   <RoomResidentsRow    data={this.props.data}
                                                                     toggleOpened={toggleOpened}
                                                                     toggleEdit={toggleEdit}
                                                                     item={key}
                                                                     index={index}
                                                                     opened={ !!this.state.opened[index] }
                                                                     editing={ !!this.state.editing[index] }
                                                                     key={index}/>
                                            :   null
                                        )
                            }
                        </tbody> ]
                    : <tbody>
                    <tr>
                        <td colSpan={6}> Жильцы или зарегистрированные не указаны</td>
                    </tr>
                    </tbody>}

            </table>
        )
    }
}

const RoomResidentsRow = (props) => {

    let toggleOpened = () => {
        props.toggleOpened( props.index );
    }

    let toggleEdit = () => {
        props.toggleEdit( props.index );
    }

    // props.item.dweller_id
    //     ? props.item.description
    //     : props.item.document_id && props.data.room.documents[ props.item.document_id ]
    //         ? props.data.room.documents[ props.item.document_id ].text
    //         : ''

    return (
        [
            <tr key={1} onClick={ toggleOpened } style={{ cursor: 'pointer' }}>
                <td className="text-left" style={{ padding: '5px' }} colSpan={2}>
                    { props.opened
                        ? <i className="material-icons">expand_more</i>
                        : <i className="material-icons">chevron_right</i>
                    }
                    &nbsp;
                    { props.item.person ? nameFormatValueConverter.getName( props.item.person ) : '-'}
                    <span className="text-muted pull-right" style={{ padding: '4px 0 0 8px' }}>
                        { props.item.person ?  dateFormat( Date.parse( props.item.person.birth_date ), 'dd.mm.yyyy' ) : '-' }
                    </span>
                </td>
                <td className="text-center">

                    {   props.item.dweller_id
                        ? 'Жилец'
                        : props.item.type === 'temporary'
                            ? 'Временная'
                            : 'Постоянная'
                    }
                </td>
                <td className="text-center">
                    { dateFormat( Date.parse( props.item.start_date ), 'dd.mm.yyyy' ) }
                </td>
                <td className="text-center">
                    {props.item.end_date && Date.parse( props.item.end_date ) && dateFormat( Date.parse( props.item.end_date ), 'dd.mm.yyyy' ) || '-'}
                </td>
                <td className="text-left">
                    {   props.item.end_date && Date.parse(props.item.end_date) && (+Date.parse(props.item.end_date) - +Date.now() + 86400000 ) < 0
                        ? <span className="text-muted">Регистрация закончилась {dateFormat( Date.parse( props.item.end_date ), 'dd.mm.yyyy' )}</span>
                        : !props.item.person.document_id
                            ? <span className="text-danger text-bold">ПАСПОРТНЫЕ ДАННЫЕ НЕ УКАЗАНЫ</span>
                            : props.item.dweller_id
                                ? props.item.description || ''
                                : props.item.document_id && props.data.room.documents[ props.item.document_id ]
                                    ? props.data.room.documents[ props.item.document_id ].text || ''
                                    : ''
                    }
                </td>
            </tr>,
            props.opened
                ?   [
                    <tr key={2}></tr>,
                    <tr key={3} className="nest">
                    <td></td>
                    <td colSpan={5}>
                        <table>
                            <colgroup>
                                <col width="13%"/>
                                <col width="87%"/>
                            </colgroup>
                            <tbody>

                            { props.item.declarant_person_id && props.data.persons[props.item.declarant_person_id]
                                ? <tr><td className="text-bold">Основание:</td><td> Заявление собственника: { nameFormatValueConverter.getName( props.data.persons[props.item.declarant_person_id] ) }</td></tr>
                                : <tr><td className="text-bold">Основание:</td><td> По праву собственности</td></tr>
                            }
                            {   props.item.document_id && props.data.room.documents[ props.item.document_id ]
                                ?   <tr><td className="text-bold"></td><td>
                                    { props.data.room.documents[ props.item.document_id ].type || '' }
                                    {` `}
                                    { props.data.room.documents[ props.item.document_id ].number || '' }
                                    {` `}
                                    { props.data.room.documents[ props.item.document_id ].date_created
                                        ? 'от ' + dateFormat( Date.parse( props.data.room.documents[ props.item.document_id ].date_created ), 'dd.mm.yyy')
                                        : '' }
                                </td></tr>
                                :   null
                            }

                            {   ( props.item.document_id && props.data.room.documents[ props.item.document_id ] && props.data.room.documents[ props.item.document_id ].text )
                            ||  props.item.description
                                ? <tr><td className="text-bold">Примечание:</td><td> {
                                    props.item.resident_id
                                        ?   props.item.document_id
                                        && props.data.room.documents[ props.item.document_id ]
                                        && props.data.room.documents[ props.item.document_id ].text
                                        || ''
                                        :   props.item.description || ''
                                }</td></tr>
                                : null
                            }
                            </tbody>
                        </table>
                    </td>
                </tr>]
                : null
        ]
    )
}

// Жильцы
class RoomResidentsEditor extends React.Component {

    constructor( props ){
        super(props);
        this.state = {
            editing: {},
            creating: false,
            show_history: false,
        }

    }

    render(){

        let toggleEdit = index => {
            let editing = {...this.state.editing};
            console.log('call', editing[index]);
            editing[index] = !editing[index];

            this.setState( { editing } );
        }

        let toggleCreate = () => {
            this.setState( { creating: !this.state.creating })
        }

        return (
            <div className="panel-body">
                <table className="nested-table">
                    <colgroup>
                        <col width="40%"/>
                        <col width="12%"/>
                        <col width="12%"/>
                        <col width="12%"/>
                        <col width="12%"/>
                        <col width="12%"/>
                    </colgroup>
                    {
                        [ ...this.props.data.room.dwellers.map( key => this.props.data.dwellers[ key ] ), ...this.props.data.room.residents.map( key => this.props.data.residents[ key ] ) ].filter( el => !!el ).length
                            ? <thead className="thead">
                                <tr>
                                    <th className="text-left" colSpan={2}>
                                        ФИО
                                        <span className="text-muted pull-right">Дата рождения</span>
                                    </th>
                                    <th className="text-center">Регистрация</th>
                                    <th className="text-center">Дата начала</th>
                                    <th className="text-center">Дата окончания</th>
                                    <th className="text-center">Действия</th>
                                </tr>
                            </thead>
                            : null
                    }
                    <tbody>
                    {[ ...this.props.data.room.dwellers.map( key => this.props.data.dwellers[ key ] ), ...this.props.data.room.residents.map( key => this.props.data.residents[ key ] ) ]
                        .filter( el => !!el )
                        .filter( el => !el.end_date || !Date.parse(el.end_date) || (+Date.parse(el.end_date) - +Date.now() + 86400000 ) >= 0 )
                        .sort( (a,b) => {
                            /* СОРТИРОВКА ПО ИМЕНИ */
                            if( !a.person ) return 0;
                            if( !b.person ) return 0;
                            let a_name = [a.person.last_name, a.person.first_name, a.person.middle_name ].join(' '),
                                b_name = [b.person.last_name, b.person.first_name, b.person.middle_name ].join(' ');

                            return a_name > b_name ? 1 : a_name < b_name ? -1 : 0;

                            /* Сортировка по дате
                            let a_date = +Date.parse( a.start_date ),
                                b_date = +Date.parse( b.start_date )
                            if( !a_date || !b_date ) return 0;

                            return a_date > b_date ? 1 : a_date < b_date ? -1 : 0;
                            */
                        })
                        .map( ( key, index ) => key && !!key.person
                            ? <RoomResidentsEditorRow data={this.props.data}
                                                      toggleEdit={toggleEdit}
                                                      item={key}
                                                      index={index}
                                                      editing={ !!this.state.editing[index] }
                                                      //ownersList={ this.state.owners_list }
                                                      key={index}
                                                      storeRoomResidents={ this.props.storeRoomResidents }
                            />
                            : null
                        )}
                    {   this.state.creating
                        ? <RoomResidentsEditorCreator data={this.props.data}
                                                      closeCreator={ toggleCreate }
                                                      storeRoomResidents={ this.props.storeRoomResidents }/>
                        : <tr>
                            <td colSpan={5} />
                            <td>
                                <button type="button" className="btn btn-primary btn-add btn-icon btn-block btn-raised" title="Отменить" onClick={ toggleCreate }>Добавить</button>
                            </td>
                        </tr>
                    }

                    </tbody>
                </table>

            </div>
        )
    }
}

const RoomResidentsEditorRow = (props) => {

    let toggleOpened = () => {
        props.toggleOpened( props.index );
    }

    let toggleEdit = () => {
        props.toggleEdit( props.index );
    }


    // props.item.dweller_id
    //     ? props.item.description
    //     : props.item.document_id && props.data.room.documents[ props.item.document_id ]
    //         ? props.data.room.documents[ props.item.document_id ].text
    //         : ''

    return (
        [
            <tr key={1} style={{ cursor: 'pointer' }} onClick={toggleEdit}>
                <td className="text-left" colSpan={2}>
                    { props.editing
                        ? <i className="material-icons">expand_more</i>
                        : <i className="material-icons">chevron_right</i>
                    }
                    &nbsp;
                    { props.item.person ? nameFormatValueConverter.getName( props.item.person ) : '-'}
                    <span className="text-muted pull-right">{ props.item.person ?  dateFormat( Date.parse( props.item.person.birth_date ), 'dd.mm.yyyy' ) : '-' }</span>
                </td>
                <td className="text-center">
                    {   props.item.dweller_id
                        ? 'Жилец'
                        : props.item.type === 'temporary'
                            ? 'Временная'
                            : 'Постоянная'
                    }
                </td>
                <td className="text-center">
                    { dateFormat( Date.parse( props.item.start_date ), 'dd.mm.yyyy' ) }
                </td>
                <td className="text-center">
                    { props.item.end_date ? dateFormat( Date.parse( props.item.end_date ), 'dd.mm.yyyy' ) : '-' }
                </td>

                <td className="text-left" style={{ padding: '4px'}}>
                    {
                        props.editing
                            ? <button type="button" className="btn btn-primary btn-icon btn-clear btn-block" title="" onClick={toggleEdit}>Отмена</button>
                            : <button type="button" className="btn btn-primary btn-icon btn-edit btn-block" title="" onClick={toggleEdit}>Изменить</button>
                    }
                </td>

            </tr>,
            props.editing
                ?   [   <tr key={1}/>,
                        <RoomResidentsEditorCreator data={ props.data }
                                                    supplied={ props.item }
                                                    closeCreator={ toggleEdit }
                                                    storeRoomResidents={props.storeRoomResidents}
                                                    key={2}
                                                    />
                    ]
                :   null
        ]
    )
}

class RoomResidentsEditorCreator extends React.Component {

    constructor(props){
        super( props );

        let supplied = props.supplied ? { ...props.supplied, type: props.supplied.dweller_id ? 'dweller' : props.supplied.type } : null;

        this.state = {
            owners_list:    {},
            has_declarant:  supplied
                            ? !!supplied.declarant_person_id
                                ? 1
                                : 0
                            : 1,
            has_document:   true,
            persons_list:   {},
            search_string:  '',
            resident:       {
                type:                   supplied
                                        ?   supplied.type
                                        :   'standing',
                start_date:             supplied
                                        ? supplied.start_date
                                        : '',
                end_date:               supplied && supplied.end_date || '',
                declarant:              supplied
                                        ? !!supplied.declarant_person_id
                                            ? this.props.data.persons_owners[ supplied.declarant_person_id]
                                            && this.props.data.owners[ this.props.data.persons_owners[ supplied.declarant_person_id] ]
                                            && this.props.data.owners[ this.props.data.persons_owners[ supplied.declarant_person_id] ].owner_id
                                            || 0
                                            : 0
                                        : 0,
                description:            supplied
                                        ? supplied.type === 'dweller'
                                            ? supplied.description || ''
                                            : supplied.document_id
                                            && this.props.data.room.documents[ supplied.document_id ]
                                            && this.props.data.room.documents[ supplied.document_id ].text
                                            || ''
                                        : '',
                force_input:            false,
                first_name:             '',
                middle_name:            '',
                last_name:              '',
                birth_date:             '',
                person_id:              supplied
                                        ? supplied.person.person_id
                                        : 0,
                document_type:          supplied
                                        && supplied.document_id
                                        && this.props.data.room.documents[ supplied.document_id ]
                                        && this.props.data.room.documents[ supplied.document_id ].type
                                        || '',
                document_number:        supplied
                                        && supplied.document_id
                                        && this.props.data.room.documents[ supplied.document_id ]
                                        && this.props.data.room.documents[ supplied.document_id ].number
                                        || '',
                document_issuer:        supplied
                                        && supplied.document_id
                                        && this.props.data.room.documents[ supplied.document_id ]
                                        && this.props.data.room.documents[ supplied.document_id ].issuer
                                        || '',
                document_created:       supplied
                                        && supplied.document_id
                                        && this.props.data.room.documents[ supplied.document_id ]
                                        && this.props.data.room.documents[ supplied.document_id ].created
                                        || '',
            },
            types:          {
                'standing': 'Постоянная',
                'temporary': 'Временная',
                'dweller': 'Жилец (без оформления)'
            },
            errors:         {},
            isSaving:       false
        }

        // Заполним всех собственников для автокомплита
        this.props.data.room.owners.map( owner_id => {
            let owner = this.props.data.ownersAll[ owner_id ];
            if( !owner || !owner.person ) return;
            this.state.owners_list[ owner_id ] = owner && owner.person
                                                    ? nameFormatValueConverter.getName( owner.person )
                                                    : owner && owner.entity
                                                        ? owner.entity.short_name || owner.entity.name
                                                        : '-'
        });

        // Заполним всех собственников для автокомплита
        Object.keys(this.props.data.persons).map( person_id=> {
            let person= this.props.data.persons[ person_id ];
            if( !person ) return;
            this.state.persons_list[ person_id ] = nameFormatValueConverter.getName( person ) || '-';
        });

    }

    render(){

        let supplied = this.props.supplied ? { ...this.props.supplied , type: this.props.supplied.dweller_id ? 'dweller' : this.props.supplied } : null;

        let closeAction = () => {
            console.log('called');
            this.props.closeCreator();
        }

        let setPerson = person_id => {
            if( !this.props.data.persons[ person_id] ){
                console.log('wrong')
                return;
            }
            setResidentValue( 'person_id', person_id )
            // На случай если вписываем собственника, убираем заявителя
            if( this.props.data.persons_owners[person_id] && this.props.data.room.owners.indexOf( this.props.data.persons_owners[person_id] ) >= 0 ){
                setStateValue( 'has_declarant', "0" )
            }
        }

        let setResidentValue = (name, value) => {
            let resident = { ...this.state.resident }
            if( typeof(resident[name]) === 'undefined' ) return;

            resident[name] = value;

            this.setState({ resident });

        }

        let changeResidentValue = event => {
            setResidentValue( event.target.name, event.target.value );
        }

        let setStateValue = (name, value) => {
            let _obj = {}
            if( typeof(this.state[name]) === 'undefined' ) return;

            _obj[name] = value;
            this.setState(_obj);

        }

        let changeStateValue = event => {
            setStateValue( event.target.name, event.target.value );
        }

        let changeDocumentChecked = () => {
            this.setState({ has_document: !this.state.has_document });
        }

        // Создаёт физлицо из строки поиска
        let createOwnerFromSearch = ( name ) => {
            let resident = {...this.state.resident},
                fields = name.split(' ');

            if( !resident ) return;
            resident.person_id      = null;
            resident.force_input    = true;
            resident.first_name     = fields[1] ? fields[1].charAt(0).toUpperCase() + fields[1].slice(1) : '';
            resident.last_name      = fields[0] ? fields[0].charAt(0).toUpperCase() + fields[0].slice(1) : '';
            resident.middle_name    = fields[2] ? fields[2].charAt(0).toUpperCase() + fields[2].slice(1) : '';

            this.setState( { resident } );

        }

        let forceInput = () => {
            if( this.state.resident.force_input === false ){
                createOwnerFromSearch( this.state.search_string );
                setStateValue('has_declarant', '1')
            }else{
                let resident = {...this.state.resident};

                resident.first_name     = '';
                resident.last_name      = '';
                resident.middle_name    = '';
                resident.force_input    = false;

                this.setState( { resident } );
            }
        }

        // Меняет значение строки автокомплита, чтобы правильно создать физлицо при нажатии на кнопку с карандашом
        let onSearchChange = value => {
            setStateValue('search_string', value);
        }
        // Проверяет инпуты
        let validateInput = () => {

            let errors = { },
                resident = this.state.resident;

            // Для создаваемого
            if( !supplied ) {
                // ФИО в автокомплите
                if ( !resident.force_input && ( !resident.person_id || !this.props.data.persons[ resident.person_id ] ) ) {
                    errors[ 'person' ] = 'фамилия, имя, отчетство';
                }

                // ФИО при ручном вводе
                if ( resident.force_input && !resident.first_name ) errors[ 'first_name' ] = 'имя';
                if ( resident.force_input && !resident.last_name ) errors[ 'last_name' ] = 'фамилия';
                if ( resident.force_input && ( !resident.birth_date || !Date.parse( resident.birth_date ) || +Date.parse( resident.birth_date ) > +Date.now() ) ) errors[ 'birth_date' ] = 'дата рождения';

                // Дата начала меньше 1900 года
                if( !resident.start_date || +Date.parse( +resident.start_date ) < -2208988800000) errors['start_date'] = 'дата начала регистрации';
            }

            // Тип собственности
            if( !this.state.types[ resident.type ])  errors['type'] = 'тип регистрации';

            // Дата окончания
            if( resident.type === 'temporary' && !Date.parse( this.state.resident.end_date ) ) errors[ 'end_date' ] = 'дата окончания регистрации';

            // Если указана, но неправильно
            if( resident.type !== 'standing'
                && resident.end_date
                && (    resident.end_date < dateFormat( Date.parse( this.state.resident.start_date ), 'yyyy-mm-dd' ) // дата окончания меньше чем дата начала владения
                    || resident.end_date < dateFormat( Date.now(), 'yyyy-mm-dd' )
                    || +Date.parse( this.state.resident.end_date ) < -2208988800000 )
            ){
                errors[ 'end_date' ] = 'дата окончания регистрации';
            }

            // Если заявитель указан неверно
            if( +this.state.has_declarant === 1
                    && resident.type !== 'dweller'
                    && ( !+resident.declarant
                    || this.props.data.room.owners.indexOf( +resident.declarant ) < 0
                    || !this.props.data.owners[ resident.declarant ]
                    || !this.props.data.owners[ resident.declarant ].person) ) errors[ 'declarant' ] = 'заявитель';

            // Заявитель не указан, но физлицо не собственник
            if( +this.state.has_declarant !== 1
                && resident.type !== 'dweller'
                && ( !resident.person_id
                    || !this.props.data.persons_owners[ resident.person_id ]
                    || this.props.data.room.owners.indexOf( this.props.data.persons_owners[ resident.person_id ] ) < 0 )
            ){
                console.log(  +this.state.has_declarant !== 1,
                    !resident.person_id,
                    !this.props.data.persons_owners[ resident.person_id ],
                    this.props.data.room.owners.indexOf( this.props.data.persons_owners[ resident.person_id ] ) < 0
                );
                errors[ 'has_declarant' ] = 'основание (не является собственником)';
            }

            // Документ
            if( +this.state.has_declarant === 1 && resident.type!=='dweller' && resident.document_number.length < 1 ) errors[ 'document_number' ] = 'номер документа';
            if( +this.state.has_declarant === 1 && resident.type!=='dweller' && resident.document_type.length < 1 ) errors[ 'document_type' ] = 'тип документа';
            if( +this.state.has_declarant === 1 && resident.type!=='dweller' && ( !Date.parse( resident.document_created ) || +Date.parse( resident.document_created ) > +Date.now() ) ) errors[ 'document_created' ] = 'дата гос. регистрации документа';

            this.setState({ errors });

            return Object.keys( errors ).length <=0;

        }

        let saveResident = () => {
            // Уже отправляем
            if( this.state.isSaving ) return;
            // Блокируем отправку
            this.setState({ isSaving: true });

            // Валидацию не прошло
            if( !validateInput() ){
                this.setState({ isSaving: false });
                return;
            }

            if( supplied ){
                modifyResident();
            }else{
                createResident();
            }

        }

        // Изменяет жильца
        let modifyResident = () => {
            let resident    = { ...this.state.resident },
                document    = {
                    created:    resident.document_created,
                    issuer:     resident.document_issuer || '',
                    number:     resident.document_number,
                    type:       resident.document_type,
                    title:      resident.document_type,
                    text:       resident.description || null,
                },
                post_data = {
                    declarant_person_id:    resident.declarant
                    && this.props.data.owners[ resident.declarant ]
                    && this.props.data.owners[ resident.declarant ].person
                    && this.props.data.owners[ resident.declarant ].person.person_id || null,
                    start_date:             supplied.start_date,
                    end_date:               ( supplied.type === 'dweller' || resident.type === 'temporary' )
                                            && resident.end_date
                                                ? resident.end_date
                                                : null,
                    room_id:                this.props.data.room.room_id,
                }

            // Если прописан, то вписываем тип
            if( supplied.type !== 'dweller' ) post_data.type = resident.type;

            // Если указан документ, добавляем его
            if( +this.state.has_declarant === 1 && supplied.type !== 'dweller' ) post_data.document = document;
            if( supplied.type === 'dweller' && resident.description ) post_data.description = resident.description;

            post_data.person_id = supplied.person.person_id


            fetchData( (supplied.type === 'dweller' ? 'dwellers/'+supplied.dweller_id : 'residents/'+supplied.resident_id ), { method: 'PUT', data: post_data })
                .then( response => response.success && response.data )
                .then( response_data => this.props.storeRoomResidents( response_data ) )
                .then( () => closeAction() )
                .catch( error => {
                    let errors = { ...this.state.errors }
                    errors.fetch = Object.isObject(error) ? error.message : error;
                    this.setState({ isSaving: false, errors })
                })

            this.setState({ isSaving: false });
        }

        let createResident = () => {

            let resident    = { ...this.state.resident },
                person      = {
                    first_name:     resident.first_name,
                    last_name:      resident.last_name,
                    middle_name:    resident.middle_name,
                    birth_date:     resident.birth_date
                },
                document    = {
                    created:    resident.document_created,
                    issuer:     resident.document_issuer || '',
                    number:     resident.document_number,
                    type:       resident.document_type,
                    title:      resident.document_type,
                    text:       resident.description || null,
                },
                post_data = {
                    declarant_person_id:    resident.declarant
                    && this.props.data.owners[ resident.declarant ]
                    && this.props.data.owners[ resident.declarant ].person
                    && this.props.data.owners[ resident.declarant ].person.person_id || null,
                    start_date:             resident.start_date,
                    end_date:               resident.type !== 'standing' && resident.end_date
                                            ? resident.end_date
                                            : null,
                    room_id:                this.props.data.room.room_id,
                }

            // Если прописан, то вписываем тип
            if( resident.type !== 'dweller' ) post_data.type = resident.type;

            // Если указан документ, добавляем его
            if( +this.state.has_declarant === 1 && resident.type !== 'dweller' ) post_data.document = document;
            if( resident.type === 'dweller' && resident.description ) post_data.description = resident.description;

            // Указываем person_id или новый person
            if( resident.force_input){
                post_data.person = person;
            }else{
                post_data.person_id = resident.person_id
            }

            fetchData( (resident.type === 'dweller' ? 'dwellers' : 'residents' ), { method: 'POST', data: ( resident.type === 'dweller' ? { dweller: post_data } : post_data ) })
                .then( response => response.success && response.data )
                .then( response_data => this.props.storeRoomResidents( response_data ) )
                .then( () => closeAction() )
                .catch( error => {
                    let errors = { ...this.state.errors }
                    errors.fetch = Object.isObject(error) ? error.message : error;
                    this.setState({ isSaving: false, errors })
                })

            this.setState({ isSaving: false });

        }

        return (
            <tr>
                <td colSpan={6} style={{ padding: '5px 0', backgroundColor: '#ffffff' }}>
                    { !supplied
                        ? <div className="text-left">
                            <div className="col-sm-12">
                                <span className="btn btn-icon btn-clear pull-right" onClick={ closeAction } style={{ right: '-9px', top: '-7px' }}>Закрыть</span>
                                <h4>Добавить жильца</h4>
                            </div>
                            <div className="col-sm-9">
                                {   !this.state.resident.force_input
                                    ?   <Autocomplete   list={ this.state.persons_list }
                                                        value={ this.state.resident.person_id }
                                                        label="Фамилия Имя Отчество *"
                                                        onSelect={ setPerson }
                                                        createLabel="Создать"
                                                        createAction={ createOwnerFromSearch }
                                                        onSearchChange={ onSearchChange }
                                                        hasError = { !!this.state.errors.person }
                                    />
                                    :   <div className="row">
                                        <div className="col-sm-4">
                                            <div className={`form-group ${ !!this.state.errors.last_name ? 'has-error' : '' }`}>
                                                <input  type="text" className="form-control" name="last_name"
                                                        value={ this.state.resident.last_name }
                                                        onChange={ changeResidentValue }
                                                />
                                                <label className="control-label"><span>Фамилия *</span></label>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className={`form-group ${ !!this.state.errors.first_name ? 'has-error' : '' }`}>
                                                <input  type="text" className="form-control" name="first_name"
                                                        value={ this.state.resident.first_name }
                                                        onChange={ changeResidentValue }
                                                />
                                                <label className="control-label"><span>Имя *</span></label>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <input  type="text" className="form-control" name="middle_name"
                                                        value={ this.state.resident.middle_name }
                                                        onChange={ changeResidentValue }
                                                />
                                                <label className="control-label"><span>Отчество *</span></label>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="col-sm-2">
                                <div className={`form-group ${this.state.resident.force_input ? '' : 'form-group-readonly'} ${ !!this.state.errors.birth_date ? 'has-error' : '' }`}>
                                    {   this.state.resident.force_input
                                        ? <input    type="date" className="form-control" name="birth_date"
                                                    max={ dateFormat( Date.now(), 'yyyy-mm-dd' )}
                                                    value={ this.state.resident.birth_date }
                                                    onChange={changeResidentValue}
                                        />
                                        :   <span className="form-control">
                                                {   this.props.data.persons[ this.state.resident.person_id ]
                                                && this.props.data.persons[ this.state.resident.person_id ].birth_date
                                                && dateFormat( Date.parse( this.props.data.persons[ this.state.resident.person_id ].birth_date ), 'dd.mm.yyyy' )
                                                || '-' }
                                            </span>
                                    }
                                    <label className="control-label"><span>Дата рождения *</span></label>
                                </div>
                            </div>
                            <div className="col-sm-1">
                                { !this.state.resident.force_input
                                    ? <button type="button" className="btn btn-primary btn-edit btn-block" tabIndex={-1} style={{padding: '11px'}}    tooltip="Ввести" title="" onClick={ forceInput } />
                                    : <button type="button" className="btn btn-primary btn-filter btn-block" tabIndex={-1} style={{padding: '11px'}}  tooltip="Выбрать" title="" onClick={ forceInput } />
                                }
                            </div>
                        </div>
                        : null // !supplied
                    }
                    <div className="text-left">
                        <div className="col-sm-12"><h5>Регистрация</h5></div>
                        <div className="col-sm-3">
                            <div className={`form-group ${ !!this.state.errors.type ? 'has-error' : '' }`}>
                                <select className="form-control" name="type"
                                        value={ this.state.resident.type }
                                        onChange={ changeResidentValue }>
                                        { !supplied || supplied.type !== 'dweller' ? <option value="standing">Постоянная</option> : null }
                                        { !supplied || supplied.type !== 'dweller' ? <option value="temporary">Временная</option> : null }
                                        { !supplied || supplied.type === 'dweller' ? <option value="dweller">Жилец (без оформления)</option> : null }
                                </select>
                                <label className="control-label">
                                    <span>Регистрация*</span>
                                </label>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className={`form-group ${ !!this.state.errors.start_date ? 'has-error' : '' } ${ supplied ? 'form-group-readonly' : '' }`}>
                                { !supplied
                                    ?   <input  type="date" className="form-control" name="start_date"
                                                value={ this.state.resident.start_date }
                                                onChange={ changeResidentValue }
                                    />
                                    :   <span className="form-control">{ dateFormat( Date.parse(supplied.start_date), 'dd.mm.yyyy' )}</span>
                                }
                                <label className="control-label">
                                    <span>Дата начала *</span>
                                </label>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className={`form-group ${ this.state.resident.type === 'standing' ? 'form-group-readonly' : ''} ${ !!this.state.errors.end_date ? 'has-error' : '' }`}>
                                {
                                    //
                                }
                                { this.state.resident.type !== 'standing'
                                    ?   <input  type="date" className="form-control" name="end_date"
                                                value={ this.state.resident.end_date }
                                                min={ Date.parse( this.state.resident.start_date ) > +Date.now() ? dateFormat( Date.parse( this.state.resident.start_date ), 'yyyy-mm-dd' ) : dateFormat( Date.now(), 'yyyy-mm-dd' ) }
                                                onChange={ changeResidentValue }
                                    />
                                    :   <span className="form-control" />
                                }
                                <label className="control-label">
                                    <span>Дата окончания { this.state.resident.type === 'temporary' ? '*' : '' }</span>
                                </label>
                            </div>
                        </div>
                        <div className="clearfix" />
                    </div>
                    {this.state.resident.type !== 'dweller'
                        ? <div className="text-left">
                            <div className="col-sm-3">
                                <div className={`form-group ${ !!this.state.errors.has_declarant ? 'has-error' : '' }`}>
                                    <select className="form-control" name="has_declarant"
                                            value={this.state.has_declarant}
                                            onChange={changeStateValue}>
                                            <option value="0">По праву собственности</option>
                                            <option value="1">По заявлению собственника</option>
                                    </select>
                                    <label className="control-label">
                                        <span>Основание*</span>
                                    </label>
                                </div>
                            </div>
                            {
                                +this.state.has_declarant === 1
                                    ? <div className="col-sm-6">
                                        <div className={`form-group ${ !!this.state.errors.declarant ? 'has-error' : '' }`}>
                                            <select className="form-control" name="declarant"
                                                    value={this.state.resident.declarant}
                                                    onChange={changeResidentValue}>>
                                                <option>Выберите собственника</option>
                                                {
                                                    Object.keys( this.state.owners_list ).map( owner_id => (
                                                        <option value={owner_id}
                                                                key={owner_id}>
                                                                {this.state.owners_list[ owner_id ]}
                                                        </option>
                                                        )
                                                    )
                                                }
                                            </select>
                                            <label className="control-label">
                                                <span>Заявитель*</span>
                                            </label>
                                        </div>
                                    </div>
                                    : null
                            }
                            <div className="clearfix"/>
                        </div>
                        :   null
                    }
                    {   this.state.resident.type !== 'dweller'
                        ?   [
                            <div className={`text-left ${ +this.state.has_declarant !== 1 ? 'text-muted' : '' }`} style={{ paddingTop: '10px' }} key={1}>
                                <div className="col-sm-12">
                                    <h5 className="inline" onClick={ changeDocumentChecked }>
                                        <span>
                                            Документ-основание для регистрации
                                        </span>
                                    </h5>
                                </div>
                            </div>,
                            <div className="text-left" key={2}>
                                <div className="col-sm-3">
                                    <div className={`form-group ${ +this.state.has_declarant !== 1 ? 'form-group-readonly' : ''} ${ !!this.state.errors.document_type ? 'has-error' : '' }`}>
                                        { +this.state.has_declarant === 1
                                            ? <input type="text"
                                                     className="form-control"
                                                     name="document_type"
                                                     value={ this.state.resident.document_type }
                                                     onChange={ changeResidentValue }/>
                                            : <span className="form-control"/>
                                        }
                                        <label className="control-label">
                                            <span>Тип документа*</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-3">
                                    <div className={`form-group ${ +this.state.has_declarant !== 1 ? 'form-group-readonly' : ''}  ${ !!this.state.errors.document_created ? 'has-error' : '' }`}>
                                        { +this.state.has_declarant === 1
                                            ? <input type="date"
                                                     className="form-control"
                                                     name="document_created"
                                                     value={ this.state.resident.document_created }
                                                     onChange={ changeResidentValue }
                                            />
                                            : <span className="form-control"/>
                                        }
                                        <label className="control-label">
                                            <span>Дата гос. регистрации *</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-3">
                                    <div className={`form-group ${ +this.state.has_declarant !== 1 ? 'form-group-readonly' : ''} ${ !!this.state.errors.document_number ? 'has-error' : '' }`}>
                                        { +this.state.has_declarant === 1
                                            ? <input type="text"
                                                     className="form-control" name="document_number"
                                                     value={ this.state.resident.document_number }
                                                     onChange={ changeResidentValue }/>
                                            : <span className="form-control"/>
                                        }
                                        <label className="control-label">
                                            <span>Номер документа*</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-3">
                                    <div className={`form-group ${ +this.state.has_declarant !== 1 ? 'form-group-readonly' : ''}`}>
                                        { +this.state.has_declarant === 1
                                            ? <input type="text"
                                                     className="form-control" name="document_issuer"
                                                     value={ this.state.resident.document_issuer }
                                                     onChange={ changeResidentValue }
                                            />
                                            : <span className="form-control"/>
                                        }
                                        <label className="control-label">
                                            <span>Кем выдан</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="clearfix"/>
                            </div>]
                        :   null
                    }
                    <div className="text-left">
                        <div className="col-sm-12"><h5>Примечание</h5></div>
                        <div className="col-sm-12">
                            <div className={`form-group ${ this.state.resident.type !== 'dweller' && +this.state.has_declarant !== 1 ? 'form-group-readonly' : ''}`}>
                                {   this.state.resident.type === 'dweller' || +this.state.has_declarant === 1
                                    ? <input    type="text"
                                                className="form-control"
                                                name="description"
                                                value={this.state.resident.description}
                                                onChange={changeResidentValue}
                                    />
                                    : <span className="form-control"/>
                                }
                                <label className="control-label">
                                    <span>Особые отметки или сведения о жильце</span>
                                </label>
                            </div>
                        </div>
                        <div className="clearfix" />
                    </div>
                    <div className="text-right">
                        <div className="col-sm-12" style={{ marginTop: '20px'}}>
                            { this.state.isSaving
                                ? <span className="form-inline" style={ {    padding: "4px 10px 0 0", opacity: 0.7, fontWeight: 'bold'} }><i className="material-icons rotated">autorenew</i> СОХРАНЯЕМ</span>
                                : null }
                            &nbsp;
                            <button type="button" className="btn btn-default btn-clear btn-icon" title="Отменить" onClick={ closeAction } >Отменить</button>
                            &nbsp;
                            <button type="button" className={`btn btn-primary btn-save btn-icon btn-raised`} title="Добавить" onClick={ saveResident }>Сохранить</button>
                        </div>
                        <div className="clearfix" />
                    </div>
                    { this.state.errors.fetch
                        ?   <div className="alert alert-error" style={{ marginBottom: 0, bottom: '-5px'}}>
                            <div className="alert-content">
                                        <span className="alert-title">Сетевая ошибка:&nbsp;
                                            <strong>{ this.state.errors.fetch }</strong>
                                        </span>
                            </div>
                        </div>
                        : Object.keys(this.state.errors).length
                            ?   <div className="alert alert-error" style={{ marginBottom: 0, bottom: '-5px' }}>
                                <div className="alert-content">
                                        <span className="alert-title">Заполните правильно:&nbsp;
                                            { Object.keys( this.state.errors ).map( (key, index) => (
                                                <strong key={ key }>{ this.state.errors[key] }{index < Object.keys(this.state.errors).length-1 ? ', ' : ''}</strong>
                                            ))}
                                        </span>
                                </div>
                            </div>
                            :   null
                    }
                </td>
            </tr>
        )
    }
}

export { RoomResidents }
