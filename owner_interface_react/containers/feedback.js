import React from "react"
import {connect} from "react-redux";
import {
    fetchRequests,
    fetchRequestEntries,
    fetchRoom,
    fetchUser,
    fetchRequestFiles,
} from "../actions/feedback/fetch";
import LoadDimmer from '../components/load_dimmer'
import {fetchData} from "../actions/fetchData";

const questions = {
    'Общие вопросы': {
        icon: 'build',
        questions: [
            'Юридический вопрос',
            'Вопрос по благоустройству',
            'Тарифы и льготы'
        ],
    },
    'Сообщить о проблеме': {
        icon: 'notifications_active',
        questions: [
            'Освещение',
            'Асфальт и покрытия',
            'Дефекты здания',
            'Детская площадка',
        ],
    },
    'Вызвать специалиста': {
        icon: 'help_outline',
        questions: [
            'Сантехник',
            'Электрик',
            'Электрогазосварщик'
        ],
    },
}

const valid_types = ['image/jpeg', 'image/png', 'image/gif', 'document/pdf']

const request_status = {
    0: 'Новая',
    1: 'Новая',
    2: 'Завершена',
    3: 'Проверка технической возможности',
    4: 'Оценка работ',
}

function bytesToSize(bytes) {
    var sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

function plural(n, forms) {
    return forms[n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
}

const mapStateToProps = state => ({
    //loading: state.loading,
    requests: state.requests,
    rooms: state.rooms,
    data_loaded: state.data_loaded,
    user: state.user,
    files: state.files,
})

const mapDispatchToProps = dispatch => {
    return {
        //checkServiceValues: serviceValue => dispatch({type: "CHECK_SERVICE_VALUES", payload: serviceValue})
        fetchAllRequests: () => {
            let _requests = {}
            return fetchRequests()
                .then(requests => _requests = requests)
                .then(() => dispatch({type: 'SET_REQUESTS', requests: _requests}))
                .then(() => fetchRequestEntries())
                .then(entries => dispatch({type: 'SET_REQUEST_ENTRIES', entries}))
                .then(() => fetchRequestFiles(_requests))
                .then(files => dispatch({type: 'SET_FILES', files}))
                .then(() => fetchRoom())
                .then(rooms => dispatch({type: 'SET_ROOMS', rooms}))
                .then(() => fetchUser())
                .then(user => dispatch({type: 'SET_USER', user}))
                .then(requests => dispatch({type: 'SET_DATA_LOADED', requests}))
        },

        appendRequestEntry: entry => dispatch({type: 'APPEND_REQUEST_ENTRY', entry}),
        appendRequest: (request, files) => dispatch({type: 'APPEND_REQUEST', request, files}),

    }
}

class FeedbackForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            question_group: Object.keys(questions)[0],
            question_value: questions[Object.keys(questions)[0]].questions[0],
            question_input: '',
            text: '',
            files: [],
            isSaving: false,
            errors: {form: {}, fetch: ''},
        }
    }

    render() {
        // Меняет значения стэйта
        let setStateValue = (name, value) => {
            let _state = {...this.state}
            _state[name] = value
            if (name === 'question_group') _state['question_value'] = (value === 'Другое' ? '' : questions[value].questions[0])
            this.setState(_state)
        }

        // Обновляет стэйт из инпута
        let changeStateValue = event => {
            setStateValue(event.target.name, event.target.value);
        }

        /*
        const readUploadedFileAsText = (inputFile) => {
            const temporaryFileReader = new FileReader();

            return new Promise((resolve, reject) => {
                temporaryFileReader.onerror = () => {
                    temporaryFileReader.abort();
                    reject(new DOMException("Problem parsing input file."));
                };

                temporaryFileReader.onload = () => {
                    resolve(temporaryFileReader.result);
                };
                temporaryFileReader.readAsText(inputFile);
            });
        }
*/
        // При выборе файлов добавляет их в массив с файлами
        let handleFiles = event => {
            let files = this.state.files;

            Object.keys(event.target.files || {}).map(file_id => {
                let file = event.target.files[file_id]

                if (!file || !file.type || valid_types.indexOf(file.type) < 0) return
                /*
                readUploadedFileAsText( file )
                    .then( result => {
                        let files = this.state.files;
                        file.thumb = window.URL.createObjectURL( file ) || '';
                        file.content = result;
                        files.push( file )
                        this.setState({ files })
                    })*/

                file.thumb = window.URL.createObjectURL(file) || '';
                //file.content = result;
                files.push(file)


            })

            this.setState({files})
            console.log(files)
        }

        // Дропает файл
        let removeFile = index => {
            let files = this.state.files;

            files.splice(index, 1);
            this.setState({files})
        }

        // Валидлация инпута.
        let validateInput = () => {

            let errors = {form: {}, fetch: ''};

            if (!this.state.text || this.state.text.length < 3) errors.form['text'] = 'Вопрос'
            if (!this.state.question_value || this.state.question_value.length < 1) errors.form['question_value'] = 'Вопрос'

            this.setState({errors})

            return Object.keys(errors.form).length <= 0;
        }

        // Отправляем запрос
        let sendRequest = () => {

            this.setState({isSaving: true});
            // Уже сохраняем
            if (this.state.isSaving) return;

            // Валидатор
            if (!validateInput()) {
                this.setState({isSaving: false});
                return;
            }

            let data = {
                    subject: this.state.question_value,
                    text: this.state.text,
                    source_type: 1,
                    room_id: this.props.roomId || 0,
                    person_id: this.props.personId || 0,
                },
                response_data = {},
                response_files = []


            fetchData('requests', {method: 'POST', data})
                .then(response => response.success && response.data || {})
                .then(data => response_data = data)
                .then(() => postFiles(response_data.request_id))
                .then(files => response_files = files)
                .then(() => this.props.appendRequest(response_data, response_files))
                .then(() => {
                    this.setState({
                        errors: {form: {}, fetch: ''},
                        files: [],
                        isSaving: false,
                        question_group: Object.keys(questions)[0],
                        question_value: questions[Object.keys(questions)[0]].questions[0],
                        question_input: '',
                        text: '',
                    })
                })
                .catch(error => {
                    this.setState({errors: {form: {}, fetch: error}})
                })

        }

        let postFiles = request_id => {
            return Promise.all(this.state.files.map((file, index) => {
                    let files = [...this.state.files]
                    files[index].status = 'loading'

                    this.setState({files});

                    return fetchData('uploads/requests/' + request_id, {method: 'upload', data: file})
                        .then(response => {
                            let files = [...this.state.files]
                            files[index].status = 'success';
                            this.setState({files});
                            return response.success && response.data || {}
                        })
                        .catch(() => {
                            let files = [...this.state.files]
                            files[index].status = 'error';
                            this.setState({files});
                            return {}
                        })
                }
            ))
        }

        return (
            <div className="panel panel-info">
                <div className="panel-heading panel-heading-big">
                    <div className="panel-heading-icon"><i className="material-icons">question_answer</i></div>
                    <div className="flex1">
                        <h4>Обратная связь с управляющей компанией</h4>
                        <p>Здесь вы можете задать вопрос сотрудникам управляющей компании, а так же оставить заявку на
                            вызов специалиста.</p>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-sm-3">
                            <div className="form-group" style={{background: '#fff', color: '#333'}}>
                                <select className="form-control"
                                        name="question_group"
                                        onChange={changeStateValue}>
                                    {
                                        Object.keys(questions).map(question_group => <option value={question_group}
                                                                                             key={question_group}>
                                            {question_group}
                                        </option>)
                                    }
                                    <option value="Другое">Другое</option>
                                </select>
                                <label className="control-label">Тема обращения</label>
                            </div>
                        </div>
                        <div className="col-sm-9">
                            <div className={`form-group ${ this.state.errors.form.question_value ? 'has-error' : '' }`}
                                 style={{background: '#fff', color: '#333'}}>
                                {!this.state.question_group || !questions[this.state.question_group] || this.state.question_group === 'Другое'
                                    ? <input type="text" className="form-control" value={this.state.question_value}
                                             name="question_value" onChange={changeStateValue}/>
                                    : <select className="form-control" name="question_value"
                                              value={this.state.question_value} onChange={changeStateValue}>
                                        {
                                            questions[this.state.question_group].questions.map(question => <option
                                                value={question} key={question}>{question}</option>)
                                        }
                                    </select>
                                }
                                <label className="control-label">Вопрос</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="panel-body">
                    <div
                        className={`form-group form-group-textarea ${ this.state.errors.form.text ? 'has-error' : '' }`}>
                        <textarea className="form-control" rows={6} style={{height: '80px', marginTop: '0px'}}
                                  value={this.state.text} name='text' onChange={changeStateValue}>

                        </textarea>
                        <label className="control-label">Ваш вопрос</label>
                    </div>
                </div>

                {this.state.files && this.state.files.length > 0
                    ? <div className="panel-body">
                        <div style={{margin: '0 -5px'}}>
                            {
                                this.state.files.map((file, index) => {
                                        console.log(file);
                                        return (
                                            <RequestFileItem file={file}
                                                             key={index}
                                                             removeFile={() => removeFile(index)}
                                                             can_edit={true}
                                            />
                                        )
                                    }
                                )
                            }
                        </div>
                    </div>
                    : null
                }
                <div className="panel-body panel-secondary">
                    <div
                        className={`btn-primary btn btn-icon pull-right btn-raised btn-save ${ this.state.isSaving ? 'btn-processing' : '' }`}
                        style={{margin: 0}} onClick={() => sendRequest()}>
                        Отправить
                    </div>
                    <div className="btn-primary btn btn-icon btn-upload pull-left relative" style={{margin: 0}}>
                        <input type="file" value="" onChange={handleFiles} className="form-control-seamless"/>
                        Прикрепить файл
                    </div>
                </div>
                {this.state.errors.fetch
                    ? <div className="alert alert-error">
                        <div className="alert-content">
                            <div className="alert-title text-bold">Ошибка: {this.state.errors.fetch}</div>
                        </div>
                    </div>
                    : null
                }
            </div>
        )
    }
}

