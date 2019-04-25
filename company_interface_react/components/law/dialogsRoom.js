import React            from 'react';

import ButtonPanel      from '../buttonPanel';
import {nameFormatValueConverter, DateToTextValueConverter} from "../../../../dist/components/global-converter";
import dateFormat       from 'dateformat'

import {RoomOwners}     from "./dialogsRoomOwners";
import {RoomAccounts}   from "./dialogsRoomAccounts";
import {RoomResidents}  from "./dialogsRoomResidents";
import {RoomServices}  from "./dialogsRoomServices";

class RoomDialogInfo extends React.Component {

    constructor(props){

        super(props);

        this.state = { ui: {
                contact_shown: {},
            } }
    }

    render() {

        let toggleContact = id => {
            let ui = { ...this.state.ui };
                ui.contact_shown[id] = !ui.contact_shown[id];

            this.setState( { ui } );
        }

        return (
            <div>
                <div className="row">
                    <div className="col-sm-12">
                        <RoomInfo   room = { this.props.room } />
                    </div>
                    <div className="clearfix" />
                    <div className="col-sm-6">
                        <RoomInfoContacts  contacts = { this.props.room.contacts }
                                            persons = { this.props.data.persons }
                                            entities = { this.props.data.entities }
                                            contact_shown = { this.state.ui.contact_shown }
                                            toggleContact = { toggleContact }
                                            />
                    </div>
                    <div className="col-sm-6">
                        <RoomInfoBalances   balances = { this.props.balances }
                                            serviceTypes = { this.props.serviceTypes }
                                            />
                    </div>
                </div>

                <div className="row"> <ButtonPanel onScroll={ () => console.log('scrolled!')}> button panel </ButtonPanel> </div>

            </div>
        )
    }
}

const RoomInfo = (props) => {

    let room = props.room;

    return (
        <div style={{ marginBottom: '40px' }}>
            <div className="btn btn-primary btn-raised btn-icon btn-edit pull-right">Настроить</div>
            <h3 className="text-capitalize">
                {room.room_type}, {room.num_of_rooms || 0} комнат
            </h3>
            <div className="row">
                <div className="col-sm-2">
                <small>Кадастровый номер</small>
                <div><strong>{room.cadastral_number || '-'}</strong></div>
            </div>
            <div className="col-sm-2">
                <small>Общая площадь</small>
                <div>   {   room.total_area
                            ? <strong>{ room.total_area } м<sup>2</sup></strong>
                            : '-'
                        }
                </div>
            </div>
            <div className="col-sm-2">
                <small>Жилая площадь</small>
                <div>   {   room.living_area
                            ? <strong>{ room.living_area } м<sup>2</sup></strong>
                            : '-'
                        }
                </div>
            </div>
            <div className="col-sm-2">
                <small>Проживает</small>
                <div><strong>{+room.dwellers.length + +room.residents.length} чел.</strong></div>
            </div>
            </div>
        </div>
    )
}

const RoomInfoContacts = (props) => {

    let contacts = props.contacts,
        contact_shown = props.contact_shown,
        toggleContact = props.toggleContact,
        persons = props.persons,
        entities = props.entities

    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h4 className="panel-title">Контакты</h4>
            </div>

            <table className="table">
                <tbody>
                {!contacts
                    ? <tr><td> Нет проживающих или зарегистрированных </td></tr>
                    : contacts.map( ( contact, index ) =>
                        [
                            <tr key={ index }>
                                <td className="has-icon relative" onClick={ () => toggleContact( contact.id ) }>
                                    { !!contact_shown[ contact.id ]
                                        ? <i className="material-icons">expand_more</i>
                                        : <i className="material-icons">chevron_right</i>
                                    }
                                    &nbsp;
                                    {contact.name}
                                    <div className="pull-badge">
                                        {contact.account    ? <span className="label label-success">Лицевой Счёт</span> : null}{` `}
                                        {contact.user       ? <span className="label label-success">Доступ</span> : null}{` `}
                                        {contact.owner      ? <span className="label label-primary">Собственник</span> : null}{` `}
                                        {contact.resident   ? <span className="label label-primary">Прописан</span> : null}{` `}
                                        {contact.dweller    ? <span className="label label-primary">Жилец</span> : null}
                                    </div>
                                </td>
                            </tr>,
                            !!contact_shown[ contact.id ]
                                ?   <RoomContactRowInfo key={ index + '_info' }
                                                        contact={ contact }
                                                        person={ contact.person_id && persons[ contact.person_id ] || {} }
                                                        entity={ contact.entity_id && entities[ contact.entity_id ] || {} }
                                                        />
                                :   null
                        ]
                    )
                }
                </tbody>
            </table>

        </div>
    )
}

