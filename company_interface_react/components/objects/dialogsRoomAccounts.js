import dateFormat from "dateformat";
import React from "react";
import {DateToTextValueConverter, nameFormatValueConverter} from "../../../../dist/components/global-converter";
import fetchData from "../../actions/fetchData";
import {partSummCalculator} from "../../actions/partCalculator";
import Autocomplete from "../autocomplete";


// Лицевые счета
const RoomAccounts = (props) => {
    // Здесь должен быть цикл по Object.keys(props.data.room.documents)[0], но на данный момент документ только один.
    return (
        <div>
            <div className="panel panel-default" style={{ marginBottom: 0}}>
                <div className="panel-heading panel-toggle-sm">
                    <h4 className="panel-title">Лицевые счета <span className="badge">{ props.data.room.accounts.length }</span></h4>
                    <div className="pull-right">
                        {   !props.isEditing
                            ? <button type="button" className="btn btn-icon btn-primary btn-raised btn-edit pull-right" onClick={ () => props.enableEditor('accounts') }>Редактировать</button>
                            : <button type="button" className="btn btn-default btn-clear btn-icon" title="Отменить" onClick={ () => props.disableEditor('accounts') }>Закрыть</button>
                        }
                    </div>

                </div>
            </div>
            <div className="nested-table-fix">
                {
                    !props.isEditing
                        ? <RoomAccountsTable    data={ props.data } />
                        : <RoomAccountsEditor   disableEditor={ props.disableEditor }
                                                storeRoomAccounts={ props.storeRoomAccounts }
                                                data={ props.data } />
                }
            </div>
        </div>
    )
};

class RoomAccountsTable extends React.Component {

    constructor(props){
        super(props);

        this.state = {

            total_active:    props.data.room.accounts.filter( account_id => !!props.data.accounts[ account_id].is_active ).length,
            total_opened:    props.data.room.accounts.filter( account_id => +props.data.accounts[ account_id].status === 1 ).length,

        }
    }

    render(){
        return (
            <table className="nested-table">
                <colgroup>
                    <col width="8%" />
                    <col width="27%" />
                    <col width="13%" />
                    <col width="14%" />
                    <col width="10%" />
                    <col width="11%" />
                    <col width="4%" />
                    <col width="2%" />
                    <col width="4%" />
                    <col width="7%" />
                </colgroup>
                <thead className="thead">
                <tr>
                    <th>Платит</th>
                    <th>ФИО</th>
                    <th>№ЛС</th>
                    <th>Обоснование</th>
                    <th>Дата открытия</th>
                    <th>Дата закрытия</th>
                    <th colSpan="3">Доля аккаунта</th>
                    <th>Статус</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.data.room.accounts
                    .sort( (a, b) => {
                        return +this.props.data.accounts[a].status === +this.props.data.accounts[b].status
                                ? nameFormatValueConverter.getName( this.props.data.ownersAll[ this.props.data.accounts[a].owner_id ].person ) > nameFormatValueConverter.getName( this.props.data.ownersAll[ this.props.data.accounts[b].owner_id ].person )
                                    ? 1
                                    : nameFormatValueConverter.getName( this.props.data.ownersAll[ this.props.data.accounts[a].owner_id ].person ) < nameFormatValueConverter.getName( this.props.data.ownersAll[ this.props.data.accounts[b].owner_id ].person )
                                        ? -1
                                        : 0
                                : +this.props.data.accounts[a].status === 1
                                    ? -1
                                    : 1
                    })
                    .map( account_id =>
                        this.props.data.accounts[account_id]
                        && this.props.data.ownersAll[ this.props.data.accounts[account_id].owner_id ]
                            ? <RoomAccountsRow data={ this.props.data }
                                               account={ this.props.data.accounts[account_id] }
                                               totalActive={ this.state.total_active }
                                               totalOpened={ this.state.total_opened }
                                               key={ account_id } />
                            : null
                    ) }
                </tbody>
            </table>
        )
    }
}

