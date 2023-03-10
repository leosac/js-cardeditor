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

function LabelProperties({t, field, show, editor, onClose, onSubmit}) {
    const [value, setValue] = useState(field.value);
    const [color, setColor] = useState(field.color ?? '#000000');
    const [fontFamily, setFontFamily] = useState(field.fontFamily);
    const [fontSize, setFontSize] = useState(field.fontSize);
    const [fontStyle, setFontStyle] = useState(field.fontStyle);
    const [colorFill, setColorFill] = useState(field.colorFill);
    const [align, setAlign] = useState(field.align);
    const [maxLength, setMaxLength] = useState(field.maxLength);
    const [autoSize, setAutoSize] = useState(field.autoSize);
    const [scaleFont, setScaleFont] = useState(field.scaleFont);
    const [wordBreak, setWordBreak] = useState(field.wordBreak);

    function modalSubmit() {
        if (onSubmit) {
            onSubmit({
                value: value,
                color: color,
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontStyle: fontStyle,
                colorFill: colorFill,
                align: align,
                maxLength: maxLength,
                autoSize: autoSize,
                scaleFont: scaleFont,
                wordBreak: wordBreak
            });
        }
        if (onClose) {
            onClose();
        }
    }

    return (
        <DesignerModal id="label_properties" show={show} editor={editor} title={t('properties.prop_label')} onClose={onClose} onSubmit={modalSubmit}>
            <Form.Group>
                <Form.Label>{t('properties.value')}</Form.Label>
                <Form.Control type="text" placeholder="Text" value={value} onChange={e => setValue(e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.color')}</Form.Label>
                <ColorPicker color={color} onChange={color => setColor(color)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.fontfamily')}</Form.Label>
                <Form.Control as="select" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                    {CardHelper.getFontFamilies().map((font) => {
                        return (
                            <option key={font}>{font}</option>
                        )
                    })}
                </Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.fontsize')}</Form.Label>
                <Form.Control type="text" placeholder="8pt" value={fontSize} onChange={e => setFontSize(e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.fontstyle')}</Form.Label>
                <Form.Control as="select" value={fontStyle} onChange={e => setFontStyle(e.target.value)}>
                    <option value="Bold" style={{fontWeight: 'bold'}}>{t('properties.bold')}</option>
                    <option value="Normal" style={{fontStyle: 'normal'}}>{t('properties.normal')}</option>
                    <option value="Italic" style={{fontStyle: 'italic'}}>{t('properties.italic')}</option>
                </Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.colorfill')}</Form.Label>
                <ColorPicker color={colorFill} onChange={setColorFill} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.align')}</Form.Label>
                <Form.Control as="select" value={align} onChange={e => setAlign(e.target.value)}>
                    <option value="TopLeft">{t('properties.topleft')}</option>
                    <option value="TopCenter">{t('properties.topcenter')}</option>
                    <option value="TopRight">{t('properties.topright')}</option>
                    <option value="MiddleLeft">{t('properties.middleleft')}</option>
                    <option value="MiddleCenter">{t('properties.middlecenter')}</option>
                    <option value="MiddleRight">{t('properties.middleright')}</option>
                    <option value="BottomLeft">{t('properties.bottomleft')}</option>
                    <option value="BottomCenter">{t('properties.bottomcenter')}</option>
                    <option value="BottomRight">{t('properties.bottomright')}</option>
                </Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('properties.maxlength')}</Form.Label>
                <Form.Control type="text" placeholder="" value={maxLength} onChange={e => setMaxLength(e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Check type="checkbox" label= {t('properties.autosize')} checked={autoSize} onChange={e => setAutoSize(e.target.checked)} />
                <Form.Check type="checkbox" label= {t('properties.scaleFont')} checked={scaleFont} onChange={e => setScaleFont(e.target.checked)} />
                <Form.Check type="checkbox" label= {t('properties.wordbreak')} checked={wordBreak} onChange={e => setWordBreak(e.target.checked)} />
            </Form.Group>
        </DesignerModal>
    );
}

export default withTranslation()(LabelProperties);