import React            from 'react';
import Tabs             from '../tabs'
import dateFormat from 'dateformat'
import Autocomplete from "../autocomplete";
import {partCalculator} from "../../actions/partCalculator";
import fetchData from "../../actions/fetchData";
import dateformat from "../../../../jspm_packages/npm/dateformat@3.0.3";

/*

назначаемые
keys = Object.keys(services).filter(el => !!services[el] && !(services[el].assignment_type === 1 && services[el].type === 1) &&
            ((types.indexOf(services[el].assignment_type) !== -1) || services[el].type === 2) && !services[el].room_id);
            
Индивидуальные
keys = Object.keys(services).filter(el => !!services[el] && services[el].assignment_type === 1 && services[el].type === 1);

objects.js:4838
 */
export const RoomServices = (props) => {

    return  (
        <Tabs>
            {[
                {   title:      'Ввод показаний',
                    content:    <RoomCountersTable  room={props.data.room}
                                                    data={props.data}/>
                },
                {   title:      'Общедомовые',
                    content:    <RoomServiceTable   title='Общедомовые услуги'
                                                    services={ props.data.services_sorted.house_common }
                                                    serviceTypes={ props.data.service_types }
                                                    serviceCategories={ props.data.service_categories }
                                                    room={props.data.room}
                                                    type="house_common"
                                                    storeRoomService={ props.storeRoomService }
                    />
                },
                {   title:      'Назначенные',
                    content:    <RoomServiceTable   title='Назначенные услуги'
                                                    services={ props.data.services_sorted.assigned }
                                                    serviceTypes={ props.data.service_types }
                                                    serviceCategories={ props.data.service_categories }
                                                    room={props.data.room}
                                                    entrances={ props.entrances }
                                                    rooms={ props.rooms }
                                                    assigned={ true }
                                                    type="assigned"
                                                    storeRoomService={ props.storeRoomService }
                    />
                },
                {   title:      'Индивидуальные',
                    content:    <RoomServiceTable   title='Индивидуальные услуги'
                                                    services={ props.data.services_sorted.individual }
                                                    serviceTypes={ props.data.service_types }
                                                    serviceCategories={ props.data.service_categories }
                                                    room={props.data.room}
                                                    type="individual"
                                                    storeRoomService={ props.storeRoomService }
                    />
                },
            ]}
        </Tabs>
    )

}

class RoomServiceTable extends React.Component {

    constructor(props){
        super(props);

        //this.services = this.props.services || {}
        //this.service_types = this.props.serviceTypes || {}
        //this.service_categories = this.props.serviceCategories || {}

        this.toggleOpen = service_group_id => {
            let opened = {...this.state.opened}
            opened[ service_group_id ] = !opened[ service_group_id ]
            this.setState({opened});
        }

        this.toggleEdit = () => {
            this.setState( { is_editing: !this.state.is_editing } )
        }

        this.toggleCreate = () => {
            this.setState( { is_creating: !this.state.is_creating } )
        }

        this.toggleItemEdit = service_id => {
            let editing = {...this.state.editing}
            editing[ service_id ] = !editing[ service_id ]
            this.setState({editing});
        }

        const count_services = category => {
            return Object.keys(category).reduce( (sum, idx) => ( sum + +Object.keys(category[idx]).reduce( (sum2, idx2) => ( sum2 + 1 ), 0 ) ) , 0)
        }

        const open_all_groups = category => {
            this.state.opened = {};
            if( !category ) return;
            Object.keys( category ).map( idx => { this.state.opened[idx] = true } )
        }

        this.state = {
            opened:         { },
            editing:        { },
            is_editing:     false,
            is_creating:    false,
            total_services: this.props.services && count_services( this.props.services ) || 0,
        }

        if( this.state.total_services <= 50 ) open_all_groups( this.props.services );

    }

