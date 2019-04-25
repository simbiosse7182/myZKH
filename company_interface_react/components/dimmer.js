import React            from 'react';

'use strict';

const Dimmer = (props) => (
    <div className={ `modal-dimmer ${ props.block ? 'block' : null }` }>
        { props.onLoadCancel || props.onHide ? <button type="button" className="btn-close" onClick={ props.onLoadCancel || props.onHide }/> : null }
        <div className="modal-dimmer-content">
            <div className="load-icon"></div>
            <div className="load-bar"><div></div><div></div><div></div></div>
            { props.loadMessage ?
                <div className="modal-dimmer-message">
                    <div className="modal-dimmer-message__text"> { props.loadMessage } </div>
                    { props.onLoadCancel ?
                        <div className="btn btn-danger modal-dimmer-message__cancel-button" onClick={ props.onLoadCancel }>Отменить</div>
                      :null
                    }
                </div>
            : null}
        </div>
    </div>
);

export default Dimmer;
