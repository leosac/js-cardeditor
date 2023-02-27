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
    this.setState({
        name: '',
        orientation: (layout !== 'cr80' && layout !== "custom") ? 'Portrait' : 'Landscape'
    });

    return Promise.all(this.getSides.call(this).map(async sideType => {
        const renderer = this.sides[sideType];
        if (renderer) {
            await renderer.createCardStage(layout, this.state.orientation, undefined, false);
        }
    }));
}

function editCustomSize(side)
{
    //1px = 5,2mm
    //1in = 25,4mm

    //Note : 'inch' value is not exact and sometime can differ from 0,1 to 0,2 

    if (side === 'x')
    {
        this.layouts['px']['custom'][0] = Number($("#templateSizeX").val());
        this.layouts['mm']['custom'][0] = Number(Number($("#templateSizeX").val() / 5,2).toFixed(4));
        this.layouts['in']['custom'][0] = Number(Number(Number($("#templateSizeX").val() / 5,2) / 25,4).toFixed(4))
    }
    else
    {
        this.layouts['px']['custom'][1] = Number($("#templateSizeY").val());
        this.layouts['mm']['custom'][1] = Number(Number($("#templateSizeY").val() / 5,2).toFixed(4));
        this.layouts['in']['custom'][1] = Number(Number(Number($("#templateSizeY").val() / 5,2) / 25,4).toFixed(4));
    }

    newCard.call(this, 'custom');
}

export {
    editBackground, newCard, editCustomSize
}