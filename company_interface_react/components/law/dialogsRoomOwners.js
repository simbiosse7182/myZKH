// Элемент списка собственников
import React from "../../../../jspm_packages/npm/react@16.2.0";
import {DateToTextValueConverter, nameFormatValueConverter} from "../../../../dist/components/global-converter";
import Autocomplete     from '../autocomplete'
import fetchData from "../../actions/fetchData";
import {partCalculator, partSummCalculator} from "../../actions/partCalculator";
import dateFormat from 'dateformat'

/*

Что нужно доделать:
-   Кнопочку "Доступ"
-   Фамилию имя отчество и дату рождения свести в одну ячейку, как это сделано в жильцах
-   Если ФИО длинные, что-то с этим надо сделать

*/

// Карточка с собственниками
const RoomOwners = (props) => {
    let document =  !!props.data.room.owners && !!props.data.room.owners[0]
        && !!props.data.room.ownerships[ props.data.room.owners[0] ]
        && !!props.data.room.ownerships[ props.data.room.owners[0] ].document_id
        && props.data.room.documents[ props.data.room.ownerships[ props.data.room.owners[0] ].document_id ] || props.data.emptyDocument;
    //console.log( 'DOCU:', document );
    // Здесь должен быть цикл по Object.keys(props.data.room.documents)[0], но на данный момент документ только один.
    return (
        <div>
            <div className="panel panel-default" style={{ marginBottom: '0px'}}>
                <div className="panel-heading panel-toggle-sm">
                    <h4 className="panel-title">Собственники <span className="badge">{ props.data.room.owners.length }</span></h4>
                    <div className="pull-right">
                        {   !props.isEditing
                            ? <button type="button" className="btn btn-icon btn-primary btn-raised btn-edit pull-right" onClick={ () => props.enableEditor('owners') }>Редактировать</button>
                            : <button type="button" className="btn btn-default btn-clear btn-icon" title="Отменить" onClick={ () => props.disableEditor('owners') }>Закрыть</button>
                        }
                    </div>
                </div>
            </div>
            <div style={{ marginBottom: '40px'}}>
                {
                    !props.isEditing    ? <RoomOwnersTable  document={ document }
                                                            enableEditor={ props.enableEditor }
                                                            data = { props.data }
                        />
                        : <RoomOwnersEditor data = {props.data}
                                            disableEditor={ props.disableEditor }
                                            storeRoomOwners={ props.storeRoomOwners }
                                            document={ document }
                        />
                }
            </div>
        </div>

    )
};

// Документ по собственникам и они сами
const RoomOwnersTable = (props) => {
    return (
        <div>
            <div className="panel" style={{ marginBottom: '0px'}}>
                <div className="description-list panel-body" style={{ marginBottom: '0px'}}>
                    <div className="flex-grid">
                        <div className="col-sm-2">
                            <small>Тип документа</small>
                            <p>{ props.document.type || '-' }</p>
                        </div>
                        <div className="col-sm-2">
                            <small>Дата гос. регистрации</small>
                            <p>{ props.document.created || '-' }</p>
                        </div>
                        <div className="col-sm-4">
                            <small>Номер</small>
                            <p>{ props.document.number || '-' }</p>
                        </div>
                        <div className="col-sm-4">
                            <small>Выдан</small>
                            <p>{ props.document.issuer || '-' }</p>
                        </div>
                    </div>

                </div>
            </div>
            <div className="nested-table-fix">
                <table className="nested-table">
                    <colgroup>
                        <col width="27%" />
                        <col width="50%" />
                        <col width="12%" />
                        <col width="11%" />
                        <col width="40px" />
                    </colgroup>
                    <thead className="thead">
                    <tr>
                        <th>Собственность</th>
                        <th>ФИО</th>
                        <th>Дата рождения</th>
                        <th>Доля</th>
                        <th>Доступ</th>
                    </tr>
                    </thead>
                    <tbody>
                    { props.data.room.owners.map( (owner_id, index) =>   props.data.owners[owner_id]
                    && props.data.room.ownerships[owner_id]
                    && ( !props.data.room.ownerships[owner_id].end_date || ( props.data.room.ownerships[owner_id].end_date && +(new Date(props.data.room.ownerships[owner_id].end_date).getTime()) >= +Date.now() ) )
                        ? <RoomOwnersRow data={ props.data } owner_id={ owner_id } key={ owner_id } index={ index }/>
                        : null ) }
                    </tbody>
                </table>
            </div>
        </div>

    );
}

