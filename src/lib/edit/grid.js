/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import {
    reloadTemplate
} from './xml';

function editGrid()
{
    this.setState({
        show_gridsettings: true
    });
}

function editGridConfirm(grid)
{
    const renderer = this.sides[this.currentside];
    const oldunit = renderer.data.grid.unit;
    const oldscale = renderer.data.grid.scale;
    const oldruler = renderer.data.grid.ruler;

    const options = Object.keys(grid);
    options.forEach((key) =>
    {
        renderer.data.grid[key] = grid[key];
    });

    if (oldunit !== renderer.data.grid.unit || oldruler !== renderer.data.grid.ruler || oldscale !== renderer.data.grid.scale) {
        reloadTemplate.call(this);
    } else {
        renderer.features.grid.drawGrid();
    }
}

function toggleGrid()
{
    const renderer = this.sides[this.currentside];
    renderer.data.grid.enabled = !renderer.data.grid.enabled;    
    renderer.features.grid.drawGrid();
}

export {
    editGrid, editGridConfirm, toggleGrid
}