/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import $ from "jquery";
import * as PIXI from "pixi.js";
import {
    createRotationBox, createResizeBox
} from './createElems';
import {
    undoTemplate, redoTemplate
} from './history';

async function onCardClickDown(event, renderer)
{
    if (renderer.data.fields.selected.length > 0 && (renderer.data.fields.selected[0].dragging || renderer.data.fields.selected[0].resizing || renderer.data.fields.selected[0].rotating))
    {
        onDragEnd(event, renderer);
    }
    else
    {
        const position = renderer.graphics.card.toLocal(event.global);
        
        const factorytype = renderer.data.fields.factorytype ?? 'cursor';
        if (factorytype === 'cursor')
        {
            if (renderer.graphics.stage.selectarea !== undefined && renderer.graphics.stage.selectarea !== null)
            {
                renderer.graphics.card.removeChild(renderer.graphics.stage.selectarea);
                renderer.graphics.stage.selectarea.destroy(true);
            }
            renderer.graphics.stage.selectarea = new PIXI.Graphics();
            renderer.graphics.stage.selectarea.alpha = 0.3;
            renderer.graphics.stage.selectarea.position.set(position.x, position.y);
            renderer.graphics.stage.selectarea.eventMode = 'none';
            renderer.graphics.card.addChild(renderer.graphics.stage.selectarea);
        }

        await renderer.features.fields.createField({type: renderer.data.fields.factorytype}, position);
    }
}

function onCardClickUp(event, renderer) {
    if (renderer.graphics.stage.selectarea !== undefined && renderer.graphics.stage.selectarea !== null)
    {
        renderer.features.fields.selectFieldsInArea(renderer.graphics.stage.selectarea);
        renderer.graphics.card.removeChild(renderer.graphics.stage.selectarea);
        renderer.graphics.stage.selectarea.destroy(true);
        renderer.graphics.stage.selectarea = null;
    }
}

function onCardMouseMove(event, renderer, topRuler, leftRuler) {
    const position = renderer.graphics.stage.toLocal(event.global);

    if (renderer.data.grid.ruler)
    {
        if (topRuler.cursorTracker === undefined || topRuler.cursorTracker === null)
        {
            topRuler.cursorTracker = new PIXI.Graphics();
            topRuler.cursorTracker.moveTo(0, 1)
                .lineTo(0, topRuler.height - 1)
                .stroke({width: 1, color: 0xffff00});
            topRuler.cursorTracker.eventMode = 'none';
            topRuler.addChild(topRuler.cursorTracker);
        }
        topRuler.cursorTracker.position.set(position.x - topRuler.x, 0);

        if (leftRuler.cursorTracker === undefined || leftRuler.cursorTracker === null)
        {
            leftRuler.cursorTracker = new PIXI.Graphics();
            leftRuler.cursorTracker.moveTo(1, 0)
                .lineTo(leftRuler.width - 1, 0)
                .stroke({width: 1, color: 0xffff00});
            leftRuler.cursorTracker.eventMode = 'none';
            leftRuler.addChild(leftRuler.cursorTracker);
        }
        leftRuler.cursorTracker.position.set(0, position.y - leftRuler.y);
    }

    if (renderer.graphics.stage.selectarea !== undefined && renderer.graphics.stage.selectarea !== null)
    {
        renderer.graphics.stage.selectarea.clear();
        //If x or y negative, we set x/y with negatives values and draw with width/height set as positive
        //If not, x/y set 0, draw with positive values
        //This fix a problem with selected area in reverse
        let areaxpos = 0;
        let areaypos = 0;
        let areawidth = position.x - (renderer.data.grid.ruler ? topRuler.x : 0) - renderer.data.card.border - renderer.graphics.stage.selectarea.position.x;
        let areaheight = position.y - (renderer.data.grid.ruler ? leftRuler.y : 0) - renderer.data.card.border - renderer.graphics.stage.selectarea.position.y;

        if (areawidth < 0)
        {
            areaxpos = areawidth;
            areawidth = Math.abs(areawidth);
        }
        if (areaheight < 0)
        {
            areaypos = areaheight;
            areaheight = Math.abs(areaheight);
        }
        renderer.graphics.stage.selectarea.rect(areaxpos, areaypos, areawidth, areaheight).fill(0xa8a8a8).stroke({width: 1, color: 0x000000});
    }

    // We forward the event to selected fields
    // Mainly to handle resize/rotate as such events arise out of the field area
    if (renderer.data.fields.selected.length > 0) {
        renderer.data.fields.selected.forEach(field => {
            onDragMove(event, renderer, field);
        });
    }
}