const RoomOwnersRow = ( props) => {
    return (
        <tr key={ props.owner_id }>
            {props.index === 0
                ?   <td rowSpan={props.data.room.owners.length} className="text-capitalize">
                    {props.data.ownershipTypes[ props.data.room.ownership_type || 'private' ] + ', '}
                    {props.data.room.ownerships[ props.owner_id ] ? props.data.room.ownerships[ props.owner_id ].start_date : null}
                    <br/>
                    <span className="label label-success">Действует</span>
                </td>
                :   null
            }
            <td className="text-left">
                { props.data.owners[props.owner_id] && props.data.owners[props.owner_id].person
                    ? nameFormatValueConverter.getName( props.data.owners[props.owner_id].person )
                    : props.data.owners[props.owner_id] && props.data.owners[props.owner_id].entity
                        ? props.data.owners[props.owner_id].entity.short_name ||  props.data.owners[props.owner_id].entity.name
                        : '-'
                }
            </td>
            <td>{ props.data.owners[props.owner_id] &&  props.data.owners[props.owner_id].person && props.data.owners[props.owner_id].person.birth_date && dateFormat( Date.parse( props.data.owners[props.owner_id].person.birth_date), 'dd.mm.yyyy' ) || '-' }</td>
            <td>{ props.data.room.ownerships[props.owner_id].part_numerator } / { props.data.room.ownerships[props.owner_id].part_denominator }</td>
            <td className="td-btn">
                <button className={`btn btn-primary btn-icon-sm btn-${props.data.owners[props.owner_id].user_id ? 'refresh' : 'add'}`} type="button" />
            </td>
        </tr>

    );
}

// Редактор собственников
class RoomOwnersEditor extends React.Component {

    constructor(props){
        super(props);

        let total_parts = 0,
            numerators = [],
            denominators = [];

        props.data.room.owners.map( owner_id => {
            if( !props.data.room.ownerships[owner_id] ) return;
            //total_parts += props.data.room.ownerships[owner_id] ? +props.data.room.ownerships[owner_id].part_numerator / +props.data.room.ownerships[owner_id].part_denominator : 0
        } );

        this.state = { editor: {
                ownershipType:      this.props.data.room.ownership_type || 'private',
                ownershipStartDate: this.props.data.room.owners[0]
                                    && this.props.data.room.ownerships[ this.props.data.room.owners[0] ]
                                    && this.props.data.room.ownerships[ this.props.data.room.owners[0] ].start_date
                                    || null,
                documentType:       this.props.document && this.props.document.type || '',
                documentNumber:     this.props.document && this.props.document.number || '',
                documentCreated:    this.props.document && this.props.document.created || '',
                documentIssuer:     this.props.document && this.props.document.issuer || '',
                documentId:         null,

                // Сумма долей
                total_parts:        partCalculator(  props.data.room.owners.map( owner_id => props.data.room.ownerships[owner_id] ? [ +props.data.room.ownerships[owner_id].part_numerator, +props.data.room.ownerships[owner_id].part_denominator ] : null )),

                owners:             this.props.data.room.owners.map( owner_id => (
                    {
                        forceInput:         false,
                        part_numerator:     this.props.data.room.ownerships[owner_id].part_numerator || 0,
                        part_denominator:   this.props.data.room.ownerships[owner_id].part_denominator || 0,
                        birth_date:         props.data.owners[owner_id] && props.data.owners[owner_id].person && props.data.owners[owner_id].person.birth_date || '',
                        input_birth_date:   '',
                        person_id:          props.data.owners[owner_id]
                                            && props.data.owners[owner_id].person
                                            && props.data.owners[owner_id]
                                            && props.data.owners[owner_id].person.person_id
                                            || 0,
                        entity_id:          props.data.owners[owner_id]
                                            && props.data.owners[owner_id].entity
                                            && props.data.owners[owner_id].entity.entity_id
                                            || 0,
                        fullName:       {
                            firstName:      '',
                            lastName:       '',
                            middleName:     '',
                        },
                        displayName:        props.data.owners[owner_id] && props.data.owners[owner_id].person
                                            ? nameFormatValueConverter.getName( props.data.owners[owner_id].person )
                                            : props.data.owners[owner_id] && props.data.owners[owner_id].entity
                                                ? props.data.owners[owner_id].entity.short_name ||  props.data.owners[owner_id].entity.name
                                                : '-'
                    })
                ),
            },
            originalEditor:         {},
            isModified:             false,
            isSaving:               false,
            errors:                 { document: {}, owners: {}, fetch: '' },
        }

        this.state.originalEditor = { ...this.state.editor }
        this.state.originalEditor.owners = this.state.editor.owners.map( owner => ({...owner}) );

        this.checkEditorModified = () => {
            let isModified = JSON.stringify(this.state.editor) !== JSON.stringify(this.state.originalEditor),
                isChanged = isModified !== this.state.isModified;

            if( isChanged && !!this.refs.main ) this.setState( { isModified })

            return isModified;
        }
    }