    render() {

        return (
            <div>
                <div className="panel panel-default" style={{marginBottom: 0, marginTop: '20px'}}>
                    <div className="panel-heading panel-toggle-sm">
                        <h4 className="panel-title">
                            <span className="text-uppercase">{ this.props.title }</span>
                            {` `}
                            <span className="text-muted">
                                ( { this.props.services && Object.keys(this.props.services).reduce( (sum, idx) => ( sum + +Object.keys(this.props.services[idx]).filter( el => el && this.props.services[idx][el].is_active ).reduce( (sum2, idx2) => ( sum2 + 1 ), 0 ) ) , 0) || 0} шт. )
                            </span>
                        </h4>
                        <div className="pull-right">
                            {   !this.state.is_editing
                                ? <button type="button" className="btn btn-icon btn-primary btn-raised btn-edit pull-right" onClick={ () => this.toggleEdit() }>Редактировать</button>
                                : <button type="button" className="btn btn-default btn-clear btn-icon" title="Отменить" onClick={ () => this.toggleEdit() }>Закрыть</button>
                            }
                        </div>
                    </div>
                </div>
                <div className="nested-table-fix">
                    <table className="nested-table hovered">
                        <colgroup>
                            <col width="88%"/>
                            <col width="12%"/>
                        </colgroup>
                        <thead className="thead">
                        <tr>
                            <th>Категория</th>
                            <th>Стоимость</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            !!this.props.services && this.props.services
                                ? Object.keys( this.props.services ).map( service_group_id => (
                                    <RoomServiceCategoryRow   title={ service_group_id }
                                                              key={service_group_id}
                                                              assigned={ this.props.type === 'assigned' }
                                                              category={ this.props.serviceCategories[ service_group_id ] }
                                                              entrances={ this.props.entrances || {} }
                                                              editing={ this.state.editing }
                                                              isEditing={this.state.is_editing}
                                                              isOpened={this.state.opened[ service_group_id ]}
                                                              room={this.props.room}
                                                              rooms={ this.props.rooms || {} }
                                                              services={ this.props.services[ service_group_id ] }
                                                              serviceTypes={ this.props.serviceTypes }
                                                              storeRoomService={ this.props.storeRoomService }
                                                              toggleOpen={() => this.toggleOpen( service_group_id )}
                                                              toggleEdit={this.toggleEdit}
                                                              toggleItemEdit={ this.toggleItemEdit }
                                                              toggleCreate={ this.toggleCreate }
                                                              type={this.props.type}
                                                              />
                                    )
                                )
                                : null
                        }
                        {   this.state.is_editing || true
                            ?   <tr className={`nested ${this.state.is_creating ? 'opened' : ''}`} onClick={this.toggleCreate}>
                                    <td className="text-left">
                                        Добавить услугу
                                    </td>
                                    <td>
                                        {!this.state.is_creating
                                            ?   <div className="btn btn-primary btn-raised btn-block btn-add btn-icon">
                                                    Добавить
                                                </div>
                                            :   <div className="btn btn-primary btn-block btn-clear btn-icon">
                                                    Отменить
                                                </div>
                                        }
                                    </td>
                                </tr>
                            :   null
                        }
                        {   this.state.is_creating
                            ?   [   <tr key={1} />,
                                    <tr className="nest nest-simple" key={2}>
                                        <td colSpan="2">
                                            <RoomsServiceCreator    serviceTypes={ this.props.serviceTypes}
                                                                    type={this.props.type}
                                                                    closeEditor={this.toggleCreate}
                                                                    rooms={ this.props.rooms || {} }
                                                                    entrances={ this.props.entrances || {} }
                                                                    houseId={ this.props.room.house_id }
                                                                    room={ this.props.room }
                                                                    storeRoomService={ this.props.storeRoomService }
                                                                    />
                                        </td>
                                    </tr>
                                ]
                            :   null
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}

class RoomServiceCategoryRow extends React.Component {
    constructor(props){
        super(props)

        this.toggleOpen = props.toggleOpen
        this.title = props.category && props.category.name || 'Без категории'

        this.total_services = Object.keys(props.services).length || 0;

        // суммарная стоимость по категории
        this.total_cost = (+Object.keys(props.services).reduce( (sum, idx) => (
                +sum + (props.services[idx].is_active    // тариф активен
                        // если разовая услуга, стоимость считается в зависимости от объёма
                        ? props.services[idx].service_type_id && props.serviceTypes[props.services[idx].service_type_id] && +props.serviceTypes[props.services[idx].service_type_id].type === 1
                                ?   +props.services[idx].value
                                    ?   +( ( +props.services[idx].tariff || 0 ) * ( +props.services[idx].value || 0 ) )
                                    :   0
                                :   +props.services[idx].calculation_unit && +props.services[idx].calculation_unit === 2
                                    // если нет, то calc_unit == 2 - по квартире, 1 - по кв.м. квартиры
                                    ?   +( +props.services[idx].tariff || 0 )
                                    :   +( ( +props.services[idx].tariff || 0 ) * ( +props.room.total_area || 0) )
                        : 0 )
            ),0) ).toFixed(2)

    }

    render(){
        return [
            <tr className={`nested ${this.props.isOpened ? 'opened' : ''}`} key={1} onClick={ this.toggleOpen }>
                <td className="text-left text-uppercase">
                    { this.title }{` `}
                    <span className="text-muted">( { Object.keys(this.props.services).filter( el => this.props.services[el].is_active ).length || 0 } шт. )</span>
                </td>
                <td>
                    {
                        !this.props.isEditing
                        ?   (+Object.keys(this.props.services).reduce( (sum, idx) => (
                                +sum + (this.props.services[idx].is_active    // тариф активен
                                    // если разовая услуга, стоимость считается в зависимости от объёма
                                    ? this.props.services[idx].service_type_id && this.props.serviceTypes[this.props.services[idx].service_type_id] && +this.props.serviceTypes[this.props.services[idx].service_type_id].type === 1
                                        ?   +this.props.services[idx].value
                                            ?   +( ( +this.props.services[idx].tariff || 0 ) * ( +this.props.services[idx].value || 0 ) )
                                            :   0
                                        :   +this.props.services[idx].calculation_unit && +this.props.services[idx].calculation_unit === 2
                                            // если нет, то calc_unit == 2 - по квартире, 1 - по кв.м. квартиры
                                            ?   +( +this.props.services[idx].tariff || 0 )
                                            :   +( ( +this.props.services[idx].tariff || 0 ) * ( +this.props.room.total_area || 0) )
                                    : 0 )
                            ),0) ).toFixed(2)
                        :   null
                    }
                </td>
            </tr>,
            this.props.isOpened
                ?   <tr className="nest nest-simple" key={2}>
                        <td colSpan="3">
                            <table className="nested-table">
                                <colgroup>
                                    <col width={`${this.props.assigned ? '33%' : '53%'}`} />
                                    { this.props.assigned && this.props.room && this.props.entrances ? <col width="20%" /> : null }
                                    <col width="15%" />
                                    {
                                        //<col width="8%" />}
                                    }
                                    <col width="10%" />
                                    <col width="10%" />
                                    <col width="12%" />
                                </colgroup>
                                <thead className="thead">
                                <tr>
                                    <th className="text-left">Услуга</th>
                                    { this.props.assigned && this.props.room && this.props.entrances ? <th>Назначение</th> : null }
                                    <th>Период оказания</th>
                                    {
                                        //<th>Ед.расчёта</th>
                                    }
                                    <th>Объём</th>
                                    <th>Тариф</th>
                                    <th>
                                        {   this.props.isEditing
                                            ? ''
                                            : 'Стоимость'
                                        }
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    Object.keys(this.props.services)
                                        .filter( service_id => this.props.services[service_id].is_active )
                                        .map( service_id =>    [    <RoomServiceRow service={ this.props.services[service_id] }
                                                                                    serviceTypes={ this.props.serviceTypes }
                                                                                    room={ this.props.room }
                                                                                    key={ 'row'+service_id }
                                                                                    isEditing={ this.props.isEditing}
                                                                                    toggleEdit={ this.props.toggleEdit }
                                                                                    rooms={ this.props.rooms || {} }
                                                                                    entrances={ this.props.entrances || {} }
                                                                                    assigned={ !!this.props.assigned }
                                                                                    toggleItemEdit={ this.props.toggleItemEdit }
                                                                                    />,
                                                                    !!this.props.editing[ service_id ]
                                                                    ?   [
                                                                            <tr key={ 'empty'+service_id }></tr>,   // хак для полосатой таблички :-)
                                                                            <tr key={ 'editor'+service_id } className="nest">
                                                                                <td colSpan={6}>
                                                                                    <RoomsServiceCreator    serviceTypes={ this.props.serviceTypes}
                                                                                                            type={this.props.type}
                                                                                                            closeEditor={ () => this.props.toggleItemEdit( service_id ) }
                                                                                                            rooms={ this.props.rooms || {} }
                                                                                                            entrances={ this.props.entrances || {} }
                                                                                                            houseId={ this.props.room.house_id }
                                                                                                            room={ this.props.room }
                                                                                                            storeRoomService={ this.props.storeRoomService }
                                                                                                            service={ this.props.services[service_id] }
                                                                                                            />
                                                                                </td>
                                                                            </tr>
                                                                        ]
                                                                    :   null
                                                                ]
                                    )
                                }
                                </tbody>
                            </table>
                        </td>
                    </tr>
                :   null
        ]
    }
}

const RoomServiceRow = (props) => {

    let service = props.service,
        service_types = props.serviceTypes,
        service_type = service.service_type_id && service_types[ service.service_type_id ] || {},
        room = props.room,
        rooms = props.rooms || {},
        entrances = props.entrances || {}

    return (
        <tr>
            <td className="text-left">
                { service.name }
                { service.end_date
                    ?   (+Date.parse(service.end_date) - +Date.now()) < 86400000*3
                        ?   <span className="pull-right text-danger">(до { dateFormat(Date.parse(service.end_date), 'yyyy.mm.dd') })</span>
                        :   <span className="pull-right text-muted">(до { dateFormat(Date.parse(service.end_date), 'yyyy.mm.dd') })</span>
                    :   null
                }
            </td>
            {   // НАЗНАЧЕНИЕ
                props.assigned
                    ?   <td>
                        {
                            service.assignment_type === 3
                                ? 'Весь дом'
                                : +service.assignment_type === 2 && +service.connection_type === 1
                                ? 'Все подъезды'
                                : +service.assignment_type === 2 && +service.connection_type === 2
                                    ? 'Подъезды кроме: ' + service.connection_details.map( entrance_id => entrances[entrance_id] && entrances[entrance_id].number || null ).join(', ')
                                    : +service.assignment_type === 2 && +service.connection_type === 3
                                        ? 'Подъезды: ' + service.connection_details.map( entrance_id => entrances[entrance_id] && entrances[entrance_id].number || null ).join(', ')
                                        : +service.assignment_type === 1 && +service.connection_type === 1
                                            ? 'Все квартиры'
                                            : +service.assignment_type === 1 && +service.connection_type === 2
                                                ? 'Квартиры, кроме: ' + service.connection_details.map( room_id => rooms[room_id] && rooms[room_id].number || null ).join(', ')
                                                : +service.assignment_type === 1 && +service.connection_type === 3
                                                    ? 'Квартиры: ' + service.connection_details.map( room_id => rooms[room_id] && rooms[room_id].number || null ).join(', ')
                                                    : 'Весь дом'
                        }
                        </td>
                    :   null
            }
            <td>
                {   // период оказания
                    service_type.type === 1
                        ?   'разовая'
                        :   service.period_arr && service.period_arr.length
                            ?   service.period_arr.map( month => ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][month-1]).join(', ')
                            :   'весь год'
                }
            </td>
            {
                /*
                <td>
                    {   // единица расчёта
                        !!service_types[ service.service_type_id ]
                            ? service_types[ service.service_type_id ].type === 1 // если разовая услуга
                            ? service_types[ service.service_type_id ].units || <span>м<sup>2</sup></span>
                            : !!service.calculation_unit
                                ? +service.calculation_unit === 1
                                    ? <span>м<sup>2</sup></span> // расчёт по кв.м.
                                    : 'квартира'
                                : <span>м<sup>2</sup></span>
                            : '-'
                    }
                </td>
                */
            }
            <td>
                {   // единица расчёта
                    !!service_types[service.service_type_id]
                        ?   service_types[service.service_type_id].type === 1 // если разовая услуга
                            ?   service.value || 0
                            :   !!service.calculation_unit
                                ?   +service.calculation_unit === 1
                                    ?   room.total_area || 0 // расчёт по кв.м.
                                    :   1
                                :   room.total_area || 0
                        :   '-'
                }
                {` `}
                {
                    // единица расчёта
                    !!service_types[ service.service_type_id ]
                        ? service_types[ service.service_type_id ].type === 1 // если разовая услуга
                            ? service_types[ service.service_type_id ].units || <span>м<sup>2</sup></span>
                            : !!service.calculation_unit
                                ? +service.calculation_unit === 1
                                    ? <span>м<sup>2</sup></span> // расчёт по кв.м.
                                    : 'кв.'
                                : <span>м<sup>2</sup></span>
                        : ''
                }
            </td>
            <td>
                { +service.tariff ? (+service.tariff).toFixed(2) : 0 }
            </td>
            <td className={`${ props.isEditing && service.is_editable ? '' : 'td-btn-fix'}`}>
                {
                    props.isEditing
                    // Кнопка редактирования
                    ?   service.is_editable
                        ? <div className="btn btn-icon btn-edit btn-primary btn-block" onClick={ () => props.toggleItemEdit(service.service_id) }>Изменить</div>
                        : ''
                    // Стоимость
                    :   !!service_types[service.service_type_id]
                        ?   service_types[service.service_type_id].type === 1 // если разовая услуга
                            ?   +service.tariff && +service.value ? (+service.tariff * +service.value).toFixed(2) : 0 // Тариф на объём
                            :   !!service.calculation_unit // Если нет, то по единице расчёта
                                ?   +service.calculation_unit === 1
                                    ?   +service.tariff && +room.total_area ? (+service.tariff * +room.total_area).toFixed(2) : 0 // расчёт по кв.м.
                                    :   +service.tariff ? (+service.tariff).toFixed(2) : 0 // расчёт на 1 квартиру
                                :   +service.tariff && +room.total_area ? (+service.tariff * +room.total_area).toFixed(2) : 0 // по умолчанию на кв.м.
                        :   '-'
                }
            </td>
        </tr>
    )
}