class Feedback extends React.Component {
    state = {
        opened: {}
    }

    componentWillMount() {
        this.props.fetchAllRequests();
    }

    render() {
        let toggleOpen = request_id => {

            let _state = this.state;
            _state.opened[request_id] = !_state.opened[request_id];
            this.setState(_state)
        }

        return (
            <div>
                {/* Лоадер :-) */}
                {!this.props.data_loaded
                    ? <LoadDimmer/>
                    : <div>
                        <FeedbackForm
                            roomId={this.props.rooms[Object.keys(this.props.rooms)[0]] && this.props.rooms[Object.keys(this.props.rooms)[0]].room_id || 0}
                            personId={this.props.user && this.props.user.owner && this.props.user.owner.person && this.props.user.owner.person.person_id || 0}
                            appendRequest={this.props.appendRequest}
                        />
                        {Object.keys(this.props.requests)
                        //.sort( (a,b) => a > b ? -1 : a < b ? 1 : 0 )
                            .sort((a, b) => (+this.props.requests[a].last_entry || +this.props.requests[a].created) > (+this.props.requests[b].last_entry || +this.props.requests[b].created)
                                ? -1
                                : (+this.props.requests[a].last_entry || +this.props.requests[a].created) < (+this.props.requests[b].last_entry || +this.props.requests[b].created)
                                    ? 1
                                    : 0
                            )
                            .map(request_id => <FeedbackRequest appendRequestEntry={this.props.appendRequestEntry}
                                                                key={request_id}
                                                                request={this.props.requests[request_id]}
                                                                files={this.props.files[request_id] || {}}
                                                                opened={this.state.opened[request_id]}
                                                                toggleOpen={() => toggleOpen(request_id)}
                            />)}
                    </div>
                }

            </div>
        )
    }
}

