/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import React from "react";
import { withTranslation } from "react-i18next";
import { Menu, Item, Separator, useContextMenu } from 'react-contexify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CardSideMenu({t, editor, cardside, canvas}) {
    const sideType = cardside.props.sideType;
    const { show } = useContextMenu({id: 'carddesign_menu_' + sideType});
    cardside.showMenu = show;
    
    return (
        <div>
            {cardside.renderer.data.fields.selected.length > 0 &&
                <Menu id={'carddesign_menu_' + sideType}>
                    {cardside.renderer.data.fields.selected.length === 1 &&
                        <React.Fragment>
                            <Item onClick={() => cardside.editField()}>
                                <span><FontAwesomeIcon icon={["fas", "fa-edit"]} /> {t('menu.edit')}</span>
                            </Item>
                            {cardside.renderer.data.fields.selected[0].options.border &&
                                <Item onClick={() => cardside.editFieldBorder()}>
                                    <span><FontAwesomeIcon icon={["fas", "fa-border-none"]} /> {t('menu.editborder')}</span>
                                </Item>
                            }
                            <Item onClick={() => cardside.editInternalField()}>
                                <span><FontAwesomeIcon icon={["fas", "fa-edit"]} /> {t('menu.editinternal')}</span>
                            </Item>
                            <Item onClick={() => cardside.editConditionalRenderingField()}>
                                <span><FontAwesomeIcon icon={["fas", "fa-arrows-to-eye"]} /> {t('menu.editconditional')}</span>
                            </Item>
                        </React.Fragment>
                    }
                    <Separator />
                    <Item onClick={() => cardside.bringToFront()}>
                        <span><FontAwesomeIcon icon={["fas", "fa-eye"]} /> {t('menu.bringtofront')}</span>
                    </Item>
                    <Item onClick={() => cardside.sendToBack()}>
                        <span><FontAwesomeIcon icon={["fas", "fa-eye-low-vision"]} /> {t('menu.sendtoback')}</span>
                    </Item>
                    <Separator />
                    <Item onClick={() => cardside.renderer.features.fields.cutField()}>
                        <span><FontAwesomeIcon icon={["fas", "fa-cut"]} /> {t('menu.cut')}</span>
                    </Item>
                    <Item onClick={() => cardside.renderer.features.fields.copyField()}>
                        <span><FontAwesomeIcon icon={["fas", "fa-copy"]} /> {t('menu.copy')}</span>
                    </Item>
                    <Item onClick={() => cardside.renderer.features.fields.deleteField()}>
                        <span><FontAwesomeIcon icon={["fas", "fa-remove"]} /> {t('menu.delete')}</span>
                    </Item>
                    <Separator />
                    <Item onClick={() => cardside.renderer.features.fields.unselectField()}>
                        <span>{t('menu.unselect')}</span>
                    </Item>
                </Menu>
            }

            {cardside.renderer.data.fields.selected.length === 0 &&
                <Menu id={'carddesign_menu_' + sideType}>
                    <Item onClick={({ event }) => cardside.renderer.features.fields.pasteFieldAtMousePos(event, canvas.current)}>
                        <span><FontAwesomeIcon icon={["fas", "fa-paste"]} /> {t('menu.paste')}</span>
                    </Item>
                    <Item onClick={() => editor.undoTemplate()} disabled={editor.state.snapshots.undo.length <= 1}>
                        <span><FontAwesomeIcon icon={["fas", "fa-rotate-left"]} /> {t('menu.undo')}</span>
                    </Item>
                    <Item onClick={() => editor.redoTemplate()} disabled={editor.state.snapshots.redo.length <= 1}>
                        <span><FontAwesomeIcon icon={["fas", "fa-rotate-right"]} /> {t('menu.redo')}</span>
                    </Item>
                    <Item onClick={() => editor.viewHistory()} disabled={editor.state.snapshots.undo.length <= 1 && editor.state.snapshots.redo.length <= 0}>
                        <span><FontAwesomeIcon icon={["fas", "fa-clock-rotate-left"]} /> {t('menu.history')}</span>
                    </Item>
                    <Separator />
                    <Item onClick={({ event }) => cardside.addFieldFromList(event, canvas.current)}>
                        <span><FontAwesomeIcon icon={["fas", "fa-list"]} /> {t('menu.addfieldfromlist')}</span>
                    </Item>
                    <Item onClick={() => cardside.editGrid()}>
                        <span><FontAwesomeIcon icon={["fas", "fa-border-all"]} /> {t('menu.viewsettings')}</span>
                    </Item>
                    <Separator />
                    <Item onClick={() => cardside.editBackground()}>
                        <span><FontAwesomeIcon icon={["fas", "fa-paint-roller"]} /> {t('menu.background')}</span>
                    </Item>
                </Menu>
            }
        </div>
    );
}

export default withTranslation()(CardSideMenu);