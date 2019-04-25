import React from "react"
import PayTable from "../components/pay_table"
import VirtualPayTable from "../components/virtual_pay_table"
import {connect} from "react-redux"
import {
    fetchAccount,
    fetchBalances,
    fetchBillEntryTypes,
    fetchCompanySettings,
    fetchRooms,
    fetchServices,
    fetchServiceTypes,
    fetchSppsDebt,
    fetchSuppliers,
    generatePayments
} from "../actions/pay/fetch"


const mapStateToProps = state => ({
    confirmRules: state.confirmRules,
    forTable: state.forTable,
    forPay: state.forPay,
    screen: state.screen,
    totalPay: state.totalPay,
    loading: state.loading,
    spps_debt: state.spps_debt,
    loading_spps_debt: state.loading_spps_debt,
    total_debt: state.total_debt,
    company_settings: state.company_settings,
    commission: false,
    balances: state.balances,
    room: state.room,
    account: state.account
})
const mapDispatchToProps = dispatch => {
    return {
        startPay: () => {
            dispatch({type: "START_PAY"})
        },
        startRequests: () => {
            dispatch({type: "START_REQUESTS"})
        },
        endRequests: () => {
            dispatch({type: "END_REQUESTS"})
        },
        changeScreen: screen => {
            dispatch({type: "CHANGE_SCREEN", payload: screen})
        },

        changePay: (key, value) => dispatch({type: "CHANGE_PAY", key, value}),
        changeCheck: (key, value) => dispatch({type: "CHANGE_CHECK", key, value}),
        changeSppsPay: (key, index, value) => dispatch({type: "CHANGE_SPPS_PAY", key, index, value}),
        changeSppsCheck: (key, index, value) => dispatch({type: "CHANGE_SPPS_CHECK", key, index, value}),
        toggleConfirmRules: value => dispatch({type: "CONFIRM_RULES", payload: value}),

        setSppsDebt: spps_debt => dispatch({type: "SET_SPPS_DEBT", payload: spps_debt}),
        setBalances: balances => dispatch({type: "SET_BALANCES", payload: balances}),
        setServices: services => dispatch({type: "SET_SERVICES", payload: services}),
        setSuppliers: suppliers => dispatch({type: "SET_SUPPLIERS", payload: suppliers}),
        setServiceTypes: serviceTypes => dispatch({type: "SET_SERVICE_TYPES", payload: serviceTypes}),
        setCompanySettings: settings => dispatch({type: "SET_COMPANY_SETTINGS", payload: settings}),
        setBillEntryTypes: billEntryTypes => dispatch({type: "SET_BILL_ENTRY_TYPES", payload: billEntryTypes}),
        setRoom: room => dispatch({type: "SET_ROOM", payload: room}),
        setAccount: account => dispatch({type: "SET_ACCOUNT", payload: account}),
    }
}

class Pay extends React.Component {
    componentWillMount() {
        let chain = Promise.resolve();
        chain
            .then(() => this.props.startRequests())
            .then(() => fetchRooms())
            .then(room => this.props.setRoom(room))
            .then(() => fetchAccount())
            .then(account => this.props.setAccount(account))
            .then(() => fetchServices())
            .then(services => this.props.setServices(services))
            .then(() => fetchSuppliers())
            .then(suppliers => this.props.setSuppliers(suppliers))
            .then(() => fetchServiceTypes())
            .then(serviceTypes => this.props.setServiceTypes(serviceTypes))
            .then(() => fetchCompanySettings())
            .then(settings => this.props.setCompanySettings(settings))
            .then(() => fetchBillEntryTypes())
            .then(billEntryTypes => this.props.setBillEntryTypes(billEntryTypes))
            .then(() => fetchBalances())
            .then(balances => this.props.setBalances(balances))
            .then(() => this.props.endRequests())
            .then(() => fetchSppsDebt())
            .then(spps_debt => this.props.setSppsDebt(spps_debt))
    }