// Элемент списка собственников
const RoomAccountsRow = (props) => {

    let account = props.account,
        owners = props.data.owners,
        ownersAll = props.data.ownersAll,
        room = props.data.room,
        total_opened = props.totalOpened,
        total_active = props.totalActive;

    return (
        <tr style={ { opacity: (account.status === 1 ? 1 : .6) }}>
            <td>
                <div className="inner-td-wrp">
                    <div className="togglebutton td-actions__item">
                        { account.status === 1 && ( account.is_active || total_active === 0 || total_opened === 1 )
                            ? <i className="material-icons text-success text-bold">done</i>
                            : <i className="material-icons text-success text-bold">&nbsp;</i>
                        }
                    </div>
                </div>
            </td>
            <td className="text-left">
                {   ownersAll[props.account.owner_id] && ownersAll[props.account.owner_id].person
                    ? nameFormatValueConverter.getName( ownersAll[props.account.owner_id].person )
                    : ownersAll[props.account.owner_id] && ownersAll[props.account.owner_id].entity
                        ? ownersAll[props.account.owner_id].entity.short_name || ownersAll[props.account.owner_id].entity.name
                        : '-'   }
            </td>
            <td>{ account.number || account.account_id }</td>
            <td>{ account.reason || '-'}</td>
            <td>{   room.ownerships[ account.owner_id ] && room.ownerships[ account.owner_id ].start_date
                        ? dateFormat(Date.parse( room.ownerships[ account.owner_id ].start_date ), 'mm.dd.yyyy')
                        : '-' }
            </td>
            <td>{ account.deleted ? dateFormat(Date.parse( account.deleted ), 'mm.dd.yyyy') : '-' }</td>
            {
                ( props.total_opened === 1 && account.status === 1 ) || ( account.is_active && total_active === 1)
                    // ЛС -- единственный
                    ? <td colSpan="3">1 / 1</td>
                    : account.status === 1 && ( account.is_active || total_active === 0 )
                    ? <td colSpan="3">{ account.part_numerator || 0 } / { account.part_denominator || 0 }</td>
                    // ЛС закрыт, либо аккаунт не плательщик
                    : <td colSpan="3">-</td>
            }

            <td>{ props.account.status === 1 ? 'Открыт' : 'Закрыт' }</td>
        </tr>
    );
}

// Редактор лицевых счетов
class RoomAccountsEditor extends React.Component {

    constructor(props){

        super(props);

        this.state = {
            editor: {
                accounts:           this.props.data.room.accounts.map( account_id => {
                        let account = this.props.data.accounts[ account_id ];
                        return  {   account_id:         account.account_id,
                            number:             account.number || '',
                            part_numerator:     account.part_numerator || '',
                            part_denominator:   account.part_denominator || '',
                            deleted:            account.deleted,
                            is_active:          account.is_active,
                            reason:             account.reason || '',
                            status:             account.status,
                            original_status:    account.status,
                            owner_id:           account.owner_id,

                        }
                    }
                ),
            },
            total_parts:            0,
            total_opened:           0,
            total_active:           0,
            selected_owners:        [],
            owners:                 {},
            originalEditor:         {},
            isModified:             false,
            isSaving:               false,
            errors:                 { accounts: {}, global: {}, fetch: '' },
        }

        // Выставляет флаг isModified, сравнивая оригинальный объект редактора с текущим
        this.checkEditorModified = () => {

            let isModified = JSON.stringify(this.state.editor) !== JSON.stringify(this.state.originalEditor),
                isChanged = isModified !== this.state.isModified;

            if( isChanged && !!this.refs.main ) this.setState( { isModified })

            return isModified;
        }

        // Высчитывает суммарную долю аккаунтов, кол-во активных и открытых.
        // @return {float} - сумма долей всех аккаунтов
        this.updateParts = () => {
            let editor = { ...this.state.editor },
                total_parts = 0,
                total_active = 0,
                total_opened = 0,
                selected_owners = [],
                numerators = [],
                denominators = []

            editor.accounts.map( account => {
                selected_owners.push( account.owner_id );
                total_active += ( account.is_active && account.status === 1 ) ? 1 : 0;
                total_opened += +account.status === 1 || 0;
                if( !account || +account.status !== 1 || ( this.state.total_active > 0 && !account.is_active ) ) return;
                //total_parts += +account.part_numerator && +account.part_denominator ? +account.part_numerator / +account.part_denominator : 0
                numerators.push( +account.part_numerator );
                denominators.push( +account.part_denominator );
            });
            total_parts = partSummCalculator( numerators, denominators );

            if( !!this.refs.main ) this.setState( { total_parts, total_active, total_opened, selected_owners } );

            return total_parts;
        }

        // Заполним всех собственников для автокомплита
        this.props.data.room.owners.map( owner_id => {
            let owner = this.props.data.ownersAll[ owner_id ];
            if( !owner ) return;
            this.state.owners[ owner_id ] = owner && owner.person
                ? nameFormatValueConverter.getName( owner.person )
                : owner && owner.entity
                    ? owner.entity.short_name || owner.entity.name
                    : '-'
        });

        // Добавим тех собственников, у которых есть ЛС, но не перечислены как действующие
        this.state.editor.accounts.map( account => {
            let owner = this.props.data.ownersAll[ account.owner_id ];

            this.state.selected_owners.push( account.owner_id );

            if( !owner || this.state.owners[account.owner_id] ) return;

            this.state.owners[ account.owner_id ] = owner && owner.person
                ? nameFormatValueConverter.getName( owner.person )
                : owner && owner.entity
                    ? owner.entity.short_name || owner.entity.name
                    : '-';
        });

        this.state.total_parts = this.updateParts();
        this.state.originalEditor   = { ...this.state.editor }
        this.state.originalEditor.accounts = this.state.editor.accounts.map( account => ( { ...account } ) );


    }

