/**
 * @copyright Copyright (c) 2023, Leosac SAS - www.leosac.com
 *
 * @license GNU LGPL version 3
 **/
import $ from "jquery";
import { CardHelper, hexColorToSignedNumber, decimalToHexColor, a2hex, hex2a } from "@leosac/cardrendering";

function xml_color(color, transparency)
{
    if (color === undefined || color === null || color === '')
        return 0xffffff;

    return hexColorToSignedNumber(color, transparency);
}

function xml_escape(value)
{
    if (value === undefined)
    {
        return '';
    }

    return value.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function parseConditionalRenderingEntries($xml)
{
    let entries = [];
    $xml.children('ConditionalRenderingEntry').each(function ()
    {
        const $this = $(this);
        entries.push({
            condition: $this.children('Condition').text(),
            targetProperty: $this.children('TargetProperty').text(),
            propertyValue: $this.children('PropertyValue').text()
        });
    });
    return entries;
}

//Used for compatibility between pre format version 4.0.0.0
function getBorderWidth(field)
{
    if (field.children('BorderSize'))
    {
        //Since 4.0.0.0
        return (Number(field.children('BorderSize').text()));
    }
    else if (field.children('HasBorder'))
    {
        //Pre 4.0.0.0
        if (field.children('HasBorder').text() === "true")
            return (1);
        else
            return (0);
    }
}

/*
*   Important Note
*
*   Each Field in XML need to be order by in Alphabetical order
*   WITHOUT THIS, XML parsing in .NET can cause unattended results
*   This format is being used to easily replace old installations, we may want to migrate to a new format
*/
function toDPF()
{
    var currentDate = new Date();
    currentDate = currentDate.toISOString();
    var oid = 0;
    var xml = '<?xml version="1.0" encoding="utf-8"?>\n';
    xml += '<Template xmlns:i="http://www.w3.org/2001/XMLSchema-instance" z:Id="' + ++oid + '" xmlns:d1p1="DataPrinterCore" i:type="d1p1:DataPrinter.Core.Objects.Template" xmlns:z="http://schemas.microsoft.com/2003/10/Serialization/" xmlns="http://schemas.datacontract.org/2004/07/DataPrinter.Core.Objects">\n';
    xml += '<CardSides z:Id="' + ++oid + '" z:Size="2">\n';
    this.getSides.call(this, true).forEach(sideType => {
        const cardRef = this.sides[sideType].graphics.card;
        if (cardRef) {
            //Inverse size regarding orientation
            if (this.state.orientation === "Portrait")
                this.layouts['px'][this.state.currentlayout] = [this.layouts['px'][this.state.currentlayout][0], this.layouts['px'][this.state.currentlayout][1]];

            xml += '<CardSide z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.CardSide">\n';
            if (cardRef.options.background.picture !== '') {
                xml += '<BackgroundImage z:Id="' + ++oid + '">';
                if (cardRef.options.background.picture !== undefined &&
                    cardRef.options.background.picture.length > 0)
                {
                    const bgvalue = a2hex(atob(cardRef.options.background.picture.split(',')[1]));
                    xml += xml_escape(bgvalue);
                }
                xml += '</BackgroundImage>';

                xml += '<BackgroundImageLayout>' + cardRef.options.background.picture_layout
                    + '</BackgroundImageLayout>\n';
            } else {
                // No background image
                xml += '<BackgroundImage i:nil="true" />\n';
                xml += '<BackgroundImageLayout>3</BackgroundImageLayout>\n';
            }
            xml += '<BackgroundImageLocation i:nil="true" />\n';
            xml += '<BackgroundSolid>' + ((cardRef.options.background.color !== null) ? xml_color(cardRef.options.background.color, true) : -1) + '</BackgroundSolid>\n';
            xml += '<ContactChipLocation>0</ContactChipLocation>\n';
            var fields = '';
            var nbfields = 0;
            if (cardRef.children && cardRef.children.length > 0) {
                for (var f = 0; f < cardRef.children.length; ++f) {
                    var child = cardRef.getChildAt(f);
                    if (child.options !== undefined && child.options.type !== undefined) {
                        let value = child.options.value;
                        if (child.options.type === 'picture') {
                            if (value !== undefined && value.length > 0) {
                                value = a2hex(atob(value.split(',')[1]));
                            }
                        }
                        let prop = '';
                        if (child.options.conditionalRenderingEntries) {
                            prop += '<ConditionalRenderingEntries z:Id="' + ++oid + '" z:Size="' + child.options.conditionalRenderingEntries.length + '">\n';
                            for (var c = 0; c < child.options.conditionalRenderingEntries.length; ++c)
                            {
                                prop += '<ConditionalRenderingEntry z:Id="' + ++oid + '">\n';
                                prop += '<Condition z:Id="' + ++oid + '">' + xml_escape(child.options.conditionalRenderingEntries[c].condition) + '</Condition>\n';
                                prop += '<PropertyValue z:Id="' + ++oid + '">' + xml_escape(child.options.conditionalRenderingEntries[c].propertyValue) + '</PropertyValue>\n';
                                prop += '<TargetProperty z:Id="' + ++oid + '">' + xml_escape(child.options.conditionalRenderingEntries[c].targetProperty) + '</TargetProperty>\n';
                                prop += '</ConditionalRenderingEntry>\n';
                            }
                            prop += '</ConditionalRenderingEntries>\n';
                        }
                        prop += '<Height>' + Math.round(child.options.height) + '</Height>\n';

                        // Fix for pre 4.0.0.0 versions
                        if (this.state.formatVersion && CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") === -1)
                            prop += '<Width>' + Math.round(child.options.width) + '</Width>\n';

                        prop += '<IsVisible>true</IsVisible>\n';
                        prop += '<IsWarningDisabled>false</IsWarningDisabled>\n';
                        prop += '<Name z:Id="' + ++oid + '">' + xml_escape(child.options.name) + '</Name>\n';

                        // We do not serialize the property if the rotation angle is not set.
                        if (child.options.rotation !== 0) {
                            prop += '<RotationAngle>' + Math.round(child.options.rotation) + '</RotationAngle>\n';
                        }
                        
                        prop += '<UseMacros>' + child.options.useMacros + '</UseMacros>\n';
                        if (value !== undefined) {
                            prop += '<Value z:Id="' + ++oid + '">' + xml_escape(value) + '</Value>\n';
                        } else {
                            prop += '<Value z:Id="' + ++oid + '" i:nil="true" />\n';
                        }

                        // Fix for pre 4.0.0.0 versions
                        if (!this.state.formatVersion || CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") !== -1)
                            prop += '<Width>' + Math.round(child.options.width) + '</Width>\n';

                        prop += '<XPosition>' + Math.round(child.options.x) + '</XPosition>\n';
                        prop += '<YPosition>' + Math.round(child.options.y) + '</YPosition>\n';
                        prop += '<ZIndex>' + Math.round(child.options.zIndex) + '</ZIndex>\n';

                        if (child.options.type === 'label') {
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.TextField">\n';
                            prop += '<Align z:Id="' + ++oid + '">' + CardHelper.export_default(child.options.align, 'TopLeft') + '</Align>\n';
                            prop += '<AutoFontResize>' + child.options.scaleFont + '</AutoFontResize>\n';
                            prop += '<AutoResize>' + child.options.autoSize + '</AutoResize>\n';

                            //Used since format version 4.0.0.0, or without version
                            if (!this.state.formatVersion || CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") !== -1)
                                prop += '<BorderSize>' + child.options.borderWidth + '</BorderSize>\n';

                            prop += '<Color>' + xml_color(child.options.color, true) + '</Color>\n';

                            //Used since format version 4.0.0.0, or without version
                            if (!this.state.formatVersion || CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") !== -1)
                                prop += '<ColorBorder>' + child.options.borderColor + '</ColorBorder>\n';


                            prop += '<ColorFill>' + xml_color(child.options.colorFill, true) + '</ColorFill>\n';
                            prop += '<Font z:Id="' + ++oid + '">' + child.options.fontFamily + ', ' + child.options.fontSize;
                            if (child.options.fontStyle && child.options.fontStyle !== 'Normal')
                            {
                                prop += ', style=' + child.options.fontStyle;
                            }
                            prop += '</Font>\n';

                            //Used for compatibility with format before 4.0.0.0
                            if (this.state.formatVersion && CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") === -1)
                                prop += '<HasBorder>' + (child.options.borderWidth > 0) + '</HasBorder>\n';

                            prop += '<MaxLength>' + child.options.maxLength + '</MaxLength>\n';
                            prop += '<WordBreak>' + child.options.wordBreak + '</WordBreak>\n';
                            fields += prop;
                            fields += '</Field>\n';
                        } else if (child.options.type === 'picture') {
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.PictureField">\n';
                            prop += '<HasBorder>' + (child.options.borderWidth > 0) + '</HasBorder>\n';
                            prop += '<KeepFileReference>false</KeepFileReference>\n';
                            prop += '<SizeMode>4</SizeMode>\n';
                            fields += prop;
                            fields += '</Field>\n';
                        } else if (child.options.type === 'barcode') {
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.BarcodeField">\n';
                            prop += '<Font z:Id="' + ++oid + '">' + child.options.fontFamily + '</Font>\n';
                            prop += '<Size>' + child.options.fontSize + '</Size>\n';
                            fields += prop;
                            fields += '</Field>\n';
                        } else if (child.options.type === 'qrcode') {
                            var eclevels = {L: 0, M: 1, Q: 2, H: 3};
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.QRCodeField">\n';
                            prop += '<ErrorCorrection>' + eclevels[child.options.ecLevel] + '</ErrorCorrection>\n';
                            prop += '<Scale>2</Scale>\n';
                            prop += '<Version>4</Version>\n';
                            fields += prop;
                            fields += '</Field>\n';
                        } else if (child.options.type === 'pdf417') {
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.PDF417Field">\n';
                            prop += '<Color>' + xml_color(child.options.color, true) + '</Color>\n';
                            prop += '<ErrorCorrection>' + child.options.ecLevel + '</ErrorCorrection>\n';
                            fields += prop;
                            fields += '</Field>\n';
                        } else if (child.options.type === 'datamatrix') {
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.DatamatrixField">\n';
                            prop += '<Color>' + xml_color(child.options.color, true) + '</Color>\n';
                            prop += '<Scheme>' + child.options.Scheme + '</Scheme>\n';
                            prop += '<SizeIdx>' + child.options.SizeIdx + '</SizeIdx>\n';
                            fields += prop;
                            fields += '</Field>\n';
                        } else if (child.options.type === 'fingerprint') {
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.Fingerprint">\n';
                            prop += '<AutoRequest>' + child.options.autoRequest + '</AutoRequest>\n';
                            prop += '<Targets>';
                            child.options.targets.forEach((t) => {
                            prop += '<Target>' + t + '</Target>';
                            });
                            prop += '</Targets>';
                            fields += prop;
                            fields += '</Field>\n';
                        } else if (child.options.type === 'rectangle') {
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.RectangleShapeField">\n';
                            prop += '<BorderColor>' + xml_color(child.options.borderColor, true) + '</BorderColor>\n';
                            prop += '<BorderWidth>' + child.options.borderWidth + '</BorderWidth>\n';
                            prop += '<Color>' + xml_color(child.options.color, true) + '</Color>\n';
                            fields += prop;
                            fields += '</Field>\n';
                        } else if (child.options.type === 'circle') {
                            fields += '<Field z:Id="' + ++oid + '" i:type="d1p1:DataPrinter.Core.Objects.CircleShapeField">\n';
                            prop += '<BorderColor>' + xml_color(child.options.borderColor, true) + '</BorderColor>\n';
                            prop += '<BorderWidth>' + child.options.borderWidth + '</BorderWidth>\n';
                            prop += '<Color>' + xml_color(child.options.color, true) + '</Color>\n';
                            fields += prop;
                            fields += '</Field>\n';
                        }
                        nbfields++;
                    }
                }
            }
            xml += '<Fields z:Id="' + ++oid + '" z:Size="' + nbfields + '">\n';
            xml += fields;
            xml += '</Fields>\n';
            //Used since format version 4.0.0.0, or without version
            if (this.state.formatVersion && CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") !== -1)
                xml += '<HeightPx>' + this.layouts['px'][this.state.currentlayout][1] + '</HeightPx>\n';
            xml += '<MagneticStripeLocation>0</MagneticStripeLocation>\n';
            xml += '<ShouldBePrinted>true</ShouldBePrinted>\n';
            //Used since format version 4.0.0.0, or without version
            if (this.state.formatVersion && CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") !== -1)
                xml += '<WidthPx>' + this.layouts['px'][this.state.currentlayout][0] + '</WidthPx>\n';
            xml += '</CardSide>\n';
        }
    });
    xml += '</CardSides>\n';
    xml += '<Category i:nil="true" />\n';
    if (this.state.creationDate) {
        if (typeof this.state.creationDate === 'object')
            xml += '<CreationDate>' + this.state.creationDate.toISOString() + '</CreationDate>\n';
        else
            xml += '<CreationDate>' + this.state.creationDate + '</CreationDate>\n';
    }
    else
        xml += '<CreationDate>' + currentDate + '</CreationDate>\n';
    xml += '<EditPassword i:nil="true" />\n';
    xml += '<FieldsRepository i:nil="true" />\n';
    if (this.state.isRectoVerso) {
        xml += '<HasVerso>true</HasVerso>\n';
    } else {
        xml += '<HasVerso>false</HasVerso>\n';
    }
    if (this.state.lastEdit) {
        if (typeof this.state.lastEdit === 'object')
            xml += '<ModifiedDate>' + this.state.lastEdit.toISOString() + '</ModifiedDate>\n';
        else
            xml += '<ModifiedDate>' + this.state.lastEdit + '</ModifiedDate>\n';
    }
    else
        xml += '<ModifiedDate>' + currentDate + '</ModifiedDate>\n';
    xml += '<Name z:Id="' + ++oid + '">' + xml_escape($('#configuration_name').val()) + '</Name>\n';
    xml += '<Orientation z:Id="' + ++oid + '">' + this.state.orientation + '</Orientation>\n';

    //Used since format version 4.0.0.0, or without version
    if (this.state.preview && (!this.state.formatVersion || CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") !== -1))
        xml += '<Preview>' + this.state.preview.replace('data:image/png;base64,','') + '</Preview>\n';
    xml += '</Template>';
    return xml;
}

function linkXMLIdRef($template)
{
    /*
    *   This part link "z:Ref" and "z:Id" attributes in XML
    *   XML Module don't make the link, so without it some values are undefined
    *   It's important for compatibility with .NET based programs, who may use Id/Ref system during serialization
    */
    let fontSideFields = $template.children('CardSides').children('CardSide').first().children("fields").children();
    let backSideFields = $template.children('CardSides').children('CardSide').last().children("fields").children();
    let mapFields = {};
    for (let sideToGet = 0; sideToGet <= 1; sideToGet++) {
        let side = sideToGet === 0 ? fontSideFields : backSideFields;
        for (let i = 0; side[i]; i++) {
            let val = $(side[i]);
            $.each(val, function(){
                if ($(this).children("value").attr("z:Id"))
                    mapFields[$(this).children("value").attr("z:Id")] = $(side[i]).children("value").text();
            })
        }
    }
    for (let sideToGet = 0; sideToGet <= 1; sideToGet++) {
        let side = sideToGet === 0 ? fontSideFields : backSideFields;
        for (let i = 0; side[i]; i++) {
            let val = $(side[i]);
            $.each(val, function(){
                if ($(this).children("value").attr("z:Ref"))
                    $(this).children("value").text(mapFields[$(this).children("value").attr("z:Ref")])
            })
        }
    }
}

async function loadDPF($xml)
{
    let $template = $xml.find('Template');
    this.setState({
        name: $template.children('Name').text(),
        orientation: $template.children('Orientation').text().toLowerCase() 
    })

    linkXMLIdRef($template);
    // If format version support customSize, customSize is enabled and template is from at least version 4.0.0.0
    // Then if layout is cr80 and 445x280/280x445 are not corresponding
    // We change layout from cr80 to custom
    if (CardHelper.checkVersion(this.state.formatVersion, "4.0.0.0") !== -1 && $template.find('CardSide').first().children("widthpx") && 
        $template.find('CardSide').first().children("widthpx")[0] &&
        $template.find('CardSide').first().children("widthpx")[0].textContent !== undefined)
    {
        if ((this.state.layout === "cr80" || this.state.layout === "custom") &&
            (($template.find('Orientation') === 'Landscape' && (Number($template.find('CardSide').first().children("widthpx")[0].textContent) !== 445 || 
                                                               Number($template.find('CardSide').first().children("heightpx")[0].textContent) !== 280)) ||
            ($template.find('Orientation') === 'Portrait' && (Number($template.find('CardSide').first().children("widthpx")[0].textContent) !== 280 || 
                                                              Number($template.find('CardSide').first().children("heightpx")[0].textContent) !== 445))))
        {

            //This part is used to inverse (or not) width/height regarding orientation
            let usedWH;
            if ($template.find('Orientation') === 'Landscape')
                usedWH = [$template.find('CardSide').first().children("widthpx")[0].textContent, $template.find('CardSide').first().children("heightpx")[0].textContent];
            else
                usedWH = [$template.find('CardSide').first().children("heightpx")[0].textContent, $template.find('CardSide').first().children("widthpx")[0].textContent];

            this.setState({layout: "custom"});
        
            this.layouts['px']['custom'][0] = Number(usedWH[0]);
            this.layouts['mm']['custom'][0] = Number(Number(usedWH[0] / 5,2).toFixed(4));
            this.layouts['in']['custom'][0] = Number(Number(Number(usedWH[0] / 5,2) / 25,4).toFixed(4));

            this.layouts['px']['custom'][1] = Number(usedWH[1]);
            this.layouts['mm']['custom'][1] = Number(Number(usedWH[1] / 5,2).toFixed(4));
            this.layouts['in']['custom'][1] = Number(Number(Number(usedWH[1] / 5,2) / 25,4).toFixed(4));
        }
    }

    // For now, force recto side
    const recto = $template.children('CardSides').children('CardSide').first();
    await this.sides['recto'].createCardStage(this.state.layout, this.state.orientation, getCardSideTemplate(recto), false);

    let verso;
    if ($template.children('HasVerso').text() === 'true') {
        this.setState({ isRectoVerso: true });
        verso = $template.children('CardSides').children('CardSide').last();
    }
    await this.sides['verso'].createCardStage(this.state.layout, this.state.orientation, getCardSideTemplate(verso), false);
}

function getCardSideTemplate($xside) {
    const tpl = {
        background: {
            color: 0xFFFFFF
        },
        fields: []
    };

    if ($xside !== undefined) {
        tpl.background.color = decimalToHexColor($xside.children('BackgroundSolid').text());
        const bg_picture = $xside.children('BackgroundImage').text();
        if (bg_picture !== undefined && bg_picture !== '' && bg_picture.trim() !== '') {
            tpl.background.picture = 'data:image/png;base64,' + btoa(hex2a(bg_picture));
        }
        tpl.background.picture_layout = Number.parseInt($xside.children('BackgroundImageLayout').text());

        $xside.children('Fields').children('Field').map(function() {
            const $this = $(this);
            const ftype = $this.attr('i:type').split(':')[1];
            let field = null;

            const font = $this.children('Font').text().split(',');
            let fontStyle;
            if (font.length > 2) {
                var fontext = font[2].split('=');
                if (fontext.length === 2 && fontext[0].trim() === 'style') {
                    fontStyle = fontext[1].trim();
                }
            }
            if (ftype === 'DataPrinter.Core.Objects.TextField') {
                const colorFill = $this.children('ColorFill').text();
                field = {
                    type: 'label',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    value: $this.children('Value').text(),
                    color: decimalToHexColor($this.children('Color').text()),
                    fontFamily: font[0].trim(),
                    fontSize: font[1].trim(),
                    fontStyle: fontStyle,
                    colorFill: (colorFill !== '' && colorFill !== '16777215') ? decimalToHexColor($this.children('ColorFill').text()) : -1,
                    borderWidth: getBorderWidth($this),
                    borderColor: $this.children('ColorBorder') ? $this.children('ColorBorder').text() : 0x000000,
                    scaleFont: ($this.children('AutoFontResize').text() === 'true'),
                    autoSize: ($this.children('AutoResize').text() === 'true'),
                    align: $this.children('Align').text(),
                    wordBreak: ($this.children('WordBreak').text() === 'true'),
                    maxLength: Number(($this.children('MaxLength')).text()),
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.URLLinkField') {
                const colorFill = $this.children('ColorFill').text();
                field = {
                    type: 'urllink',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    value: $this.children('Value').text(),
                    color: decimalToHexColor($this.children('Color').text()),
                    fontFamily: font[0].trim(),
                    fontSize: font[1].trim(),
                    fontStyle: fontStyle,
                    colorFill: (colorFill !== '' && colorFill !== '16777215') ? decimalToHexColor($this.children('ColorFill').text()) : -1,
                    borderWidth: getBorderWidth($this),
                    borderColor: 0x000000,
                    scaleFont: ($this.children('AutoFontResize').text() === 'true'),
                    autoSize: ($this.children('AutoResize').text() === 'true'),
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.BarcodeField') {
                field = {
                    type: 'barcode',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    value: $this.children('Value').text(),
                    fontFamily: font[0].trim(),
                    fontSize: Number($this.children('Size').text()),
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.QRCodeField') {
                const eclevels = ['L', 'M', 'Q', 'H'];
                field = {
                    type: 'qrcode',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    value: $this.children('Value').text(),
                    ecLevel: eclevels[Number($this.children('ErrorCorrection').text())],
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.Pdf417Field') {
                const colorFill = $this.children('ColorFill').text();
                field = {
                    type: 'pdf417',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    value: $this.children('Value').text(),
                    ecLevel: Number($this.children('ErrorCorrection').text()),
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    color: decimalToHexColor($this.children('ForeColor').text()),
                    colorFill: (colorFill !== '' && colorFill !== '16777215') ? decimalToHexColor($this.children('ColorFill').text()) : -1,
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.DatamatrixField') {
                const colorFill = $this.children('ColorFill').text();
                field = {
                    type: 'datamatrix',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    value: $this.children('Value').text(),
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    scheme: Number($this.children('Scheme').text()),
                    sizeIdx: Number($this.children('SizeIdx').text()),
                    color: decimalToHexColor($this.children('ForeColor').text()),
                    colorFill: (colorFill !== '' && colorFill !== '16777215') ? decimalToHexColor($this.children('ColorFill').text()) : -1,
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.Fingerprint') {
                const targets = [];
                const obj = $this.children('Targets');
                obj.children('Target').each((idx) => {
                    targets.push(obj.children('Target')[idx].textContent);
                });
                field = {
                    type: 'fingerprint',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    autoRequest: ($this.children('AutoRequest').text() === 'true'),
                    targets: targets,
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.PictureField') {
                let data = $this.children('Value').text();
                if (data !== undefined && data !== '' && data.trim() !== '') {
                    data = 'data:image/png;base64,' + btoa(hex2a(data));
                } else {
                    data = this.blankimg;
                }
                field = {
                    type: 'picture',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    value: data,
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    borderWidth: getBorderWidth($this),
                    borderColor: $this.children('ColorBorder') ? $this.children('ColorBorder').text() : 0x000000,
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.RectangleShapeField') {
                field = {
                    type: 'rectangle',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    color: decimalToHexColor($this.children('Color').text()),
                    borderWidth: Number($this.children('BorderWidth').text()),
                    borderColor: decimalToHexColor($this.children('BorderColor').text()),
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            } else if (ftype === 'DataPrinter.Core.Objects.CircleShapeField') {
                field = {
                    type: 'circle',
                    name: $this.children('Name').text(),
                    useMacros: ($this.children('UseMacros').text() === 'true'),
                    color: decimalToHexColor($this.children('Color').text()),
                    borderWidth: Number($this.children('BorderWidth').text()),
                    borderColor: decimalToHexColor($this.children('BorderColor').text()),
                    width: Number($this.children('Width').text()),
                    height: Number($this.children('Height').text()),
                    x: Number($this.children('XPosition').text()),
                    y: Number($this.children('YPosition').text()),
                    zIndex: Number($this.children('ZIndex').text()),
                    rotation: Number($this.children('RotationAngle').text()),
                    conditionalRenderingEntries: parseConditionalRenderingEntries($this.children('ConditionalRenderingEntries')),
                };
            }
            
            if (field != null) {
                tpl.fields.push(field);
            }
            return field;
        });
    }

    return tpl;
}

async function reloadTemplate()
{
    const xmldoc = $.parseXML(toDPF.call(this));
    const xmlContent = $(xmldoc);
    await loadDPF.call(this, xmlContent);
}

export {
    toDPF, loadDPF, reloadTemplate, xml_color, xml_escape
}