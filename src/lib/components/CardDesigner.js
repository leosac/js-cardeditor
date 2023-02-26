/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import $ from "jquery";
import React from "react";
import { withTranslation } from "react-i18next";
import { CardHelper } from "@leosac/cardrendering";
import AddFieldFromList from "./AddFieldFromList";
import FormValidator from "../form";
import {
    editField, editInternalField, editConditionalRenderingField, addFieldFromList, addFieldFromListConfirm
} from '../edit/fields';
import {
    editGrid, editGridConfirm, toggleGrid
} from '../edit/grid';
import {
    newCard, editCustomSize, editBackground
} from '../edit/card';
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
    downloadDPF, downloadImage
} from '../edit/download';
import {
    toDPF, loadDPF
} from '../edit/xml';
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
import NavDivider from "./NavDivider"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class CardDesigner extends React.Component {

    constructor(props) {
        super(props);
        this.initProps();

        this.downloadDPF = downloadDPF.bind(this);
        this.downloadImage = downloadImage.bind(this);
        this.printTemplate = printTemplate.bind(this);
        this.printCard = printCard.bind(this);
        this.printCardConfirm = printCardConfirm.bind(this);
        this.getAllNamedFields = getAllNamedFields.bind(this);
        this.onCardKeyDown = onCardKeyDown.bind(this);
        this.onCardKeyUp = onCardKeyUp.bind(this);
        this.onCardPaste = onCardPaste.bind(this);
        this.addFieldFromListConfirm = addFieldFromListConfirm.bind(this);
        this.newCard = newCard.bind(this);
        this.editCustomSize = editCustomSize.bind(this);
        this.editBackground = editBackground.bind(this);
        this.loadSnapshot = loadSnapshot.bind(this);
        this.saveCurrentSnapshot = saveCurrentSnapshot.bind(this);
        this.undoTemplate = undoTemplate.bind(this);
        this.redoTemplate = redoTemplate.bind(this);
        this.viewHistory = viewHistory.bind(this);
        this.editGrid = editGrid.bind(this);
        this.editGridConfirm = editGridConfirm.bind(this);
        this.toggleGrid = toggleGrid.bind(this);
        this.toDPF = toDPF.bind(this);
        this.loadDPF = loadDPF.bind(this);
        this.editConditionalRenderingField = editConditionalRenderingField.bind(this);
        this.editInternalField = editInternalField.bind(this);
        this.editField = editField.bind(this);
        this.addFieldFromList = addFieldFromList.bind(this);

        this.sides = {
            recto: undefined,
            verso: undefined
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
            selectedside: 'recto',
            alerts: [],

            isRectoVerso: false,
            cardwidth: 0,
            cardheight: 0,
            cardborder: 3,
            currentlayout: CardHelper.getLayouts(this.props.enabledCardSizes)[0].value,
            orientation: 'Landscape',
            selectedfield: [],
            clipboardfield: null,
            clipboardfieldSideType: null,
            multiselection: false,
            rotationmode: false,
            preventkeystroke: false,
            
            show_field: false,
            show_field_label: false,
            show_field_urllink: false,
            show_field_picture: false,
            show_field_barcode: false,
            show_field_qrcode: false,
            show_field_pdf417: false,
            show_field_datamatrix: false,
            show_field_rectangle: false,
            show_field_circle: false,
            show_field_fingerprint: false,
            show_conditionalrendering: false,
            show_background: false,
            show_gridsettings: false,
            show_addfieldfromlist: false,

            add_x: 0,
            add_y: 0
        }
    }

    initProps() {
        //Check if "cb_AtEdit" option is a function
        if (this.props.cb_AtEdit && typeof this.props.cb_AtEdit !== "function")
        {
            console.error('JsCardRendering : cb_AtEdit option is not a function, option removed.');
            delete this.props.cb_AtEdit;
        }

        if (!this.props.formatVersion) {
            this.props.formatVersion = "3.0.0.0";
        }
    }

    getSides(all = false) {
        const sides = [ 'recto' ];
        if (all || this.state.isRectoVerso) {
            sides.push('verso');
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

    errorState(fieldName){
        const e = new FormValidator('cardDesigner').getErrorFor(fieldName);
        return e ? 'has-error' : '';
    }
    
    errorMessage(fieldName) {
        return new FormValidator('cardDesigner').getErrorFor(fieldName);
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
    
    versoDisplayStyle() {
        if (this.state.isRectoVerso)
        {
            return "block";
        }
        return "none";
    }
    
    multipleFieldSelected() {
        return (this.state.selectedfield.length > 1);
    }

    showCustomSize() {
        if (this.state.currentlayout === "custom")
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
            borderWidth: 0,
            borderColor: 0x000000,
            scaleFont: false,
            autoSize: true,
            wordBreak: false,
            maxLength: 0,
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
        reader.onload = (e) =>
        {
            const xmldoc = $.parseXML(e.target.result);
            let $xml = $(xmldoc);
            this.loadDPF($xml);
        };
        reader.onerror = (e) =>
        {
            alert("Error reading file.");
        };
        reader.readAsText(file, "UTF-8");
    }

    changeName(name) {
        this.setState({
            name: name
        })
    }

    changeLayout(layout) {
        this.setState({
            currentlayout: layout
        })
    }

    changeIsRectoVerso(isRectoVerso) {
        this.setState({ isRectoVerso: isRectoVerso });
        return Promise.all(this.getSides(true).map(async sideType => {
            const renderer = this.sides[sideType];
            await renderer.createCardStage(this.state.currentlayout, this.state.orientation, undefined, false);
        }));
    }

    changeOrientation(orientation) {
        this.setState({orientation: orientation});
        return Promise.all(this.getSides().map(async sideType => {
            const renderer = this.sides[sideType];
            await renderer.createCardStage(this.state.currentlayout, orientation, undefined, false);
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
            this.onCardKeyDown(event);
        });
        $(document).on('keyup', (event) =>
        {
            this.onCardKeyUp(event);
        });
        $(document).on('paste', (event) =>
        {
            this.onCardPaste(event);
        });

        this.newCard(CardHelper.getLayouts(this.props.enabledCardSizes)[0].value).then(() => {
            const content = this.props.content;
            if (content !== undefined)
            {
                setTimeout(() =>
                {
                    var xmldoc = $.parseXML(content);
                    let $xml = $(xmldoc);
        
                    //TODO Make all functions related async
                    this.loadDPF($xml).then(() => {
                        setTimeout(() => {
                            this.saveCurrentSnapshot();
                        }, 2500);
                    });
                }, 1000);
            }
            else
            {
                this.saveCurrentSnapshot();
            }
            this.animate();
        
            //On Window Resize
            $(window).on('resize', (e) => {
                let xmldoc = $.parseXML(this.toDPF());
                let $xmlContent = $(xmldoc);
                let $templatecopied = $xmlContent.find('Template');
                this.getSides().forEach((sideType, index) => {
                    const renderer = this.sides[sideType];
                    if (renderer.graphics.stage) {
                        renderer.createCardStage(this.state.currentlayout, this.state.orientation,
                            $templatecopied.children('CardSides').children('CardSide').eq(index), true);
                    }
                });
            });
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

        $("#carddesign_recto").droppable({
            tolerance: "pointer",
            drop: function(event, ui){
                dropEventFonction(event, ui, "recto");
            }
        });
        $("#carddesign_verso").droppable({
            tolerance: "pointer",
            drop: function(event, ui){
                dropEventFonction(event, ui, "verso");
            }
        });
    }

    render() {
        const { t } = this.props;
        return (
            <div>
                <span style={{visibility: 'hidden', fontFamily:'C39HrP24DhTt'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily:'C39HrP24DlTt'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily:'C39HrP36DlTt'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily:'C39HrP48DhTt'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily:'Code39'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily:'Code 93'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily:'Code 128'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily:'EanBwrP72Tt'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily:'UPC-A'}}>&nbsp;</span>
                <span style={{visibility: 'hidden', fontFamily: 'Code CodaBar'}}>&nbsp;</span>
            
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
                    <div className="row ">
                        <OverlayTrigger placement="right" overlay={<Tooltip>{t('create.name_help')}</Tooltip>}>
                            <Form.Group className="col-md-6">
                                <Form.Label>{t('create.name')}</Form.Label>
                                <Form.Control type="text" placeholder={t('create.name_default')} value={this.state.name} onChange={e => this.changeName(e.target.value)} />
                            </Form.Group>
                        </OverlayTrigger>
                        <Form.Group className="col-md-6">
                            <Form.Label>{t('create.orientation')}</Form.Label>
                            <Form.Control as="select" value={this.state.orientation} onChange={e => this.changeOrientation(e.target.value)}>
                                <option value='Landscape'>{t('create.orientation_landscape')}</option>
                                <option value='Portrait'>{t('create.orientation_portrait')}</option>
                            </Form.Control>
                        </Form.Group>
                    </div>
            
                    <div className="row">
                        <Form.Group className="col-md-6">
                            <Form.Label>{t('common.ratio')}</Form.Label>
                            <Form.Control as="select" className="form-control field_type_selector" value={this.state.currentlayout} onChange={e => this.changeLayout(e.target.value)}>
                                {CardHelper.getLayouts(this.props.enabledCardSizes).map(layout => {
                                    return(
                                        <option key={layout.value} value={layout.value}>
                                            {layout.textv}
                                            {layout.text &&
                                                t(layout.text)
                                            }
                                        </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="col-md-6">
                            <Form.Check type="checkbox" checked={this.state.isRectoVerso} label={t('properties.recto_verso')} onChange={e => this.changeIsRectoVerso(e.target.checked)} />
                        </Form.Group>
                    </div>
            
                    <Navbar bg="light" expand="lg">
                        <Container>
                            <Navbar.Collapse id="wdcbtns">
                                <Nav className="me-auto">
                                    <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "fa-file"]} /> {t('create.new')}</span>)}>
                                        {CardHelper.getLayouts(this.props.enabledCardSizes).map(layout => {
                                            return (
                                                <NavDropdown.Item key={layout.value} href={'#new_' + layout.value} onClick={() => this.newCard(layout.value)}>{layout.textv}{t(layout.text)}</NavDropdown.Item>
                                            )
                                        })}
                                    </NavDropdown>
                                    <Nav.Link href="#load_file" onClick={() => $('#load_file').trigger('click')} id="load_file_link">
                                        <FontAwesomeIcon icon={["fas", "fa-cloud-upload-alt"]} /> {t('create.loadfile')}
                                        <input type="file" id="load_file" accept=".dpf" onChange={(e) => this.loadFile(e.target)} style={{display: 'none'}} />
                                    </Nav.Link>
                                    {this.checkFormatVersion(this.props.formatVersion, "3.0.0.0", false) && this.showCustomSize() &&
                                        <Nav.Link href="#">
                                            {t('properties.width')} <input id="templateSizeX" type="number" min="0" max="500" maxLength="4" value={this.getCustomSize('x')} onChange={e => this.editCustomSize('x', Number(e.target.value))} />
                                            {t('properties.height')} <input id="templateSizeY" type="number" min="0" max="500" maxLength="4" value={this.getCustomSize('y')} onChange={e => this.editCustomSize('y', Number(e.target.value))} />
                                        </Nav.Link>
                                    }
                                    <NavDivider />
                                    {this.props.enableDownload &&
                                        <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "cloud-download-alt"]} /> {t('create.download')}</span>)}>
                                            <NavDropdown.Item href="#download_dpf" onClick={this.downloadDPF}>{t('create.download_template')}</NavDropdown.Item>
                                            <NavDropdown.Item href="#download_image" onClick={this.downloadImage}>{t('create.download_image')}</NavDropdown.Item>
                                        </NavDropdown>
                                    }
                                    {this.props.enablePrint &&
                                        <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "fa-print"]} /> {t('create.print')}</span>)}>
                                            <NavDropdown.Item href="#print_template" onClick={this.printTemplate}>{t('create.print_template')}</NavDropdown.Item>
                                            <NavDropdown.Item href="#print_card" onClick={this.printCard}>{t('create.print_card')}</NavDropdown.Item>
                                        </NavDropdown>
                                    }
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>

                    {/* We should seperate rendering and designer components & logic, then create the stage at renderer side !!*/}
                    {this.getSides(true).map((sideType, sideIndex) => {
                        return (
                            <div key={sideType} style={{display: (sideIndex === 0 || this.state.isRectoVerso) ? 'block' : 'none'}}>
                                <hr />
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
                                                    <NavDropdown.Item id={sideType + '_factory_datamatrix'} href="#datamatrix" onClick={() => this.changeFactory('dataMatrix', sideType)}><FontAwesomeIcon icon={["fas", "fa-qrcode"]} /> {t('create.datamatrix')}</NavDropdown.Item>
                                                    <NavDropdown.Item id={sideType + '_factory_pdf417'} href="#pdf417" onClick={() => this.changeFactory('pdf417', sideType)}><FontAwesomeIcon icon={["fas", "fa-barcode"]} /> {t('create.pdf417')}</NavDropdown.Item>
                                                </NavDropdown>
                        
                                                {this.props.enableUnprintable &&
                                                    <NavDropdown title={(<span><FontAwesomeIcon icon={["fas", "fa-plus-circle"]} /> {t('common.unprintable')}</span>)}>
                                                        <NavDropdown.Item id={sideType + '_factory_fingerprint'} href="#fingerprint" onClick={() => this.changeFactory('fingerprint', sideType)}><FontAwesomeIcon icon={["fas", "fa-thumbs-up"]} /> {t('create.fingerprint')}</NavDropdown.Item>
                                                        <NavDropdown.Item id={sideType + '_factory_urllink'} href="#urllink" onClick={() => this.changeFactory('urllink', sideType)}><FontAwesomeIcon icon={["fas", "fa-globe-europe"]} /> {t('create.urllink')}</NavDropdown.Item>
                                                    </NavDropdown>
                                                }

                                                <NavDropdown title={t('create.align')}>
                                                    <NavDropdown.Item href="#align_left" onClick={() => this.alignSelectedField('left')}><FontAwesomeIcon icon={["fas", "fa-align-left"]} /> {t('create.align_left')}</NavDropdown.Item>
                                                    <NavDropdown.Item href="#align_right" onClick={() => this.alignSelectedField('right')}><FontAwesomeIcon icon={["fas", "fa-align-right"]} /> {t('create.align_right')}</NavDropdown.Item>
                                                    <NavDropdown.Item href="#align_top" onClick={() => this.alignSelectedField('top')}><FontAwesomeIcon icon={["fas", "fa-arrow-up"]} /> {t('create.align_top')}</NavDropdown.Item>
                                                    <NavDropdown.Item href="#align_bottom" onClick={() => this.alignSelectedField('bottom')}><FontAwesomeIcon icon={["fas", "fa-arrow-down"]} /> {t('create.align_bottom')}</NavDropdown.Item>
                                                    <NavDropdown.Item href="#align_vertical" onClick={() => this.alignSelectedField('vertical')}><FontAwesomeIcon icon={["fas", "fa-grip-lines-vertical"]} /> {t('create.align_vertical')}</NavDropdown.Item>
                                                    <NavDropdown.Item href="#align_horizontal" onClick={() => this.alignSelectedField('horizontal')}><FontAwesomeIcon icon={["fas", "fa-grip-lines"]} /> {t('create.align_horizontal')}</NavDropdown.Item>
                                                    <NavDropdown.Item href="#grid" onClick={() => this.toggleGrid()}><FontAwesomeIcon icon={["fas", "fa-border-all"]} /> {t('create.grid')}</NavDropdown.Item>
                                                </NavDropdown>
                                            </Nav>
                                        </Navbar.Collapse>
                                    </Container>
                                </Navbar>
                    
                                <div className="row">
                                    <div className="col-md-12 text-center">
                                        <CardSide sideType={sideType} editor={this} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    
                    {this.props.enableSubmitBtn &&
                        <div className="text-right edit-create-button-template">
                            {this.props.create
                                ? <button type="submit" className="btn btn-lg btn-success">{t('common.create')}</button>
                                : <button id="print_submit" type="submit" className="btn btn-lg btn-success">{t('common.validate')}</button>
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
                                                {t('properties.recto')}
                                            </th>
                                            <th scope="col" style={{display: this.state.isRectoVerso ? '' : 'none'}}>
                                                {t('properties.verso')}
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
                                                        <i className="fas fa-plus-square draggableFieldAddRecto" onClick={e => this.addDraggableField(e.target, 'recto')}></i>
                                                    </td>
                                                    <td className="" style={{display: this.state.isRectoVerso ? 'block' : 'none'}}>
                                                        <i className="fas fa-plus-square draggableFieldAddVerso" onClick={e => this.addDraggableField(e.target, 'verso')}></i>
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
                <AddFieldFromList show={this.state.show_addfieldfromlist} editor={this} fieldlist={this.props.fieldlist} onClose={() => this.setState({show_addfieldfromlist: false})} onSubmit={this.addFieldFromListConfirm} />
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
    enableSubmitBtn: true,
    cb_AtEdit: undefined
}

export default withTranslation()(CardDesigner);