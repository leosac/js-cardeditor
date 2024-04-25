/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import $ from "jquery";
import React from "react";
import { withTranslation } from "react-i18next";
import { CardHelper } from "@leosac/cardrendering";
import {
    newCard, editCustomSize
} from '../edit/card';
import { toggleGrid } from '../edit/grid';
import {
    onCardKeyDown, onCardKeyUp, onCardPaste
} from '../edit/onEvent';
import {
    loadSnapshot, saveCurrentSnapshot, undoTemplate, redoTemplate, viewHistory
} from '../edit/history';
import {
    printCardConfirm, printCard, printTemplate, getAllNamedFields
} from '../edit/print';
import {
    downloadTemplate, downloadImage
} from '../edit/download';
import {
    toDPF, loadDPF
} from '../edit/xml';
import {
    getTemplate, loadTemplate, toJson, fromJson
} from '../edit/json';
import CardSide from "./CardSide";
import PrintCard from "./PrintCard";
import History from "./History";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import NavDivider from "./NavDivider"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class CardDesigner extends React.Component {

    constructor(props) {
        CardDesigner.initProps(props);
        super(props);

        this.downloadTemplate = downloadTemplate.bind(this);
        this.downloadImage = downloadImage.bind(this);
        this.printTemplate = printTemplate.bind(this);
        this.printCard = printCard.bind(this);
        this.printCardConfirm = printCardConfirm.bind(this);
        this.getAllNamedFields = getAllNamedFields.bind(this);
        this.onCardKeyDown = onCardKeyDown.bind(this);
        this.onCardKeyUp = onCardKeyUp.bind(this);
        this.onCardPaste = onCardPaste.bind(this);
        this.toggleGrid = toggleGrid.bind(this);
        this.newCard = newCard.bind(this);
        this.editCustomSize = editCustomSize.bind(this);
        this.loadSnapshot = loadSnapshot.bind(this);
        this.saveCurrentSnapshot = saveCurrentSnapshot.bind(this);
        this.undoTemplate = undoTemplate.bind(this);
        this.redoTemplate = redoTemplate.bind(this);
        this.viewHistory = viewHistory.bind(this);
        this.toDPF = toDPF.bind(this);
        this.loadDPF = loadDPF.bind(this);
        this.getTemplate = getTemplate.bind(this);
        this.loadTemplate = loadTemplate.bind(this);
        this.toJson = toJson.bind(this);
        this.fromJson = fromJson.bind(this);

        this.sides = {
            front: undefined,
            back: undefined
        };
           
        this.state = {
            grid: {
                enabled: false,
                columns: 8,
                rows: 6,
                step: 1,
                unit: 'px',
                ruler: true,
                scale: 1
            },
            snapshots: {
                undo: [],
                redo: [],
                history: []
            },
            alerts: [],

            hasBack: false,
            cardwidth: 0,
            cardheight: 0,
            cardborder: 3,
            layout: {
                size: CardHelper.getLayoutSizes(this.props.enabledCardSizes)[0].value,
                orientation: 'landscape'
            }
        }
    }

    static initProps(props) {
        //Check if "onEdit" option is a function
        if (props.onEdit && typeof props.onEdit !== "function")
        {
            console.error('JsCardRendering : onEdit option is not a function, option removed.');
            delete props.onEdit;
        }

        //Check if "onSubmit" option is a function
        if (props.onSubmit && typeof props.onSubmit !== "function")
        {
            console.error('JsCardRendering : onSubmit option is not a function, option removed.');
            delete props.onSubmit;
        }

        //Check if "onLoaded" option is a function
        if (props.onLoaded && typeof props.onLoaded !== "function")
        {
            console.error('JsCardRendering : onLoaded option is not a function, option removed.');
            delete props.onLoaded;
        }

        if (!props.formatVersion) {
            props.formatVersion = "3.0.0.0";
        }

        if (props.enableName === undefined) {
            props.enableName = true;
        }

        if (props.enableLoad === undefined) {
            props.enableLoad = true;
        }
    }

    getSides(all = false) {
        const sides = [ 'front' ];
        if ((all && this.props.allowBackSide) || this.state.hasBack) {
            sides.push('back');
        }
        return sides;
    }

    //This function check if used version is the required version
    checkFormatVersion(current, required, requireExact = false) {
        let x=current.split('.').map(e=> parseInt(e));
        let y=required.split('.').map(e=> parseInt(e));
        let z = "";

        for(let i=0;i<x.length;i++) {
            if(x[i] === y[i]) {
                z+="e";
            } else
            if(x[i] > y[i]) {
                z+="m";
            } else {
                z+="l";
            }
        }
        if (!z.match(/[l|m]/g)) {
            return 1;
        } else if (z.split('e').join('')[0] === "m") {
            if (!requireExact)
                return (1);
            else
                return (0)
        } else {
            return 0;
        }
    }

    showAlert(type, title, text) {
        this.state.alerts.push({
            type: type,
            title: title,
            text: text,
            show: true
        });
        this.setState({
            alerts: this.state.alerts
        });
    }

    changeFactory(factorytype, sideType) {
        this.sides[sideType].data.fields.factorytype = factorytype;
    }

    alignSelectedField(align, sideType) {
        this.sides[sideType].features.fields.alignSelectedField(align);
    }

    showCustomSize() {
        if (this.state.layout.size === "custom")
            return (true);
        return (false);
    }

    getCustomSize(axe) {
        if (axe === "x")
            return (this.state.cardwidth);
        else
            return (this.state.cardheight);
    }

    showMessageInvalidFormatVersion(current) {
        if (!current || current !== "0.0.0.0")
            return (false);
        else
            return (true);
    }
    
    addDraggableField(target, side) {
        const field = $(target).closest(".draggableField");
        this.addFieldBtn(field, side);
    }

    addFieldBtn(target, sideType)
    {
        let field = this.sides[sideType].features.fields.createField({
            type: 'label',
            name: target.attr("data-name"),
            useMacros: false,
            value: target.attr("data-defaultValue") ? target.attr("data-defaultValue") : target.attr("data-name"),
            color: 0x000000,
            colorFill: -1,
            fontFamily: 'Verdana',
            fontSize: '12pt',
            fontStyle: 'Normal',
            align: 'TopLeft',
            scaleFont: false,
            autoSize: true,
            wordBreak: false,
            maxLength: 0,
            border: {
                width: 0,
                color: 0x000000,
            },
            width: 46,
            height: 18,
            x: $("#carddesign_" + sideType).width() / 2,
            y: $("#carddesign_" + sideType).height() / 2,
            zIndex: 0,
            rotation: 0,
        });
        field.droppableId = target.attr("data-id");
        target.hide();
        this.addFieldToCard(field, sideType);
        this.saveCurrentSnapshot();
    }

    loadFile(ev) {
        const file = ev.files[0];
        //Prevent error when a template is loaded, selecting 'load from...' and 'cancel' during selection
        if (!file)
            return;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (file.name && file.name.split('.').pop() === "dpf") {
                const xmldoc = $.parseXML(e.target.result);
                let $xml = $(xmldoc);
                this.loadDPF($xml);
            } else {
                this.fromJson(e.target.result);
            }
        };
        reader.onerror = (e) => {
            alert("Error reading file.");
        };
        reader.readAsText(file, "UTF-8");
    }

    changeName(name) {
        this.setState({
            name: name
        })
    }

    changeLayoutOrientation(orientation) {
        this.changeLayout({
            orientation: orientation
        });
    }

    changeLayoutSize(size) {
        this.changeLayout({
            size: size
        });
    }

    changeLayout(layout) {
        const newlayout = {
            ...this.state.layout,
            ...layout
        };
        this.setState({
            layout: newlayout
        });
        this.updateRenderersLayout(newlayout);
    }

    changeHasBack(hasBack) {
        this.setState({ hasBack: hasBack });
        this.updateRenderersLayout();
    }

    updateRenderersLayout(layout = undefined) {
        if (!layout) {
            layout = this.state.layout;
        }
        return Promise.all(this.getSides(true).map(async sideType => {
            const renderer = this.sides[sideType];
            if (renderer) {
                await renderer.createCardStage(layout, undefined, false);
            }
        }));
    }

    enterModal() {
        //Disable keyblinds
        this.getSides().map(async sideType => {
            const renderer = this.sides[sideType];
            renderer.data.preventkeystroke = true;
        });
    }

    leaveModal() {
        //Activate keyblinds
        //Disable keyblinds
        this.getSides().map(async sideType => {
            const renderer = this.sides[sideType];
            renderer.data.preventkeystroke = false;
        });
    }

    animate() {
        let renderers = [];
        this.getSides.call(this, true).forEach(sideType => {
            const renderer = this.sides[sideType];
            if (renderer) {
                renderers.push(renderer);
            }
        });
        this.animateSides(renderers);
    }

    animateSides(renderers) {
        renderers.forEach(renderer => {
            renderer.animate();
        });
    }

    componentDidMount() {
        $(document).on('keydown', (event) =>
        {
            this.getSides.call(this).forEach(sideType => {
                this.onCardKeyDown(event, this.sides[sideType]);
            });
        });
        $(document).on('keyup', (event) =>
        {
            this.getSides.call(this).forEach(sideType => {
                this.onCardKeyUp(event, this.sides[sideType]);
            });
        });
        $(document).on('paste', (event) =>
        {
            this.getSides.call(this).forEach(sideType => {
                this.onCardPaste(event, this.sides[sideType]);
            });
        });

        this.newCard({size: CardHelper.getLayoutSizes(this.props.enabledCardSizes)[0].value}).then(() => {
            this.animate();
            if (this.props.content !== undefined)
            {
                //TODO Make all functions related async
                this.fromJson(this.props.content);
                setTimeout(() => {
                    this.saveCurrentSnapshot();
                }, 2500);
            }
            else
            {
                this.saveCurrentSnapshot();
            }
        
            //On Window Resize
            $(window).on('resize', (e) => {
                this.getSides().forEach((sideType) => {
                    const renderer = this.sides[sideType];
                    const sidetpl = renderer.getTemplate();
                    if (renderer.graphics.stage) {
                        renderer.createCardStage(this.state.layout, sidetpl, true);
                    }
                });
            });

            if (this.props.onLoaded) {
                this.props.onLoaded(this);
            }
        });

        let dropEventFonction = (event, ui, sideType) => {
            const renderer = this.sides[sideType];
            let field = renderer.features.fields.createField({
                type: 'label',
                name: ui.draggable.attr("data-name"),
                useMacros: false,
                value: ui.draggable.attr("data-defaultValue") ? ui.draggable.attr("data-defaultValue") : ui.draggable.attr("data-name"),
                color: 0x000000,
                colorFill: -1,
                fontFamily: 'Verdana',
                fontSize: '12pt',
                fontStyle: 'Normal',
                align: 'TopLeft',
                borderWidth: 0,
                borderColor: 0x000000,
                scaleFont: false,
                autoSize: true,
                wordBreak: false,
                maxLength: 0,
                width: 46,
                height: 18,
                x: event.offsetX,
                y: event.offsetY,
                zIndex: 0,
                rotation: 0,
            });
            field.droppableId = ui.draggable.attr("data-id");
            ui.draggable.hide();

            renderer.features.fields.addFieldToCard(field);
            renderer.handleOnChange();
        };

        $("#carddesign_draggableFields").find(".draggableField").draggable({
            helper: "clone",
            revert: true
        });

        $("#carddesign_front").droppable({
            tolerance: "pointer",
            drop: function(event, ui){
                dropEventFonction(event, ui, "front");
            }
        });
        $("#carddesign_back").droppable({
            tolerance: "pointer",
            drop: function(event, ui){
                dropEventFonction(event, ui, "back");
            }
        });
    }

    render() {
        const { t } = this.props;
        return (
            <div>            
                {this.showMessageInvalidFormatVersion(this.props.formatVersion) &&
                    <div id="invalidFormatVersion" className="alert alert-danger alert-dismissible" role="alert">
                        {t('create.invalidFormatVersion')}
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                }
                <form id="cardDesigner">
                    <div>
                        {this.state.alerts.map((alert, index) => {
                            return (
                                <Alert key={index} show={alert.show} variant={alert.type} onClose={() => alert.show = false} dismissible>
                                    <Alert.Heading>{alert.title}</Alert.Heading>
                                    <p>
                                        {alert.text}
                                    </p>
                                </Alert>
                            )
                        })}
                    </div>
                    {this.props.enableName &&
                        <div className="row ">
                            <OverlayTrigger placement="right" overlay={<Tooltip>{t('create.name_help')}</Tooltip>}>
                                <Form.Group className="col-md-6">
                                    <Form.Label>{t('create.name')}</Form.Label>
                                    <Form.Control type="text" placeholder={t('create.name_default')} value={this.state.name} onChange={e => this.changeName(e.target.value)} />
                                </Form.Group>
                            </OverlayTrigger>
                        </div>
                    }
            
                    <div className="row">
                        <Form.Group className="col-md-6">
                            <Form.Label>{t('create.orientation')}</Form.Label>
                            <Form.Control as="select" value={this.state.layout.orientation} onChange={e => this.changeLayoutOrientation(e.target.value)}>
                                <option value='landscape'>{t('create.orientation_landscape')}</option>
                                <option value='portrait'>{t('create.orientation_portrait')}</option>
                            </Form.Control>
                        </Form.Group>
                        {this.props.allowBackSide &&
                            <Form.Group className="col-md-6">
                                <Form.Check type="checkbox" checked={this.state.hasBack} label={t('properties.front_back')} onChange={e => this.changeHasBack(e.target.checked)} />
                            </Form.Group>
                        }
                    </div>

                    <div className="row">
                        <Form.Group className="col-md-6">
                            <Form.Label>{t('common.ratio')}</Form.Label>
                            <Form.Control as="select" className="form-control field_type_selector" value={this.state.layout.size} onChange={e => this.changeLayoutSize(e.target.value)}>
                                {CardHelper.getLayoutSizes(this.props.enabledCardSizes).map(layout => {
                                    return(
                                        <option key={layout.value} value={layout.value}>
                                            {layout.label}
                                        </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </div>
            
                    {(this.props.enableLoad || this.props.enableDownload || this.props.enablePrint) &&
                        <Navbar bg="light" expand="lg">
                            <Container>
                                <Navbar.Collapse id="wdcbtns">
                                    <Nav className="me-auto">
                                        {this.props.enableLoad &&
                                            <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "fa-file"]} /> {t('create.new')}</span>)}>
                                                {CardHelper.getLayoutSizes(this.props.enabledCardSizes).map(size => {
                                                    return (
                                                        <NavDropdown.Item key={size.value} href={'#new_' + size.value} onClick={() => this.newCard({size: size.value})}>{size.textv}{t(size.text)}</NavDropdown.Item>
                                                    )
                                                })}
                                            </NavDropdown>
                                        }
                                        {this.props.enableLoad &&
                                            <Nav.Link href="#load_file" onClick={() => $('#load_file').trigger('click')} id="load_file_link">
                                                <FontAwesomeIcon icon={["fas", "fa-cloud-upload-alt"]} /> {t('create.loadfile')}
                                                <input type="file" id="load_file" accept=".json,.dpf" onChange={(e) => this.loadFile(e.target)} style={{display: 'none'}} />
                                            </Nav.Link>
                                        }
                                        {this.checkFormatVersion(this.props.formatVersion, "3.0.0.0", false) && this.showCustomSize() &&
                                            <Nav.Link href="#">
                                                {t('properties.width')} <input id="templateSizeX" type="number" min="0" max="500" maxLength="4" value={this.getCustomSize('x')} onChange={e => this.editCustomSize('x', Number(e.target.value))} />
                                                {t('properties.height')} <input id="templateSizeY" type="number" min="0" max="500" maxLength="4" value={this.getCustomSize('y')} onChange={e => this.editCustomSize('y', Number(e.target.value))} />
                                            </Nav.Link>
                                        }
                                        <NavDivider />
                                        {this.props.enableDownload &&
                                            <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "cloud-download-alt"]} /> {t('create.download')}</span>)}>
                                                <NavDropdown.Item href="#download_template" onClick={() => this.downloadTemplate()}>{t('create.download_template')}</NavDropdown.Item>
                                                <NavDropdown.Item href="#download_image" onClick={() => this.downloadImage()}>{t('create.download_image')}</NavDropdown.Item>
                                            </NavDropdown>
                                        }
                                        {this.props.enablePrint &&
                                            <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "fa-print"]} /> {t('create.print')}</span>)}>
                                                <NavDropdown.Item href="#print_template" onClick={() => this.printTemplate()}>{t('create.print_template')}</NavDropdown.Item>
                                                <NavDropdown.Item href="#print_card" onClick={() => this.printCard()}>{t('create.print_card')}</NavDropdown.Item>
                                            </NavDropdown>
                                        }
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                    }

                    <Tabs defaultActiveKey="front">
                        {this.getSides(true).map((sideType, sideIndex) => {
                            return (
                                <Tab key={sideType} eventKey={sideType} title={t('properties.' + sideType)} disabled={(sideIndex > 0 && !this.state.hasBack)}>
                                    <Navbar bg="light" expand="lg">
                                        <Container>
                                            <Navbar.Collapse id={sideType + '_wdcbtns'}>
                                                <Nav className="me-auto">
                                                    <Nav.Link id={sideType + '_factory_cursor'} href="#cursor" onClick={() => this.changeFactory('cursor', sideType)}>
                                                        <FontAwesomeIcon icon={["fas", "fa-mouse-pointer"]} /> {t('create.cursor')}
                                                    </Nav.Link>
                                                    <Nav.Link id={sideType + '_factory_label'} href="#label" onClick={() => this.changeFactory('label', sideType)}>
                                                        <FontAwesomeIcon icon={["fas", "fa-font"]} /> {t('create.label')}
                                                    </Nav.Link>
                                                    <Nav.Link id={sideType + '_factory_rectangle'} href="#rectangle" onClick={() => this.changeFactory('rectangle', sideType)}>
                                                        <div style={{display: 'inline-block', backgroundColor: '#777', width: '1em', height: '1em', verticalAlign: 'middle'}}></div> {t('create.rectangle')}
                                                    </Nav.Link>
                                                    <Nav.Link id={sideType + '_factory_circle'} href="#circle" onClick={() => this.changeFactory('circle', sideType)}>
                                                        <div style={{display: 'inline-block', backgroundColor: '#777', width: '1em', height: '1em', verticalAlign: 'middle', WebkitBorderRadius: '100px', MozBorderRadius: '0.5em', OBorderRadius: '0.5em', borderRadius: '0.5em'}}></div> {t('create.circle')}
                                                    </Nav.Link>
                                                    <Nav.Link id={sideType + '_factory_picture'} href="#picture" onClick={() => this.changeFactory('picture', sideType)}>
                                                        <FontAwesomeIcon icon={["fas", "fa-images"]} /> {t('create.picture')}
                                                    </Nav.Link>
                            
                                                    <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "fa-barcode"]} /> {t('common.codes')}</span>)}>
                                                        <NavDropdown.Item id={sideType + '_factory_barcode'} href="#barcode" onClick={() => this.changeFactory('barcode', sideType)}><FontAwesomeIcon icon={["fas", "fa-barcode"]} /> {t('create.barcode')}</NavDropdown.Item>
                                                        <NavDropdown.Item id={sideType + '_factory_qrcode'} href="#qrcode" onClick={() => this.changeFactory('qrcode', sideType)}><FontAwesomeIcon icon={["fas", "fa-qrcode"]} /> {t('create.qrcode')}</NavDropdown.Item>
                                                        <NavDropdown.Item id={sideType + '_factory_datamatrix'} href="#datamatrix" onClick={() => this.changeFactory('datamatrix', sideType)}><FontAwesomeIcon icon={["fas", "fa-qrcode"]} /> {t('create.datamatrix')}</NavDropdown.Item>
                                                        <NavDropdown.Item id={sideType + '_factory_pdf417'} href="#pdf417" onClick={() => this.changeFactory('pdf417', sideType)}><FontAwesomeIcon icon={["fas", "fa-barcode"]} /> {t('create.pdf417')}</NavDropdown.Item>
                                                    </NavDropdown>
                            
                                                    {this.props.enableUnprintable &&
                                                        <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "fa-plus-circle"]} /> {t('common.unprintable')}</span>)}>
                                                            <NavDropdown.Item id={sideType + '_factory_fingerprint'} href="#fingerprint" onClick={() => this.changeFactory('fingerprint', sideType)}><FontAwesomeIcon icon={["fas", "fa-thumbs-up"]} /> {t('create.fingerprint')}</NavDropdown.Item>
                                                        </NavDropdown>
                                                    }

                                                    <NavDropdown title={t('create.align')}>
                                                        <NavDropdown.Item href="#align_left" onClick={() => this.alignSelectedField('left', sideType)}><FontAwesomeIcon icon={["fas", "fa-align-left"]} /> {t('create.align_left')}</NavDropdown.Item>
                                                        <NavDropdown.Item href="#align_right" onClick={() => this.alignSelectedField('right', sideType)}><FontAwesomeIcon icon={["fas", "fa-align-right"]} /> {t('create.align_right')}</NavDropdown.Item>
                                                        <NavDropdown.Item href="#align_top" onClick={() => this.alignSelectedField('top', sideType)}><FontAwesomeIcon icon={["fas", "fa-arrow-up"]} /> {t('create.align_top')}</NavDropdown.Item>
                                                        <NavDropdown.Item href="#align_bottom" onClick={() => this.alignSelectedField('bottom', sideType)}><FontAwesomeIcon icon={["fas", "fa-arrow-down"]} /> {t('create.align_bottom')}</NavDropdown.Item>
                                                        <NavDropdown.Item href="#align_vertical" onClick={() => this.alignSelectedField('vertical', sideType)}><FontAwesomeIcon icon={["fas", "fa-grip-lines-vertical"]} /> {t('create.align_vertical')}</NavDropdown.Item>
                                                        <NavDropdown.Item href="#align_horizontal" onClick={() => this.alignSelectedField('horizontal', sideType)}><FontAwesomeIcon icon={["fas", "fa-grip-lines"]} /> {t('create.align_horizontal')}</NavDropdown.Item>
                                                        <NavDropdown.Item href="#grid" onClick={() => this.toggleGrid(sideType)}><FontAwesomeIcon icon={["fas", "fa-border-all"]} /> {t('create.grid')}</NavDropdown.Item>
                                                    </NavDropdown>
                                                </Nav>
                                            </Navbar.Collapse>
                                        </Container>
                                    </Navbar>
                        
                                    <div className="row">
                                        <div className="col-md-12 text-center">
                                            <CardSide sideType={sideType} editor={this} fieldlist={this.props.fieldlist} />
                                        </div>
                                    </div>
                                </Tab>
                            )
                        })}
                    </Tabs>
                    
                    {this.props.onSubmit &&
                        <div className="text-right edit-create-button-template">
                            {this.props.create
                                ? <button type="submit" className="btn btn-lg btn-success" onClick={this.props.onSubmit}>{t('common.create')}</button>
                                : <button id="print_submit" type="submit" className="btn btn-lg btn-success" onClick={this.props.onSubmit}>{t('common.validate')}</button>
                            }
                        </div>
                    }

                    {this.props.draggableFields &&
                        <div id="carddesign_draggableFields">
                            <hr />
                            <p className="h5">{t('dragdropfields.title')}</p>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                <span></span>
                                            </th>
                                            <th scope="col">
                                                {t('properties.front')}
                                            </th>
                                            <th scope="col" style={{display: this.state.hasBack ? '' : 'none'}}>
                                                {t('properties.back')}
                                            </th>
                                            <th scope="col">
                                                {t('common.name')}
                                            </th>
                                            <th scope="col">
                                                {t('dragdropfields.default_value')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.props.draggableFields.map((field, index) => {
                                            return (
                                                <tr key={field.name} className="draggableField" data-name={field.name} data-type={field.type} data-defaultValue={field.default_value} data-id={index}>
                                                    <td className="">
                                                        <i className="fas fa-th"></i>
                                                    </td>
                                                    <td className="">
                                                        <i className="fas fa-plus-square draggableFieldAddFront" onClick={e => this.addDraggableField(e.target, 'front')}></i>
                                                    </td>
                                                    <td className="" style={{display: this.state.hasBack ? 'block' : 'none'}}>
                                                        <i className="fas fa-plus-square draggableFieldAddBack" onClick={e => this.addDraggableField(e.target, 'back')}></i>
                                                    </td>
                                                    <td className="">
                                                        {field.name}
                                                    </td>
                                                    <td className="">
                                                        {field.default_value}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    }
                </form>
                {this.state.show_printcard &&
                    <PrintCard show={this.state.show_printcard} editor={this} fields={this.getAllNamedFields()} onClose={() => this.setState({show_printcard: false})} onSubmit={this.printCardConfirm} />                            
                }
                <History show={this.state.show_history} editor={this} snapshots={this.state.snapshots.history} onClose={() => this.setState({show_history: false})} onSubmit={this.loadSnapshot} />
            </div>
        );
    }
}

CardDesigner.defaultProps = {
    formatVersion: '3.0.0.0',
    lang: 'en',
    enabledCardSizes: {
        cr80: true,
        res_4to3: true,
        res_3to2 : true,
        res_8to5: true,
        res_5to3: true,
        res_16to9 : true,
        custom: true
    },
    enableUnprintable: false,
    enableName: true,
    enableLoad: true,
    allowBackSide: false,
    onSubmit: undefined,
    onLoaded: undefined
}

export default withTranslation()(CardDesigner);