class FeedbackRequest extends React.Component {

    state = {
        isSaving: false,
        text: '',
        limit: 5,
        files: []
    }

    render() {

        // Меняет значения стэйта
        let setStateValue = (name, value) => {
            let _state = {...this.state}
            _state[name] = value
            if (name === 'question_group') _state['question_value'] = (value === 'Другое' ? '' : questions[value].questions[0])
            this.setState(_state)
        }

        // Обновляет стэйт из инпута
        let changeStateValue = event => {
            setStateValue(event.target.name, event.target.value);
        }

        // Валидация инпута.
        let validateInput = () => {

            let errors = {form: {}, fetch: ''};

            if (!this.state.text || this.state.text.length < 3) errors.form['text'] = 'Вопрос'

            this.setState({errors})

            return Object.keys(errors.form).length <= 0;
        }

        // Разворачивает чат
        let increaseLimit = () => {
            this.setState({limit: +this.state.limit + 5})
        }
        // Отправляем запрос
        let sendEntry = () => {

            this.setState({isSaving: true});
            // Уже сохраняем
            if (this.state.isSaving) return;

            // Валидатор
            if (!validateInput()) {
                this.setState({isSaving: false});
                return;
            }

            let data = {
                    text: this.state.text,
                    request_id: +this.props.request.request_id,
                    status: +this.props.request.status,
                },
                response_data = {}


            fetchData('request-entries', {method: 'POST', data})
                .then(response => response.success && response.data || {})
                .then(data => response_data = data)
                .then(() => this.props.appendRequestEntry(response_data))
                //.then( () => postFiles( response_data.request_id ) )
                /* .catch( error => {
                    console.log('errr', error)
                    this.setState({ errors: { form: {}, fetch: error } })
                })*/
                .then(() => this.setState({isSaving: false, text: ''}))


        }

        let postFiles = request_id => {
            return Promise.all(this.state.files.map((file, index) => {
                    let files = [...this.state.files]

                    if (files[index].status) return; // Игнорим загруженные или загружаемые

                    files[index].status = 'loading'

                    this.setState({files});

                    return fetchData('uploads/requests/' + request_id, {method: 'upload', data: file})
                        .then(() => {
                            let files = [...this.state.files]
                            files[index].status = 'success';
                            this.setState({files});
                        })
                        .catch(() => {
                            let files = [...this.state.files]
                            files[index].status = 'error';
                            this.setState({files});
                        })
                }
            ))
        }

        let postFile = index => {
            let files = [...this.state.files]
            files[index].status = 'loading'
            this.setState({files});
            return fetchData('uploads/requests/' + this.props.request.request_id, {method: 'upload', data: file})
                .then(() => {
                    let files = [...this.state.files]
                    files[index].status = 'success';
                    this.setState({files});
                })
                .catch(() => {
                    let files = [...this.state.files]
                    files[index].status = 'error';
                    this.setState({files});
                })
        }

        // При выборе файлов добавляет их в массив с файлами
        let handleFiles = event => {
            let files = this.state.files;

            Object.keys(event.target.files || {}).map(file_id => {
                let file = event.target.files[file_id]

                if (!file || !file.type || valid_types.indexOf(file.type) < 0) return

                file.thumb = window.URL.createObjectURL(file) || '';
                files.push(file)

            })

            this.setState({files})
            postFiles(this.props.request.request_id);
        }

        // Дропает файл
        let removeFile = index => {
            let files = this.state.files;

            files.splice(index, 1);
            this.setState({files})
        }

        return (
            <div className="panel panel-default">
                <div className="panel-heading panel-toggle" onClick={this.props.toggleOpen}>

                    <div>
                        <h4 className="panel-title">{this.props.request.subject}</h4>
                        <span
                            className={`label ${ this.props.request.entries && this.props.request.entries[0] && this.props.request.entries[0].status && +this.props.request.entries[0].status === 2 ? 'label-danger' : 'label-success'}`}>
                            {this.props.request.entries
                                ? this.props.request.entries[0].status
                                    ? request_status[this.props.request.entries[0].status]
                                    : 'Новая'
                                : 'Новая'
                            }
                        </span>
                        <small>
                            Задача создана {new Date(+this.props.request.created * 1000).toLocaleDateString()}
                        </small>
                    </div>

                </div>
                {
                    this.props.opened
                        ? <div className="">
                            <div className="row flex">
                                <div className="col-md-8 flex1" style={{paddingRight: 0}}>
                                    <form className="request-chat" onSubmit={sendEntry}>
                                        <div className="request-chat-inputs">
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <input type="text" className="form-control" value={this.state.text}
                                                           name="text" onChange={changeStateValue}/>
                                                </div>
                                                <div
                                                    className={`btn btn-primary btn-raised btn-comment btn-icon ${ this.props.isSaving ? 'btn-processing' : '' }`}
                                                    style={{margin: '5px'}} onClick={sendEntry}>Ответить
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            this.props.request.entries
                                            && [...this.props.request.entries]
                                                .sort((a, b) => {
                                                    return +a.created > +b.created ? -1 : +a.created < +b.created ? 1 : 0
                                                })
                                                .filter((entry, index, entries) => {
                                                    return +index <= this.state.limit
                                                })
                                                .map((entry, index) =>
                                                    <RequestChatItem key={entry.request_entry_id} text={entry.text}
                                                                     time={entry.created} employee={entry.employee}
                                                                     owner={entry.owner}/>
                                                )
                                        }
                                        {this.props.request.entries && (+this.props.request.entries.length - +this.state.limit) > 0
                                            ? null
                                            : <RequestChatItem text={this.props.request.text}
                                                               time={this.props.request.created}
                                            />
                                        }
                                        {
                                            this.props.request.entries && (+this.props.request.entries.length - +this.state.limit) > 0
                                                ? <div className="request-chat-more" onClick={increaseLimit}>
                                                    Показать ещё
                                                    ({+this.props.request.entries.length - +this.state.limit})
                                                    {` `}
                                                    {plural((+this.props.request.entries.length - +this.state.limit), ['сообщение', 'сообщения', 'сообщений'])}</div>
                                                : null
                                        }
                                    </form>
                                </div>
                                <div className="col-md-4">
                                    <div className="request-details">
                                        {
                                            Object.keys(this.props.files)
                                                .map(file_id => this.props.files[file_id])
                                                .map((file, index) => <RequestFileItem file={file} key={'old_' + index}/>)
                                        }
                                        {
                                            Object.keys(this.state.files)
                                                .map(file_id => this.state.files[file_id])
                                                .map((file, index) => <RequestFileItem key={'new_' + index} file={file}/>)
                                        }
                                        <div className="clearfix"/>
                                        <div className="file-attach-placeholder">
                                            <div className="btn btn-primary btn-icon btn-upload btn-raised relative">
                                                <input type="file" value="" className="form-control-seamless"
                                                       onChange={handleFiles}/>
                                                Добавить файлы
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        : null
                }
            </div>
        )
    }
}


