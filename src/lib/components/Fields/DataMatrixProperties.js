/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { useState } from "react";
import { withTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import { CardHelper } from "@leosac/cardrendering";
import DesignerModal from "../DesignerModal";
import ColorPicker from "../ColorPicker";

function DataMatrixProperties({t, field, show, editor, onClose, onSubmit}) {
    const [value, setValue] = useState(field.value);
    const [color, setColor] = useState(field.color);
    const [colorFill, setColorFill] = useState(field.colorFill);
    const [sizeIdx, setSizeIdx] = useState(field.sizeIdx);
    const [scheme, setScheme] = useState(field.scheme);

    function modalSubmit() {
        if (onSubmit) {
            onSubmit({
                value: value,
                color: color,
                colorFill: colorFill,
                sizeIdx: sizeIdx,
                scheme: scheme
            });
        }
        if (onClose) {
            onClose();
        }
    }

    return (
        <DesignerModal id="datamatrix_properties" show={show} editor={editor} title={t('properties.prop_datamatrix')} onClose={onClose} onSubmit={modalSubmit}>
            <Form.Group>
                <Form.Label>{t('properties.value')}</Form.Label>
                <Form.Control type="text" placeholder="Text" value={value} onChange={e => setValue(e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.color')}</Form.Label>
                <ColorPicker color={color} onChangeComplete={setColor} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.colorfill')}</Form.Label>
                <ColorPicker color={colorFill} onChange={setColorFill} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.prop_datamatrix_symbolSize')}</Form.Label>
                <Form.Control as="select" value={sizeIdx} onChange={e => setSizeIdx(e.target.value)}>
                    {CardHelper.getDataMatrixSizeIdx().map((idx) => {
                        return (
                            <option key={idx.value} value={idx.value}>{idx.label}</option>
                        )
                    })}
                </Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.prop_datamatrix_scheme')}</Form.Label>
                <Form.Control as="select" value={scheme} onChange={e => setScheme(e.target.value)}>
                    <option value="0">Ascii</option>
                    <option value="6">Ascii GS1</option>
                </Form.Control>
            </Form.Group>
        </DesignerModal>
    );
}

export default withTranslation()(DataMatrixProperties);