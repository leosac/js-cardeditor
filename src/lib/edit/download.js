/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import {
    toDPF
} from './xml';

function downloadDPF()
{
    const xml = toDPF.call(this);
    let tplname = this.state.name;
    if (tplname === '')
    {
        tplname = 'Template';
    }
    const element = document.createElement('a');
    const blob = new Blob([xml], {
        type: 'text/xml'
    });
    element.href = URL.createObjectURL(blob);
    element.setAttribute('download', tplname.toLowerCase() + '.dpf');
    document.body.appendChild(element);
    element.click();
}

function downloadImage()
{
    const renderer = this.sides['recto'];
    const resizedCanvas = renderer.createCanvas();
    let imgdata = resizedCanvas.toDataURL('image/png');
    let tplname = this.state.name;
    if (tplname === '')
    {
        tplname = 'Template';
    }
    const element = document.createElement('a');
    element.href = imgdata;
    element.setAttribute('download', tplname.toLowerCase() + '.png');
    document.body.appendChild(element);
    element.click();
}

export {
    downloadDPF, downloadImage
}