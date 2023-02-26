/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import React from "react";
import { withTranslation } from "react-i18next";
import { CardRenderer } from "@leosac/cardrendering";
import { onCardClickUp, onCardClickDown, onDragStart, onDragEnd, onDragMove, onSelectedSpriteCreated } from "../edit/onEvent";
import GridSettings from "./GridSettings";
import FieldProperties from "./FieldProperties";
import { BarcodeProperties, CircleProperties, DataMatrixProperties, FingerprintProperties, LabelProperties,
    Pdf417Properties, PictureProperties, QrCodeProperties, RectangleProperties, UrlLinkProperties} from "./Fields";
import BackgroundProperties from "./BackgroundProperties";
import ConditionalRendering from "./ConditionalRendering";
import CardSideMenu from "./CardSideMenu";
import 'react-contexify/ReactContexify.css';

class CardSide extends React.Component {

    constructor (props) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = {
            selectedfield: undefined
        };
        this.renderer = new CardRenderer({
            grid: {
                ruler: true
            },
            interaction: true,
            onCardClickDown: onCardClickDown,
            onCardClickUp: onCardClickUp,
            onFieldDragStart: onDragStart,
            onFieldDragEnd: onDragEnd,
            onFieldDragMove: onDragMove,
            onSelectedSpriteCreated: onSelectedSpriteCreated,
            onSelectionChange: this.handleSelectionChange,
            onChange: this.handleOnChange,
            onError: this.handleOnError
        });
        props.editor.sides[props.sideType] = this.renderer;
    }

    componentDidMount() {
        this.renderer.options.canvas = this.canvasRef.current;
    }

    handleSelectionChange(selection) {
        this.setState({selectedfield: selection.length > 0 ? selection[0] : undefined})
    }

    handleOnChange() {
        this.props.editor.saveCurrentSnapshot();
    }

    handleOnError(errorCode) {
        this.props.editor.showAlert.call(this.props.editor, "danger", this.props.t('alerts.error'), this.props.t('alerts.' + errorCode));
    }

    updateSelectedField(options) {
        this.renderer.features.fields.updateField(options);
    }

    updateBackground(background) {
        const options = Object.keys(background);
        options.forEach(key =>
        {
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
        const { t, editor, sideType } = this.props;
        return (
            <div>
                <canvas ref={this.canvasRef} className="carddesign" id={'carddesign_' + sideType} onContextMenu={this.handleContextMenu}></canvas>
                <CardSideMenu editor={editor} renderer={this.renderer} sideType={sideType} canvas={this.canvasRef} />
                {this.state.selectedfield &&
                    <div>
                        <FieldProperties show={this.state.show_field} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field: false})} onSubmit={this.updateSelectedField} />
                        <ConditionalRendering show={this.state.show_conditionalrendering} editor={editor} entries={this.state.selectedfield.conditionalRenderingEntries} onClose={() => this.setState({show_conditionalrendering: false})} onSubmit={entries => this.updateSelectedField({conditionalRenderingEntries: entries})} />
                        <LabelProperties show={this.state.show_field_label} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_label: false})} onSubmit={this.updateSelectedField} />
                        <UrlLinkProperties show={this.state.show_field_urllink} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_urllink: false})} onSubmit={this.updateSelectedField} />
                        <PictureProperties show={this.state.show_field_picture} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_picture: false})} onSubmit={this.updateSelectedField} />
                        <BarcodeProperties show={this.state.show_field_barcode} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_barcode: false})} onSubmit={this.updateSelectedField} />
                        <QrCodeProperties show={this.state.show_field_qrcode} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_qrcode: false})} onSubmit={this.updateSelectedField} />
                        <Pdf417Properties show={this.state.show_field_pdf417} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_pdf417: false})} onSubmit={this.updateSelectedField} />
                        <DataMatrixProperties show={this.state.show_field_datamatrix} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_datamatrix: false})} onSubmit={this.updateSelectedField} />
                        <RectangleProperties show={this.state.show_field_rectangle} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_rectangle: false})} onSubmit={this.updateSelectedField} />
                        <CircleProperties show={this.state.show_field_circle} editor={editor} field={this.state.selectedfield} onClose={() => this.setState({show_field_circle: false})} onSubmit={this.updateSelectedField} />
                    </div>
                }
                {this.renderer.graphics.card &&
                    <div>
                        <BackgroundProperties show={this.state.show_background} editor={this} background={this.renderer.graphics.card.options.background} onClose={() => this.setState({show_background: false})} onSubmit={background => this.updateBackground(background)} />
                        <GridSettings show={this.state.show_gridsettings} editor={this} grid={this.renderer.data.grid} onClose={() => this.setState({show_gridsettings: false})} onSubmit={this.editGridConfirm} />
                    </div>
                }
            </div>
        );
    }
}

export default withTranslation()(CardSide);