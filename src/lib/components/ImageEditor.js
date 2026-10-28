/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { useContext, useState, useRef } from 'react';
import { withTranslation } from "react-i18next";
import FilerobotImageEditor, { TABS } from 'react-filerobot-image-editor';
import ThemeContext from "../ThemeContext";

const darkTheme = {
    palette: {
        'bg-primary': '#212529',
        'bg-secondary': '#2b3035',
        'bg-primary-light': '#343a40',
        'bg-primary-hover': '#495057',
        'bg-primary-active': '#495057',
        'bg-primary-stateless': '#495057',
        'bg-stateless': '#212529',
        'bg-active': '#343a40',
        'bg-hover': '#343a40',
        'bg-grey': '#495057',
        'bg-base-light': '#343a40',
        'bg-base-medium': '#495057',
        'bg-tooltip': '#343a40',
        'txt-primary': '#dee2e6',
        'txt-secondary': '#adb5bd',
        'txt-placeholder': '#adb5bd',
        'icon-primary': '#adb5bd',
        'icons-secondary': '#adb5bd',
        'icons-primary-hover': '#dee2e6',
        'icons-secondary-hover': '#dee2e6',
        'btn-secondary-text': '#dee2e6',
        'borders-primary': '#495057',
        'borders-secondary': '#495057',
        'borders-strong': '#6c757d'
    }
};

function ImageEditor({t, image, onChange}) {
    const theme = useContext(ThemeContext);
    const [showEditor, setShowEditor] = useState(false);
    const inputFile = useRef(null);

    function fileClick() {
        inputFile.current.click();
    }

    function changeFile(target) {
        if (FileReader && target.files && target.files.length > 0)
        {
            const reader = new FileReader();
            reader.onload = (e) => {
                onChange(e.target.result);
            };
            reader.onerror = (e) => {
                alert("Error reading image file.");
            };
            reader.readAsDataURL(target.files[0]);
        }
    }

    return (
        <div>
            {!showEditor &&
                <div className="row">
                    <div className="col-md-6 text-center">
                        <img src={image} alt={t('properties.currentimage')} className="img-fluid" />
                    </div>
                    <div className="col-md-6 list-group">
                        <button type="button" className="btn btn-primary" onClick={fileClick}>{t('create.loadfile')}</button>
                        <input type='file' ref={inputFile} style={{display: 'none'}} onChange={e => changeFile(e.target)} />
                        {image &&
                            <button type="button" className="btn" onClick={() => setShowEditor(true)}>{t('common.edit')}</button>
                        }
                    </div>
                </div>
            }
            {showEditor &&
                <FilerobotImageEditor
                    theme={theme === 'dark' ? darkTheme : undefined}
                    source={image}
                    tabsIds={[TABS.ADJUST, TABS.FINETUNE, TABS.FILTERS, TABS.ANNOTATE, TABS.WATERMARK, TABS.RESIZE]}
                    onClose={() => setShowEditor(false)}
                    onSave={(edited) => onChange(edited.imageBase64)}
                    onBeforeSave={() => false}
                    closeAfterSave={true}
                    Crop={{
                        presetsItems: [
                            {
                                titleKey: 'ID Photo',
                                descriptionKey: '3,5:4,5',
                                ratio: 7 / 9
                            }
                        ]
                    }}
                />
            }
        </div>
    );
}

export default withTranslation()(ImageEditor);