async function onCardKeyDown(event, renderer) {
    if (renderer) {
        if (event.ctrlKey) {
            renderer.data.fields.multiselection = true;

            if (!renderer.data.preventkeystroke) {
                if (renderer.data.fields.selected.length > 0) {
                    // A char
                    if (event.keyCode === 65) {
                        event.preventDefault();
                        renderer.features.fields.selectAllFields();
                        event.stopPropagation();
                    }
                    // C char
                    else if (event.keyCode === 67) {
                        renderer.features.fields.copyField();
                    }
                    // X char
                    else if (event.keyCode === 88) {
                        renderer.features.fields.cutField();
                    }
                    // Z char
                    else if (event.keyCode === 89) {
                        await redoTemplate(renderer);
                    }
                    // Z char
                    else if (event.keyCode === 90) {
                        await undoTemplate(renderer);
                    }
                }

                // V char, in case paste event is not supported
                if (event.keyCode === 86) {
                    if (await renderer.features.fields.pasteField(-1, -1)) {
                        // Avoid paste for few milliseconds
                        renderer.data.preventkeystroke = true;
                        setTimeout(() => {
                            renderer.data.preventkeystroke = false;
                        }, 300);
                    }
                }
            }
        }

        if (event.shiftKey) {
            renderer.data.fields.rotationmode = true;
        }
    }
}

async function onCardPaste(event, renderer) {
    if (renderer) {
        if (!renderer.data.preventkeystroke) {
            // Avoid paste for few milliseconds
            renderer.data.preventkeystroke = true;
            setTimeout(() => {
                renderer.data.preventkeystroke = false;
            }, 300);

            if (!await renderer.features.fields.pasteField(-1, -1)) {
                /*const textdata = event.originalEvent.clipboardData ? event.originalEvent.clipboardData.getData('text/plain') :
                    (window.clipboardData ? window.clipboardData.getData('Text') : false);
                if (textdata !== false) {
                    let newfield = renderer.features.fields.createField({type: 'label', value: textdata, autoSize: true, colorFill: -1},
                        {x: 10, y: 10}
                    );

                    renderer.features.fields.selectField(newfield);
                }*/
            }
        }
    }
}

function onCardKeyUp(event, renderer) {
    if (renderer) {
        renderer.data.fields.multiselection = false;
        renderer.data.fields.rotationmode = false;

        if (!renderer.data.preventkeystroke)  {
            // Catch "BACKSPACE" and "DELETE" keypress.
            // Key code have to be hardcoded as number.
            // See here for keycode: https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
            if (event.keyCode === 8 || event.keyCode === 46) {
                renderer.features.fields.deleteField();
            }
            if (renderer.data.fields.selected.length > 0) {
                event.preventDefault();
                // Left arrow
                if (event.keyCode === 37) {
                    renderer.features.fields.moveSelectedFields(-renderer.data.grid.step, 0);
                }
                // Up arrow
                else if (event.keyCode === 38) {
                    renderer.features.fields.moveSelectedFields(0, -renderer.data.grid.step);
                }
                // Right arrow
                else if (event.keyCode === 39) {
                    renderer.features.fields.moveSelectedFields(renderer.data.grid.step, 0);
                }
                // Down arrow
                else if (event.keyCode === 40) {
                    renderer.features.fields.moveSelectedFields(0, renderer.data.grid.step);
                }

                event.stopPropagation();
            }
        }
    }
}