    componentDidUpdate() {
        this.checkEditorModified();
    }

    render() {

        // Меняет значения в state.editor
        let setEditorValue = event => {

            if( typeof(this.state.editor[event.target.name]) === 'undefined' ) return;
            let editor = { ...this.state.editor }
            editor[event.target.name] = event.target.value;

            this.setState( { editor } );

        }

        // Меняет физлицо или юрлицо по автокомплиту
        let setOwnerRowId = ( index, value ) => {
            let editor = {...this.state.editor},
                type = +value.indexOf('person_') === 0 ? 'person' : 'entity',
                person_id = +value.substr(7),
                owner = editor.owners[index]

            console.log('bump', type, person_id)
            if( !owner
                && ( type === 'person' || type === 'entity' )
                && ( (  type === 'person' && !this.props.data.persons[ person_id ])
                        || ( type === 'entity' && !this.props.data.entities[ person_id ]) )
                ) return;
            console.log('continue');

            owner.displayName=      ( type === 'person' && this.props.data.persons[ person_id ] )
                                    ? nameFormatValueConverter.getName( this.props.data.persons[ person_id ] )
                                    : this.props.data.entities[ person_id ].short_name || this.props.data.entities[ person_id ].name || '';

            if(type === 'person'){
                owner.person_id     = person_id;
                owner.entity_id     = 0;
                owner.birth_date    = this.props.data.persons[ person_id ] && this.props.data.persons[ person_id ].birth_date || null;
            }else{
                owner.birth_date    = null;
                owner.person_id     = 0;
                owner.entity_id     = person_id;
            }

            this.setState({ editor });

        }

        // По селекту в редакторе выставляет новый owner_id
        let changeOwnerRowId = (event, index) => {
            setOwnerRowId( index, event.target.value );
        }

        // Переключает ручной ввод имени пользователя (его создание)
        let toggleOwnerRowForceInput = (index, value) => {
            let editor = {...this.state.editor},
                owner = editor.owners[index];

            if( !owner ) return;
            owner.forceInput = value;

            this.setState({ editor });

        }

        // Задаёт дату рождения
        let changeOwnerRowBirthDate = (event, index) => {

            let editor = {...this.state.editor},
                owner = editor.owners[index];

            if( !owner ) return;

            owner.input_birth_date = event.target.value;

            this.setState( { editor } );

        }

        // Меняет один из ключей owner.fullName
        let changeOwnerRowFullName = (event, index) => {

            let editor = {...this.state.editor},
                owner = editor.owners[index]

            if( !owner || typeof( owner.fullName[event.target.name] ) === 'undefined' ) return;

            owner.fullName[event.target.name] = event.target.value;

            this.setState( { editor } );


        }

        // Меняет долю у собственника
        let changeOwnerRowParts = (event, index) => {
            let editor = {...this.state.editor},
                owner = editor.owners[index]

            if( !owner || typeof( owner['part_' + event.target.name] ) === 'undefined' ) return;

            owner['part_' + event.target.name] = +event.target.value;

            editor.total_parts = getOwnerTotalParts( editor.owners );

            this.setState( { editor } );

        }

        // Считает суммарные доли аккаунтов
        let getOwnerTotalParts = owners => {
            return partCalculator(  owners.map( owner => [ owner.part_numerator, owner.part_denominator ] ) )
        }
        // Добавляет одного собственника
        let addOwner = () => {
            let editor = {...this.state.editor};
            editor.owners.push( {
                owner_id:           '',
                forceInput:         false,
                part_numerator:     0,
                part_denominator:   0,
                birth_date:         '',
                input_birth_date:   '',
                fullName:       {
                    firstName:      '',
                    lastName:       '',
                    middleName:     '',
                },
                displayName:        ''
            });
            editor.total_parts = getOwnerTotalParts( editor.owners );
            this.setState( { editor } );

        }

        // Удаляет собственника
        let deleteOwnerRow = index => {
            let editor = {...this.state.editor};

            if( typeof( editor.owners[index] ) === 'undefined' ) return;

            editor.owners.splice( index, 1);
            editor.total_parts = getOwnerTotalParts( editor.owners );

            this.setState( { editor } );

        }

        // Создаёт собственника из введённого в автокомплит значения
        let createOwnerFromSearch = (index, name) => {
            let editor = {...this.state.editor},
                owner = editor.owners[index],
                fields = name.split(' ');

            if( !owner ) return;
            owner.owner_id = null;
            owner.forceInput = true;
            owner.fullName.firstName    = fields[1] ? fields[1].charAt(0).toUpperCase() + fields[1].slice(1) : '';
            owner.fullName.lastName     = fields[0] ? fields[0].charAt(0).toUpperCase() + fields[0].slice(1) : '';
            owner.fullName.middleName   = fields[2] ? fields[2].charAt(0).toUpperCase() + fields[2].slice(1) : '';

            this.setState( { editor } );

        }

        // Проверяет инпуты
        let validateInput = () => {

            let errors = { document: {}, owners: {}, fetch: '' },
                total_parts = partCalculator(  this.state.editor.owners.map( owner => [ owner.part_numerator, owner.part_denominator ] ) );

            // Тип собственности только из списка
            if( !this.props.data.ownershipTypes[this.state.editor.ownershipType] ) errors.document['ownershipType'] = 'тип собственности';
            // Даты начала владения и дата выдачи документа не позже, чем сегодня
            if( !this.state.editor.ownershipStartDate || !Date.parse(this.state.editor.ownershipStartDate) || +Date.parse(this.state.editor.ownershipStartDate) > +Date.now() ) errors.document['ownershipStartDate'] = 'дата начала владения';
            if( !this.state.editor.documentCreated || !Date.parse(this.state.editor.documentCreated) || +Date.parse(this.state.editor.documentCreated) > +Date.now() ) errors.document['documentCreated'] = 'дата выдачи документа';
            // Тип документа
            if( !this.state.editor.documentType || this.state.editor.documentType.length < 1 ) errors.document['documentType'] = 'тип документа';
            // Номер документа
            if( !this.state.editor.documentNumber || this.state.editor.documentNumber.length < 1 ) errors.document['documentNumber'] = 'номер документа';

            // Сумма долей собственников должна складываться в единицу
            if( total_parts !== 1 && this.state.editor.owners.length ) errors.document['totalParts'] = 'сумма долей не равна 1';

            // Собственников должно быть ненулевое количество
            console.log( 'owners' , this.state.editor.owners );
            if( !this.state.editor.owners.length ) errors.document['owners'] = 'собственники';

            this.state.editor.owners.map( (owner, index) => {
                let owner_errors = [];

                if( owner.forceInput ){
                    // Поля с именами
                    if( !owner.fullName.firstName || owner.fullName.firstName.length < 2) owner_errors.push('firstName');
                    if( !owner.fullName.lastName || owner.fullName.lastName.length < 2) owner_errors.push('lastName');
                    if( !owner.fullName.middleName || owner.fullName.middleName.length < 2) owner_errors.push('middleName');
                    // Дата рождения
                    if( !Date.parse(owner.input_birth_date) || +Date.parse(owner.input_birth_date) > +Date.now() ) owner_errors.push('birth_date');
                }else{
                    // В случае автокомплита
                    //if( !Number.isInteger( +owner.owner_id ) || owner.owner_id <= 0 ) owner_errors.push('owner_id');
                    if(
                        ( !owner.person_id && !owner.entity_id )
                        || ( owner.person_id && !this.props.data.persons[ owner.person_id ])
                        || ( owner.entity_id && !this.props.data.entities[ owner.entity_id ])
                    ) owner_errors.push('owner_id')
                }

                if( owner.part_numerator <=0 || owner.part_denominator <=0 || owner.part_numerator > owner.part_denominator ) owner_errors.push('parts')

                if( owner_errors.length ){
                    errors.owners[index] = owner_errors;
                }

            });

            if( Object.keys(errors.owners).length ){
                errors.document['owners'] = 'собственники';
            }

            this.setState({ errors });

            return (+Object.keys(errors.document).length + +Object.keys(errors.owners).length) <= 0;
        }

        let postOwnerDocument = document => {
            return fetchData('documents', { method: 'POST', data: document })
                .then( response => response.success && response.data || {} )
        }

        let postOwnerOwnershipType = ownership_type => {
            let room_id = this.props.data.room.room_id;

            if( !room_id || !ownership_type ) return;

            return fetchData('rooms/' + room_id, { method: 'PUT', data: { ownership_type: ownership_type} })
                .then( response => response.success && response.data || {} )
        }

        let postOwnerOwnerships = document => {

            let room_id     = this.props.data.room.room_id,
                old_owners  = this.state.editor.owners.filter( owner => !owner.forceInput ),
                new_owners  = this.state.editor.owners.filter( owner => owner.forceInput ),
                ownerships  = [];



            return Promise.all( new_owners.map( owner => {
                // Добавляем всех созданных людей, получаем их persons
                let person = {
                    first_name:     owner.fullName.firstName,
                    last_name:      owner.fullName.lastName,
                    middle_name:    owner.fullName.middleName,
                    birth_date:     owner.input_birth_date
                }
                return fetchData('people', { method: 'POST', data: person })
                    .then( response => response.success && response.data || {} )
                }))
                .then ( persons => {
                    // Подготавливаем созданных собственников к отправке
                    new_owners.map( (owner, index) => {
                        let new_owner = {
                            document_id:        document.document_id,
                            owner:              { person_id: +persons[index].person_id },
                            part_denominator:   +owner.part_denominator,
                            part_numerator:     +owner.part_numerator,
                            percent:            (+owner.part_numerator / +owner.part_denominator) * 100,
                            start_date:         this.state.editor.ownershipStartDate,
                        };
                        ownerships.push( new_owner );
                    })
                    // Подготавливаем существующих собственников к отправке
                    old_owners.map( (owner, index) => {
                        let new_owner = {   document_id:        document.document_id,
                            //owner_id:           +owner.owner_id,

                            part_denominator:   +owner.part_denominator,
                            part_numerator:     +owner.part_numerator,
                            percent:            (+owner.part_numerator / +owner.part_denominator) * 100,
                            start_date:         this.state.editor.ownershipStartDate,
                        };
                        if( owner.person_id ){
                            if( this.props.data.persons_owners[ owner.person_id] ){
                                new_owner.owner_id = this.props.data.persons_owners[ owner.person_id]
                            }else{
                                new_owner.owner = {person_id: owner.person_id }
                            }
                        }else{
                            if( this.props.data.entities_owners[ owner.entity_id] ){
                                new_owner.owner_id = this.props.data.entities_owners[ owner.entity_id]
                            }else{
                                new_owner.owner = { entity_id: owner.entity_id }
                            }
                        }

                        ownerships.push( new_owner );
                    })
                } )
                .then( () => fetchData('rooms/'+room_id+'/ownerships', {method: 'POST', data: { ownerships } }) )
                .then( response => response.success && response.data || {} )

        }

        let fetchOwners = () => {
            return fetchData('owners', {params: { room_id: this.props.data.room.room_id } } )
                .then( response => ( response.success && response.data || [] ) )
        }

        let saveOwners = () => {
            // Уже отправляем
            if( this.state.isSaving ) return;
            // Блокируем отправку
            this.setState({ isSaving: true });
            // Ничего не изменилось
            if( !this.checkEditorModified() ) return this.props.disableEditor('owners');

            // Валидацию не прошло
            if( !validateInput() ){
                this.setState({ isSaving: false });
                return;
            }

            // В будущем, если надо, зациклим для нескольких документов
            let document = {
                    created:    this.state.editor.documentCreated,
                    issuer:     this.state.editor.documentIssuer || '',
                    number:     this.state.editor.documentNumber,
                    type:       this.state.editor.documentType,
                    title:      this.state.editor.documentType,
                }, post_data = {
                    document:       {},
                    ownerships:     {},
                    room:           {},
                    owners:         {},
                },
                errors = { document: {}, owners: {}, fetch: '' };

            this.setState({ errors }); // Очистим ошибки

            Promise.all([ postOwnerDocument(document), postOwnerOwnershipType( this.state.editor.ownershipType ) ])
                .then( responses    => {
                    post_data.document  =   {...responses[0]};
                    post_data.room      =   {...responses[1]};
                    return responses[0]
                })
                .then( document     => postOwnerOwnerships( document ) )
                .then( ownerships => post_data.ownerships = { ...ownerships } )
                .then( () => fetchOwners() )
                .then( owners => post_data.owners = owners )
                .then( () => this.props.storeRoomOwners( post_data ) )
                .then( () => this.props.disableEditor('owners'))
                .then( () => this.setState({ isSaving: false }) )
                .catch( error => {
                    errors.fetch = Object.isObject(error) ? error.message : error;
                    this.setState({ isSaving: false, errors })
                })

        }

        return (
            <div className="panel panel-default" style={{ marginBottom: '40px'}}>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-lg-4">
                            <h5>Собственность</h5>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className={`form-group ${ this.state.errors.document['ownershipType'] ? 'has-error' : null }`}>
                                        <select className="form-control"
                                                name="ownershipType"
                                                value={ this.props.data.ownershipTypes[ this.state.editor.ownershipType ] ? this.state.editor.ownershipType : 'private' }
                                                onChange={ setEditorValue }
                                        >
                                            { Object.keys( this.props.data.ownershipTypes ).map( key => <option value={ key } key={ key }> { this.props.data.ownershipTypes[key] } </option> ) }
                                        </select>
                                        <label className="control-label">
                                            <span>Тип собственности*</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className={`form-group ${ this.state.errors.document['ownershipStartDate'] ? 'has-error' : null }`}>
                                        <input  type="date"
                                                className="form-control"
                                                name="ownershipStartDate"
                                                value={ this.state.editor.ownershipStartDate }
                                                onChange={ setEditorValue }
                                                onBlur={ setEditorValue }
                                                max={ DateToTextValueConverter.getData(Date.now(), 'YMD', {date: true}) }
                                                />

                                        <label className="control-label">
                                            <span>Начало владения *</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <h5>Правоустанавливающий документ</h5>
                            <div className="row">
                                <div className="col-sm-3">
                                    <div className={`form-group ${ this.state.errors.document['documentType'] ? 'has-error' : null }`}>
                                        <input  type="text"
                                                className="form-control"
                                                name="documentType"
                                                value={ this.state.editor.documentType }
                                                onChange={ setEditorValue }
                                        />
                                        <label className="control-label">
                                            <span>Тип документа*</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-3">
                                    <div className={`form-group ${ this.state.errors.document['documentNumber'] ? 'has-error' : null }`}>
                                        <input type="text"
                                               className="form-control"
                                               name="documentNumber"
                                               value={ this.state.editor.documentNumber }
                                               onChange={ setEditorValue }
                                        />
                                        <label className="control-label">
                                            <span>Номер*</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-3">
                                    <div className={`form-group ${ this.state.errors.document['documentCreated'] ? 'has-error' : null }`}>
                                        <input type="date"
                                               className="form-control"
                                               max={ DateToTextValueConverter.getData(Date.now(), 'YMD', {date: true}) }
                                               name="documentCreated"
                                               value={ this.state.editor.documentCreated }
                                               onChange={ setEditorValue }
                                        />
                                        <label className="control-label">
                                            <span>Дата государственной регистрации *</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-3">
                                    <div className="form-group">
                                        <input type="text"
                                               className="form-control"
                                               name="documentIssuer"
                                               value={ this.state.editor.documentIssuer }
                                               onChange={ setEditorValue }
                                        />
                                        <label className="control-label">
                                            <span>Выдан</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h5 style={{ margin: '15px 0px 15px' }}>Собственники</h5>

                    <table className="nested-table">
                        <colgroup>
                            <col width="21%" />
                            <col width="21%" />
                            <col width="21%" />
                            <col width="15%" />
                            <col width="12%" />
                            <col width="5%" />
                            <col width="20px" />
                            <col width="5%" />
                            <col width="40px" />
                        </colgroup>
                        <thead>
                        <tr>
                            <th colSpan="4">ФИО</th>
                            <th>Дата рождения</th>
                            <th colSpan="4">Доля</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.editor.owners.map( (owner, index) => <RoomOwnersEditorRow data={ this.props.data }
                                                                                                 owner = {owner}
                                                                                                 key = {index}
                                                                                                 index = {index}
                                                                                                 changeOwnerRowId = { changeOwnerRowId }
                                                                                                 changeOwnerRowBirthDate = { changeOwnerRowBirthDate }
                                                                                                 changeOwnerRowFullName = { changeOwnerRowFullName }
                                                                                                 changeOwnerRowParts = { changeOwnerRowParts }
                                                                                                 deleteOwnerRow = { deleteOwnerRow }
                                                                                                 setOwnerRowId={ setOwnerRowId }
                                                                                                 toggleOwnerRowForceInput = { toggleOwnerRowForceInput }
                                                                                                 createOwnerFromSearch = { createOwnerFromSearch }
                                                                                                 errors={ this.state.errors && this.state.errors.owners && this.state.errors.owners[index] || [] }
                            /> )
                        }
                        <tr>
                            <td colSpan={5}>
                                { this.state.editor.owners.length && this.state.editor.total_parts < 1
                                    ? <div className="text-right text-danger">Сумма долей собственников меньше единицы.</div>
                                    : this.state.editor.owners.length && this.state.editor.total_parts > 1
                                        ? <div className="text-right text-danger">Сумма долей собственников больше единицы.</div>
                                        : null }
                            </td>
                            <td colSpan={4}>
                                <button type="button" className="btn btn-primary btn-add btn-icon btn-block btn-raised" title="Отменить" onClick={ addOwner }>Добавить</button>
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
                        <button type="button" className="btn btn-default btn-clear btn-icon" title="Отменить" onClick={ () => { if( !this.state.isSaving ){ this.props.disableEditor('owners') } } }>Отменить</button>
                        &nbsp;
                        <button type="button" className={`btn btn-primary btn-save btn-icon ${ this.state.isModified ? 'btn-raised' : '' }`} title="Сохранить" onClick={ saveOwners }>Сохранить</button>
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
                    : Object.keys(this.state.errors.document).length
                        ?   <div className="alert alert-error" style={{ marginBottom: 0 }}>
                            <div className="alert-content">
                                    <span className="alert-title">Заполните правильно:&nbsp;
                                        { Object.keys( this.state.errors.document ).map( (key, index) => (
                                            <strong key={ key }>{ this.state.errors.document[key] }{index < Object.keys(this.state.errors.document).length-1 ? ', ' : ''}</strong>
                                        ))}
                                    </span>
                            </div>
                        </div>
                        :   <div className="alert alert-icon alert-warning" style={{ marginBottom: 0 }}>
                                <div className="alert-content"><strong className="alert-title">Предыдущие документы будут помечены как «недействительные»</strong></div>
                            </div>
                }

