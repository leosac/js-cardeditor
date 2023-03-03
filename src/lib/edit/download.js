/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { toJson } from './json';

function downloadTemplate()
{
    const json = toJson.call(this);
    let tplname = this.state.name;
    if (tplname === '') {
        tplname = 'Template';
    }
    const element = document.createElement('a');
    const blob = new Blob([json], {
        type: 'text/json'
    });
    element.href = URL.createObjectURL(blob);
    element.setAttribute('download', 'card-' + tplname.toLowerCase() + '.json');
    document.body.appendChild(element);
    element.click();
}

function downloadImage()
{
    const renderer = this.sides.front;
    const resizedCanvas = renderer.createCanvas();
    let imgdata = resizedCanvas.toDataURL('image/png');
    let tplname = this.state.name;
    if (tplname === '') {
        tplname = 'Template';
    }
    const element = document.createElement('a');
    element.href = imgdata;
    element.setAttribute('download', tplname.toLowerCase() + '.png');
    document.body.appendChild(element);
    element.click();
}

export {
    downloadTemplate, downloadImage
}