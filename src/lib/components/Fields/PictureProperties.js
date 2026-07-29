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

function PictureProperties({t, field, show, editor, renderer, onClose, onSubmit}) {
    const [value, setValue] = useState(field.value);
    const [height, setHeight] = useState(field.height);
    const [width, setWidth] = useState(field.width);
    const [keepFieldSize, setKeepFieldSize] = useState(true);

    function modalSubmit() {
        if (onSubmit) {
            onSubmit({
                value: value,
                height: height,
                width: width
            });
        }
        if (onClose) {
            onClose();
        }
    }

    async function pictureChanged(imgsrc) {
        const img = new Image();
        if (imgsrc) {
            img.src = imgsrc;
            await img.decode();
            if (keepFieldSize) {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                imgsrc = canvas.toDataURL("image/png");
            }
            else
            {
                setHeight(img.height);
                setWidth(img.width);
            }
        }
        setValue(imgsrc);
    }
    
    return (
        <DesignerModal id="picture_properties" show={show} editor={editor} title={t('properties.prop_picture')} onClose={onClose} onSubmit={modalSubmit}>
            <Form.Group>
                <Form.Label>{t('properties.picture')}</Form.Label>
                <ImageEditor image={value} onChange={pictureChanged} />
            </Form.Group>
            <Form.Group className="col-md-6">
                <Form.Check type="checkbox" checked={keepFieldSize} label={t('properties.keepFieldSize')} onChange={e => setKeepFieldSize(e.target.checked)} />
            </Form.Group>
        </DesignerModal>
    );
}

export default withTranslation()(PictureProperties);