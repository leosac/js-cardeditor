const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test, afterEach } = require('node:test');
const vm = require('node:vm');
const React = require('react');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.getComputedStyle = dom.window.getComputedStyle;
const { render, fireEvent, cleanup } = require('@testing-library/react');

afterEach(cleanup);

const translate = { withTranslation: () => component => component };
const t = key => key;
const noop = () => {};
const ThemeContext = React.createContext('light');

async function load(relativePath, mocks = {}, globals = {}) {
    const filename = path.resolve(__dirname, '..', relativePath);
    const { transformAsync } = await import('@babel/core');
    const { code } = await transformAsync(await readFile(filename, 'utf8'), {
        filename,
        babelrc: false,
        configFile: false,
        presets: [
            ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
            ['@babel/preset-react', { runtime: 'automatic' }]
        ]
    });
    const localRequire = createRequire(filename);
    const module = { exports: {} };
    vm.runInNewContext(code, {
        module,
        exports: module.exports,
        require: name => Object.hasOwn(mocks, name) ? mocks[name] : localRequire(name),
        document,
        console,
        ...globals
    }, { filename });
    return module.exports;
}

async function loadDesigner() {
    const mocks = {
        'react-i18next': translate,
        '@leosac/cardrendering': { CardHelper: { getLayoutSizes: () => [{ value: 'cr80' }] } },
        '../ThemeContext': ThemeContext,
        '../../css/jsCardRendering.css': {},
        './CardSide': () => null,
        './PrintCard': () => null,
        './History': () => null,
        './NavDivider': () => null,
        '@fortawesome/react-fontawesome': { FontAwesomeIcon: () => null }
    };
    for (const name of ['card', 'grid', 'onEvent', 'history', 'print', 'download', 'xml', 'json']) {
        mocks['../edit/' + name] = new Proxy({}, { get: (_, key) => key === '__esModule' ? false : noop });
    }
    return (await load('src\\lib\\components\\CardDesigner.js', mocks)).default;
}

test('light is the default, dark is scoped, and changing themes preserves editor state', async () => {
    const CardDesigner = await loadDesigner();
    const editor = new CardDesigner({ ...CardDesigner.defaultProps, t });
    editor.state.name = 'Keep this template';
    const view = render(editor.render());
    const root = view.container.querySelector('.cardeditor-theme');
    assert.equal(root.dataset.bsTheme, 'light');
    assert.equal(root.querySelectorAll('.navbar.bg-light').length, 2);

    const state = editor.state;
    editor.props = { ...editor.props, theme: 'dark' };
    view.rerender(editor.render());
    assert.equal(root.dataset.bsTheme, 'dark');
    assert.equal(root.querySelectorAll('.navbar.bg-dark').length, 2);
    assert.equal(root.querySelector('input[type="text"]').value, 'Keep this template');
    assert.equal(editor.state, state);
    assert.equal(document.documentElement.hasAttribute('data-bs-theme'), false);
    assert.equal(document.body.hasAttribute('data-bs-theme'), false);

    const lightEditor = new CardDesigner({ ...CardDesigner.defaultProps, t });
    const lightView = render(lightEditor.render());
    assert.equal(lightView.container.firstChild.dataset.bsTheme, 'light');
    assert.equal(root.dataset.bsTheme, 'dark');

    editor.props = { ...editor.props, theme: 'light' };
    view.rerender(editor.render());
    assert.equal(root.dataset.bsTheme, 'light');
});

test('unsupported themes fail explicitly', async () => {
    const CardDesigner = await loadDesigner();
    const editor = new CardDesigner({ ...CardDesigner.defaultProps, t, theme: 'invalid' });
    assert.throws(() => editor.render(), /theme must be "light" or "dark"/);
});

test('portaled dialogs follow theme updates', async () => {
    const DesignerModal = (await load('src\\lib\\components\\DesignerModal.js', {
        'react-i18next': translate,
        '../ThemeContext': ThemeContext,
        jquery: () => ({ draggable: noop })
    })).default;
    const dialog = theme => React.createElement(ThemeContext.Provider, { value: theme },
        React.createElement(DesignerModal, { t, show: true, title: 'Theme test' }));
    const view = render(dialog('dark'));
    const modal = document.body.querySelector('.modal');
    assert.ok(modal);
    assert.equal(view.container.contains(modal), false);
    assert.equal(modal.dataset.bsTheme, 'dark');
    view.rerender(dialog('light'));
    assert.equal(modal.dataset.bsTheme, 'light');
});