const RoomContactRowInfo = (props) => {
    let person = props.person,
        entity  = props.entity

    return (
        <tr>
            <td className="td-form" style={{ paddingLeft: '28px' }}>
                <table className="table-striped">
                    <tbody>
                        { person && person.phone
                            ?   <tr><td>Телефон: <span className="pull-right">{ person.phone }</span></td></tr>
                            :   null
                        }
                        { person && person.email
                            ?   <tr><td>Email: <span className="pull-right">{ person.email }</span></td></tr>
                            :   null
                        }
                        { person && person.birth_date
                            ?   <tr><td>Дата рождения: <span className="pull-right">{ dateFormat( Date.parse(person.birth_date), 'dd.mm.yyyy' ) }</span></td></tr>
                            :   null
                        }
                        { entity && entity.inn
                            ?   <tr><td>ИНН: <span className="pull-right">{ entity.inn }</span></td></tr>
                            :   null
                        }
                        { entity && entity.ogrn
                            ?   <tr><td>ОГРН: <span className="pull-right">{ entity.ogrn }</span></td></tr>
                            :   null
                        }
                        { entity && entity.kpp
                            ?   <tr><td>КПП: <span className="pull-right">{ entity.kpp }</span></td></tr>
                            :   null
                        }
                    </tbody>
                </table>
            </td>
        </tr>
    )
}