function onDragStart(event, cardside, renderer, field) {
    const factorytype = renderer.data.fields.factorytype ?? 'cursor';
console.log("onDragStart");
    $(':focus').blur();
    if (factorytype === 'cursor') {
        if (renderer.data.clicks !== 1) {
            renderer.data.clicks = 1;
            renderer.data.clicksTimer = setTimeout(() => {
                renderer.data.clicks = 0;
            }, 300);

            if (renderer.data.fields.selected.indexOf(field) === -1)  {
                if (!renderer.data.fields.multiselection) {
                    if (renderer.data.fields.selected.length > 0) {
                        renderer.features.fields.unselectField();
                    }
                }
                renderer.features.fields.selectField(field)
            } else {
                if (renderer.data.fields.multiselection) {
                    renderer.features.fields.unselectField(field);
                }
            }

            if (field.selected !== undefined && field.selected !== null) {
                // store a reference to the global position
                // the reason for this is because of multitouch
                // we want to track the movement of this particular touch
                field.global = event.global;
                const position = field.toLocal(field.global);
                field.sx = (position.x * field.scale.x);
                field.sy = (position.y * field.scale.y);
                field.alpha = 0.5;
                field.dragging = true;
                field.cursor = 'move';
            }
        } else {
            renderer.data.clicks = 0;
            cardside.editField();
        }
    } else {
        // We want to draw a new item (on top of an other one).
        onCardClickDown(event, renderer);
    }

    event.stopPropagation();
}

function onDragEnd(event, renderer) {
    if (renderer.data.fields.selected.length > 0)
    {
        let changed = false;
        renderer.data.fields.selected.forEach((f) => {
            f.alpha = 1;

            f.dragging = false;
            // set the interaction global to null
            f.global = null;

            if (f.resizing || f.rotating)
            {
                f.resizing = false;
                f.rotating = false;
                const createOpt = {
                    autoSizeImg: false
                };

                renderer.features.fields.recreateSelectedField(createOpt);
                changed = true;
            }
            else if (f.moved)
            {
                changed = true;
            }
            f.moved = false;
        });

        if (changed) {
            renderer.handleOnChange();
        }
    }

    renderer.features.fields.cleanHighlights();
}

function onSelectedSpriteCreated(renderer, selectgraph, boxwidth, boxheight, scale) {
    if (renderer.data.fields.rotationmode) {
        const rsRightBot = createRotationBox(renderer, 'rightBottom', scale);
        rsRightBot.x = boxwidth - ((rsRightBot.width - 3) / 2);
        rsRightBot.y = boxheight - ((rsRightBot.height - 2) / 2);
        selectgraph.addChild(rsRightBot);

        const rsLeftBot = createRotationBox(renderer, 'leftBottom', scale);
        rsLeftBot.x = -((rsLeftBot.width + 3) / 2);
        rsLeftBot.y = boxheight - ((rsLeftBot.height - 2) / 2);
        selectgraph.addChild(rsLeftBot);

        const rsLeftTop = createRotationBox(renderer, 'leftTop', scale);
        rsLeftTop.x = -((rsLeftTop.width + 3) / 2);
        rsLeftTop.y = -((rsLeftTop.height + 2) / 2);
        selectgraph.addChild(rsLeftTop);

        const rsRightTop = createRotationBox(renderer, 'rightTop', scale);
        rsRightTop.x = boxwidth - ((rsRightTop.width - 3) / 2);
        rsRightTop.y = -((rsRightTop.height + 2) / 2);
        selectgraph.addChild(rsRightTop);
    } else {
        const rsRightBot = createResizeBox(renderer, 'rightBottom', scale);
        rsRightBot.x = boxwidth - ((rsRightBot.width - 3) / 2);
        rsRightBot.y = boxheight - ((rsRightBot.height - 2) / 2);
        selectgraph.addChild(rsRightBot);

        const rsLeftBot = createResizeBox(renderer, 'leftBottom', scale);
        rsLeftBot.x = -((rsLeftBot.width + 3) / 2);
        rsLeftBot.y = boxheight - ((rsLeftBot.height - 2) / 2);
        selectgraph.addChild(rsLeftBot);

        if (boxheight > rsRightBot.height / 2)
        {
            const rsLeftTop = createResizeBox(renderer, 'leftTop', scale);
            rsLeftTop.x = -((rsLeftTop.width + 3) / 2);
            rsLeftTop.y = -((rsLeftTop.height + 2) / 2);
            selectgraph.addChild(rsLeftTop);

            const rsRightTop = createResizeBox(renderer, 'rightTop', scale);
            rsRightTop.x = boxwidth - ((rsRightTop.width - 3) / 2);
            rsRightTop.y = -((rsRightTop.height + 2) / 2);
            selectgraph.addChild(rsRightTop);

            if (boxwidth > rsRightBot.width * 2)
            {
                const rstop = createResizeBox(renderer, 'top', scale);
                rstop.x = (boxwidth - rstop.width) / 2;
                rstop.y = -((rstop.height + 2) / 2);
                selectgraph.addChild(rstop);
            }
        }

        if (boxwidth > rsRightBot.width * 2)
        {
            const rsbottom = createResizeBox(renderer, 'bottom', scale);
            rsbottom.x = (boxwidth - rsbottom.width) / 2;
            rsbottom.y = boxheight - ((rsbottom.height - 2) / 2);
            selectgraph.addChild(rsbottom);
        }

        if (boxheight > rsRightBot.height * 2)
        {
            const rsleft = createResizeBox(renderer, 'left', scale);
            rsleft.x = -((rsleft.width + 3) / 2);
            rsleft.y = (boxheight - rsleft.height) / 2;
            selectgraph.addChild(rsleft);

            const rsright = createResizeBox(renderer, 'right', scale);
            rsright.x = boxwidth - ((rsleft.width - 3) / 2);
            rsright.y = (boxheight - rsright.height) / 2;
            selectgraph.addChild(rsright);
        }
    }
}

