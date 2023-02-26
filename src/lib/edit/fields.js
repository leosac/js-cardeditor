/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/

function editInternalField(sideType)
{
    this.state.selectedside = sideType;
    const renderer = this.sides[sideType];
    if (renderer.data.fields.selected.length > 0)
    {
        this.setState({
            show_field: true
        });
        renderer.sortByZIndex.call(this);
    }
}

function editConditionalRenderingField(sideType)
{
    this.state.selectedside = sideType;
    if (this.sides[sideType].data.fields.selected.length > 0)
    {
        this.setState({
            show_conditionalrendering: true
        });
    }
}

function editField(sideType)
{
    this.state.selectedside = sideType;
    if (this.sides[sideType].data.fields.selected.length > 0)
    {
        let newstate = {};
        newstate['show_field_' + this.sides[sideType].data.fields.selected[0].options.type]  = true;
        this.setState(newstate);
    }
}

function addFieldFromList(ev, canvas, sideType)
{
    const renderer = this.sides[sideType];
    const pos = renderer.features.fields.getMousePos(canvas.current, ev);
    this.setState({
        currentside: sideType,
        add_x: pos.x - renderer.graphics.card.x,
        add_y: pos.y -  renderer.graphics.card.y,
        show_addfieldfromlist: true
    });
}

async function addFieldFromListConfirm(f)
{
    const renderer = this.sides[this.state.currentside];
    const cardRef = renderer.graphics.card;
    let printField = this.props.fieldlist.findOne({_id: f.id});
    if (printField)
    {
        let field = await renderer.features.fields.createField(
            {type: printField.type},
            {x: this.state.add_x, y: this.state.add_y}
        );
        field.options.name = printField.name;
        if (printField.type === 'label')
        {
            field.options.value = '<<' + printField.name + '>>';
            cardRef.removeChild(field);
            field.options.type = printField.type;
            field = await renderer.features.fields.createField(
                field.options,
                {x: field.options.x, y: field.options.y}
            );
            renderer.features.fields.addFieldToCard(field);
            renderer.handleOnChange();
        }
    }
}

export {
    editField, editInternalField, editConditionalRenderingField, addFieldFromList, addFieldFromListConfirm
}