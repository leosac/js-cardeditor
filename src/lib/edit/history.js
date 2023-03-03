/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import { getTemplate, loadTemplate } from './json';

async function undoTemplate()
{
    if (this.state.snapshots.undo.length > 1) {
        let snapshot = this.state.snapshots.undo.pop();
        addSnapshotToHistory(this.state.snapshots.redo, snapshot);
        snapshot = this.state.snapshots.undo[this.state.snapshots.undo.length - 1];

        await loadSnapshot(snapshot);
    }
}

async function redoTemplate()
{
    if (this.state.snapshots.redo.length > 0) {
        let snapshot = this.state.snapshots.redo.pop();
        addSnapshotToHistory(this.state.snapshots.undo, snapshot);

        await loadSnapshot(snapshot);
    }
}

async function loadSnapshot(snapshot)
{
    await loadTemplate.call(this, snapshot.content);
}

function viewHistory()
{
    this.state.snapshots.history = this.state.snapshots.undo.concat(this.state.snapshots.redo).reverse();
    this.setState({
        snapshots: this.state.snapshots,
        show_history: true
    });
}

function createSnapshot(preview)
{
    if (preview === undefined) {
        preview = false;
    }

    const snapshot = {
        name: this.state.name,
        layout: this.state.layout,
        content: getTemplate.call(this)
    };

    if (preview) {
        const renderer = this.sides.front;
        let oldgrid = false;
        //Disable Grid
        if (renderer.data.grid) {
            oldgrid = renderer.data.grid.enabled;
            renderer.data.grid.enabled = false;
        }

        //Disable Highlights
        if (renderer.graphics.highlights)
        {
            renderer.graphics.highlights.forEach((h) => {h.visible = false;});
        }

        if (renderer.graphics.card) {
            //Disable resize/rotate boxes
            renderer.graphics.card.children.forEach(child => {
                if (child.box)
                {
                    child.box.visible = false;
                }
            });

            const resizedCanvas = renderer.createCanvas();
            if (resizedCanvas) {
                snapshot.preview = resizedCanvas.toDataURL("image/png");
            }
        }

        //Enable Grid
        if (renderer.data.grid) {
            renderer.data.grid.enabled = oldgrid;
        }
        //Enable Highlights
        if (renderer.graphics.highlights)
        {
            renderer.graphics.highlights.forEach((h) => {h.visible = true;});
        }

        //Enable resize/rotate boxes
        if (renderer.graphics.card) {
            renderer.graphics.card.children.forEach(child => {
                if (child.box)
                {
                    child.box.visible = true;
                }
            });
        }
    }
    return snapshot;
}

function saveCurrentSnapshot()
{
    let snapshot = createSnapshot.call(this, true);
    snapshot.date = new Date();

    let skip = false;
    if (this.state.snapshots.undo.length > 0) {
        let lastsnapshot = this.state.snapshots.undo[this.state.snapshots.undo.length - 1];
        if (lastsnapshot.content === snapshot.content) {
            // Skip if latest snapshot content is the same
            skip = true;
        } else if (lastsnapshot.date && lastsnapshot.date.getTime() > snapshot.date.getTime() - 500) {
            // Avoid creating to much snapshots per seconds
            skip = true;
        }
    }

    if (!skip) {
        if (this.state.snapshots.redo.length > 0) {
            this.state.snapshots.redo = [];
        }
        addSnapshotToHistory.call(this, this.state.snapshots.undo, snapshot);
    }

    if (this.props.onEdit) {
        this.props.onEdit(snapshot);
    }
}

function addSnapshotToHistory(history, snapshot)
{
    // Save 30 snapshots max
    if (history.length === 30) {
        history.shift();
    }
    snapshot.lastuser = this.props.t('common.you')
    history.push(snapshot);
}

export {
    undoTemplate, redoTemplate, loadSnapshot, viewHistory,
    createSnapshot ,saveCurrentSnapshot, addSnapshotToHistory
}