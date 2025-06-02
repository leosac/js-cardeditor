function getTemplate() {
    const tpl = {
        name: this.state.name,
        layout: this.state.layout,
        sides: {}
    };
    tpl.sides.front = this.sides.front.getTemplate();
    if (this.state.hasBack) {
        tpl.sides.back = this.sides.back.getTemplate();
    }
    return tpl;
}

function loadTemplate(tpl) {
    if (!tpl.layout) {
        tpl.layout = {
            size: 'cr80',
            orientation: 'landscape'
        };
    }
    if (!tpl.sides) {
        tpl.sides = {};
    }

    this.setState({
        name: tpl.name,
        layout: tpl.layout,
        hasBack: (tpl.sides.back !== undefined)
    });

    if (tpl.layout.size === 'custom') {
        this.editCustomSize('x', tpl.layout.width);
        this.editCustomSize('y', tpl.layout.height);
    }
    
    this.sides.front.createCardStage(tpl.layout, tpl.sides.front, false);
    if (this.sides.back) {
        this.sides.back.createCardStage(tpl.layout, tpl.sides.back, false);
    }
}

function toJson() {
    const tpl = getTemplate.call(this);
    return JSON.stringify(tpl, null, 2);
}

function fromJson(json) {
    const tpl = JSON.parse(json);
    loadTemplate.call(this, tpl);
}

async function reloadTemplate() {
    const tpl = getTemplate.call(this);
    loadTemplate.call(this, tpl);
}

export {
    toJson, fromJson, getTemplate, loadTemplate, reloadTemplate
}