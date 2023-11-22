import { __decorate } from "tslib";
import { css, html, nothing, LitElement, svg } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { newEditEvent } from '@openscd/open-scd-core';
import '@material/mwc-dialog';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item.js';
import '@material/mwc-textfield';
import { getReference, identity } from '@openscd/oscd-scl';
import { bayGraphic, eqRingPath, equipmentGraphic, movePath, resizePath, symbols, voltageLevelGraphic, } from './icons.js';
import { attributes, connectionStartPoints, elementPath, isBusBar, isEqType, newConnectEvent, newPlaceEvent, newPlaceLabelEvent, newResizeEvent, newRotateEvent, newStartConnectEvent, newStartPlaceEvent, newStartPlaceLabelEvent, newStartResizeEvent, privType, removeNode, removeTerminal, ringedEqTypes, sldNs, svgNs, uuid, xlinkNs, xmlBoolean, } from './util.js';
const parentTags = {
    ConductingEquipment: 'Bay',
    Bay: 'VoltageLevel',
    VoltageLevel: 'Substation',
};
const singleTerminal = new Set([
    'BAT',
    'EFN',
    'FAN',
    'GEN',
    'IFL',
    'MOT',
    'PMP',
    'RRC',
    'SAR',
    'SMC',
    'VTR',
]);
function newEditWizardEvent(element) {
    return new CustomEvent('oscd-edit-wizard-request', {
        bubbles: true,
        composed: true,
        detail: { element },
    });
}
function contains([x1, y1, w1, h1], [x2, y2, w2, h2]) {
    return x1 <= x2 && y1 <= y2 && x1 + w1 >= x2 + w2 && y1 + h1 >= y2 + h2;
}
function overlaps([x1, y1, w1, h1], [x2, y2, w2, h2]) {
    if (x1 >= x2 + w2 || x2 >= x1 + w1)
        return false;
    if (y1 >= y2 + h2 || y2 >= y1 + h1)
        return false;
    return true;
}
function containsRect(element, x0, y0, w0, h0) {
    const { pos: [x, y], dim: [w, h], } = attributes(element);
    return contains([x, y, w, h], [x0, y0, w0, h0]);
}
function overlapsRect(element, x0, y0, w0, h0) {
    const { pos: [x, y], dim: [w, h], } = attributes(element);
    return overlaps([x, y, w, h], [x0, y0, w0, h0]);
}
function cleanPath(path) {
    let i = path.length - 2;
    while (i > 0) {
        const [x, y] = path[i];
        const [nx, ny] = path[i + 1];
        const [px, py] = path[i - 1];
        if ((x === nx && y === ny) ||
            (x === nx && x === px) ||
            (y === ny && y === py))
            path.splice(i, 1);
        i -= 1;
    }
}
function isBay(element) {
    return element.tagName === 'Bay' && !isBusBar(element);
}
function preventDefault(e) {
    e.preventDefault();
}
function copy(element, nsp) {
    const clone = element.cloneNode(true);
    const terminals = new Set(Array.from(element.querySelectorAll('Terminal')));
    const cNodes = new Set(Array.from(element.querySelectorAll('ConnectivityNode')));
    terminals.forEach(terminal => {
        const cNode = element.ownerDocument.querySelector(`ConnectivityNode[pathName="${terminal.getAttribute('connectivityNode')}"]`);
        if (cNode)
            cNodes.add(cNode);
    });
    const foreignCNodes = new Set();
    cNodes.forEach(cNode => {
        const foreignTerminal = Array.from(element.ownerDocument.querySelectorAll(`Terminal[connectivityNode="${cNode.getAttribute('pathName')}"]`)).find(terminal => !terminals.has(terminal));
        if (foreignTerminal ||
            (isBusBar(cNode.closest('Bay')) &&
                cNode.closest(element.tagName) !== element))
            foreignCNodes.add(cNode);
    });
    foreignCNodes.forEach(cNode => {
        var _a, _b, _c;
        if (cNode.closest(element.tagName) === element) {
            if (isBusBar(cNode.closest('Bay')))
                (_b = (_a = clone
                    .querySelector(`ConnectivityNode[pathName="${cNode.getAttribute('pathName')}"]`)) === null || _a === void 0 ? void 0 : _a.closest('Bay')) === null || _b === void 0 ? void 0 : _b.remove();
            else
                (_c = clone
                    .querySelector(`ConnectivityNode[pathName="${cNode.getAttribute('pathName')}"]`)) === null || _c === void 0 ? void 0 : _c.remove();
        }
        terminals.forEach(terminal => {
            var _a;
            if (terminal.getAttribute('connectivityNode') ===
                cNode.getAttribute('pathName'))
                (_a = clone
                    .querySelector(`[*|uuid="${terminal.getAttributeNS(sldNs, 'uuid')}"]`)) === null || _a === void 0 ? void 0 : _a.remove();
        });
    });
    Array.from(clone.querySelectorAll('Terminal')).forEach(terminal => {
        const oldUUID = terminal.getAttributeNS(sldNs, 'uuid');
        if (!oldUUID)
            return;
        const newUUID = uuid();
        Array.from(clone.querySelectorAll(`Vertex[*|uuid="${oldUUID}"`)).forEach(vertex => vertex.setAttributeNS(sldNs, `${nsp}:uuid`, newUUID));
        terminal.setAttributeNS(sldNs, `${nsp}:uuid`, newUUID);
    });
    return clone;
}
function renderMenuFooter(element) {
    const name = element.getAttribute('name');
    let detail = element.getAttribute('desc');
    const type = element.getAttribute('type');
    if (type) {
        if (detail)
            detail = html `${type} &mdash; ${detail}`;
        else
            detail = type;
    }
    let footerGraphic = equipmentGraphic(null);
    if (element.tagName === 'ConductingEquipment')
        footerGraphic = equipmentGraphic(element.getAttribute('type'));
    else if (element.tagName === 'Bay' && isBusBar(element))
        footerGraphic = html `<mwc-icon slot="graphic">horizontal_rule</mwc-icon>`;
    else if (element.tagName === 'Bay')
        footerGraphic = bayGraphic;
    else if (element.tagName === 'VoltageLevel')
        footerGraphic = voltageLevelGraphic;
    return html `<mwc-list-item ?twoline=${detail} graphic="avatar" noninteractive>
    <span>${name}</span>
    ${detail
        ? html `<span
          slot="secondary"
          style="display: inline-block; max-width: 15em; overflow: hidden; text-overflow: ellipsis;"
        >
          ${detail}
        </span>`
        : nothing}
    ${footerGraphic}
  </mwc-list-item>`;
}
let SLDEditor = class SLDEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.editCount = -1;
        this.gridSize = 32;
        this.nsp = 'esld';
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseX2 = 0;
        this.mouseY2 = 0;
        this.coordinatesRef = createRef();
        this.handleKeydown = ({ key }) => {
            if (key === 'Escape')
                this.menu = undefined;
        };
        this.handleClick = (e) => {
            if (this.menu &&
                !e
                    .composedPath()
                    .find(elm => 'id' in elm && elm.id === 'sld-context-menu')) {
                e.stopImmediatePropagation();
                this.menu = undefined;
            }
        };
    }
    positionCoordinates(e) {
        var _a;
        const coordinatesDiv = (_a = this.coordinatesRef) === null || _a === void 0 ? void 0 : _a.value;
        if (coordinatesDiv) {
            coordinatesDiv.style.top = `${e.clientY}px`;
            coordinatesDiv.style.left = `${e.clientX + 16}px`;
        }
    }
    openMenu(element, e) {
        if (!this.placing &&
            !this.resizing &&
            !this.placingLabel &&
            !this.connecting)
            this.menu = { element, left: e.clientX, top: e.clientY };
        e.preventDefault();
    }
    svgCoordinates(clientX, clientY) {
        const p = new DOMPoint(clientX, clientY);
        const { x, y } = p.matrixTransform(this.sld.getScreenCTM().inverse());
        return [x, y].map(coord => Math.max(0, coord));
    }
    canPlaceAt(element, x, y, w, h) {
        if (element.tagName === 'Substation')
            return true;
        const overlappingSibling = Array.from(this.substation.querySelectorAll(element.tagName)).find(sibling => sibling !== element &&
            overlapsRect(sibling, x, y, w, h) &&
            !isBusBar(sibling));
        if (overlappingSibling && !isBusBar(element)) {
            return false;
        }
        const containingParent = element.tagName === 'VoltageLevel'
            ? containsRect(this.substation, x, y, w, h)
            : Array.from(this.substation.querySelectorAll(parentTags[element.tagName])).find(parent => !isBusBar(parent) && containsRect(parent, x, y, w, h));
        if (containingParent)
            return true;
        return false;
    }
    canResizeTo(element, w, h) {
        const { pos: [x, y], dim: [oldW, oldH], } = attributes(element);
        if (!this.canPlaceAt(element, x, y, w, h) &&
            this.canPlaceAt(element, x, y, oldW, oldH))
            return false;
        const lostChild = Array.from(element.children).find(child => {
            if (parentTags[child.tagName] !== element.tagName)
                return false;
            const { pos: [cx, cy], dim: [cw, ch], } = attributes(child);
            return !contains([x, y, w, h], [cx, cy, cw, ch]);
        });
        if (lostChild)
            return false;
        return true;
    }
    renderedLabelPosition(element) {
        let { label: [x, y], } = attributes(element);
        if (this.placing &&
            element.closest(this.placing.tagName) === this.placing) {
            const { pos: [parentX, parentY], } = attributes(this.placing);
            x += this.mouseX - parentX;
            y += this.mouseY - parentY;
        }
        if (this.placingLabel === element) {
            x = this.mouseX2;
            y = this.mouseY2 + 0.5;
        }
        return [x, y];
    }
    renderedPosition(element) {
        let { pos: [x, y], } = attributes(element);
        if (this.placing &&
            element.closest(this.placing.tagName) === this.placing) {
            const { pos: [parentX, parentY], } = attributes(this.placing);
            x += this.mouseX - parentX;
            y += this.mouseY - parentY;
        }
        return [x, y];
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('click', this.handleClick, true);
        window.addEventListener('click', this.positionCoordinates);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('click', this.handleClick);
        window.removeEventListener('click', this.positionCoordinates);
    }
    nearestOpenTerminal(equipment) {
        if (!equipment)
            return undefined;
        const topTerminal = equipment.querySelector('Terminal[name="T1"]');
        const bottomTerminal = equipment.querySelector('Terminal:not([name="T1"])');
        const oneSided = singleTerminal.has(equipment.getAttribute('type'));
        if (topTerminal && bottomTerminal)
            return undefined;
        if (oneSided && (topTerminal || bottomTerminal))
            return undefined;
        if (oneSided)
            return 'top';
        if (topTerminal)
            return 'bottom';
        if (bottomTerminal)
            return 'top';
        const [mX2, mY2] = [this.mouseX2, this.mouseY2].map(n => n % 1);
        const { rot } = attributes(equipment);
        if (rot === 0 && mY2 === 0.5)
            return 'bottom';
        if (rot === 1 && mX2 === 0)
            return 'bottom';
        if (rot === 2 && mY2 === 0)
            return 'bottom';
        if (rot === 3 && mX2 === 0.5)
            return 'bottom';
        return 'top';
    }
    groundTerminal(equipment, name) {
        const bay = equipment.closest('Bay');
        const edits = [];
        let grounded = bay.querySelector(':scope > ConnectivityNode[name="grounded"]');
        let pathName = grounded === null || grounded === void 0 ? void 0 : grounded.getAttribute('pathName');
        if (!pathName) {
            pathName = elementPath(equipment.closest('Bay'), 'grounded');
            grounded = this.doc.createElementNS(this.doc.documentElement.namespaceURI, 'ConnectivityNode');
            grounded.setAttribute('name', 'grounded');
            grounded.setAttribute('pathName', pathName);
            edits.push({
                parent: bay,
                node: grounded,
                reference: getReference(bay, 'ConnectivityNode'),
            });
        }
        const terminal = this.doc.createElementNS(this.doc.documentElement.namespaceURI, 'Terminal');
        terminal.setAttribute('name', name);
        terminal.setAttribute('cNodeName', 'grounded');
        const sName = equipment.closest('Substation').getAttribute('name');
        if (sName)
            terminal.setAttribute('substationName', sName);
        const vlName = equipment.closest('VoltageLevel').getAttribute('name');
        if (vlName)
            terminal.setAttribute('voltageLevelName', vlName);
        const bName = equipment.closest('Bay').getAttribute('name');
        if (bName)
            terminal.setAttribute('bayName', bName);
        terminal.setAttribute('connectivityNode', pathName);
        edits.push({
            parent: equipment,
            node: terminal,
            reference: getReference(equipment, 'Terminal'),
        });
        this.dispatchEvent(newEditEvent(edits));
    }
    flipElement(element) {
        const { flip } = attributes(element);
        this.dispatchEvent(newEditEvent({
            element,
            attributes: {
                [`${this.nsp}:flip`]: {
                    namespaceURI: sldNs,
                    value: flip ? null : 'true',
                },
            },
        }));
    }
    equipmentMenuItems(equipment) {
        const items = [
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Mirror</span>
          <mwc-icon slot="graphic">flip</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.flipElement(equipment),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Rotate</span>
          <mwc-icon slot="graphic">rotate_90_degrees_cw</mwc-icon>
        </mwc-list-item>`,
                handler: () => {
                    this.dispatchEvent(newRotateEvent(equipment));
                },
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Copy</span>
          <mwc-icon slot="graphic">copy_all</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartPlaceEvent(copy(equipment, this.nsp))),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Move</span>
          <svg
            xmlns="${svgNs}"
            height="24"
            width="24"
            slot="graphic"
            viewBox="0 96 960 960"
          >
            ${movePath}
          </svg>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartPlaceEvent(equipment)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Move Label</span>
          <mwc-icon slot="graphic">text_rotation_none</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartPlaceLabelEvent(equipment)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Edit</span>
          <mwc-icon slot="graphic">edit</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newEditWizardEvent(equipment)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Delete</span>
          <mwc-icon slot="graphic">delete</mwc-icon>
        </mwc-list-item>`,
                handler: () => {
                    const edits = [];
                    Array.from(equipment.querySelectorAll('Terminal')).forEach(terminal => edits.push(...removeTerminal(terminal)));
                    edits.push({ node: equipment });
                    this.dispatchEvent(newEditEvent(edits));
                },
            },
        ];
        const { rot } = attributes(equipment);
        const icons = {
            connect: ['north', 'east', 'south', 'west'],
            ground: ['expand_less', 'chevron_right', 'expand_more', 'chevron_left'],
            disconnect: [
                'arrow_drop_up',
                'arrow_right',
                'arrow_drop_down',
                'arrow_left',
            ],
        };
        const texts = {
            connect: [
                'Connect top',
                'Connect right',
                'Connect bottom',
                'Connect left',
            ],
            ground: ['Ground top', 'Ground right', 'Ground bottom', 'Ground left'],
            disconnect: [
                'Detach top',
                'Detach right',
                'Detach bottom',
                'Detach left',
            ],
        };
        const icon = (kind, top) => icons[kind][top ? rot % 4 : (rot + 2) % 4];
        const text = (kind, top) => texts[kind][top ? rot % 4 : (rot + 2) % 4];
        const item = (kind, top) => html `<mwc-list-item graphic="icon">
        <span>${text(kind, top)}</span>
        <mwc-icon slot="graphic">${icon(kind, top)}</mwc-icon>
      </mwc-list-item>`;
        const topTerminal = equipment.querySelector('Terminal[name="T1"]');
        const bottomTerminal = equipment.querySelector('Terminal:not([name="T1"])');
        if (!singleTerminal.has(equipment.getAttribute('type'))) {
            if (bottomTerminal)
                items.unshift({
                    handler: () => this.dispatchEvent(newEditEvent(removeTerminal(bottomTerminal))),
                    content: item('disconnect', false),
                });
            else
                items.unshift({
                    handler: () => this.dispatchEvent(newStartConnectEvent({
                        equipment,
                        terminal: 'bottom',
                    })),
                    content: item('connect', false),
                }, {
                    handler: () => this.groundTerminal(equipment, 'T2'),
                    content: item('ground', false),
                });
        }
        if (topTerminal)
            items.unshift({
                handler: () => this.dispatchEvent(newEditEvent(removeTerminal(topTerminal))),
                content: item('disconnect', true),
            });
        else
            items.unshift({
                handler: () => this.dispatchEvent(newStartConnectEvent({ equipment, terminal: 'top' })),
                content: item('connect', true),
            }, {
                handler: () => this.groundTerminal(equipment, 'T1'),
                content: item('ground', true),
            });
        return items;
    }
    busBarMenuItems(busBar) {
        const items = [
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Resize</span>
          <svg
            xmlns="${svgNs}"
            slot="graphic"
            width="24"
            height="24"
            viewBox="0 96 960 960"
          >
            ${resizePath}
          </svg>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartResizeEvent(busBar)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Move</span>
          <svg
            xmlns="${svgNs}"
            height="24"
            width="24"
            slot="graphic"
            viewBox="0 96 960 960"
          >
            ${movePath}
          </svg>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartPlaceEvent(busBar)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Move Label</span>
          <mwc-icon slot="graphic">text_rotation_none</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartPlaceLabelEvent(busBar)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Edit</span>
          <mwc-icon slot="graphic">edit</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newEditWizardEvent(busBar)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Delete</span>
          <mwc-icon slot="graphic">delete</mwc-icon>
        </mwc-list-item>`,
                handler: () => {
                    const node = busBar.querySelector('ConnectivityNode');
                    this.dispatchEvent(newEditEvent([...removeNode(node), { node: busBar }]));
                },
            },
        ];
        return items;
    }
    containerMenuItems(bayOrVL) {
        const items = [
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Resize</span>
          <svg
            xmlns="${svgNs}"
            slot="graphic"
            width="24"
            height="24"
            viewBox="0 96 960 960"
          >
            ${resizePath}
          </svg>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartResizeEvent(bayOrVL)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Copy</span>
          <mwc-icon slot="graphic">copy_all</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartPlaceEvent(copy(bayOrVL, this.nsp))),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Move</span>
          <svg
            xmlns="${svgNs}"
            height="24"
            width="24"
            slot="graphic"
            viewBox="0 96 960 960"
          >
            ${movePath}
          </svg>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartPlaceEvent(bayOrVL)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Move Label</span>
          <mwc-icon slot="graphic">text_rotation_none</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newStartPlaceLabelEvent(bayOrVL)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Edit</span>
          <mwc-icon slot="graphic">edit</mwc-icon>
        </mwc-list-item>`,
                handler: () => this.dispatchEvent(newEditWizardEvent(bayOrVL)),
            },
            {
                content: html `<mwc-list-item graphic="icon">
          <span>Delete</span>
          <mwc-icon slot="graphic">delete</mwc-icon>
        </mwc-list-item>`,
                handler: () => {
                    const edits = [];
                    Array.from(bayOrVL.getElementsByTagName('ConnectivityNode')).forEach(cNode => {
                        if (Array.from(this.doc.querySelectorAll(`Terminal[connectivityNode="${cNode.getAttribute('pathName')}"]`)).find(terminal => terminal.closest(bayOrVL.tagName) !== bayOrVL))
                            edits.push(...removeNode(cNode));
                    });
                    Array.from(bayOrVL.getElementsByTagName('Terminal')).forEach(terminal => {
                        const cNode = this.doc.querySelector(`ConnectivityNode[pathName="${terminal.getAttribute('connectivityNode')}"]`);
                        if (cNode && cNode.closest(bayOrVL.tagName) !== bayOrVL)
                            edits.push(...removeNode(cNode));
                    });
                    edits.push({ node: bayOrVL });
                    this.dispatchEvent(newEditEvent(edits));
                },
            },
        ];
        return items;
    }
    renderMenu() {
        if (!this.menu)
            return html ``;
        const { element } = this.menu;
        let items = [];
        if (element.tagName === 'ConductingEquipment')
            items = this.equipmentMenuItems(element);
        else if (element.tagName === 'Bay' && isBusBar(element))
            items = this.busBarMenuItems(element);
        else if (element.tagName === 'Bay' || element.tagName === 'VoltageLevel')
            items = this.containerMenuItems(element);
        return html `
      <menu
        id="sld-context-menu"
        style="position: fixed; top: ${this.menu.top}px; left: ${this.menu
            .left}px; background: var(--oscd-base3, white); margin: 0px; padding: 0px; box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23); --mdc-list-vertical-padding: 0px; overflow-y: auto;"
        ${ref(async (menu) => {
            if (!(menu instanceof HTMLElement))
                return;
            const nav = this.parentElement.getRootNode().querySelector('nav');
            const navHeight = nav.offsetHeight + 8;
            await this.updateComplete;
            const { bottom, right } = menu.getBoundingClientRect();
            if (bottom > window.innerHeight - navHeight) {
                menu.style.removeProperty('top');
                // eslint-disable-next-line no-param-reassign
                menu.style.bottom = `${navHeight}px`;
                // eslint-disable-next-line no-param-reassign
                menu.style.maxHeight = `calc(100vh - ${navHeight + 68}px)`;
            }
            if (right > window.innerWidth) {
                menu.style.removeProperty('left');
                // eslint-disable-next-line no-param-reassign
                menu.style.right = '0px';
            }
        })}
      >
        <mwc-list
          @selected=${({ detail: { index } }) => {
            var _a;
            (_a = items[index]) === null || _a === void 0 ? void 0 : _a.handler();
            this.menu = undefined;
        }}
        >
          ${items.map(i => i.content)}
          <li divider role="separator"></li>
          ${renderMenuFooter(element)}
        </mwc-list>
      </menu>
    `;
    }
    render() {
        var _a, _b, _c;
        const { dim: [w, h], } = attributes(this.substation);
        const placingTarget = ((_a = this.placing) === null || _a === void 0 ? void 0 : _a.tagName) === 'VoltageLevel'
            ? svg `<rect width="100%" height="100%" fill="url(#grid)" />`
            : nothing;
        const placingLabelTarget = this.placingLabel
            ? svg `<rect width="100%" height="100%" fill="url(#halfgrid)"
      @click=${() => {
                const element = this.placingLabel;
                const [x, y] = this.renderedLabelPosition(element);
                this.dispatchEvent(newPlaceLabelEvent({ element, x, y }));
            }}
      />`
            : nothing;
        let placingElement = svg ``;
        if (this.placing) {
            if (this.placing.tagName === 'VoltageLevel' || isBay(this.placing))
                placingElement = svg `${this.renderContainer(this.placing, true)}`;
            else if (this.placing.tagName === 'ConductingEquipment')
                placingElement = this.renderEquipment(this.placing, { preview: true });
            else if (isBusBar(this.placing))
                placingElement = this.renderBusBar(this.placing);
        }
        let coordinates = html ``;
        let invalid = false;
        let hidden = true;
        if (this.placing) {
            const { dim: [w0, h0], } = attributes(this.placing);
            hidden = false;
            invalid = !this.canPlaceAt(this.placing, this.mouseX, this.mouseY, w0, h0);
            coordinates = html `${this.mouseX},${this.mouseY}`;
        }
        if (this.resizing && !isBusBar(this.resizing)) {
            const { pos: [x, y], } = attributes(this.resizing);
            const newW = Math.max(1, this.mouseX - x + 1);
            const newH = Math.max(1, this.mouseY - y + 1);
            hidden = false;
            invalid = !this.canResizeTo(this.resizing, newW, newH);
            coordinates = html `${newW}&times;${newH}`;
        }
        const coordinateTooltip = html `<div
      ${ref(this.coordinatesRef)}
      class="${classMap({ coordinates: true, invalid, hidden })}"
    >
      (${coordinates})
    </div>`;
        const connectionPreview = [];
        if (((_b = this.connecting) === null || _b === void 0 ? void 0 : _b.equipment.closest('Substation')) === this.substation) {
            const { equipment, path, terminal } = this.connecting;
            let i = 0;
            while (i < path.length - 2) {
                const [x1, y1] = path[i];
                const [x2, y2] = path[i + 1];
                connectionPreview.push(svg `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke-linecap="square" stroke="black" />`);
                i += 1;
            }
            const [[x1, y1], [oldX2, oldY2]] = path.slice(-2);
            const vertical = x1 === oldX2;
            let x3 = this.mouseX + 0.5;
            let y3 = this.mouseY + 0.5;
            let [x4, y4] = [x3, y3];
            const targetEq = Array.from(this.substation.querySelectorAll('ConductingEquipment'))
                .filter(eq => eq !== equipment)
                .find(eq => {
                const { pos: [x, y], } = attributes(eq);
                return x === this.mouseX && y === this.mouseY;
            });
            const toTerminal = this.nearestOpenTerminal(targetEq);
            if (targetEq && toTerminal) {
                const { far, close } = connectionStartPoints(targetEq)[toTerminal];
                [x3, y3] = far;
                [x4, y4] = close;
            }
            const x2 = vertical ? oldX2 : x3;
            const y2 = vertical ? y3 : oldY2;
            connectionPreview.push(svg `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke-linecap="square" stroke="black" />`, svg `<line x1="${x2}" y1="${y2}" x2="${x3}" y2="${y3}"
                stroke-linecap="square" stroke="black" />`, svg `<line x1="${x3}" y1="${y3}" x2="${x4}" y2="${y4}"
                stroke-linecap="square" stroke="black" />`);
            connectionPreview.push(svg `<rect width="100%" height="100%" fill="url(#grid)"
      @click=${() => {
                path[path.length - 1] = [x2, y2];
                path.push([x3, y3]);
                path.push([x4, y4]);
                cleanPath(path);
                this.requestUpdate();
                if (targetEq && toTerminal)
                    this.dispatchEvent(newConnectEvent({
                        equipment,
                        terminal,
                        path,
                        connectTo: targetEq,
                        toTerminal,
                    }));
            }} />`);
        }
        const menu = this.renderMenu();
        return html `<section>
      <h2>
        ${this.substation.getAttribute('name')}
        <mwc-icon-button
          label="Resize Substation"
          @click=${() => this.resizeSubstationUI.show()}
        >
          <svg
            xmlns="${svgNs}"
            width="24"
            height="24"
            viewBox="0 96 960 960"
            opacity="0.83"
          >
            ${resizePath}
          </svg>
        </mwc-icon-button>
      </h2>
      <svg
        xmlns="${svgNs}"
        xmlns:xlink="${xlinkNs}"
        id="sld"
        viewBox="0 0 ${w} ${h}"
        width="${w * this.gridSize}"
        height="${h * this.gridSize}"
        stroke-width="0.06"
        fill="none"
        @mousemove=${(e) => {
            const [x, y] = this.svgCoordinates(e.clientX, e.clientY);
            this.mouseX = Math.floor(x);
            this.mouseY = Math.floor(y);
            this.mouseX2 = Math.floor(x * 2) / 2;
            this.mouseY2 = Math.floor(y * 2) / 2;
            this.positionCoordinates(e);
        }}
      >
        <style>
          .handle {
            visibility: hidden;
          }
          :focus {
            outline: none;
          }
          :focus > .handle,
          :focus-within > .handle {
            opacity: 0.2;
            visibility: visible;
          }
          .handle:hover,
          .handle:focus {
            visibility: visible;
            opacity: 1;
          }
          g.voltagelevel > rect,
          g.bay > rect {
            shape-rendering: crispEdges;
          }
          svg:not(:hover) .preview {
            visibility: hidden;
          }
          .preview {
            opacity: 0.83;
          }
        </style>
        ${symbols}
        <rect width="100%" height="100%" fill="white" />
        ${placingTarget}
        ${Array.from(this.substation.children)
            .filter(child => child.tagName === 'VoltageLevel')
            .map(vl => svg `${this.renderContainer(vl)}`)}
        ${connectionPreview}
        ${((_c = this.connecting) === null || _c === void 0 ? void 0 : _c.equipment.closest('Substation')) === this.substation
            ? Array.from(this.substation.querySelectorAll('ConductingEquipment')).map(eq => this.renderEquipment(eq, { connect: true }))
            : nothing}
        ${Array.from(this.substation.querySelectorAll('ConnectivityNode'))
            .filter(node => node.getAttribute('name') !== 'grounded' &&
            !(this.placing &&
                node.closest(this.placing.tagName) === this.placing) &&
            !isBusBar(node.parentElement))
            .map(cNode => this.renderConnectivityNode(cNode))}
        ${Array.from(this.substation.querySelectorAll('ConnectivityNode'))
            .filter(node => node.getAttribute('name') !== 'grounded' &&
            !(this.placing &&
                node.closest(this.placing.tagName) === this.placing) &&
            isBusBar(node.parentElement))
            .map(cNode => this.renderConnectivityNode(cNode))}
        ${Array.from(this.substation.querySelectorAll('VoltageLevel, Bay, ConductingEquipment'))
            .filter(e => !this.placing || e.closest(this.placing.tagName) !== this.placing)
            .map(element => this.renderLabel(element))}
        ${placingLabelTarget} ${placingElement}
      </svg>
      ${menu} ${coordinateTooltip}
      <mwc-dialog
        id="resizeSubstationUI"
        heading="Resize ${this.substation.getAttribute('name')}"
      >
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <mwc-textfield
            id="substationWidthUI"
            type="number"
            min="1"
            step="1"
            label="Width"
            value="${w}"
            dialogInitialFocus
            autoValidate
            .validityTransform=${(value, validity) => {
            const { dim: [_w, oldH], } = attributes(this.substation);
            if (validity.valid &&
                !this.canResizeTo(this.substation, parseInt(value, 10), oldH)) {
                return { valid: false, rangeUnderflow: true };
            }
            return {};
        }}
          ></mwc-textfield>
          <mwc-textfield
            id="substationHeightUI"
            type="number"
            min="1"
            step="1"
            label="Height"
            value="${h}"
            autoValidate
            .validityTransform=${(value, validity) => {
            const { dim: [oldW, _h], } = attributes(this.substation);
            if (validity.valid &&
                !this.canResizeTo(this.substation, oldW, parseInt(value, 10))) {
                return { valid: false, rangeUnderflow: true };
            }
            return {};
        }}
          ></mwc-textfield>
        </div>
        <mwc-button
          slot="primaryAction"
          @click=${() => {
            const valid = Array.from(this.resizeSubstationUI.querySelectorAll('mwc-textfield')).every(textField => textField.checkValidity());
            if (!valid)
                return;
            const { dim: [oldW, oldH], } = attributes(this.substation);
            const [newW, newH] = [
                this.substationWidthUI,
                this.substationHeightUI,
            ].map(ui => { var _a; return parseInt((_a = ui.value) !== null && _a !== void 0 ? _a : '1', 10).toString(); });
            this.resizeSubstationUI.close();
            if (newW === oldW.toString() && newH === oldH.toString())
                return;
            this.dispatchEvent(newEditEvent({
                element: this.substation,
                attributes: {
                    [`${this.nsp}:w`]: { namespaceURI: sldNs, value: newW },
                    [`${this.nsp}:h`]: { namespaceURI: sldNs, value: newH },
                },
            }));
        }}
          >resize</mwc-button
        >
        <mwc-button dialogAction="close" slot="secondaryAction"
          >cancel</mwc-button
        >
      </mwc-dialog>
    </section>`;
    }
    renderLabel(element) {
        const [x, y] = this.renderedLabelPosition(element);
        const name = element.getAttribute('name');
        const fontSize = element.tagName === 'ConductingEquipment' ? 0.45 : 0.6;
        let events = 'none';
        let handleClick = nothing;
        if (!this.placing &&
            !this.resizing &&
            !this.connecting &&
            !this.placingLabel) {
            events = 'all';
            handleClick = () => this.dispatchEvent(newStartPlaceLabelEvent(element));
        }
        const id = element.closest('Substation') === this.substation
            ? identity(element)
            : nothing;
        return svg `<g class="label" id="label:${id}">
        <text x="${x + 0.1}" y="${y - 0.2}"
          @mousedown=${preventDefault}
          @auxclick=${(e) => {
            if (e.button === 1) {
                // middle mouse button
                this.dispatchEvent(newEditWizardEvent(element));
                e.preventDefault();
            }
        }}
          @click=${handleClick}
          @contextmenu=${(e) => this.openMenu(element, e)}
          pointer-events="${events}" fill="#000000" fill-opacity="0.83"
          style="font: ${fontSize}px sans-serif; cursor: default;">
          ${name}
        </text>
      </g>`;
    }
    renderContainer(bayOrVL, preview = false) {
        var _a, _b, _c;
        const isVL = bayOrVL.tagName === 'VoltageLevel';
        if (this.placing === bayOrVL && !preview)
            return svg ``;
        const [x, y] = this.renderedPosition(bayOrVL);
        let { dim: [w, h], } = attributes(bayOrVL);
        let handleClick;
        let invalid = false;
        if (this.resizing === bayOrVL) {
            w = Math.max(1, this.mouseX - x + 1);
            h = Math.max(1, this.mouseY - y + 1);
            if (this.canResizeTo(bayOrVL, w, h))
                handleClick = () => {
                    this.dispatchEvent(newResizeEvent({
                        w,
                        h,
                        element: bayOrVL,
                    }));
                };
            else
                invalid = true;
        }
        if (this.placing === bayOrVL) {
            let parent;
            if (isVL)
                parent = this.substation;
            else
                parent = Array.from(this.substation.querySelectorAll(':root > Substation > VoltageLevel')).find(vl => containsRect(vl, x, y, w, h));
            if (parent && this.canPlaceAt(bayOrVL, x, y, w, h))
                handleClick = () => {
                    this.dispatchEvent(newPlaceEvent({
                        x,
                        y,
                        element: bayOrVL,
                        parent: parent,
                    }));
                };
            else
                invalid = true;
        }
        let moveHandle = svg ``;
        let resizeHandle = svg ``;
        let placingTarget = svg ``;
        let resizingTarget = svg ``;
        if ((isVL && ((_a = this.placing) === null || _a === void 0 ? void 0 : _a.tagName) === 'Bay') ||
            (!isVL && ((_b = this.placing) === null || _b === void 0 ? void 0 : _b.tagName) === 'ConductingEquipment'))
            placingTarget = svg `<rect x="${x}" y="${y}" width="${w}" height="${h}"
        @click=${handleClick || nothing} fill="url(#grid)" />`;
        if (this.resizing === bayOrVL ||
            (((_c = this.resizing) === null || _c === void 0 ? void 0 : _c.parentElement) === bayOrVL && isBusBar(this.resizing)))
            resizingTarget = svg `<rect x="${x}" y="${y}" width="${w}" height="${h}"
        @click=${handleClick || nothing} fill="url(#grid)" />`;
        if (!this.placing &&
            !this.resizing &&
            !this.connecting &&
            !this.placingLabel) {
            moveHandle = svg `<svg class="handle" xmlns="${svgNs}" height="1" width="1"
          fill="black" opacity="0.83" viewBox="0 96 960 960" 
          @click=${(e) => this.dispatchEvent(newStartPlaceEvent(e.shiftKey ? copy(bayOrVL, this.nsp) : bayOrVL))}
          x="${x}" y="${y}">
        <rect fill="white" x="28.8" y="124.8" width="902.4" height="902.4" />
        ${movePath}
      </svg>`;
            resizeHandle = svg `<svg class="handle" xmlns="${svgNs}" height="1" width="1"
          fill="black" opacity="0.83" viewBox="0 96 960 960" 
          @click=${() => this.dispatchEvent(newStartResizeEvent(bayOrVL))}
          x="${w + x - 1}" y="${h + y - 1}">
        <rect fill="white" x="28.8" y="124.8" width="902.4" height="902.4" />
        ${resizePath}
      </svg>`;
        }
        return svg `<g id="${bayOrVL.closest('Substation') === this.substation
            ? identity(bayOrVL)
            : nothing}" class=${classMap({
            voltagelevel: isVL,
            bay: !isVL,
            preview,
        })} tabindex="0" pointer-events="all" style="outline: none;">
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
        @contextmenu=${(e) => this.openMenu(bayOrVL, e)}
        @click=${handleClick || nothing}
        fill="white" stroke-dasharray="${isVL ? nothing : '0.18'}"
        stroke="${
        // eslint-disable-next-line no-nested-ternary
        invalid ? '#BB1326' : isVL ? '#F5E214' : '#12579B'}" />
      ${moveHandle}
      ${placingTarget}
      ${Array.from(bayOrVL.children)
            .filter(isBay)
            .map(bay => this.renderContainer(bay))}
      ${Array.from(bayOrVL.children)
            .filter(child => child.tagName === 'ConductingEquipment')
            .map(equipment => this.renderEquipment(equipment))}
      ${preview
            ? Array.from(bayOrVL.querySelectorAll('ConnectivityNode'))
                .filter(child => child.getAttribute('name') !== 'grounded')
                .map(cNode => this.renderConnectivityNode(cNode))
            : nothing}
      ${preview
            ? Array.from(bayOrVL.querySelectorAll('Bay, ConductingEquipment'))
                .concat(bayOrVL)
                .map(element => this.renderLabel(element))
            : nothing}
      ${resizeHandle}
      ${resizingTarget}
    </g>`;
    }
    renderEquipment(equipment, { preview = false, connect = false } = {}) {
        var _a;
        if (this.placing === equipment && !preview)
            return svg ``;
        if (((_a = this.connecting) === null || _a === void 0 ? void 0 : _a.equipment.closest('Substation')) === this.substation &&
            !connect)
            return svg ``;
        const [x, y] = this.renderedPosition(equipment);
        const { flip, rot } = attributes(equipment);
        const deg = 90 * rot;
        const eqType = equipment.getAttribute('type');
        const ringed = ringedEqTypes.has(eqType);
        const symbol = isEqType(eqType) ? eqType : 'ConductingEquipment';
        const icon = ringed
            ? svg `<svg
    viewBox="0 0 25 25"
    width="1"
    height="1"
  >
    ${eqRingPath}
  </svg>`
            : svg `<use href="#${symbol}" xlink:href="#${symbol}"
              pointer-events="none" />`;
        let handleClick = (e) => {
            let placing = equipment;
            if (e.shiftKey)
                placing = copy(equipment, this.nsp);
            this.dispatchEvent(newStartPlaceEvent(placing));
        };
        if (this.placing === equipment) {
            const parent = Array.from(this.substation.querySelectorAll(':root > Substation > VoltageLevel > Bay')).find(bay => !isBusBar(bay) && containsRect(bay, x, y, 1, 1));
            if (parent && this.canPlaceAt(equipment, x, y, 1, 1))
                handleClick = () => {
                    this.dispatchEvent(newPlaceEvent({
                        x,
                        y,
                        element: equipment,
                        parent,
                    }));
                };
        }
        const terminals = Array.from(equipment.children).filter(c => c.tagName === 'Terminal');
        const topTerminal = terminals.find(t => t.getAttribute('name') === 'T1');
        const bottomTerminal = terminals.find(t => t.getAttribute('name') !== 'T1');
        const topConnector = topTerminal || this.placing || this.resizing || this.connecting
            ? nothing
            : svg `<circle cx="0.5" cy="0" r="0.2" opacity="0.4"
      fill="#BB1326" stroke="#F5E214"
    @click=${() => this.dispatchEvent(newStartConnectEvent({ equipment, terminal: 'top' }))}
    @contextmenu=${(e) => {
                e.preventDefault();
                this.groundTerminal(equipment, 'T1');
            }}
      />`;
        const topIndicator = !this.connecting ||
            this.connecting.equipment === equipment ||
            (this.connecting &&
                this.mouseX === x &&
                this.mouseY === y &&
                this.nearestOpenTerminal(equipment) === 'top') ||
            topTerminal
            ? nothing
            : svg `<polygon points="0.3,0 0.7,0 0.5,0.4" 
                fill="#12579B" opacity="0.4" />`;
        const topGrounded = (topTerminal === null || topTerminal === void 0 ? void 0 : topTerminal.getAttribute('cNodeName')) === 'grounded'
            ? svg `<line x1="0.5" y1="-0.1" x2="0.5" y2="0" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`
            : nothing;
        const bottomConnector = bottomTerminal ||
            this.placing ||
            this.resizing ||
            this.connecting ||
            singleTerminal.has(eqType)
            ? nothing
            : svg `<circle cx="0.5" cy="1" r="0.2" opacity="0.4"
      fill="#BB1326" stroke="#F5E214"
    @click=${() => this.dispatchEvent(newStartConnectEvent({ equipment, terminal: 'bottom' }))}
    @contextmenu=${(e) => {
                e.preventDefault();
                this.groundTerminal(equipment, 'T2');
            }}
      />`;
        const bottomIndicator = !this.connecting ||
            this.connecting.equipment === equipment ||
            (this.connecting &&
                this.mouseX === x &&
                this.mouseY === y &&
                this.nearestOpenTerminal(equipment) === 'bottom') ||
            bottomTerminal ||
            singleTerminal.has(eqType)
            ? nothing
            : svg `<polygon points="0.3,1 0.7,1 0.5,0.6" 
                fill="#12579B" opacity="0.4" />`;
        const bottomGrounded = (bottomTerminal === null || bottomTerminal === void 0 ? void 0 : bottomTerminal.getAttribute('cNodeName')) === 'grounded'
            ? svg `<line x1="0.5" y1="1.1" x2="0.5" y2="1" stroke="black"
                stroke-width="0.06" marker-start="url(#grounded)" />`
            : nothing;
        return svg `<g class="${classMap({
            equipment: true,
            preview: this.placing === equipment,
        })}"
    id="${equipment.closest('Substation') === this.substation
            ? identity(equipment)
            : nothing}"
    transform="translate(${x} ${y}) rotate(${deg} 0.5 0.5)${flip ? ' scale(-1,1) translate(-1 0)' : ''}">
      <title>${equipment.getAttribute('name')}</title>
      ${icon}
      ${ringed
            ? svg `<use transform="rotate(${-deg} 0.5 0.5)" pointer-events="none"
                  href="#${symbol}" xlink:href="#${symbol}" />`
            : nothing}
      <rect width="1" height="1" fill="none" pointer-events="${connect ? 'none' : 'all'}"
        @mousedown=${preventDefault}
        @click=${handleClick}
        @auxclick=${(e) => {
            if (e.button === 1) {
                // middle mouse button
                this.dispatchEvent(newRotateEvent(equipment));
                e.preventDefault();
            }
        }}
        @contextmenu=${(e) => this.openMenu(equipment, e)}
      />
      ${topConnector}
      ${topIndicator}
      ${topGrounded}
      ${bottomConnector}
      ${bottomIndicator}
      ${bottomGrounded}
    </g>
    <g class="preview">${preview ? this.renderLabel(equipment) : nothing}</g>`;
    }
    renderBusBar(busBar) {
        const [x, y] = this.renderedPosition(busBar);
        const { dim: [w, h], } = attributes(busBar);
        let placingTarget = svg ``;
        placingTarget = svg `<rect x="${x}" y="${y}" width="1" height="1"
          pointer-events="all" fill="none" 
          @click=${() => {
            const parent = Array.from(this.substation.querySelectorAll(':root > Substation > VoltageLevel')).find(vl => containsRect(vl, x, y, w, h));
            if (parent)
                this.dispatchEvent(newPlaceEvent({
                    x,
                    y,
                    element: busBar,
                    parent: parent,
                }));
        }}
        />`;
        return svg `<g class="bus preview" id="${busBar.closest('Substation') === this.substation
            ? identity(busBar)
            : nothing}">
      <title>${busBar.getAttribute('name')}</title>
      ${this.renderLabel(busBar)}
      ${this.renderConnectivityNode(busBar.querySelector('ConnectivityNode'))}
      ${placingTarget}
    </g>`;
    }
    renderConnectivityNode(cNode) {
        const priv = cNode.querySelector(`Private[type="${privType}"]`);
        if (!priv)
            return nothing;
        const circles = [];
        const intersections = Object.entries(Array.from(priv.querySelectorAll('Vertex'))
            .map(v => this.renderedPosition(v))
            .reduce((obj, pos) => {
            const ret = obj;
            const key = JSON.stringify(pos);
            if (ret[key])
                ret[key].count += 1;
            else
                ret[key] = { val: pos, count: 1 };
            return ret;
        }, {}))
            .filter(([_, { count }]) => count > 2)
            .map(([_, { val }]) => val);
        intersections.forEach(([x, y]) => circles.push(svg `<circle fill="black" cx="${x}" cy="${y}" r="0.15" />`));
        const lines = [];
        const sections = Array.from(priv.getElementsByTagNameNS(sldNs, 'Section'));
        const bay = cNode.closest('Bay');
        const targetSize = this.connecting ? 0.99 : 0.7;
        const pointerEvents = !this.resizing || isBusBar(this.resizing) ? 'all' : 'none';
        sections.forEach(section => {
            const busBar = xmlBoolean(section.getAttribute('bus'));
            const vertices = Array.from(section.getElementsByTagNameNS(sldNs, 'Vertex')).map(vertex => this.renderedPosition(vertex));
            let i = 0;
            while (i < vertices.length - 1) {
                const [x1, y1] = vertices[i];
                let [x2, y2] = vertices[i + 1];
                let handleClick = nothing;
                let handleAuxClick = nothing;
                let handleContextMenu = nothing;
                if (busBar && bay) {
                    handleClick = () => this.dispatchEvent(newStartPlaceEvent(bay));
                    handleAuxClick = ({ button }) => {
                        if (button === 1)
                            this.dispatchEvent(newStartResizeEvent(bay));
                    };
                    handleContextMenu = (e) => this.openMenu(bay, e);
                }
                if (busBar && this.resizing === bay) {
                    if (section !== sections.find(s => xmlBoolean(s.getAttribute('bus'))))
                        return;
                    circles.length = 0;
                    const { pos: [vX, vY], dim: [vW, vH], } = attributes(bay.parentElement);
                    const maxX = vX + vW - 0.5;
                    const maxY = vY + vH - 0.5;
                    if (i === 0) {
                        const dx = Math.max(this.mouseX - x1, 0);
                        const dy = Math.max(this.mouseY - y1, 0);
                        if (dx > dy) {
                            x2 = Math.max(x1, Math.min(maxX, this.mouseX + 0.5));
                            y2 = y1;
                        }
                        else {
                            y2 = Math.max(y1, Math.min(maxY, this.mouseY + 0.5));
                            x2 = x1;
                        }
                        if (x1 === x2 && y1 === y2)
                            if (x2 >= maxX)
                                y2 += 1;
                            else
                                x2 += 1;
                    }
                    handleClick = () => {
                        this.dispatchEvent(newPlaceEvent({
                            parent: section,
                            element: section.getElementsByTagNameNS(sldNs, 'Vertex')[vertices.length - 1],
                            x: x2,
                            y: y2,
                        }));
                    };
                    lines.push(svg `<rect x="${this.mouseX}" y="${this.mouseY}"
              width="1" height="1" fill="none" pointer-events="${pointerEvents}"
              @click=${handleClick} />`);
                }
                if (this.connecting)
                    handleClick = () => {
                        const { equipment, path, terminal } = this.connecting;
                        if (equipment.querySelector(`Terminal[connectivityNode="${cNode.getAttribute('pathName')}"]`))
                            return;
                        const [[oldX1, _y], [oldX2, oldY2]] = path.slice(-2);
                        const vertical = oldX1 === oldX2;
                        const x3 = this.mouseX + 0.5;
                        const y3 = this.mouseY + 0.5;
                        const newX2 = vertical ? oldX2 : x3;
                        const newY2 = vertical ? y3 : oldY2;
                        path[path.length - 1] = [newX2, newY2];
                        path.push([x3, y3]);
                        cleanPath(path);
                        this.dispatchEvent(newConnectEvent({
                            equipment,
                            terminal,
                            path,
                            connectTo: cNode,
                        }));
                    };
                lines.push(svg `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                pointer-events="${pointerEvents}"
                stroke-width="${busBar ? 0.12 : nothing}" stroke="black" 
                stroke-linecap="${busBar ? 'round' : 'square'}" />`);
                lines.push(svg `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                pointer-events="${pointerEvents}" stroke-width="${targetSize}"
                @contextmenu=${handleContextMenu} @mousedown=${preventDefault}
                @click=${handleClick} @auxclick=${handleAuxClick} />`);
                if (busBar ||
                    (this.connecting && ![x1, y1].find(n => Number.isInteger(n))))
                    lines.push(svg `<rect x="${x1 - targetSize / 2}" y="${y1 - targetSize / 2}"
                  width="${targetSize}" height="${targetSize}"
                  @click=${handleClick} @auxclick=${handleAuxClick}
                  @contextmenu=${handleContextMenu} @mousedown=${preventDefault}
                  pointer-events="${pointerEvents}" fill="none" />`);
                if (busBar ||
                    (this.connecting && ![x2, y2].find(n => Number.isInteger(n))))
                    lines.push(svg `<rect x="${x2 - targetSize / 2}" y="${y2 - targetSize / 2}"
                  width="${targetSize}" height="${targetSize}"
                  @click=${handleClick} @auxclick=${handleAuxClick}
                  @contextmenu=${handleContextMenu} @mousedown=${preventDefault}
                  pointer-events="${pointerEvents}" fill="none" />`);
                i += 1;
            }
        });
        const id = cNode.closest('Substation') === this.substation
            ? identity(cNode)
            : nothing;
        return svg `<g class="node" id="${id}" >
        <title>${cNode.getAttribute('pathName')}</title>
        ${circles}
        ${lines}
      </g>`;
    }
};
SLDEditor.styles = css `
    h2 {
      font-family: Roboto;
      font-weight: 300;
      font-size: 24px;
      margin-bottom: 4px;
      --mdc-icon-button-size: 28px;
      --mdc-icon-size: 24px;
    }

    .hidden {
      display: none;
    }
    svg:not(:hover) ~ .coordinates {
      display: none;
    }
    .coordinates {
      position: fixed;
      pointer-events: none;
      font-size: 16px;
      font-family: 'Roboto', sans-serif;
      padding: 8px;
      border-radius: 16px;
      background: #fffd;
      color: rgb(0, 0, 0 / 0.83);
    }
    .coordinates.invalid {
      color: #bb1326;
    }

    * {
      user-select: none;
    }
  `;
