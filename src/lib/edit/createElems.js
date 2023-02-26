/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import $ from 'jquery';
import * as PIXI from "pixi.js-legacy";
import {
    onResizeStart, onRotationStart
} from './onEvent';

function createResizeBox(cardside, position, scale) {
    const rbox = new PIXI.Graphics();
    rbox.lineStyle(1, 0xffffff, 1);
    rbox.beginFill(0x000000);
    if ($(window).width() <= 759 || $(window).height() <= 759)
        rbox.drawRect(0, 0, 12 / scale.x, 12 / scale.y);
    else
        rbox.drawRect(0, 0, 8 / scale.x, 8 / scale.y);
    rbox.zindex = -1001;
    rbox.endFill();
    rbox.interactive = true;
    rbox.buttonMode = true;
    if (position === 'top' || position === 'bottom')
    {
        rbox.cursor = 'ns-resize';
    }
    else if (position === 'rightBottom' || position === 'leftTop')
    {
        rbox.cursor = 'nwse-resize';
    }
    else if (position === 'leftBottom' || position === 'rightTop')
    {
        rbox.cursor = 'nesw-resize';
    }
    else
    {
        rbox.cursor = 'ew-resize';
    }
    rbox
        .on('mousedown', (event) =>
        {
            onResizeStart(event, cardside, position);
        })
        .on('touchstart', (event) =>
        {
            onResizeStart(event, cardside, position);
        });
    return rbox;
}

function createRotationBox(cardside, position, scale) {
    const rbox = new PIXI.Graphics();
    rbox.lineStyle(1, 0xffffff, 1);
    rbox.beginFill(0x000000);
    rbox.drawRect(0, 0, 6 / scale.x, 6 / scale.y);
    rbox.endFill();
    rbox.interactive = true;
    rbox.buttonMode = true;
    rbox.cursor = 'grab';
    rbox
        .on('mousedown', (event) =>
        {
            onRotationStart(event, cardside, position);
        })
        .on('touchstart', (event) =>
        {
            onRotationStart(event, cardside, position);
        });
    return rbox;
}

export {
    createResizeBox, createRotationBox
}