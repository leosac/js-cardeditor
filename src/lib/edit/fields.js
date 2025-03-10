/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/

function editInternalField()
{
    if (this.renderer.data.fields.selected.length > 0)
    {
        this.setState({
            show_field: true
        });
        this.renderer.sortByZIndex();
    }
}

function editFieldBorder()
{
    if (this.renderer.data.fields.selected.length > 0)
    {
        this.setState({
            show_fieldborder: true
        });
        this.renderer.sortByZIndex();
    }
}

function editConditionalRenderingField()
{
    if (this.renderer.data.fields.selected.length > 0)
    {
        this.setState({
            show_conditionalrendering: true
        });
    }
}

function editField()
{
    if (this.renderer.data.fields.selected.length > 0)
    {
        let newstate = {};
        newstate['show_field_' + this.renderer.data.fields.selected[0].options.type]  = true;
        this.setState(newstate);
    }
}

function integerFieldProperty(v) {
    if (v === undefined) {
        return undefined;
    }

    return parseInt(v);
}

function floatFieldProperty(v) {
    if (v === undefined) {
        return undefined;
    }

    return parseFloat(v);
}

function addFieldFromList(ev, canvas)
{
    const pos = this.renderer.features.fields.getMousePos(canvas.current, ev);
    this.setState({
        add_x: pos.x - this.renderer.graphics.card.x,
        add_y: pos.y -  this.renderer.graphics.card.y,
        show_addfieldfromlist: true
    });
}

async function addFieldFromListConfirm(f)
{
    const cardRef = this.renderer.graphics.card;
    let printField = this.props.fieldlist.findOne({_id: f.id});
    if (printField)
    {
        let field = await this.renderer.features.fields.createField(
            {type: printField.type},
            {x: this.state.add_x, y: this.state.add_y}
        );
        field.options.name = printField.name;
        if (printField.type === 'label')
        {
            field.options.value = '<<' + printField.name + '>>';
            cardRef.removeChild(field);
            field.options.type = printField.type;
            field = await this.renderer.features.fields.createField(
                field.options,
                {x: field.options.x, y: field.options.y}
            );
            this.renderer.features.fields.addFieldToCard(field);
            this.renderer.handleOnChange();
        }
    }
}

function bringToFront()
{
    if (this.renderer.data.fields.selected.length > 0)
    {
        this.renderer.data.fields.selected.forEach(field => {
            if (field.options.zIndex === undefined) {
                field.options.zIndex = 0;
            }
            field.options.zIndex += 9;
        });
        this.renderer.sortByZIndex();
        this.renderer.handleOnChange();
    }
}

function sendToBack()
{
    if (this.renderer.data.fields.selected.length > 0)
    {
        this.renderer.data.fields.selected.forEach(field => {
            field.options.zIndex = 0;
        });
        this.renderer.sortByZIndex();
        this.renderer.handleOnChange();
    }
}

export {
    editField, editFieldBorder, editInternalField, editConditionalRenderingField, addFieldFromList, addFieldFromListConfirm, integerFieldProperty, floatFieldProperty, bringToFront, sendToBack
}