class RoomsServiceCreator extends React.Component {
    constructor(props){
        super(props);

        let month_arr = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
        this.state = {
            service_id:         this.props.service && this.props.service.service_id || 0,
            service_type_id:    this.props.service && this.props.service.service_type_id || 0,
            calculation_unit:   this.props.service && this.props.service.calculation_unit || 1,
            tariff:             this.props.service && this.props.service.tariff || 0,
            value:              this.props.service && this.props.service.value || 0,
            charge_type:        this.props.service && this.props.service.charge_type || 2,
            charge_arr:         this.props.service && this.props.service.charge_arr || [],
            assessment_type:    this.props.service && this.props.service.assessment_type || 2,
            connection_type:    this.props.service && this.props.service.connection_type || 1,
            connection_details: this.props.service && this.props.service.connection_details || [],
            period_type:        this.props.service && this.props.service.period_arr && this.props.service.period_arr.length > 0 ? 2 : 1,
            period_arr:         this.props.service && this.props.service.period_arr || [],
            end_date:           this.props.service && this.props.service.end_date || '',
            errors:             { service: {}, fetch: '' },
            isSaving:           false,
        }
        this.rooms = {}
        this.entrances = {}
        this.months = {}

            console.log('END_DATE', this.props.service)

        month_arr.map( (month, index) => this.months[index+1] = month );

        Object.keys(this.props.rooms)
            .filter( el => +this.props.rooms[el].house_id === +this.props.houseId )
            .map( room_id => this.rooms[room_id] = 'кв.'+this.props.rooms[room_id].number)
        Object.keys(this.props.entrances)
            .filter( el => +this.props.entrances[el].house_id === +this.props.houseId )
            .map( entrance_id => this.entrances[entrance_id] = "№"+this.props.entrances[entrance_id].number)

    }

