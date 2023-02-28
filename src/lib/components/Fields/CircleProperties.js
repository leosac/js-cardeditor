/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import {  useState } from 'react';
import { withTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import DesignerModal from "../DesignerModal";
import ColorPicker from "../ColorPicker";

function CircleProperties({t, field, show, editor, onClose, onSubmit}) {
    const [color, setColor] = useState(field.color ?? '#000000');

    function modalSubmit() {
        if (onSubmit) {
            onSubmit({
                color: color
            });
        }
        if (onClose) {
            onClose();
        }
    }

    return (
        <DesignerModal id="circle_properties" show={show} editor={editor} title={t('properties.prop_circle')} onClose={onClose} onSubmit={modalSubmit}>
            <Form.Group>
                <Form.Label>{t('properties.color')}</Form.Label>
                <ColorPicker color={color} onChange={setColor} />
            </Form.Group>
        </DesignerModal>
    );
}

export default withTranslation()(CircleProperties);