/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { useState } from 'react';
import { Form } from "react-bootstrap";
import { withTranslation } from "react-i18next";
import DesignerModal from "./DesignerModal";
import ColorPicker from "./ColorPicker";

function FieldBorderProperties({t, border, show, editor, onClose, onSubmit}) {
    const [width, setWidth] = useState(border.width ?? 0);
    const [color, setColor] = useState(border.color ?? '#000000');

    function modalSubmit() {
        if (onSubmit) {
            onSubmit({
                width: width,
                color: color
            });
        }
        if (onClose) {
            onClose();
        }
    }

    return (
        <DesignerModal id="fieldborder_properties" show={show} editor={editor} confirm={t('properties.update')} title={t('properties.prop_border')} onClose={onClose} onSubmit={modalSubmit}>
            <Form.Group>
                <Form.Label>{t('properties.borderwidth')}</Form.Label>
                <Form.Control type="number" placeholder="1" min="0" max="100" value={width} onChange={e => setWidth(Number(e.target.value))} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.bordercolor')}</Form.Label>
                <ColorPicker color={color} onChange={setColor} />
            </Form.Group>
        </DesignerModal>
    );
}

export default withTranslation()(FieldBorderProperties);