    render(){

        let services = this.props.services,
            service_types = this.props.serviceTypes

        let setStateValue = ( name, value ) => {
            let _state = {...this.state}

            if( typeof(_state[name]) === 'undefined' ) return;

            _state[name] = value;
            if( name === 'service_type_id' || name === 'connection_type' ){ _state['connection_details'] = []; }
            this.setState(_state);
        }

        let changeStateValue = event => {
            if( !event.target || !event.target.name || typeof(event.target.value) === 'undefined' ) return;
            setStateValue( event.target.name, event.target.value );
        }

        // Удаляет услугу, выставляя ей срок окончания вчерашним днём
        let dropService = () => {
            Promise.resolve()
                .then( () => this.setState({ end_date: dateFormat( Date.now(), 'yyyy-mm-dd') }) )
                .then( () => {
                    if ( !!this.refs.date_input ) {
                        this.refs.date_input.dispatchEvent( new Event( 'keydown', {bubbles: true} ) ); // material.js правильно обрабатывает заполненный инпут
                    }
                })
                .then( () => saveServices() )
            //saveServices();
        }

        // Проверяет инпуты
        let validateInput = () => {

            let errors = { service: {}, fetch: '' };

            // Тип услуги
            if( !(+this.state.service_type_id) || !this.props.serviceTypes[ +this.state.service_type_id] ) errors.service['service_type_id'] = 'тип услуги';
            // Тариф
            if( (!(+this.state.tariff) && +this.state.tariff !== 0) || +this.state.tariff < 0 ) errors.service['tariff'] = 'тариф';
            // Период оплаты
            if( +this.state.charge_type === 3 && this.state.charge_arr.length === 0 ) errors.service['charge_arr'] = 'период оплаты';
            // Дата окончания действия
            if( this.state.end_date && Date.parse(this.state.end_date) && Date.parse(this.state.end_date) < (+Date.now()-86400000*2 ) ) errors.service['end_date'] = 'дата окончания действия';

            if( +this.state.service_type_id && this.props.serviceTypes[ +this.state.service_type_id] ){ // если услуга задана

                let service_type = this.props.serviceTypes[ +this.state.service_type_id]

                if ( +service_type.type !== 1 ) {  // Периодические услуги
                    // Указан период оказания и он не нулевой
                    if ( !( +this.state.period_type ) || +this.state.period_type < 1 || +this.state.period_type > 3 ) errors.service[ 'period_arr' ] = 'период оплаты';
                    // Указан период оказания и он не нулевой
                    if ( +this.state.period_type === 2 && this.state.period_arr.length === 0 ) errors.service[ 'period_arr' ] = 'период оказания';
                    // Единица расчёта
                    if ( !( +this.state.calculation_unit ) || +this.state.calculation_unit < 1 || +this.state.calculation_unit > 2 ) errors.service[ 'calculation_unit' ] = 'единица расчёта';
                } else {  // Разовые услуги
                    // Объём работ
                    if ( ( !( +this.state.value ) && +this.state.value !== 0 ) || +this.state.value < 0 ) errors.service[ 'value' ] = 'объем';
                }

                if( this.props.type === 'assigned' && +service_type.assignment_type !== 3) {
                    // Назначаемые услуги, на подъезд или квартиру
                    if( (+this.state.connection_type === 2 || +this.state.connection_type === 3 )
                        && +this.state.connection_details.length <= 0 ) {    errors.service[ 'connection_details' ] = 'объекты назначения'; }
                }

            }

            console.log(errors.service)
            this.setState({ errors });

            return +Object.keys(errors.service).length <= 0;
        }

        let saveServices = () => {
            // Уже отправляем
            if( this.state.isSaving ) return;
            // Блокируем отправку
            this.setState({ isSaving: true });

            // Валидацию не прошло
            if( !validateInput() ){
                this.setState({ isSaving: false });
                return;
            }


            this.setState({ isSaving: false });
            let data =   {  service_type_id:    +this.state.service_type_id,
                            tariff:             +this.state.tariff,
                            charge_type:        +this.state.charge_type,
                            charge_arr:         this.state.charge_arr,
                            assessment_type:    2,
                            assignment_type:    this.props.serviceTypes[ +this.state.service_type_id].assignment_type,
                        }

            // Дата окончания
            if( this.state.end_date && Date.parse(this.state.end_date) ){
                data.end_date = this.state.end_date;
            }else{
                console.log('WRONG DATE!', 1, this.state.end_date)
            }
            // Для назначаемых
            if( this.props.type === 'assigned' && +this.state.service_type_id && this.props.serviceTypes[ +this.state.service_type_id]
                && this.props.serviceTypes[ +this.state.service_type_id] !== 3
                && this.props.serviceTypes[ +this.state.service_type_id] !== 0
                ){
                    data.connection_type = this.state.connection_type;
                    if( +this.state.connection_type === 2 || +this.state.connection_type === 3){
                        data.connection_details = this.state.connection_details;
                    }
            }

            // Для разовых
            if( +this.state.service_type_id && this.props.serviceTypes[ +this.state.service_type_id] && this.props.serviceTypes[ +this.state.service_type_id].type === 1 ){
                data.value = +this.state.value;
            }else{
                data.calculation_unit = +this.state.calculation_unit;
                if( +this.state.period_type === 2 ){
                    data.period_arr = this.state.period_arr;
                }
            }

            // Для индивидуальных
            if( this.props.type === 'individual' ){
                data.room_id =  +this.props.room.room_id;
            }else{
                data.house_id = +this.props.houseId;
            }

            let errors = { service: {}, fetch: '' },
                response_data = {};

            this.setState({ errors }); // Очистим ошибки

            fetchData('services' + ( this.state.service_id ? '/' + this.state.service_id : '' ),
                        {   method: this.state.service_id ? 'PUT' : 'POST',
                            data })
                .then( response => response_data = response.success && response.data || {} )
                .then( () => {
                    response_data._room_id = this.props.room.room_id
                    response_data.is_editable = true
                } )
                .then( () => this.props.storeRoomService(this.props.type, response_data) )
                .then( () => this.props.closeEditor() )
                .catch( error => {
                    errors.fetch = Object.isObject(error) ? error.message : error;
                    this.setState({ isSaving: false, errors })
                })


        }

        return (
            <div className="panel">
                <div className="panel-body text-left" style={{ marginTop: '1px'}}>

                    <h5>Услуга</h5>
                    <div className="row">
                        <div className="col-sm-3">
                            <div className={`form-group ${ this.state.errors.service['service_type_id'] ? 'has-error' : null }`}>
                                <select     className="form-control"
                                            name="service_type_id"
                                            value={ this.state.service_type_id }
                                            onChange={ changeStateValue }
                                            >
                                                <option value={0}>...</option>
                                                {   Object.keys(this.props.serviceTypes)
                                                    .map( service_type_id => service_types[service_type_id] )
                                                    .filter( el =>  (   el.sub_type === this.props.type && el.type !== 2) )
                                                    .map( service_type =>   <option value={ service_type.service_type_id }
                                                                                    key={ service_type.service_type_id }>
                                                        { service_type.name }
                                                    </option> )
                                                })
                                </select>
                                <label className="control-label">
                                    <span>Услуга*</span>
                                </label>
                            </div>
                        </div>

                        {   // Единица расчёта. Только для периодических услуг.
                            ( service_types[ this.state.service_type_id ] && +service_types[ this.state.service_type_id ].type !== 1 ) || this.props.type === 'assigned'
                            ?   <div className="col-sm-3">
                                    <div className={`form-group ${ this.state.errors.service['calculation_unit'] ? 'has-error' : null }`}>
                                        <select className="form-control"
                                                name="calculation_unit"
                                                value={ this.state.calculation_unit }
                                                onChange={ changeStateValue }>
                                            <option value={1}>Кв. метр</option>
                                            <option value={2}>Квартира</option>
                                        </select>
                                        <label className="control-label">
                                            <span>Единица расчёта</span>
                                        </label>
                                    </div>
                                </div>
                            :   null
                        }

                        <div className="col-sm-3">
                            <div className={`form-group ${ this.state.errors.service['tariff'] ? 'has-error' : null }`}>
                                <input type="number"
                                       className="form-control"
                                       name="tariff"
                                       value={ this.state.tariff }
                                       onChange={ changeStateValue }
                                       />
                                <label className="control-label">
                                    <span>Тариф</span>
                                </label>
                            </div>
                        </div>

                        <div className="col-sm-3">
                            <div className={`form-group ${ this.state.errors.service['end_date'] ? 'has-error' : null }`}>
                                <input type="date"
                                       className="form-control"
                                       name="end_date"
                                       value={ this.state.end_date }
                                       onChange={ changeStateValue }
                                       min={ dateFormat( +(+Date.now()-86400000), 'yyyy-mm-dd') }

                                       />
                                <label className="control-label">
                                    <span>Дата окончания действия</span>
                                </label>
                            </div>
                        </div>

                        {   // Объем. Только для разовых.
                            service_types[ this.state.service_type_id ] && +service_types[ this.state.service_type_id ].type === 1
                                ?   <div className="col-sm-3">
                                        <div className={`form-group ${ this.state.errors.service['value'] ? 'has-error' : null }`}>
                                            <input type="number"
                                                   className="form-control"
                                                   name="value"
                                                   value={ this.state.value }
                                                   onChange={ changeStateValue }
                                                   />
                                            <label className="control-label">
                                                <span>Объём работ</span>
                                            </label>
                                        </div>
                                    </div>
                                :   null
                        }

                    </div>
                    <div>
                        <h5>Периодичность оказания</h5>

                        {   // Период оказания. Для всех, кроме разовых.
                            service_types[ this.state.service_type_id ] && +service_types[ this.state.service_type_id ].type !== 1
                            ? <div className="row">

                                <div className="col-sm-3">
                                    <div className="form-group">
                                        <select className="form-control"
                                                name="period_type"
                                                value={ this.state.period_type }
                                                onChange={ changeStateValue }>
                                            <option value={1}>Весь год</option>
                                            <option value={2}>Указать</option>
                                        </select>
                                        <label className="control-label">
                                            <span>период оказания</span>
                                        </label>
                                    </div>
                                </div>

                                {   +this.state.period_type === 2
                                    ?   <div className="col-sm-9">
                                            <Autocomplete   list={ this.months }
                                                            value={ this.state.period_arr.sort( (a,b) => ( +a > +b ? 1 : +a < +b ? -1 : 0 ) ) }
                                                            exclude={ this.state.period_arr }
                                                            onSelect={ val => setStateValue("period_arr", val) }
                                                            label="период оказания"
                                                            hasError={ !!this.state.errors.service['period_arr'] }
                                                            />
                                        </div>
                                    :   null
                                }

                            </div>
                            : null
                        }

                        <div className="row">

                            <div className="col-sm-3">
                                <div className="form-group">
                                    <select className="form-control"
                                            name="charge_type"
                                            value={ this.state.charge_type }
                                            onChange={ changeStateValue }>
                                                <option value={1}>Весь год</option>
                                                <option value={2}>Равен периоду оказания</option>
                                                <option value={3}>Указать</option>
                                    </select>
                                    <label className="control-label">
                                        <span>период оплаты</span>
                                    </label>
                                </div>
                            </div>

                            {   +this.state.charge_type === 3
                                ?   <div className="col-sm-9">
                                        <Autocomplete   list={ this.months }
                                                        value={ this.state.charge_arr.sort( (a,b) => ( +a > +b ? 1 : +a < +b ? -1 : 0 ) ) }
                                                        exclude={ this.state.charge_arr }
                                                        onSelect={ val => setStateValue("charge_arr", val) }
                                                        label="период оплаты"
                                                        hasError={ !!this.state.errors.service['charge_arr'] }
                                                        />
                                    </div>
                                :   null
                            }

                        </div>

                        {   this.props.type && this.props.type === 'assigned' && service_types[ this.state.service_type_id ] && typeof(service_types[ this.state.service_type_id ].assignment_type) !== 'undefined'
                            ?   <div className="row">
                                    <div className="col-sm-12">
                                        <h5>Объекты назначения</h5>
                                    </div>
                                    <div className="col-sm-3">
                                        <div className="form-group form-group-readonly">
                                            <span className="form-control">
                                                {
                                                    service_types[ this.state.service_type_id ] && +service_types[ this.state.service_type_id ].assignment_type !== 0
                                                    ?   ['','Квартиры','Подъезды','Дом'][+service_types[ this.state.service_type_id ].assignment_type]
                                                    :   ' '
                                                }
                                            </span>
                                            <label className="control-label">
                                                <span>назначить на</span>
                                            </label>
                                        </div>
                                    </div>

                                    {   this.state.service_type_id && service_types[ this.state.service_type_id ]
                                        && (+service_types[ this.state.service_type_id ].assignment_type === 1 || +service_types[ this.state.service_type_id ].assignment_type === 2)
                                        ? <div className="col-sm-3">
                                            <div className="form-group">
                                                <select className="form-control"
                                                        name="connection_type"
                                                        value={this.state.connection_type}
                                                        onChange={changeStateValue}>
                                                    <option value={1}>Все</option>
                                                    <option value={2}>Все, кроме</option>
                                                    <option value={3}>Только указанные</option>
                                                </select>
                                                <label className="control-label">
                                                    <span>выбрать</span>
                                                </label>
                                            </div>
                                        </div>
                                        : null
                                    }

                                    {   +this.state.connection_type === 2 || +this.state.connection_type === 3
                                        ?   <div className="col-sm-6">
                                            {   +service_types[ this.state.service_type_id ].assignment_type === 1
                                                ?   <Autocomplete list={ this.rooms }
                                                                  value={this.state.connection_details}
                                                                  exclude={this.state.connection_details}
                                                                  onSelect={val => setStateValue( "connection_details", val )}
                                                                  label="квартиры"
                                                                  hasError={!!this.state.errors.service[ 'connection_details' ]}
                                                                  key={1}
                                                                  />
                                                :   +service_types[ this.state.service_type_id ].assignment_type === 2
                                                    ?   <Autocomplete list={ this.entrances }
                                                                      value={this.state.connection_details}
                                                                      exclude={this.state.connection_details}
                                                                      onSelect={val => setStateValue( "connection_details", val )}
                                                                      label="подъезды"
                                                                      hasError={!!this.state.errors.service[ 'connection_details' ]}
                                                                      key={2}
                                                                      />
                                                    :   null
                                            }
                                            </div>
                                        : null
                                    }
                                </div>
                            :   null
                        }
                    </div>
                </div>
                <div className="panel-body">

                    {   this.state.service_id
                        ?   <button type="button" className="btn btn-default btn-clear btn-icon btn-danger btn-raised pull-left" title="Удалить" onClick={ () => { if( !this.state.isSaving ){ dropService() } } }>Закрыть Услугу</button>
                        :   null
                    }

                    <div className="btn-group-flex pull-right">
                        { this.state.isSaving
                            ? <span className="form-inline" style={ {    padding: "4px 10px 0 0", opacity: 0.7, fontWeight: 'bold'} }><i className="material-icons rotated">autorenew</i> СОХРАНЯЕМ</span>
                            : null }
                        &nbsp;
                        <button type="button" className="btn btn-default btn-clear btn-icon" title="Отменить" onClick={ () => { if( !this.state.isSaving ){ this.props.closeEditor() } } }>Отменить</button>
                        &nbsp;
                        <button type="button" className={`btn btn-primary btn-save btn-icon btn-raised`} title="Сохранить" onClick={ saveServices }>Сохранить</button>
                    </div>
                    <div className="clearfix" />
                </div>
                { this.state.errors.fetch
                    ?   <div className="alert alert-error" style={{ marginBottom: 0 }}>
                        <div className="alert-content">
                                    <span className="alert-title">Сетевая ошибка:&nbsp;
                                        <strong>{ this.state.errors.fetch }</strong>
                                    </span>
                        </div>
                    </div>
                    : Object.keys(this.state.errors.service).length
                        ?   <div className="alert alert-error" style={{ marginBottom: 0 }}>
                                <div className="alert-content">
                                        <span className="alert-title">Заполните правильно:&nbsp;
                                            { Object.keys( this.state.errors.service ).map( (key, index) => (
                                                <strong key={ key }>{ this.state.errors.service[key] }{index < Object.keys(this.state.errors.service).length-1 ? ', ' : ''}</strong>
                                            ))}
                                        </span>
                                </div>
                            </div>
                        :   this.props.type === 'house_common'
                            ?   <div>
                                    <div className="alert alert-info" style={{ marginBottom: 0 }}>
                                        <div className="alert-content"><strong className="alert-title">Изменения будут применены для всех квартир этого дома</strong></div>
                                    </div>
                                </div>
                            :   this.props.type === 'house_common'
                                ?   <div>
                                        <div className="alert alert-info" style={{ marginBottom: 0 }}>
                                            <div className="alert-content"><strong className="alert-title">Изменения будут применены для всех квартир в объектах назначения</strong></div>
                                        </div>
                                    </div>
                                :   null
                }

            </div>
        )
    }
}