            </div>
        );
    }
}

// Строка редактора собственников
class RoomOwnersEditorRow extends React.Component {

    constructor(props){
        super(props);

        this.state = { searchString: '' }
    }

    render(){

        let onSearchChange = searchString => {
            this.setState({ searchString });
        }

        return (
            <tr>
                {   !this.props.owner.forceInput
                    ?   <RoomOwnersEditorSelect owner={this.props.owner}
                                                index={ this.props.index }
                                                data={this.props.data}
                                                changeOwnerRowId={ this.props.changeOwnerRowId }
                                                onSearchChange={ onSearchChange }
                                                setOwnerRowId={ this.props.setOwnerRowId }
                                                createOwnerFromSearch={ this.props.createOwnerFromSearch }
                                                hasError={ this.props.errors && this.props.errors.indexOf('owner_id') >= 0 }/>
                    :   <RoomOwnersEditorInputs owner={this.props.owner}
                                                index={ this.props.index }
                                                data={this.props.data}
                                                changeOwnerRowFullName={ this.props.changeOwnerRowFullName }
                                                errors={ this.props.errors }
                    />
                }
                <td>
                    { !this.props.owner.forceInput
                        ? <button type="button" className="btn btn-primary btn-icon btn-edit btn-block" tooltip="Ввести" title="" onClick={ () => this.props.createOwnerFromSearch(this.props.index, this.state.searchString || '') }>Создать</button>
                        : <button type="button" className="btn btn-primary btn-icon btn-filter btn-block" tooltip="Выбрать" title="" onClick={ () => this.props.toggleOwnerRowForceInput(this.props.index, false) }>Выбрать</button>
                    }
                </td>
                {   !this.props.owner.forceInput
                    ?   <td>{ dateFormat( Date.parse( this.props.owner.birth_date ), 'dd.mm.yyyy' ) || 'не указана' }</td>
                    :   <td className="td-form" style={ {padding: '4px'} }>
                        <div className={`form-group ${ !!this.props.errors && this.props.errors.indexOf('birth_date') >= 0 ? 'has-error' : '' }`}>
                            <input type="date"
                                   max={ DateToTextValueConverter.getData(Date.now(), 'YMD', {date: true}) }
                                   style={ {width: '100%', textAlign: 'center'} }
                                   onChange={ event => this.props.changeOwnerRowBirthDate(event, this.props.index)  }
                                   value={this.props.owner.input_birth_date}
                            />
                        </div>
                    </td>
                }
                <td className="td-form" style={ {padding: '4px'} }>
                    <div className={`form-group ${ this.props.errors.indexOf('parts') >= 0 ? 'has-error' : '' }`}>
                        <input type="text" className="form-control text-center" name="numerator"
                               value={ this.props.owner.part_numerator || '' }
                               autoComplete="off"
                               onChange={ event => this.props.changeOwnerRowParts(event, this.props.index) }/>
                    </div>
                </td>
                <td>/</td>
                <td className="td-form" style={ {padding: '4px'} }>
                    <div className={`form-group ${ this.props.errors.indexOf('parts') >= 0 ? 'has-error' : '' }`}>
                        <input type="text" className="form-control text-center" name="denominator"
                               value={ this.props.owner.part_denominator || '' }
                               autoComplete="off"
                               onChange={ event => this.props.changeOwnerRowParts(event, this.props.index) } />
                    </div>
                </td>
                <td>
                    <button type="button" className="btn btn-default btn-icon-sm btn-clear" title="Отменить" onClick={ () => this.props.deleteOwnerRow( this.props.index ) }/>
                </td>
            </tr>
        );
    }
}

