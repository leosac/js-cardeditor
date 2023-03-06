/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { useState } from 'react';
import { Form } from "react-bootstrap";
import { withTranslation } from "react-i18next";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DesignerModal from "./DesignerModal";

function ConditionalRendering({t, entries, show, onClose, onSubmit}) {
    const [newEntries, setEntries] = useState(entries ?? []);

    function modalSubmit() {
        if (onSubmit) {
            onSubmit(newEntries);
        }
        if (onClose) {
            onClose();
        }
    }

    function addEntry() {
        setEntries([
            ...newEntries,
            {
                condition: '',
                targetProperty: '',
                propertyValue: ''
            }
        ]);
    }

    function removeEntry(index) {
        setEntries(newEntries.filter((e, i) => i !== index));
    }

    function setEntryProperty(property, index, val) {
        setEntries(newEntries.map((e, i) => {
            if (i === index) {
                const n = {...e};
                n[property] = val;
                return n;
            } else {
                return e;
            }
        }));
    }

    function setEntryCondition(index, val) {
        setEntryProperty('condition', index, val);
    }

    function setEntryTargetProperty(index, val) {
        setEntryProperty('targetProperty', index, val);
    }

    function setEntryPropertyValue(index, val) {
        setEntryProperty('propertyValue', index, val);
    }

    return (
        <DesignerModal id="conditional_rendering" show={show} confirm={t('properties.update')} title={t('properties.conditional_rendering')} onClose={onClose} onSubmit={modalSubmit}>
            <div>
                <button className="btn btn-sm add_entry" onClick={() => addEntry()}>
                    <FontAwesomeIcon icon={["fas", "fa-plus-circle"]} style={{color: 'green'}} /> {t('properties.addentry')}
                </button>
            </div>
            <div id="conditional_rendering_entries">
                {newEntries.map((entry, index) => {
                    return (
                        <div key={index} className="row" id={'rendering_entry_' + index} data-index={index}>
                            <Form.Group className="col-md-3">
                                <Form.Label>{t('properties.condition_string')}</Form.Label>
                                <Form.Control type="text" value={entry.condition} placeholder="" onChange={e => setEntryCondition(index, e.target.value)} />
                            </Form.Group>
                            <Form.Group className="col-md-3">
                                <Form.Label>{t('properties.target_property')}</Form.Label>
                                <Form.Control as="select" value={entry.targetProperty} onChange={e => setEntryTargetProperty(index, e.target.value)}>
                                    <option value="color">{t('color')}</option>
                                    <option value="colorFill">{t('colorFill')}</option>
                                    <option value="isVisible">{t('isVisible')}</option>
                                    <option value="xPosition">{t('xPosition')}</option>
                                    <option value="yPosition">{t('yPosition')}</option>
                                    <option value="value">{t('value')}</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group className="col-md-3">
                                <Form.Label>{t('properties.target_property_value')}</Form.Label>
                                <Form.Control type="text" value={entry.propertyValue} placeholder="" onChange={e => setEntryPropertyValue(index, e.target.value)} />
                            </Form.Group>
                            <Form.Group className="col-md-3">
                                <Form.Label>{t('common.action')}</Form.Label>
                                <button className="btn btn-danger remove_entry form-control" onClick={() => removeEntry(index)}>{t('common.remove')}</button>
                            </Form.Group>
                        </div>
                    )
                })}
            </div>
        </DesignerModal>
    );
}

export default withTranslation()(ConditionalRendering);