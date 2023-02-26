/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { withTranslation } from "react-i18next";
import { Menu, Item, Separator, useContextMenu } from 'react-contexify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CardSideMenu({t, editor, renderer, sideType, canvas}) {
    renderer.showMenu = useContextMenu({id: 'carddesign_menu_' + sideType});
    
    return (
        <div>
            {renderer.data.fields.selected.length > 0 &&
                <Menu id={'carddesign_menu_' + sideType}>
                    <Item onClick={() => editor.editField(sideType)}>
                        <FontAwesomeIcon icon={["fas", "fa-edit"]} />
                        <span>Edit Properties</span>
                    </Item>
                    <Item onClick={() => editor.editInternalField(sideType)}>
                        <FontAwesomeIcon icon={["fas", "fa-edit"]} />
                        <span>Edit Internal Properties</span>
                    </Item>
                    <Item onClick={() => editor.editConditionalRenderingField(sideType)}>
                        <FontAwesomeIcon icon={["fas", "fa-edit"]} />
                        <span>Conditional Rendering</span>
                    </Item>
                    <Item onClick={renderer.features.fields.cutField}>
                        <FontAwesomeIcon icon={["fas", "fa-cut"]} />
                        <span>Cut</span>
                    </Item>
                    <Item onClick={renderer.features.fields.copyField}>
                        <FontAwesomeIcon icon={["fas", "fa-copy"]} />
                        <span>Copy</span>
                    </Item>
                    <Item onClick={renderer.features.fields.deleteField}>
                        <FontAwesomeIcon icon={["fas", "fa-remove"]} />
                        <span>{t('common.delete')}</span>
                    </Item>
                    <Separator />
                    <Item onClick={renderer.features.fields.unselectField}>
                        <span>Unselect</span>
                    </Item>
                </Menu>
            }

            {renderer.data.fields.selected.length === 0 &&
                <Menu id={'carddesign_menu_' + sideType}>
                    <Item onClick={({ event }) => editor.sides[sideType].features.fields.pasteFieldAtMousePos(event, canvas.current, sideType)}>
                        <FontAwesomeIcon icon={["fas", "fa-paste"]} />
                        <span>Paste</span>
                    </Item>
                    <Item onClick={editor.undoTemplate} disabled={editor.state.snapshots.undo.length <= 1}>
                        <span>Undo</span>
                    </Item>
                    <Item onClick={editor.redoTemplate} disabled={editor.state.snapshots.redo.length <= 1}>
                        <span>Redo</span>
                    </Item>
                    <Item onClick={editor.viewHistory} disabled={editor.state.snapshots.undo.length <= 1 && editor.state.snapshots.redo.length <= 0}>
                        <span>History...</span>
                    </Item>
                    <Separator />
                    <Item onClick={({ event }) => editor.addFieldFromList(event, canvas.current, sideType)}>
                        <span>Add field from list...</span>
                    </Item>
                    <Item onClick={editor.editGrid}>
                        <span>View Settings...</span>
                    </Item>
                    <Separator />
                    <Item onClick={() => editor.editBackground(sideType)}>
                        <span>Set Background...</span>
                    </Item>
                </Menu>
            }
        </div>
    );
}

export default withTranslation()(CardSideMenu);