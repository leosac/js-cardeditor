/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/

import $ from 'jquery';
import {
    toDPF, loadDPF, reloadTemplate
} from './xml';

async function printTemplate()
{
    const data = this.sides.recto.data;
    if (data.grid.enabled){
        this.getSides.call(this).forEach(sideType => {
            const renderer = this.sides[sideType];
            renderer.features.fields.unselectField();
            renderer.features.grid.cleanGrid();
        });
    }

    // Be sure we hide visual helpers
    data.grid.enabled = false;
    data.grid.ruler = false;
    data.card.border = 0;
    await reloadTemplate.call(this);

    // If we're in recto/verso mode, we need twice the height.
    let height = 0;
    this.getSides.call(this).forEach(sideType => {
        const renderer = this.sides[sideType];
        height += renderer.graphics.renderer.view.height;
    });

    const mywindow = window.open('', 'Card', 'height=' + height + ',width=' + this.sides['recto'].graphics.renderer.view.width);
    mywindow.document.write('<html><head><title>Card</title>');
    if (this.state.currentlayout === 'cr80') {
        mywindow.document.write('<style>@page { size: 85.725mm 53.975mm; margin: 0; } body { overflow-x: visible; overflow-y: visible; }</style>');
    }
    mywindow.document.write('</head><body >');

    this.getSides.call(this).forEach(sideType => {
        const renderer = this.sides[sideType];
        renderer.graphics.renderer.render(renderer.graphics.stage);
        mywindow.document.write('<img src="' + renderer.graphics.renderer.view.toDataURL("image/png") + '" style="width: 100%; height: 100%" />');
    });

    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10
    mywindow.print();

    /*
    *   This part is used to close print window, because of Chrome choices we need to check
    *   manually each navigator. Yes, because lot of navigator include "Chrome" inside their userAgent.
    *   So, if navigator is Chrome, we add aventlistener, else, we just call close.
    *   If you find a better solution, fell free to change this !
    */
    let userAgent = mywindow.navigator.userAgent;
    if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Edge") === -1 &&
        userAgent.indexOf("OPR") === -1 && userAgent.indexOf("Opera") === -1 &&
        userAgent.indexOf("SamsungBrowser") === -1)
            mywindow.addEventListener("afterprint", function(e) {mywindow.close();});
    else
        mywindow.close();
}

function getAllNamedFields()
{
    let fields = [];
    this.getSides.call(this).forEach(sideType => {
        const renderer = this.sides[sideType];
        const cardRef = renderer.graphics.card;
        for (let f = 0; f < cardRef.children.length; ++f)
        {
            const child = cardRef.getChildAt(f);
            if (child.options !== undefined && child.options.name !== undefined && child.options.name !== '' && child.options.type !== undefined)
            {
                fields.push({
                    name: child.options.name,
                    type: child.options.type,
                    value: child.options.value
                });
            }
        }
    });
    return fields;
}

function printCard()
{
    this.setState({
        show_printcard: true
    })
}

async function printCardConfirm(values)
{
    // Duplicate template
    const xmldoc = $.parseXML(toDPF.call(this));
    const $xml = $(xmldoc);

    // Update values from form. For each side if need be.
    this.getSides.call(this).forEach(sideType => {
        const renderer = this.sides[sideType];
        const cardRef = renderer.graphics.card;
        let fields = [];
        for (let f = 0; f < cardRef.children.length; ++f)
        {
            const child = cardRef.getChildAt(f);
            if (child.options !== undefined && child.options.name !== undefined && child.options.name !== '' && child.options.type !== undefined)
            {
                if (values[child.options.name] !== undefined) {
                    child.options.value = values[child.options.name];
                    fields.push(child);
                }
            }
        }
        for (let f = 0; f < fields.length; ++f)
        {
            cardRef.removeChild(fields[f]);
            renderer.features.fields.createField(
                fields[f].options,
                {x: fields[f].options.x, y: fields[f].options.y}
            );
        }
    });
    await printTemplate.call(this);

    // Restore template
    await loadDPF.call(this, $xml);
}

export {
    printCardConfirm, printCard, getAllNamedFields, printTemplate
}