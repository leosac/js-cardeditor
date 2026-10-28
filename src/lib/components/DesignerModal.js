/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import $ from 'jquery';
import { useContext, useEffect } from "react";
import { withTranslation } from "react-i18next";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ThemeContext from "../ThemeContext";

function DesignerModal({t, show, editor, id, title, children, onClose, onSubmit, confirm = t('properties.update')}) {
    const theme = useContext(ThemeContext);

    useEffect(() => {
        $(".modal-dialog").draggable({
            handle: ".modal-header"
        });
    });

    function handleOnShow(e) {
        if (editor) {
            editor.enterModal();
        }
    }

    function handleOnClose(e) {
        if (onClose) {
            onClose(e);
        }

        if (editor) {
            editor.leaveModal();
        }
    }

    function handleOnSubmit(e) {
        if (onSubmit) {
            onSubmit(e);
        }

        if (editor) {
            editor.leaveModal();
        }
    }
    
    return (
        <Modal id={id} className="cardeditor-theme" data-bs-theme={theme} show={show} onHide={handleOnClose} onShow={handleOnShow}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleOnSubmit}>{confirm}</Button>
                <Button variant="secondary" className="btnclose" onClick={handleOnClose}>{t('properties.cancel')}</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default withTranslation()(DesignerModal);