test('both context menu branches receive the selected theme', async () => {
    const CardSideMenu = (await load('src\\lib\\components\\CardSideMenu.js', {
        'react-i18next': translate,
        '../ThemeContext': ThemeContext,
        '@fortawesome/react-fontawesome': { FontAwesomeIcon: () => null },
        'react-contexify': {
            Menu: ({ theme, children }) => React.createElement('div', { 'data-menu-theme': theme }, children),
            Item: ({ children }) => React.createElement('div', null, children),
            Separator: () => null,
            useContextMenu: () => ({ show: noop })
        }
    })).default;
    for (const selected of [[], [{ options: {} }]]) {
        const view = render(React.createElement(ThemeContext.Provider, { value: 'dark' },
            React.createElement(CardSideMenu, {
                t,
                editor: { state: { snapshots: { undo: [], redo: [] } } },
                cardside: { props: { sideType: 'front' }, renderer: { data: { fields: { selected } } } }
            })));
        assert.equal(view.container.querySelector('[data-menu-theme]').dataset.menuTheme, 'dark');
        view.unmount();
    }
});

test('changing the background preserves card fields', async () => {
    const CardSide = (await load('src\\lib\\components\\CardSide.js', {
        'react-i18next': translate,
        '@leosac/cardrendering': { CardRenderer: class {} },
        '../edit/onEvent': new Proxy({}, { get: () => noop }),
        '../edit/fields': new Proxy({}, { get: () => noop }),
        '../edit/grid': new Proxy({}, { get: () => noop }),
        '../edit/card': new Proxy({}, { get: () => noop }),
        './GridSettings': () => null,
        './FieldProperties': () => null,
        './FieldBorderProperties': () => null,
        './Fields': {},
        './ConditionalRendering': () => null,
        './BackgroundProperties': () => null,
        './AddFieldFromList': () => null,
        './CardSideMenu': () => null,
        'react-contexify/ReactContexify.css': {}
    }, { crypto: require('node:crypto').webcrypto })).default;
    const side = new CardSide({ editor: { sides: {} }, sideType: 'front' });
    const fields = [
        { options: { type: 'label', name: 'name' } },
        { options: { type: 'qrcode', name: 'code' } }
    ];
    const card = {
        children: [{ options: {} }, ...fields, { options: { zIndex: 1000 } }],
        options: { background: { color: '#FFFFFF' } },
        removeChildren() {
            this.children = [];
        },
        addChild(child) {
            this.children.push(child);
        }
    };
    let changed = false;
    side.renderer = {
        graphics: { card },
        drawCardBackground: async () => {
            card.removeChildren();
            card.addChild({ options: { zIndex: 1000 } });
        },
        sortByZIndex: () => {},
        handleOnChange: () => { changed = true; }
    };

    await side.updateBackground({ color: '#123456' });

    assert.deepEqual(card.children.filter(child => child.options.type), fields);
    assert.equal(card.options.background.color, '#123456');
    assert.equal(changed, true);
});

test('image editing receives a dark palette and restores its default light palette', async () => {
    let imageTheme;
    const ImageEditor = (await load('src\\lib\\components\\ImageEditor.js', {
        'react-i18next': translate,
        '../ThemeContext': ThemeContext,
        'react-filerobot-image-editor': {
            __esModule: true,
            default: props => { imageTheme = props.theme; return null; },
            TABS: {}
        }
    })).default;
    const imageEditor = theme => React.createElement(ThemeContext.Provider, { value: theme },
        React.createElement(ImageEditor, { t, image: 'data:image/png;base64,test', onChange: noop }));
    const view = render(imageEditor('dark'));
    fireEvent.click(view.getByText('common.edit'));
    assert.equal(imageTheme.palette['bg-primary'], '#212529');
    assert.equal(imageTheme.palette['txt-primary'], '#dee2e6');
    view.rerender(imageEditor('light'));
    assert.equal(imageTheme, undefined);
});

test('the DOM API accepts both data-theme and explicit theme options', async () => {
    const calls = [];
    const { createCardEditor } = await load('src\\lib\\dom.js', {
        '../pixi-init': {},
        '../i18n': {},
        './index': { CardDesigner: () => null }
    }, { ReactDOM: { render: element => calls.push(element.props) } });
    const container = document.createElement('div');
    createCardEditor(container);
    assert.equal(calls.at(-1).theme, 'light');
    container.dataset.theme = 'dark';
    createCardEditor(container);
    assert.equal(calls.at(-1).theme, 'dark');
    createCardEditor(container, { theme: 'light' });
    assert.equal(calls.at(-1).theme, 'light');
});