const RequestChatItem = (props) => {
    return (
        <div className="request-entry-line">
            <div
                className={`request-entry ${ !!props.employee ? 'request-entry-incoming' : 'request-entry-outgoing' }`}>
                {props.text}
                <span className="request-entry-author">
                    {props.employee
                        ? props.employee.person
                            ? props.employee.person.last_name + ' ' + props.employee.person.first_name + ' ' + props.employee.person.middle_name
                            + ' (' + props.employee.appointment + ')'
                            : 'Сотрудник УК'
                        : 'Вы'
                    }
                    {`, `}
                    {new Date(+props.time * 1000).toLocaleDateString()}
                </span>
            </div>
            <div className="clearfix"></div>
        </div>
    )
}

const RequestFileItem = (props) => {

    let downloadFile = () => {
        // пока что не работает. Проблема: мы получаем блоб с файлом, а дальше надо, чтобы он записался в ссыоку и только
        // после этого можно будет его скачать
        return
        fetch('/api/uploads/' + props.file.upload_id + '/', {
            headers: {"Authorization": "Bearer " + +localStorage.getItem('aurelia_token'),}
        })
            .then(response => response.blob())
            .then(blob => URL.createObjectURL(blob))

    }

    return (
        <div className="file-attach-block" onClick={downloadFile}>

            <div className="file-attach-item ">
                {props.can_edit && props.removeFile
                    ? <i className="material-icons file-attach-close" onClick={props.removeFile}>close</i>
                    : null
                }
                <div className={`file-attach-cover ${ props.file.status || '' }`}
                     style={{backgroundImage: 'url(' + (props.file.thumb || '') + ')'}}>
                    {
                        props.file.original_file_name
                            ? <i className="material-icons file-attach-download">file_download</i>
                            : null
                    }
                    <i className="material-icons file-attach-spinner rotated">sync</i>
                    <i className="material-icons file-attach-success">check</i>
                    <i className="material-icons file-attach-error">error</i>
                </div>
                <div className="file-attach-title">
                    <h5>{props.file.name || props.file.original_file_name || 'Untitled'}</h5>
                    <div className="text-small text-muted">{props.file.size && bytesToSize(props.file.size) || ''}</div>
                </div>
                <div className="clearfix"></div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);

