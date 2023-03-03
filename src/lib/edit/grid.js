/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { reloadTemplate } from './json';

function editGrid()
{
    this.setState({
        show_gridsettings: true
    });
}

function editGridConfirm(grid)
{
    const oldunit = this.renderer.data.grid.unit;
    const oldscale = this.renderer.data.grid.scale;
    const oldruler = this.renderer.data.grid.ruler;

    const options = Object.keys(grid);
    options.forEach((key) => {
        this.renderer.data.grid[key] = grid[key];
    });

    if (oldunit !== this.renderer.data.grid.unit || oldruler !== this.renderer.data.grid.ruler || oldscale !== this.renderer.data.grid.scale) {
        reloadTemplate.call(this.props.editor);
    } else {
        this.renderer.features.grid.drawGrid();
    }
}

function toggleGrid(sideType)
{
    const renderer = this.sides[sideType];
    renderer.data.grid.enabled = !renderer.data.grid.enabled;
    if (renderer.data.grid.enabled) {
        renderer.features.grid.drawGrid();
    } else {
        renderer.features.grid.cleanGrid();
    }
}

export {
    editGrid, editGridConfirm, toggleGrid
}