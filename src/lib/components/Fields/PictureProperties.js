/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { useState } from 'react';
import { withTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import DesignerModal from "../DesignerModal";
import ImageEditor from "../ImageEditor";

function PictureProperties({t, field, show, editor, onClose, onSubmit}) {
    const [value, setValue] = useState(field.value);

    function modalSubmit() {
        if (onSubmit) {
            onSubmit({
                value: value
            });
        }
        if (onClose) {
            onClose();
        }
    }
    
    return (
        <DesignerModal id="picture_properties" show={show} editor={editor} title={t('properties.prop_picture')} onClose={onClose} onSubmit={modalSubmit}>
            <Form.Group>
                <Form.Label>{t('properties.picture')}</Form.Label>
                <ImageEditor image={value} onChange={img => { setValue(img)}} />
            </Form.Group>
        </DesignerModal>
    );
}

export default withTranslation()(PictureProperties);