// Строка редактора собственников
const RoomOwnersEditorSelect = (props) => {

    let personList = {}

    Object.keys( props.data.persons ).map( person_id => {
        let person = props.data.persons[ person_id ] || {};

        if(!person) return;

        personList[ 'person_' + person.person_id ] = nameFormatValueConverter.getName( person )
    });

    Object.keys( props.data.entities ).map( entity_id => {
        let entity = props.data.entities[ entity_id ] || {};

        if(!entity) return;

        personList[ 'entity_' + entity.entity_id ] = entity.short_name || entity.name;
    })

    let setOwner = owner_id => {
        props.setOwnerRowId( props.index, owner_id );
    }

    let createOwner = owner_name => {
        props.createOwnerFromSearch( props.index, owner_name );
    }

    return (
        <td colSpan={3} className="td-form" style={ {padding: '4px'} }>
            <Autocomplete list={ personList }
                          value={ props.owner.person_id ? 'person_'+props.owner.person_id : props.owner.entity_id ? 'entity_'+props.owner.entity_id : null }
                          onSelect={ setOwner }
                          createLabel="Создать"
                          placeholder="Начните набирать фамилию или имя собственника"
                          createAction={ createOwner }
                          onSearchChange={ props.onSearchChange }
                          hasError = { !!props.hasError }
            />
        </td>
    )
}