    componentDidUpdate() {
        this.checkEditorModified();
    }

    componentDidMount() {
        this.updateParts();
    }

    render() {

        // Активный плательщик. Чекбокс по ивенту
        let setAccountValue = (index,key, value) => {
            let editor = {...this.state.editor},
                account = editor.accounts[index];

            if( !editor.accounts || !account || typeof( account[key] ) === 'undefined' ) return;

            account[key] = value;

            this.setState({ editor });
            this.updateParts();

        }

        // Добавление аккаунт
        let createAccount = () => {
            let accounts = this.state.editor.accounts;

            // Кол-во ЛС такое же, как и собственников
            if( accounts.length === Object.keys( this.state.owners ).length ) return;

            accounts.push( {    account_id:         null,
                number:             '',
                part_numerator:     0,
                part_denominator:   0,
                deleted:            '',
                is_active:          false,
                reason:             '',
                status:             1,
                original_status:    1,
                owner_id:           null,

            });

            this.setState( { accounts });
            this.updateParts();
        }

        // Удаляет аккаунты, но только созданные
        let dropAccount = index => {
            let account = this.state.editor.accounts[index],
                accounts = this.state.editor.accounts;

            if( !account || account.account_id ) return;

            accounts.splice( index, 1 );
            this.setState( { accounts } );
            this.updateParts();
        }

        // Проверяет инпуты
        let validateInput = () => {

            let errors = { global: {}, accounts: {}, fetch: '' };

            // Сумма долей = 1. Если ЛС - не единственный плательщик, не единственный открытый
            if( this.state.total_active !== 1 && this.state.total_opened !== 1 && this.updateParts() !== 1 ) errors.global['totalParts'] = 'сумма долей не равна 1';

            // Счетов должно быть больше нуля
            if( !this.state.editor.accounts.length ) errors.global['accounts'] = 'собственники';
            // Хотя бы один открытый
            if( +this.state.total_opened === 0 ) errors.global['count'] = 'хотя бы один открытый счёт';
            this.state.editor.accounts.map( (account, index) => {
                let account_errors = [];

                // Должен быть привязан собственник
                if( !Number.isInteger( +account.owner_id ) || account.owner_id <= 0 || !this.props.data.ownersAll[ account.owner_id ] ) account_errors.push('owner_id');

                //  Номер и обоснование
                if( !account.number || account.number.length < 1 ) account_errors.push('number')
                if( !account.reason || account.reason.length < 1 ) account_errors.push('reason')
                // Дата закрытия. Если аккаунт закрыт.
                if( +account.status === 3 && account.deleted && ( !Date.parse(account.deleted) || +Date.parse(account.deleted) > +Date.now() ) )  account_errors.push('deleted')
                // Аккаунт не пытаются открыть заново
                if( +account.status === 1 && +account.original_status === 3 ) account_errors.push('status')

                // Доли должны быть заполнены

                if( ( +account.status === 1 && +this.state.total_active !== 1 && +this.state.total_opened !== 1 )
                    && ( account.is_active || this.state.total_active === 0 )
                        // Аккаунт -- не единственный плательщик и не единственный открытый
                    && ( +account.part_numerator <= 0
                        || +account.part_denominator <= 0
                        || +account.part_numerator > +account.part_denominator ) ){
                    account_errors.push( 'parts' )
                }

                if( account_errors.length ){
                    errors.accounts[index] = account_errors;
                }

            });

            if( Object.keys(errors.accounts).length ){
                errors.global['owners'] = 'лицевые счета';
            }

            this.setState({ errors });

            return +Object.keys(errors.global).length <= 0;

        }

        let postAccounts = () => {

            let room_id     = this.props.data.room.room_id,
                accounts    = this.state.editor.accounts


            return Promise.all( accounts.map( item => {
                let account = {...item},
                    data = {
                        room_id,
                        owner_id:           +account.owner_id,
                        status:             +account.status || 1,
                        part_numerator:     +account.part_numerator ,
                        part_denominator:   +account.part_denominator,
                        is_active:          account.is_active,
                        number:             +account.number,
                        reason:             account.reason,
                        deleted:            account.deleted && Date.parse(account.deleted) && DateToTextValueConverter.getData( Date.parse( account.deleted ), 'YMD', {date: true, time: true}) || '',
                    }

                // Аккаунт -- единственный плательщик или единственный открытый. Платёжная доля -- 1
                if( ( +account.status === 1 && this.state.total_opened === 1 ) || (account.is_active && this.state.total_active === 1 ) ){
                    data.part_numerator = 1;
                    data.part_denominator = 1;
                }

                return  fetchData(  'accounts' + ( +account.account_id ? '/' + +account.account_id : '' ),
                    { method: +account.account_id ? 'PUT' : 'POST', data: data }
                ).then( response => response.success && response.data || {} )
            }))

        }

        // Отправляет сохраняющие запросы
        let saveAccounts = () => {

            // Уже отправляем
            if( this.state.isSaving ) return;
            // Блокируем отправку
            this.setState({ isSaving: true });
            // Ничего не изменилось
            if( !this.checkEditorModified() ) return this.props.disableEditor('accounts');

            // Валидацию не прошло
            if( !validateInput() ){
                this.setState({ isSaving: false });
                return;
            }

            let errors = { ...this.state.errors, fetch: '' },
                post_data = { room: { ...this.props.data.room }, accounts: [] }

            return  postAccounts()
                .then( responses => post_data.accounts = responses )
                .then( () => this.props.storeRoomAccounts( post_data ) )
                .then( () => this.setState({ isSaving: false }) )
                .then( () => this.props.disableEditor('accounts'))
                .catch( error => {
                    errors.fetch = Object.isObject(error) ? error.message : error;
                    this.setState({ isSaving: false, errors })
                });

        }

        return (
            <div>
                <div className="panel-body">
                    <table className="nested-table">
                        <colgroup>
                            <col width="6%"/>
                            <col width="25%"/>
                            <col width="12%"/>
                            <col width="12%"/>
                            <col width="12%"/>
                            <col width="12%"/>
                            <col width="8%"/>
                            <col width="4%"/>
                            <col width="20px"/>
                            <col width="4%"/>
                            <col width="40px" />
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Платит</th>
                            <th>ФИО</th>
                            <th>№ЛС</th>
                            <th>Обоснование</th>
                            <th>Дата открытия</th>
                            <th>Дата закрытия</th>
                            <th>Статус</th>
                            <th colSpan="4">Доля аккаунта</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.editor.accounts.map( (account, index) => <RoomAccountsEditorRow  data={ this.props.data }
                                                                                                        editor={ this.state.editor }
                                                                                                        account={ account }
                                                                                                        index={ index }
                                                                                                        setAccountValue={ setAccountValue }
                                                                                                        dropAccount={ dropAccount }
                                                                                                        totalOpened={ this.state.total_opened}
                                                                                                        totalActive={ this.state.total_active}
                                                                                                        owners={ this.state.owners || {} }
                                                                                                        selectedOwners={ this.state.selected_owners || [] }
                                                                                                        errors={ this.state.errors.accounts[index] || [] }
                                                                                                        key={ index } /> )
                        }
                        <tr>
                            <td colSpan={7}>

                            </td>
                            <td colSpan={4}>
                                <button type="button" className={`btn btn-add btn-icon btn-block ${ this.state.editor.accounts.length < Object.keys( this.state.owners ).length ? 'btn-primary btn-raised ' : '' }`} title="Отменить" onClick={ createAccount }>Добавить</button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="panel-body">
                    <div className="btn-group-flex pull-right">
                        { this.state.isSaving
                            ? <span className="form-inline" style={ {    padding: "4px 10px 0 0", opacity: 0.7, fontWeight: 'bold'} }><i className="material-icons rotated">autorenew</i> СОХРАНЯЕМ</span>
                            : null }
                        &nbsp;
                        <button type="button" className="btn btn-default btn-clear btn-icon" title="Отменить" onClick={ () => { if( !this.state.isSaving ){ this.props.disableEditor('accounts') } } }>Отменить</button>
                        &nbsp;
                        <button type="button" className={`btn btn-primary btn-save btn-icon ${ this.state.isModified ? 'btn-raised' : '' }`} title="Сохранить" onClick={ saveAccounts }>Сохранить</button>
                    </div>
                    <div className="clearfix" />
                </div>
                {
                    Object.keys( this.state.errors.global ).length
                    ?   <div className="alert alert-error" style={{marginBottom: 0}}>
                        <div className="alert-content">
                                <span className="alert-title">Заполните правильно:&nbsp;
                                    {Object.keys( this.state.errors.global ).map( ( key, index ) => (
                                        <strong
                                            key={key}>{this.state.errors.global[ key ]}{index < Object.keys( this.state.errors.global ).length - 1 ? ', ' : ''}</strong>
                                    ) )}
                                </span>
                        </div>
                    </div>
                    : null
                }
            </div>
        )
    }
}