    render() {
        if (this.props.loading) {
            return (
                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <svg className="spinner"
                         width="65px"
                         height="65px"
                         viewBox="0 0 66 66"
                         xmlns="http://www.w3.org/2000/svg">
                        <circle className="path"
                                fill="none"
                                strokeWidth="6"
                                strokeLinecap="round" cx="33" cy="33"
                                r="30"/>
                    </svg>
                </div>
            )
        }
        else {
            let totalPay = Math.ceil((+this.props.totalPay.uk + +this.props.totalPay.spps) * 100) / 100
            if (this.props.screen === 1) {
                return (
                    <div>
                        <a href="#оплата/история" type="button" className="btn btn-link btn-single-right"><span
                            className="hidden-xs">История платежей</span></a>
                        <h2 className="page-heading">Оплата услуг</h2>

                        <table className="nested-table table-adaptive hovered">
                            <colgroup>
                                <col width="48%"/>
                                <col width="13%"/>
                                <col width="13%"/>
                                <col width="13%"/>
                                <col width="13%"/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th>Получатель платежа</th>
                                <th>№ Л/С</th>
                                <th>
                                    <div>Баланс</div>
                                    (с учетом переплат)
                                </th>
                                <th colSpan='1'>Оплатить</th>
                                <th>Комиссия</th>

                            </tr>
                            </thead>

                            <PayTable changeCheck={this.props.changeCheck}
                                      changePay={this.props.changePay}
                                      commission={this.props.company_settings.commission === "true"}
                                      label={this.props.room.company.name}
                                      account_number={this.props.account.number}
                                      balances={this.props.balances}
                                      total_debt={this.props.total_debt}
                            />
                        </table>
                        {this.props.loading_spps_debt ?
                            <div className="center-block text-muted pay-line-loading">
                                <span className="loader-spinner pull-left"/>
                                <span>Загружаем данные от ресурсоснабжающих организаций</span>
                            </div>
                            :
                            <div>
                               <h2 style={{textAlign: "center",marginBottom:"10px"}}>
                                   Ресурсоснабжающие организации
                               </h2>
                                <table className="nested-table table-adaptive hovered">
                                    <colgroup>
                                        <col width="49%"/>
                                        <col width="17%"/>
                                        <col width="17%"/>
                                        <col width="17%"/>

                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th>Получатель платежа</th>
                                        <th>№ Л/С</th>
                                        <th>К оплате</th>
                                        <th colSpan='1'>Оплатить</th>
                                    </tr>
                                    </thead>

                                    {

                                        Object.keys(this.props.spps_debt).map(key =>
                                            <VirtualPayTable
                                                sppsKey={key}
                                                spps={this.props.spps_debt[key]}
                                                key={key}
                                                changeCheck={this.props.changeSppsCheck}
                                                changePay={this.props.changeSppsPay}
                                            />
                                        )

                                    }


                                </table>
                            </div>
                        }


                        <footer className="form-footer">
                            <div className="page-container text-right">

                                <button disabled={totalPay <= 0} type="button"
                                        onClick={() => {
                                            this.props.startPay()
                                        }}
                                        className="btn btn-primary btn-icon btn-raised btn-pay ">
                                    Оплатить&nbsp; {totalPay} <span className="rub">a</span>
                                </button>

                            </div>
                        </footer>
                    </div>
                )
            }
            if (this.props.screen === 2) {
                return (

                    <div>
                        <button type="button"
                                className="btn btn-default btn-icon-sm btn-prev pull-left au-target"
                                onClick={() => this.props.changeScreen(1)}
                        />
                        <h2 className="page-heading">
                            Подтверждение
                        </h2>
                        <table className="nested-table table-adaptive">
                            <colgroup>
                                <col width="48%"/>
                                <col width="13%"/>

                                <col width="18%"/>
                                <col width="21%"/>

                            </colgroup>
                            <thead>
                            <tr>
                                <th>Поставщик</th>
                                <th>№ ЛС</th>
                                <th>Назначение платежа</th>
                                <th className="au-target" colSpan="2">Сумма</th>

                            </tr>
                            </thead>
                            <tbody>
                            {Object.keys(this.props.forTable).map(key => (
                                    <tr key={key}>
                                        <td className="text-left">{this.props.forTable[key].name}</td>
                                        <td>{this.props.forTable[key].account_number}</td>
                                        <td>{this.props.forTable[key].services.join(", ")}</td>
                                        <td>{this.props.forTable[key].pay}</td>
                                    </tr>
                                )
                            )}


                            <tr className="tfoot">
                                <td colSpan="3" className="text-left">Итого</td>
                                <td className="text-right au-target" colSpan="2">
                                    {Math.ceil((Object.keys(this.props.forTable).reduce((sum, key) => (sum + this.props.forTable[key].pay), 0)) * 100) / 100}
                                </td>

                            </tr>
                            </tbody>
                        </table>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" checked={this.props.confirmRules}
                                       onChange={e => this.props.toggleConfirmRules(e.target.checked)}/>
                                <span>Я согласен </span>
                                <a href="javascript:void(0);" data-toggle="modal" data-target="#rulesModal">

                                    <span> с условиями предоставления и получения услуг</span>
                                </a>
                                <br/>и ознакомлен с информацией о поставщиках.
                            </label>
                        </div>
                        <footer className="form-footer">
                            <div className="page-container text-right">
                                <button disabled={!this.props.confirmRules} type="button"
                                        onClick={() => {
                                            generatePayments(this.props.forPay).then(response => window.location.href = response.data.bank_url)
                                        }}
                                        className="btn btn-primary btn-icon btn-raised btn-pay ">
                                    Оплатить&nbsp;  {Math.ceil((Object.keys(this.props.forTable).reduce((sum, key) => (sum + this.props.forTable[key].pay), 0)) * 100) / 100}
                                    <span className="rub">a</span>
                                </button>

                            </div>
                        </footer>
                        <div className="modal fade" id="rulesModal" tabIndex="-1" role="dialog"
                             aria-labelledby="myModalLabel">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h4 className="modal-title" id="myModalLabel">Условия предоставления и получения
                                            услуг</h4>
                                        <ul className="nav nav-tabs" role="tablist">
                                            <li role="presentation" className="active">
                                                <a href="#pay" aria-controls="pay" role="tab" data-toggle="tab">Оплата
                                                    услуг</a>
                                            </li>
                                            <li role="presentation">
                                                <a href="#user" aria-controls="user" role="tab" data-toggle="tab">Пользовательское
                                                    соглашение</a>
                                            </li>

                                        </ul>
                                    </div>
                                    <div className="modal-body">
                                        <div>


                                            <div className="tab-content">
                                                <div role="tabpanel" className="tab-pane active" id="pay">
                                                    <h4 className="sub-heading">Оплата банковской картой</h4>
                                                    <p>
                                                        Для оплаты заказа Вы будете переадресованы на платежную страницу
                                                        банка-эквайера, где необходимо ввести реквизиты Вашей карты.
                                                    </p>
                                                    <p>В случае, если у Вас подключена услуга "Безопасные платежи в
                                                        Интернет" и для совершения платежа банк-эмитент требует введения
                                                        пароля, после ввода всех реквизитов Вы будете переадресованы на
                                                        страницу Вашего банка эмитента для ввода данного пароля.
                                                    </p>
                                                    <p>После завершения платежа Вам будет предложено вернуться в Личный
                                                        кабинет
                                                    </p>
                                                    <p>
                                                        Платежи проводятся посредством сервиса Газпромбанк (Акционерное
                                                        общество). Безопасность платежей обеспечивается современными
                                                        протоколами и технологиями, разработанными международными
                                                        платежными системами Visa International и MasterCard Worldwide
                                                        (3D-Secure: Verified by VISA, MasterCard SecureCode). «МойЖКХ»
                                                        ни при каких обстоятельствах не обрабатывает и не получает
                                                        данные Вашей банковской карты.
                                                    </p>
                                                    <p>
                                                        Обработка полученных конфиденциальных данных Держателя карты
                                                        производится в процессинговом центре Банка-эквайера,
                                                        сертифицированного по стандарту PCI DSS.
                                                    </p>
                                                    <p>
                                                        Защита передаваемой информации обеспечивается с помощью
                                                        современных протоколов обеспечения безопасности в Интернет.
                                                    </p>
                                                    <hr/>
                                                    <h4 className="sub-heading">Возврат средств</h4>
                                                    <p>
                                                        Для возврата средств необходимо обратиться в управляющую
                                                        компанию, которая предоставляет вам доступ в «МойЖКХ».
                                                    </p>
                                                    <p>Средства, поступившие в оплату заказа с банковской карты, будут
                                                        возвращены на ту же карту, с которой проведен оригинальный
                                                        платеж.
                                                    </p>
                                                </div>
                                                <div role="tabpanel" className="tab-pane" id="user">
                                                    <ol>
                                                        <li><b>Общие положения</b>
                                                            <ol>
                                                                <li>Соглашение регулирует отношения между системой
                                                                    управления многоквартирным домом «Мой ЖКХ» (далее
                                                                    Система) и Собственником жилого помещения (далее
                                                                    Пользователь). Система предоставляет доступ
                                                                    Пользователю в Личный кабинет и дает возможность
                                                                    обмена информацией с управляющей организацией и
                                                                    проведения оплаты жилищно-коммунальных услуг.
                                                                </li>
                                                                <li>Основные термины:<p>— Пользователь – физическое
                                                                    лицо, заключившее договор с управляющей организацией
                                                                    на предоставление услуг по обслуживанию дома.<br/>—
                                                                    Управляющая организация - организация
                                                                    осуществляющая управление жилыми домами
                                                                    (управляющие организации, ТСЖ, ЖСК, ЖК) с
                                                                    которыми у Абонента заключен договор на
                                                                    управление и обслуживание собственности.<br/>—
                                                                    Администратор Системы – Общество с
                                                                    ограниченной ответственностью «Медиа
                                                                    Системы» ИНН 5405504100 ОГРН 1145476132867,
                                                                    адрес: г. Новосибирск, Советская 52,
                                                                    помещение 102, которому принадлежат все
                                                                    соответствующие исключительные имущественные
                                                                    права на Сайт, включая права на доменное имя
                                                                    Сайта, и осуществляющее его
                                                                    администрирование.<br/>— Страница регистрации
                                                                    - информационная площадка,
                                                                    обеспечивающая вход в Личный кабинет
                                                                    Пользователя.<br/>— Личный кабинет –
                                                                    интернет ресурс, представляющий
                                                                    собой совокупность содержащихся в
                                                                    информационной системе информации и
                                                                    объектов интеллектуальной
                                                                    собственности (в том числе программа
                                                                    для ЭВМ, база данных, графическое
                                                                    оформление интерфейса (дизайн) и
                                                                    др.), доступ к которому
                                                                    обеспечивается с различных
                                                                    пользовательских устройств,
                                                                    подключенных к сети Интернет,
                                                                    посредством специального
                                                                    программного обеспечения для
                                                                    просмотра веб-страниц (браузер) по
                                                                    адресу: мойжкх.рф (включая домены
                                                                    следующих уровней, относящихся к
                                                                    данному адресу).<br/>— Регистрация –
                                                                    совокупность действий
                                                                    Пользователя в соответствии с
                                                                    указанными на Сайте
                                                                    инструкциями, включая
                                                                    предоставление Учетных данных и
                                                                    иной информации, совершаемых
                                                                    Пользователем с использованием
                                                                    специальной формы
                                                                    пользовательского интерфейса
                                                                    Сайта в целях формирования
                                                                    Личного кабинета и получения
                                                                    доступа.<br/>— Учетные данные –
                                                                    имя и пароль
                                                                    Пользователя.<br/>— Аккаунт –
                                                                    уникальная учетная
                                                                    запись Пользователя,
                                                                    содержащая информацию и
                                                                    сведения о Пользователе,
                                                                    необходимые для его
                                                                    идентификации и учёта.
                                                                </p></li>
                                                            </ol>
                                                        </li>
                                                        <li><b>Регистрация в Системе</b>
                                                            <ol>
                                                                <li>Для регистрации в Личном кабинете Пользователю
                                                                    необходимо обратиться в Управляющую организацию,
                                                                    которая предоставляет учетные данные Пользователя.
                                                                </li>
                                                            </ol>
                                                        </li>
                                                        <li><b>Правила пользования Системой</b>
                                                            <ol>
                                                                <li>Перевод денежных средств происходит напрямую от
                                                                    Пользователя Системы (Держателя карты) в Управляющую
                                                                    организацию, которая оказывает ему
                                                                    жилищно-коммунальные услуги и предоставляет доступ к
                                                                    Системе.
                                                                </li>
                                                                <li>Любое действие, совершенное из Личного кабинета
                                                                    Пользователя с использованием его учетных данных,
                                                                    считается действием, совершенным самим Пользователем
                                                                    или уполномоченным им лицом, и устанавливает
                                                                    обязанности и ответственность для Пользователя в
                                                                    отношении таких действий, включая ответственность за
                                                                    нарушение настоящего Пользовательского Соглашения.
                                                                </li>
                                                                <li>Пользователь обязан немедленно уведомить
                                                                    Администратора Системы, если у него есть причины
                                                                    подозревать, что его учетные данные были раскрыты
                                                                    или могут быть использованы неуполномоченными им
                                                                    третьими лицами.
                                                                </li>
                                                                <li>Администратор Системы вправе использовать доступные
                                                                    технические решения для проверки правильности
                                                                    информации, предоставляемой Пользователем при
                                                                    использовании Личного кабинета.
                                                                </li>
                                                                <li>Администратор Системы не может гарантировать, что
                                                                    Пользователь действительно является тем, кем
                                                                    представляется, а также что информация,
                                                                    предоставленная Пользователем в Системе,
                                                                    соответствует действительности.
                                                                </li>
                                                            </ol>
                                                        </li>
                                                        <li><b>Права и обязанности пользователя</b>
                                                            <ol>
                                                                <li>Пользователь обязуется предоставлять о себе
                                                                    правдивую, точную и актуальную информацию.
                                                                    Пользователь несет полную ответственность перед
                                                                    управляющими организациями, ресурсоснабжающими
                                                                    компаниями, прочими организациями за некорректно
                                                                    предоставленную информацию в Личном кабинете
                                                                    (передача показаний индивидуальных приборов учета).
                                                                </li>
                                                                <li>Пользователь имеет право регистрировать только один
                                                                    пользовательский аккаунт.
                                                                </li>
                                                                <li>Пользователю предоставляется право, согласно
                                                                    договору между Пользователем и Управляющей
                                                                    организацией, обновлять и вносить необходимые
                                                                    изменения в информацию, предоставленную ранее, с
                                                                    целью сохранения ее точной, правдивой и актуальной.
                                                                </li>
                                                                <li>Пользователь несет исключительную и полную
                                                                    ответственность за размещенный им в Личном кабинете
                                                                    контент, за возможное ущемление интеллектуальных,
                                                                    авторских и смежных с ними прав, а также иных
                                                                    имущественных и неимущественных прав третьих лиц.
                                                                </li>
                                                                <li>В случае нарушения условий настоящего Соглашения
                                                                    Пользователь несет ответственность в соответствии с
                                                                    действующим законодательством РФ.
                                                                </li>
                                                                <li>Пользователь обязуется принимать все надлежащие меры
                                                                    для защиты паролей доступа к своему аккаунту.
                                                                </li>
                                                                <li>При оплате жилищно-коммунальных и прочих услуг через
                                                                    Личный кабинет Пользователь соглашается с тем, что
                                                                    ознакомился с порядком оплаты услуг, расположенных
                                                                    на странице регистрации.
                                                                </li>
                                                                <li>Пользователь соглашается с тем, что Управляющая
                                                                    организация имеет право на хранение и обработку, в
                                                                    том числе и автоматизированную, любой информации,
                                                                    относящейся к персональным данным Пользователя в
                                                                    соответствии с Федеральным законом от 27.07.2006 г.
                                                                    №152-ФЗ «О персональных данных», включая сбор,
                                                                    систематизацию, накопление, хранение, уточнение,
                                                                    использование, распространение (в том числе
                                                                    передачу), обезличивание, блокирование, уничтожение
                                                                    персональных данных, предоставленных Пользователем.
                                                                </li>
                                                                <li>В случае обращения Пользователя через Личный кабинет
                                                                    в Аварийно-диспетчерскую службу Управляющей
                                                                    организации, Пользователь выражает согласие на
                                                                    передачу соответствующему специалисту
                                                                    Аварийно-диспетчерской службы Управляющей
                                                                    организации информации содержащейся в заявке о ФИО,
                                                                    номере контактного телефона и адреса места
                                                                    жительства/адреса фактического места пребывания
                                                                    Пользователя.
                                                                </li>
                                                            </ol>
                                                        </li>
                                                        <li><b>Права и обязанности Администратора Системы</b>
                                                            <ol>
                                                                <li>Администратор Системы и его представители не несут
                                                                    ответственности за контент, созданный и (или)
                                                                    добавленный Пользователями в Личный Кабинет.
                                                                </li>
                                                                <li>В случае несоблюдения Пользователем любого пункта
                                                                    настоящих Соглашений Администратор Системы оставляет
                                                                    за собой право удаления аккаунта Пользователя, либо
                                                                    информации, опубликованной им в Личном кабинете, без
                                                                    уведомления Пользователя об этом.
                                                                </li>
                                                                <li>Администратор Системы обеспечивает работоспособность
                                                                    Системы круглосуточно, семь дней в неделю, включая
                                                                    выходные и праздничные дни, за исключением случаев
                                                                    предусмотренных п. 5.4. настоящего Соглашения.
                                                                </li>
                                                                <li>Администратор Системы вправе приостанавливать доступ
                                                                    к Личному кабинету всем Пользователям или отдельным
                                                                    Пользователям по причинам технологического характера
                                                                    (профилактические работы, обновление программного
                                                                    или аппаратного обеспечения и т.п.), а также в иных
                                                                    случаях, предусмотренных настоящим Соглашением.
                                                                </li>
                                                                <li>Администратор Системы защищает информацию с личными
                                                                    данными Пользователя с использованием всех доступных
                                                                    ему программных и прочих средств.
                                                                </li>
                                                                <li>Администратор Системы не несет ответственности за
                                                                    возможные неполадки на стороне Банка-эквайера (ОАО
                                                                    «Газпромбанк»), возникшие в процессе оплаты
                                                                    жилищно-коммунальных и прочих услуг.
                                                                </li>
                                                                <li>Администратор Системы не несет ответственности перед
                                                                    Пользователем за информацию, предоставляемую
                                                                    Управляющей организацией в Личном кабинете.
                                                                </li>
                                                            </ol>
                                                        </li>
                                                        <li><b>Защита информации и обработка персональных данных</b>
                                                            <ol>
                                                                <li>Настоящим Пользователь информируется о том, что на
                                                                    Сайте будет происходить обработка персональных
                                                                    данных Пользователя в соответствии с Федеральным
                                                                    законом «О персональных данных» №152 от 27.06.2006г.
                                                                    Пользователь согласен с передачей и обработкой его
                                                                    персональных данных в целях исполнения договора
                                                                    между Пользователем и Управляющей организацией.
                                                                </li>
                                                                <li>Администратор Системы обрабатывает персональные
                                                                    данные Пользователя в целях получения Пользователем
                                                                    персонализированной рекламы, проверки, исследования
                                                                    и анализа таких данных, позволяющих поддерживать и
                                                                    улучшать сервисы и разделы Сайта, а также
                                                                    разрабатывать новые сервисы и разделы.
                                                                </li>
                                                                <li>Администратор Системы принимает все необходимые меры
                                                                    для защиты персональных данных Пользователя от
                                                                    неправомерного доступа, изменения, раскрытия или
                                                                    уничтожения.
                                                                </li>
                                                            </ol>
                                                        </li>
                                                        <li><b>Заключительные положения</b>
                                                            <ol>
                                                                <li>Своей регистрацией в Личном кабинете Пользователь
                                                                    автоматически подтверждает свое согласие со всеми
                                                                    пунктами настоящего Соглашения, признает свою
                                                                    правоспособность для принятия настоящего Соглашения
                                                                    и способность нести ответственность за невыполнение
                                                                    пунктов данного Соглашения.
                                                                </li>
                                                                <li>Администратор Системы оставляет за собой право
                                                                    дополнять и изменять настоящее Соглашение как
                                                                    целиком, так и отдельные его части без уведомления
                                                                    об этом Пользователя.
                                                                </li>
                                                                <li>Изменения и дополнения к настоящему Соглашению
                                                                    считаются вступившими в силу с момента их публикации
                                                                    (размещения) на Странице регистрации по адресу:
                                                                    мойжкх.рф, при этом предыдущая редакция считается
                                                                    утратившей силу.
                                                                </li>
                                                                <li>Вопросы, не урегулированные настоящим Соглашением,
                                                                    регулируются действующим законодательством.
                                                                </li>
                                                                <li>Все возникающие споры разрешаются путем переговоров.
                                                                    При недостижении согласия возникающие споры
                                                                    разрешаются в порядке, установленном действующим
                                                                    законодательством.
                                                                </li>
                                                                <li>Настоящее Соглашение вступают в силу для
                                                                    Пользователя с момента его регистрации в Личном
                                                                    кабинете и действует весь период пользования
                                                                    последним Личным кабинетом.
                                                                </li>
                                                            </ol>
                                                        </li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                )
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pay);
