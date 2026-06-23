/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import $ from 'jquery';
import * as PIXI from "pixi.js";
import {
    onResizeStart, onRotationStart
} from './onEvent';

function createResizeBox(cardside, position, scale) {
    const container = new PIXI.Container();
    const rbox = new PIXI.Graphics();
    if ($(window).width() <= 759 || $(window).height() <= 759)
        rbox.rect(0, 0, 12 / scale.x, 12 / scale.y);
    else
        rbox.rect(0, 0, 8 / scale.x, 8 / scale.y);
    rbox.fill(0x000000).stroke({width: 1, color: 0xffffff});
    container.addChild(rbox);
    container.eventMode  = 'static';
    if (position === 'top' || position === 'bottom')
    {
        container.cursor = 'ns-resize';
    }
    else if (position === 'rightBottom' || position === 'leftTop')
    {
        container.cursor = 'nwse-resize';
    }
    else if (position === 'leftBottom' || position === 'rightTop')
    {
        container.cursor = 'nesw-resize';
    }
    else
    {
        container.cursor = 'ew-resize';
    }
    container
        .on('mousedown', (event) =>
        {
            onResizeStart(event, cardside, position);
        })
        .on('touchstart', (event) =>
        {
            onResizeStart(event, cardside, position);
        });
    return container;
}

function createRotationBox(cardside, position, scale) {
    const container = new PIXI.Container();
    const rbox = new PIXI.Graphics();
    rbox.rect(0, 0, 6 / scale.x, 6 / scale.y).fill(0x000000).stroke({width: 1, color: 0xffffff});
    container.addChild(rbox);
    container.eventMode  = 'static';
    container.cursor = 'grab';
    container
        .on('mousedown', (event) =>
        {
            onRotationStart(event, cardside, position);
        })
        .on('touchstart', (event) =>
        {
            onRotationStart(event, cardside, position);
        });
    return container;
}

export {
    createResizeBox, createRotationBox
}