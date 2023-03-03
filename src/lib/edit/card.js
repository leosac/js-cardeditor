/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import $ from 'jquery';
import "jquery-ui";
import "jquery-ui/ui/widgets/draggable";
import "jquery-ui/ui/widgets/droppable";

function editBackground()
{
    this.setState({
        show_background: true
    });
}

function newCard(layout)
{
    if (!layout.orientation) {
        layout.orientation = (layout.size !== 'cr80' && layout.size !== "custom") ? 'portrait' : 'landscape';
    }
    this.setState({
        name: '',
        layout: layout
    });

    return Promise.all(this.getSides.call(this).map(async sideType => {
        const renderer = this.sides[sideType];
        if (renderer) {
            await renderer.createCardStage(layout, undefined, false);
        }
    }));
}

function editCustomSize(side)
{
    //1px = 0.2645833333 mm
    //1in = 25.4mm

    if (side === 'x')
    {
        this.layoutsizes['px']['custom'][0] = Number($("#templateSizeX").val());
        this.layoutsizes['mm']['custom'][0] = Number(Number($("#templateSizeX").val() * 0.2645833333).toFixed(4));
        this.layoutsizes['in']['custom'][0] = Number(Number(Number($("#templateSizeX").val() * 0.2645833333) / 25,4).toFixed(4))
    }
    else
    {
        this.layoutsizes['px']['custom'][1] = Number($("#templateSizeY").val());
        this.layoutsizes['mm']['custom'][1] = Number(Number($("#templateSizeY").val() * 0.2645833333).toFixed(4));
        this.layoutsizes['in']['custom'][1] = Number(Number(Number($("#templateSizeY").val() * 0.2645833333) / 25,4).toFixed(4));
    }

    newCard.call(this, 'custom');
}

export {
    editBackground, newCard, editCustomSize
}