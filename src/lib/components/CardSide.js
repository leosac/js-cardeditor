/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import React from "react";
import { withTranslation } from "react-i18next";
import { CardRenderer } from "@leosac/cardrendering";
import { onCardClickUp, onCardClickDown, onCardMouseMove, onDragStart, onDragEnd, onDragMove, onSelectedSpriteCreated } from "../edit/onEvent";
import { editField, editFieldBorder, editInternalField, editConditionalRenderingField, addFieldFromList, addFieldFromListConfirm } from '../edit/fields';
import { editGrid, editGridConfirm } from '../edit/grid';
import { editBackground } from '../edit/card';
import GridSettings from "./GridSettings";
import FieldProperties from "./FieldProperties";
import FieldBorderProperties from "./FieldBorderProperties";
import { BarcodeProperties, CircleProperties, DataMatrixProperties, FingerprintProperties, LabelProperties,
    Pdf417Properties, PictureProperties, QrCodeProperties, RectangleProperties} from "./Fields";
import ConditionalRendering from "./ConditionalRendering";
import BackgroundProperties from "./BackgroundProperties";
import AddFieldFromList from "./AddFieldFromList";
import CardSideMenu from "./CardSideMenu";
import 'react-contexify/ReactContexify.css';

class CardSide extends React.Component {

    constructor (props) {
        super(props);
        this.canvasRef = React.createRef();

        this.editBackground = editBackground.bind(this);
        this.editGrid = editGrid.bind(this);
        this.editGridConfirm = editGridConfirm.bind(this);
        this.editConditionalRenderingField = editConditionalRenderingField.bind(this);
        this.editInternalField = editInternalField.bind(this);
        this.editField = editField.bind(this);
        this.editFieldBorder = editFieldBorder.bind(this);
        this.addFieldFromList = addFieldFromList.bind(this);
        this.addFieldFromListConfirm = addFieldFromListConfirm.bind(this);

        this.state = {
            selectedfield: undefined,

            show_field: false,
            show_fieldborder: false,
            show_field_label: false,
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
        };
        this.renderer = new CardRenderer({
            grid: {
                ruler: true
            },
            interaction: true,
            onCardClickDown: onCardClickDown,
            onCardClickUp: onCardClickUp,
            onCardMouseMove: onCardMouseMove,
            onFieldDragStart: (event, renderer, field) => onDragStart(event, this, renderer, field),
            onFieldDragEnd: onDragEnd,
            onFieldDragMove: onDragMove,
            onSelectedSpriteCreated: onSelectedSpriteCreated,
            onFieldAdded: (field) => this.handleOnFieldAdded(this, field),
            onSelectionChanged: (selection) => this.handleSelectionChanged(this, selection),
            onChange: () => this.handleOnChange(this),
            onError: (errorCode) => this.handleOnError(this, errorCode)
        });
        props.editor.sides[props.sideType] = this.renderer;
    }

    componentDidMount() {
        this.renderer.options.canvas = this.canvasRef.current;
    }

    handleSelectionChanged(cardside, selection) {
        cardside.setState({selectedfield: selection.length > 0 ? selection[0].options : null});
    }

    handleOnFieldAdded(cardside, field) {
        cardside.props.editor.changeFactory('cursor', cardside.props.sideType);
    }

    handleOnChange(cardside) {
        cardside.props.editor.saveCurrentSnapshot();
    }

    handleOnError(cardside, errorCode) {
        cardside.props.editor.showAlert.call(cardside.props.editor, "danger", cardside.props.t('alerts.error'), cardside.props.t('alerts.' + errorCode));
    }

    updateSelectedField(options) {
        this.renderer.features.fields.updateField(options);
    }

    updateBackground(background) {
        const options = Object.keys(background);
        options.forEach(key => {
            this.renderer.graphics.card.options.background[key] = background[key];
        });
        this.renderer.drawCardBackground();
        this.renderer.handleOnChange();
    }

    handleContextMenu(event) {
        if (this.showMenu) {
            this.showMenu({
                event: event,
                props: {}
            });
        }
    }

    render() {
        const { editor, sideType } = this.props;
        return (
            <div>
                <canvas ref={this.canvasRef} className="carddesign" id={'carddesign_' + sideType} onContextMenu={(e) => this.handleContextMenu.call(this, e)}></canvas>
                <CardSideMenu editor={editor} renderer={this.renderer} cardside={this} canvas={this.canvasRef} />
                {this.state.selectedfield &&
                    <React.Fragment>
                        <FieldProperties show={this.state.show_field} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        {this.state.selectedfield.border &&
                            <FieldBorderProperties show={this.state.show_fieldborder} editor={editor} border={this.state.selectedfield.border} onClose={() => this.setState({show_fieldborder: false})} onSubmit={(border) => this.updateSelectedField({border: border})} />
                        }
                        <ConditionalRendering show={this.state.show_conditionalrendering} editor={editor} entries={this.state.selectedfield.conditionalRenderingEntries} onClose={() => this.setState({show_conditionalrendering: false})} onSubmit={entries => this.updateSelectedField({conditionalRenderingEntries: entries})} />
                        <LabelProperties show={this.state.show_field_label} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_label: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        <PictureProperties show={this.state.show_field_picture} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_picture: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        <BarcodeProperties show={this.state.show_field_barcode} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_barcode: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        <QrCodeProperties show={this.state.show_field_qrcode} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_qrcode: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        <Pdf417Properties show={this.state.show_field_pdf417} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_pdf417: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        <DataMatrixProperties show={this.state.show_field_datamatrix} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_datamatrix: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        <FingerprintProperties show={this.state.show_field_fingerprint} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_fingerprint: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        <RectangleProperties show={this.state.show_field_rectangle} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_rectangle: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                        <CircleProperties show={this.state.show_field_circle} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_circle: false})} onSubmit={(options) => this.updateSelectedField(options)} />
                    </React.Fragment>
                }
                {this.renderer.graphics.card &&
                    <React.Fragment>
                        <BackgroundProperties show={this.state.show_background} editor={editor} background={this.renderer.graphics.card.options.background} onClose={() => this.setState({show_background: false})} onSubmit={background => this.updateBackground(background)} />
                        <GridSettings show={this.state.show_gridsettings} editor={editor} grid={this.renderer.data.grid} onClose={() => this.setState({show_gridsettings: false})} onSubmit={(grid) => this.editGridConfirm(grid)} />
                        <AddFieldFromList show={this.state.show_addfieldfromlist} editor={editor} fieldlist={this.props.fieldlist} onClose={() => this.setState({show_addfieldfromlist: false})} onSubmit={(field) => this.addFieldFromListConfirm(field)} />
                    </React.Fragment>
                }
            </div>
        );
    }
}

export default withTranslation()(CardSide);