const RoomInfoBalances = (props) => {
    let balances = props.balances,
        service_types = props.serviceTypes

    /*
    <h1 className={balances.all < 0 ? 'text-danger' : ''}>


            </h1>
     */
    return (
        <div className="panel panel-default">
            <div className="panel-heading relative">
                {   balances && balances.all < 0
                    ? <span className="pull-right badge badge-heading badge-danger">Долг: {balances.all.toFixed( 2 ) * -1} <span className="rub">a</span></span>
                    : <span className="pull-right badge badge-heading badge-success">Переплата: {balances ? balances.all.toFixed( 2 ) : 0} <span className="rub">a</span></span>
                }
                <h4 className="panel-title">Баланс</h4>
            </div>

            {balances && balances.services ?
                <table className="table table-bordered">
                    <colgroup>
                        <col width="5%"/>
                        <col width="55%"/>
                        <col width="20%"/>
                        <col width="20%"/>
                    </colgroup>
                    <thead>
                        <tr className="thead">
                            <th className="text-left" colSpan={2}>Услуга</th>
                            <th className="text-right">Баланс, руб</th>
                            <th className="text-right">Пеня, руб</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys( balances.services ).map( key => (
                            service_types[ key ] && service_types[ key ].name
                                ? <tr key={key}>
                                    <td className="text-left" colSpan={2}> {service_types[ key ].name}:</td>
                                    <td className={`text-right ${ +balances.services[key] >= 0 ? 'text-success' : 'text-danger'}`} style={{ verticalAlign: 'top' }}>
                                        {balances.services[ key ] ? balances.services[ key ].toFixed( 2 ) : '-'}
                                    </td>
                                    <td className="text-right" style={{ verticalAlign: 'top' }}> -</td>
                                </tr>
                                : null )
                        )}
                        {
                            balances.services[ 'null' ] ?
                                <tr>
                                    <td className="text-left" colSpan={4}>Жилищно-коммунальные услуги (ЖКУ)</td>
                                </tr>
                                : null
                        }
                        {Object.keys( balances.sub_services ).map( key => (
                            service_types[ key ] && service_types[ key ].name
                                ?   <tr key={ key }>
                                        <td />
                                        <td className="text-left"> {service_types[ key ].name}:</td>
                                        <td className={`text-right ${ +balances.sub_services[key] >= 0 ? 'text-success' : 'text-danger'}`} style={{ verticalAlign: 'top' }}>
                                            {balances.sub_services[ key ] ? balances.sub_services[ key ].toFixed( 2 ) : '-'}
                                        </td>
                                        <td className="text-right" style={{ verticalAlign: 'top' }}> -</td>
                                    </tr>
                                : null )
                        )}
                        {Object.keys( balances.sub_services ).length && balances.services[ 'null' ]
                            ?   <tr>
                                    <td />
                                    <td className="text-right"> Всего по ЖКУ:</td>
                                    <td className={`text-right ${ +balances.services[null] >= 0 ? 'text-success' : 'text-danger'}`} style={{ verticalAlign: 'top' }}>
                                        {balances.services[ null ] ? balances.services[ null ].toFixed( 2 ) : '-'}
                                    </td>
                                    <td className="text-right" style={{ verticalAlign: 'top' }}> -</td>
                                </tr>
                            : null
                        }
                        <tr className="tr-summary text-bold">
                            <td className="text-right text-bold" colSpan="2"> ИТОГО:</td>
                            <td className={`text-right ${ +balances.all >= 0 ? 'text-success' : 'text-danger'}`} style={{ verticalAlign: 'top' }}>
                                {balances.all ? balances.all.toFixed( 2 ) : '-'}
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'top' }}> -</td>
                        </tr>
                    </tbody>
                </table> : null}
        </div>
    )
}
class RoomDialogContacts extends React.Component {

    constructor( props ) {
        super( props );
        this.state = {
            ui: {
                editing: {
                    owners: false,
                    accounts: false,
                    residents: false,
                }
            }
        }
    }

    render() {

        let enableEditor = type => {
            let ui = {...this.state.ui}
            if ( typeof( ui.editing[ type ] ) === 'undefined' ) return;

            ui.editing[ type ] = true;
            this.setState( {ui} )
        }

        let disableEditor = type => {
            let ui = {...this.state.ui}
            if ( typeof( ui.editing[ type ] ) === 'undefined' ) return;

            ui.editing[ type ] = false;
            this.setState( {ui} )
        }

        return (
            <div>
                <br/>

                <RoomOwners     data={ this.props.data }
                                enableEditor={ enableEditor }
                                disableEditor={ disableEditor }
                                storeRoomOwners={ this.props.storeRoomOwners }
                                isEditing={ this.state.ui.editing.owners } />

                <RoomAccounts   data={ this.props.data}
                                enableEditor={ enableEditor }
                                disableEditor={ disableEditor }
                                storeRoomAccounts={ this.props.storeRoomAccounts }
                                isEditing={ this.state.ui.editing.accounts }
                                />

                <RoomResidents  data={ this.props.data}
                                enableEditor={ enableEditor }
                                disableEditor={ disableEditor }
                                storeRoomResidents={ this.props.storeRoomResidents }
                                isEditing={ this.state.ui.editing.residents }
                                />

            </div>
        );

    }
}

const RoomDialogServices = (props) => {
    return <RoomServices    data={ props.data }
                            entrances={ props.entrances }
                            rooms={ props.rooms }
                            storeRoomService={ props.storeRoomService }
                            />
}

export { RoomDialogInfo, RoomDialogContacts, RoomDialogServices }