function onResizeStart(event, renderer, position) {
    const selectedFieldRef = renderer.data.fields.selected[0];

    // store a reference to the global
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    selectedFieldRef.global = event.global;
    selectedFieldRef.alpha = 0.5;
    selectedFieldRef.resizingFrom = position;
    selectedFieldRef.resizing = true;
    if (selectedFieldRef.selected !== null)
    {
        selectedFieldRef.removeChild(selectedFieldRef.selected);
        selectedFieldRef.selected.destroy(true);
    }
    event.stopPropagation();
}

function onRotationStart(event, renderer, position)
{
    const selectedFieldRef = renderer.data.fields.selected[0];

    // store a reference to the global
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch

    selectedFieldRef.global = event.global;
    selectedFieldRef.alpha = 0.5;
    selectedFieldRef.rotatingFrom = position;
    selectedFieldRef.originalRotation = selectedFieldRef.rotation;
    selectedFieldRef.rotating = true;
    if (selectedFieldRef.selected !== null)
    {
        selectedFieldRef.removeChild(selectedFieldRef.selected);
        selectedFieldRef.selected.destroy(true);
    }
    event.stopPropagation();
}

function onDragMove(event, renderer, field)
{
    if (field.dragging || field.resizing || field.rotating)
    {
        if (field.global)
        {
            const newPosition = field.parent.toLocal(field.global);
            if (newPosition !== null)
            {
                if (field.dragging)
                {
                    // Move all selected fields
                    let mx = (newPosition.x - field.sx) - field.position.x;
                    let my = (newPosition.y - field.sy) - field.position.y;
                    const previousxy = {x: field.position.x, y: field.position.y};

                    // Quick fix for rotation (field.rotation -> Disable StepAlign)
                    // We move all selected fields and not only this specific field.
                    // Otherwise we would callrenderer.features.fields.moveField(field, mx, my, true);
                    renderer.features.fields.moveSelectedFields(mx, my, true);
                    renderer.features.fields.highlightFieldPositions(field, previousxy);
                }
                else if (field.resizing)
                {
                    // Don't resize if multiselection
                    if (renderer.data.fields.selected.length === 1) {
                        if (field.options) {
                            if (field.resizingFrom === 'top') {
                                if ((newPosition.y) < (field.position.y + field.options.height)) {
                                    field.height = (field.height + (field.position.y - (newPosition.y)));
                                    field.options.height = (field.height + (field.position.y - (newPosition.y)));
                                    
                                    field.position.y = newPosition.y;
                                }
                            } else if (field.resizingFrom === 'bottom') {
                                if ((newPosition.y) > field.position.y) {
                                    field.height = (newPosition.y) - field.position.y;
                                    field.options.height = (newPosition.y) - field.options.y;
                                }
                            } else if (field.resizingFrom === 'left') {
                                if ((newPosition.x) < (field.position.x + field.options.width)) {
                                    field.width = field.width + (field.position.x - (newPosition.x));
                                    field.options.width = field.options.width + (field.position.x - (newPosition.x));
                                    field.position.x = (newPosition.x);
                                }
                            } else if (field.resizingFrom === 'right') {
                                if ((newPosition.x) > field.position.x) {
                                    field.width = (newPosition.x) - field.position.x;
                                    field.options.width = (newPosition.x) - field.options.x;
                                }
                            } else if (field.resizingFrom === 'rightBottom') {
                                if ((newPosition.x) > field.position.x && (newPosition.y) > field.position.y) {
                                    field.width = (newPosition.x) - field.position.x;
                                    field.options.width = (newPosition.x) - field.options.x;

                                    field.height = (newPosition.y) - field.position.y;
                                    field.options.height = (newPosition.y) - field.options.y;
                                }
                            } else if (field.resizingFrom === 'leftBottom') {
                                if ((newPosition.x) < (field.position.x + field.options.width) &&
                                (newPosition.y) > field.position.y) {
                                    field.width = field.width + (field.position.x - (newPosition.x));
                                    field.options.width = field.options.width + (field.position.x - (newPosition.x));
                                    field.position.x = (newPosition.x);

                                    field.height = (newPosition.y) - field.position.y;
                                    field.options.height = (newPosition.y) - field.options.y;
                                }
                            }
                            else if (field.resizingFrom === 'leftTop') {
                                if ((newPosition.x) < (field.position.x + field.options.width) &&
                                (newPosition.y) < (field.position.y + field.options.height)) {
                                    field.width = field.width + (field.position.x - (newPosition.x));
                                    field.options.width = field.options.width + (field.position.x - (newPosition.x));
                                    field.position.x = (newPosition.x);

                                    field.height = field.height + (field.position.y - (newPosition.y));
                                    field.options.height = field.options.height + (field.position.y - (newPosition.y));
                                    field.position.y = (newPosition.y);
                                }
                            }
                            else if (field.resizingFrom === 'rightTop') {
                                if ((newPosition.x) > field.position.x &&
                                    (newPosition.y) < (field.position.y + field.options.height)) {
                                    field.width = (newPosition.x) - field.position.x;
                                    field.options.width = (newPosition.x) - field.options.x;

                                    field.height = field.height + (field.position.y - (newPosition.y));
                                    field.options.height = field.options.height + (field.position.y - (newPosition.y));
                                    field.position.y = (newPosition.y);
                                }
                            }
                        }
                    }
                } else if (field.rotating)
                {
                    // Don't rotate if multiselection
                    if (renderer.data.fields.selected.length === 1) {
                        const centerX = field.position.x + field.options.width / 2;
                        const centerY = field.position.y + field.options.height / 2;

                        const startMouseAngle = Math.atan2(field.global.y - centerY, field.global.x - centerX);
                        const mouseAngle = Math.atan2(newPosition.y - centerY, newPosition.x - centerX);

                        field.rotation = field.originalRotation + (mouseAngle - startMouseAngle);
                        field.options.rotation = field.rotation;
                    }
                }

                if (field.options)
                {
                    field.options.x = Math.round(field.position.x);
                    field.options.y = Math.round(field.position.y);
                }
            }
        }
    }
}

export {
    onCardClickDown, onCardClickUp, onCardKeyDown, onCardKeyUp, onCardMouseMove, onCardPaste, onDragEnd, onDragMove, onDragStart, onResizeStart, onRotationStart, onSelectedSpriteCreated
}