class RoomCountersTable extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            service_values: {},
            counter_models: {},
            values_loaded: false,
            service_counters: {},
            tariffs: {},
            improvement_types: {},
            norms:  {},
        }

    }

    componentDidMount(){

        let service_values = {...this.state.service_values},
            counter_models = {},
            service_counters = {},
            tariffs = {},
            improvement_types={},
            norms=[]

        this.props.room.counters.map( counter_id => {

            let counter = this.props.data.counters[ counter_id ];
            if(!counter) return;

            service_counters[ counter.service_id ] = service_counters[ counter.service_id ] || [];
            service_counters[ counter.service_id ].push(counter_id);
        })

        this.setState({ service_counters })
        Promise.all( this.props.room.counters.map( counter_id => {
            return fetchData( 'service-values/' + counter_id )
                .then( response => response.success && response.data || {} )
        } ) )
        .then( values => values.map( value => service_values[ value.counter_id ] = value ))
        .then( () => this.setState({ service_values }))
        .then( () => console.log('FINALLY GOT VALUES', service_values) )

        fetchData( 'counter-models' )
            .then( response => response.success && response.data || [] )
            .then( models => models.map( model => counter_models[model.counter_model_id] = model ))
            .then( () => this.setState({ counter_models }))

        fetchData( 'tariffs' )
            .then( response => response.success && response.data || [] )
            .then( _tariffs => _tariffs.map( tariff => tariffs[tariff.service_type_id] = tariff ))
            .then( () => this.setState({ tariffs }))

        fetchData( 'improvement-types' )
            .then( response => response.success && response.data || [] )
            .then( types => types
            // для room.type = 1 is_habitable true, для остальных false
                            .filter( type => type.is_habitable === ( this.props.data.room.type === 1 ) )
                            .map( type => improvement_types[type.improvement_type_id] = type ))
            .then( () => this.setState({ improvement_types }))

        fetchData( 'norms' )
            .then( response => response.success && response.data || [] )
            .then( _norms => norms = _norms
                                    .filter( norm => norm.improvement_type_id && this.state.improvement_types[norm.improvement_type_id] ) )
            .then( () => this.setState({ norms }))

    }

    render(){
        return (
            <div>

                {
                 /*
                 <RoomCounterTariffTable data={ this.props.data }
                                        tariffs={ this.state.tariffs }
                                        improvementTypes={ this.state.improvement_types }
                                        norms={ this.state.norms }
                                        />
                  */
                }

                {
                    /*
                    Object.keys(this.props.data.services)
                    .map( service_id => this.props.data.services[service_id])
                    .filter( service => this.props.data.service_types[service.service_type_id].type === 2 && +service.house_id === +this.props.room.house_id )
                    .map( service => (
                        <RoomCounterServiceRow service={service}
                                               data={this.props.data}
                                               name={this.props.data.service_types[service.service_type_id].name}
                                               counter={ this.state.service_counters[service.service_id] && this.props.data.counters[this.state.service_counters[service.service_id]] }
                                               values={ this.props.data.counters[this.state.service_counters[service.service_id]] && this.state.service_values[ this.props.data.counters[this.state.service_counters[service.service_id]].counter_id ] }
                                               models = {this.state.counter_models}
                                               key={service.service_id}
                                               />
                    ) )
                    */
                }


                {
                    Object.keys( this.state.service_counters )

                        .map( service_id    =>  <RoomCounterServiceRow  service={ this.props.data.services[service_id] }
                                                                        data={this.props.data}
                                                                        name={this.props.data.service_types[this.props.data.services[service_id].service_type_id].name}
                                                                        counters={ this.state.service_counters[service_id] }
                                                                        //values={ this.props.data.counters[this.state.service_counters[service.service_id]] && this.state.service_values[ this.props.data.counters[this.state.service_counters[service.service_id]].counter_id ] }
                                                                        models = {this.state.counter_models}
                                                                        key={service_id}
                                                                        />)
                }
            </div>
        )
    }

}