const RoomOwnersEditorInputs = (props) => {
    return (
        [   <td className="td-form" key="last" style={ {padding: '4px'} }>
            <div className={`form-group ${ !!props.errors && props.errors.indexOf('lastName') >= 0 ? 'has-error' : '' }`}>
                <input className="form-control"
                       value={props.owner.fullName.lastName}
                       name="lastName"
                       placeholder="Фамилия"
                       onChange={event => props.changeOwnerRowFullName(event, props.index)}/>
            </div>
        </td>,
            <td className="td-form" key="first" style={ {padding: '4px'} }>
                <div className={`form-group ${ !!props.errors && props.errors.indexOf('firstName') >= 0 ? 'has-error' : '' }`}>
                    <input className="form-control"
                           value={props.owner.fullName.firstName}
                           name="firstName"
                           placeholder="Имя"
                           onChange={event => props.changeOwnerRowFullName(event, props.index)}/>
                </div>
            </td>,
            <td className="td-form" key="middle" style={ {padding: '4px'} }>
                <div className={`form-group ${ !!props.errors && props.errors.indexOf('middleName') >= 0 ? 'has-error' : '' }`}>
                    <input className="form-control"
                           value={props.owner.fullName.middleName}
                           name="middleName"
                           placeholder="Отчество"
                           onChange={event => props.changeOwnerRowFullName(event, props.index)}/>
                </div>
            </td>,
        ]
    )
}

export {RoomOwners}