// Элемент списка редактора собственников
const RoomAccountsEditorRow = (props) => {

    let account = props.account,
        errors = props.errors,
        editor  = props.editor;

    let setAccountValue = event => {
        props.setAccountValue( props.index, event.target.name, event.target.value );
    }

    let toggleActive = () => {
        props.setAccountValue( props.index, 'is_active', !account.is_active );
    }

    let setOwner = owner_id => {
        props.setAccountValue( props.index, 'owner_id', +owner_id );
    }

    let closeAccount = () => {
        if( !account.account_id ){
            props.dropAccount( props.index );
        }else{
            props.setAccountValue( props.index, 'status', 3 );
            props.setAccountValue( props.index, 'deleted', DateToTextValueConverter.getData(Date.now(), 'YMD', {date: true}) );
        }
    }

    let restoreAccount = () => {
        if( +account.status !== 3 || +account.original_status === 3) return
        props.setAccountValue( props.index, 'status', 1 );
        props.setAccountValue( props.index, 'deleted', '' );
    }

    return (
        <tr>
            <td className="td-form" style={ {padding: '4px'} }>
                <div className="inner-td-wrp">
                    <div className="togglebutton td-actions__item">
                        <label>
                            <input type="checkbox" name="is_active" value={ account.is_active } checked = { ( account.is_active || props.totalOpened === 1 ) && +account.status !== 3 } onChange={ toggleActive } disabled={ +account.status === 3}/>
                        </label>
                    </div>
                </div>
            </td>
            <td className="td-form text-left" style={ {padding: '4px'} }>
                { !account.account_id
                    ? <Autocomplete     list={ props.owners }
                                        value={ account.owner_id }
                                        exclude={ props.selectedOwners }
                                        onSelect={ setOwner }
                                        hasError = { errors.indexOf('owner_id') >= 0 }
                    />
                    : props.owners[ account.owner_id ] || '-' }
            </td>
            <td className="td-form" style={ {padding: '4px'} }>
                <div className={`form-group ${ errors.indexOf('number') >= 0 ? 'has-error' : '' }`}>
                    <input type="text" className="form-control text-center" name="number"
                           autoComplete="off"
                           value={ account.number || '' }
                           onChange={ setAccountValue }/>
                </div>
            </td>
            <td  className="td-form" style={ {padding: '4px'} }>
                <div className={`form-group ${ errors.indexOf('reason') >= 0 ? 'has-error' : '' }`}>
                    <input type="text" className="form-control text-center" name="reason"
                           autoComplete="off"
                           value={ account.reason || '' }
                           onChange={ setAccountValue }/>
                </div>
            </td>
            <td className="td-form" style={ {padding: '4px'} }>
                { props.data.room.ownerships[ account.owner_id ] ? dateFormat(Date.parse(  props.data.room.ownerships[ account.owner_id ].start_date ), 'mm.dd.yyyy') || '-' : null }
            </td>
            <td className="td-form" style={ {padding: '4px'} }>
                { +account.original_status === 3
                    ? dateFormat(Date.parse( account.deleted ), 'mm.dd.yyyy' ) || '-'
                    : +account.status === 3
                        ?   <div className={`form-group ${ errors.indexOf('deleted') >= 0 ? 'has-error' : '' }`}>
                            <input  type="date"
                                    name="deleted"
                                    value={ account.deleted || '' }
                                    className="text-center"
                                    onChange={ setAccountValue }
                                    onBlur={ setAccountValue }
                                    style={ {width: '100%'} }
                                    max={ DateToTextValueConverter.getData(Date.now(), 'YMD', {date: true}) }
                            />
                        </div>
                        :   '-'
                }
            </td>
            <td className="td-form" style={ {padding: '4px'} }>
                { +account.original_status === 3
                    ?   'Закрыт'
                    :   <div className={`form-group ${ errors.indexOf('deleted') >= 0 ? 'has-error' : '' }`}>
                        <select value={ props.account.status } name="status" onChange={ setAccountValue } style={ {width: '100%'} }>
                            <option value={ 1 }>Открыт</option>
                            <option value={ 3 }>Закрыт</option>
                        </select>
                    </div>
                }

            </td>
            { +account.status !== 3
                ?   ( props.totalOpened === 1 && +account.status === 1 ) || ( props.totalActive === 1 && account.is_active )
                    ? <td className="td-form text-center" colSpan={3}>1 / 1</td>    // Единственный платёжный аккаунт
                    : props.totalActive === 1 && !account.is_active
                        ?   <td colSpan={3}>-</td> // один платёжный аккаунт. Не этот
                        :   account.is_active || props.totalActive === 0 // Этот аккаунт платит или платят все
                            ?   [   <td className="td-form" style={ {padding: '4px'} } key={1}>
                                <div className={`form-group ${ errors.indexOf('parts') >= 0 ? 'has-error' : '' }`}>
                                    <input type="text" className="form-control text-center" name="part_numerator"
                                           autoComplete="off"
                                           value={ props.account.part_numerator || '' }
                                           onChange={ setAccountValue }/>
                                </div>
                            </td>,
                                <td className="td-form" style={ {padding: '4px'} } key={2}>
                                    /
                                </td>,
                                <td className="td-form" style={ {padding: '4px'} } key={3}>
                                    <div className={`form-group ${ errors.indexOf('parts') >= 0 ? 'has-error' : '' }`}>
                                        <input  type="text" className="form-control text-center" name="part_denominator"
                                                autoComplete="off"
                                                value={ props.account.part_denominator || '' }
                                                onChange={ setAccountValue }/>
                                    </div>
                                </td> ]
                            :   <td colSpan={3}>-</td> // аккаунт не платит
                :   <td colSpan={3}>-</td>  // аккаунт вырублен


            }
            <td>
                { +account.status === 1
                    ? <button type="button" className={`btn btn-default btn-icon-sm btn-clear ${ !account.account_id ? 'btn-danger' : ''}`} title="Закрыть счёт"
                              onClick={closeAccount}/>
                    : +account.original_status !== 3
                        ? <button type="button" className="btn btn-default btn-icon-sm btn-refresh" title="Закрыть счёт"
                                  onClick={restoreAccount}/>
                        : null
                }
            </td>
        </tr>
    );
}

export { RoomAccounts }