__decorate([
    property()
], SLDEditor.prototype, "doc", void 0);
__decorate([
    property()
], SLDEditor.prototype, "substation", void 0);
__decorate([
    property()
], SLDEditor.prototype, "editCount", void 0);
__decorate([
    property()
], SLDEditor.prototype, "gridSize", void 0);
__decorate([
    property()
], SLDEditor.prototype, "nsp", void 0);
__decorate([
    property()
], SLDEditor.prototype, "resizing", void 0);
__decorate([
    property()
], SLDEditor.prototype, "placing", void 0);
__decorate([
    property()
], SLDEditor.prototype, "placingLabel", void 0);
__decorate([
    property()
], SLDEditor.prototype, "connecting", void 0);
__decorate([
    query('#resizeSubstationUI')
], SLDEditor.prototype, "resizeSubstationUI", void 0);
__decorate([
    query('#substationWidthUI')
], SLDEditor.prototype, "substationWidthUI", void 0);
__decorate([
    query('#substationHeightUI')
], SLDEditor.prototype, "substationHeightUI", void 0);
__decorate([
    query('svg#sld')
], SLDEditor.prototype, "sld", void 0);
__decorate([
    state()
], SLDEditor.prototype, "mouseX", void 0);
__decorate([
    state()
], SLDEditor.prototype, "mouseY", void 0);
__decorate([
    state()
], SLDEditor.prototype, "mouseX2", void 0);
__decorate([
    state()
], SLDEditor.prototype, "mouseY2", void 0);
__decorate([
    state()
], SLDEditor.prototype, "menu", void 0);
SLDEditor = __decorate([
    customElement('sld-editor')
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
], SLDEditor);
export { SLDEditor };
//# sourceMappingURL=sld-editor.js.map