/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { useState } from 'react';
import { withTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import { CardHelper } from "@leosac/cardrendering";
import DesignerModal from "../DesignerModal";
import ColorPicker from "../ColorPicker";

function BarcodeProperties({t, field, show, editor, onClose, onSubmit}) {
    const [value, setValue] = useState(field.value);
    const [color, setColor] = useState(field.color);
    const [fontFamily, setFontFamily] = useState(field.fontFamily);

    function modalSubmit() {
        if (onSubmit) {
            onSubmit({
                value: value,
                color: color,
                fontFamily: fontFamily
            });
        }
        if (onClose) {
            onClose();
        }
    }

    return (
        <DesignerModal id="barcode_properties" show={show} editor={editor} title={t('properties.prop_barcode')} onClose={onClose} onSubmit={modalSubmit}>
            <Form.Group>
                <Form.Label>{t('properties.value')}</Form.Label>
                <Form.Control type="text" placeholder="Text" value={value} onChange={e => setValue(e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.color')}</Form.Label>
                <ColorPicker color={color} onChangeComplete={setColor} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.fontfamily')}</Form.Label>
                <Form.Control as="select" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                    {CardHelper.getBarcodes().map((barcode) => {
                        return (
                            <option key={barcode.code}>{barcode.name}</option>
                        )
                    })}
                </Form.Control>
            </Form.Group>
        </DesignerModal>
    );
}

export default withTranslation()(BarcodeProperties);