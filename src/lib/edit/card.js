/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
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

function editCustomSize(side, val)
{
    //1px = 0.2645833333 mm
    //1in = 25.4mm
    
    const i = (side === 'x') ? 0 : 1;
    if (i === 0) {
        this.changeLayout({width: val});
    } else {
        this.changeLayout({height: val});
    }

    newCard.call(this, { size: 'custom' });
}

export {
    editBackground, newCard, editCustomSize
}