class RoomCounterTariffTable extends React.Component {
    render(){
        return (
            <div>
                <div className="panel">
                    <div className="panel-heading">Тарифы</div>
                    <table className="table table-bordered table-condensed">
                        <tbody>
                        {
                            Object.keys(this.props.tariffs).map( service_type_id => {

                                let tariff = this.props.tariffs[service_type_id]
                                return (
                                    <tr key={service_type_id}>
                                        <td>{ this.props.data.service_types[service_type_id] && this.props.data.service_types[service_type_id].name }</td>
                                        <td>
                                            { service_type_id }
                                            {
                                                Object.keys(this.props.improvementTypes)
                                                    .some( type => +this.props.improvementTypes[type].resource_id === +service_type_id ).name
                                            }
                                        </td>
                                        <td>{(+tariff.value).toFixed(2)}</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

class RoomCounterServiceRow extends React.Component {
    render(){
        return (
          <div className="panel panel-default">
              <div className="panel-heading">
                  <div className="panel-title">
                      { this.props.name }
                  </div>
              </div>
                  {
                      this.props.counters.map( counter_id =>  <RoomCounterRow   key={counter_id}
                                                                                counter={ this.props.data.counters[counter_id] }
                                                                                //values={ this.props.values }
                                                                                service={this.props.service}
                                                                                model={ this.props.models[ this.props.data.counters[counter_id].counter_model_id ] }
                                                                                />)

                  }
          </div>
        );
    }
}

class RoomCounterRow extends React.Component {

    constructor(props){
        super(props);
        this.state = { value: '' }
    }

    render() {

        let sendServiceValue = () => {
            return fetchData("service-values", {
                method: "POST", data: {
                    counter_id: this.props.counter.counter_id,
                    service_id: this.props.service.service_id,
                    value: this.state.value,
                    work_id: null,
                    is_fact: true
                }
            })
            .then(response => response.success && response.data || {})
        }

        let setValue = event => {
            this.setState({ value: +event.target.value.replace('.',',') })
        }

        return (
            <form className="panel-body" style={{paddingTop: '3px', paddingBottom: 0}}>

                <div className="row">

                    <div className="col-sm-3" style={{marginTop: '2px'}}>
                        <h4>
                            <strong>{ this.props.model && this.props.model.name || "N/A"}</strong>
                            {` `}
                            {this.props.counter.serial_number}
                        </h4>
                    </div>
                    <div className="col-sm-3" style={{marginTop: '2px'}}>
                        <div className="row">
                            <div className="col-xs-6">
                                <label className="text-small">Дата поверки</label>
                                <div>
                                    {dateformat( this.props.counter.seal_date, "dd.mm.yyyy" )}
                                </div>
                            </div>
                            <div className="col-xs-6">
                                <label className="text-small">Следующая поверка</label>
                                <div>
                                    {dateformat( this.props.counter.next_verify_date, "dd.mm.yyyy" )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-3">
                        <div className="bem-form-group__inner-form-group form-group form-group-readonly">
                            <div className="input-group">
                                    <span className="form-control">

                                        {` `}
                                        <span className="text-muted">{this.props.units}</span>
                                    </span>
                                <button data-toggle="modal" data-target={`#${this.props.counter.counter_id}`}
                                        className="btn btn-success btn-icon btn-history btn-raised"
                                        style={{margin: '5px'}}
                                >
                                    История
                                </button>
                            </div>
                            <label className="control-label">
                                <span>Показание от {dateformat( this.props.lastInputDate, "dd.mm.yyyy" )}</span>
                            </label>

                        </div>
                    </div>

                    <div className="col-sm-3 bem-form-group ">

                        <div
                            className={`bem-form-group__inner-form-group form-group is-empty `}
                            >


                            <div className="input-group">
                                <input data-toggle="tooltip"
                                       title="Текст всплывающей подсказки"
                                       className="form-control"
                                       type="number"
                                       step="any"
                                       onChange={ setValue }
                                       value={ this.state.value }
                                />

                                <button type="submit"
                                        className="btn btn-primary btn-icon btn-forward au-target btn-raised"
                                        style={{margin: '5px'}}
                                        onClick={() => sendServiceValue() }
                                        disabled={false}
                                >
                                    Ввести
                                </button>

                            </div>

                            <label className="control-label">
                                <span>Показание</span>
                            </label>
                        </div>

                    </div>


                </div>

            </form>
        )
    }
}
