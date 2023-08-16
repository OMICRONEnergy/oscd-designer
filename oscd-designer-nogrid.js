/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
/* eslint-disable no-return-assign */
/* eslint-disable no-debugger */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import { __decorate } from "tslib";
import { LitElement, html, css, svg, nothing } from 'lit';
import { svg as staticSvg, unsafeStatic } from 'lit/static-html.js';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { state } from 'lit/decorators.js';
import { newEditEvent } from '@openscd/open-scd-core';
import { getReference, identity } from '@openscd/oscd-scl';
import { symbols } from './icons.js';
/*
// open-scd editor action for backwards compatibility
function newCreateEvent(parent: Node, element: Node, reference?: Node | null) {
  return new CustomEvent('editor-action', {
    bubbles: true,
    composed: true,
    detail: { action: { new: { parent, element, reference } } },
  });
}
*/
const svgNs = 'http://www.w3.org/2000/svg';
const sldNs = 'https://transpower.com/SCL/SSD/SLD/v0';
const gridSize = 25;
const dirs = ['E', 'S', 'W', 'N'];
const clockwise = { E: 'S', S: 'W', W: 'N', N: 'E' };
function direction(str) {
    const dir = str === null || str === void 0 ? void 0 : str.toUpperCase();
    if (dirs.includes(dir))
        return dir;
    return 'S';
}
const degrees = { S: 0, W: 90, N: 180, E: 270 };
function attributes(element) {
    var _a, _b;
    const [x, y, w, h] = ['x', 'y', 'w', 'h'].map(name => { var _a; return parseInt((_a = element.getAttributeNS(sldNs, name)) !== null && _a !== void 0 ? _a : '1', 10); });
    const dir = direction(element.getAttributeNS(sldNs, 'dir'));
    const bus = ['true', '1'].includes((_b = (_a = element.getAttributeNS(sldNs, 'bus')) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : 'false');
    return { x, y, w, h, bus, dir };
}
const childTags = {
    SCL: ['Substation'],
    Substation: ['VoltageLevel'],
    VoltageLevel: ['Bay'],
    Bay: ['ConductingEquipment', 'ConnectivityNode'],
    ConductingEquipment: ['Terminal'],
};
function getChildren(element) {
    return Array.from(element.children).filter(child => { var _a; return (_a = childTags[element.tagName]) === null || _a === void 0 ? void 0 : _a.includes(child.tagName); });
}
function isValidTarget(target, moving) {
    var _a;
    return (((_a = childTags[target.tagName]) === null || _a === void 0 ? void 0 : _a.includes(moving.tagName)) &&
        [target, null].includes(moving.closest(target.tagName)));
}
function svgCoordinates(clientX, clientY, svgElement) {
    var _a;
    const p = new DOMPoint(clientX, clientY);
    const { x, y } = p.matrixTransform((_a = svgElement.getScreenCTM()) === null || _a === void 0 ? void 0 : _a.inverse());
    return { clickedX: Math.floor(x), clickedY: Math.floor(y) };
}
function connectionPoint(terminal) {
    const equipment = terminal.closest('ConductingEquipment');
    if (!equipment)
        return [NaN, NaN];
    const { x, y, dir } = attributes(equipment);
    const input = Array.from(equipment.children)
        .filter(c => c.tagName === 'Terminal')
        .findIndex(t => t === terminal) === 0;
    const connectionPoints = {
        S: [x + 0.5, input ? y : y + 1],
        N: [x + 0.5, input ? y + 1 : y],
        E: [input ? x : x + 1, y + 0.5],
        W: [input ? x + 1 : x, y + 0.5],
    };
    return connectionPoints[dir];
}
export default class Designer extends LitElement {
    constructor() {
        super(...arguments);
        this.editCount = -1;
        this.currentLine = [];
    }
    getSVG(id) {
        var _a, _b;
        if (Number.isNaN(id))
            return null;
        return ((_b = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector(`svg#${id}`)) !== null && _b !== void 0 ? _b : null);
    }
    insertAt(x, y, parent) {
        if (!this.placing)
            return;
        this.placing.setAttributeNS(sldNs, 'x', x.toString());
        this.placing.setAttributeNS(sldNs, 'y', y.toString());
        this.dispatchEvent(newEditEvent({
            parent,
            node: this.placing,
            reference: getReference(parent, this.placing.tagName),
        }));
    }
    placeAt(clientX, clientY, target) {
        if (!this.placing)
            return;
        const svgElement = this.getSVG(identity(target.closest('Substation')));
        if (!svgElement)
            return;
        const { clickedX, clickedY } = svgCoordinates(clientX, clientY, svgElement);
        if (this.placing.closest(target.tagName) === target)
            this.dispatchEvent(newEditEvent({
                element: this.placing,
                attributes: {
                    x: { namespaceURI: sldNs, value: clickedX.toString() },
                    y: { namespaceURI: sldNs, value: clickedY.toString() },
                },
            }));
        else
            this.insertAt(clickedX, clickedY, target);
        if (!['ConductingEquipment', 'Substation', 'ConnectivityNode'].includes(this.placing.tagName))
            this.resizing = this.placing;
        this.placing = undefined;
    }
    rotateEquipment(element) {
        const { dir } = attributes(element);
        const value = clockwise[dir];
        this.dispatchEvent(newEditEvent({
            element,
            attributes: { dir: { namespaceURI: sldNs, value } },
        }));
    }
    resizeTo(clientX, clientY) {
        if (!this.resizing)
            return;
        const svgElement = this.getSVG(identity(this.resizing.closest('Substation')));
        if (!svgElement)
            return;
        const { clickedX, clickedY } = svgCoordinates(clientX, clientY, svgElement);
        const { x: elementX, y: elementY } = attributes(this.resizing);
        const w = Math.max(clickedX - elementX + 1, 1).toString();
        const h = Math.max(clickedY - elementY + 1, 1).toString();
        this.dispatchEvent(newEditEvent({
            element: this.resizing,
            attributes: {
                w: { namespaceURI: sldNs, value: w.toString() },
                h: { namespaceURI: sldNs, value: h.toString() },
            },
        }));
        this.resizing = undefined;
    }
    equipmentAt(x, y, substation) {
        const eq = Array.from(substation.querySelectorAll(`:scope > VoltageLevel > Bay > ConductingEquipment`)).find(e => e.getAttributeNS(sldNs, 'x') === x.toString() &&
            e.getAttributeNS(sldNs, 'y') === y.toString());
        return eq;
    }
    lineTo(clientX, clientY) {
        if (!this.lineStart)
            return;
        const svgElement = this.getSVG(identity(this.lineStart.from.closest('Substation')));
        if (!svgElement)
            return;
        const { clickedX, clickedY } = svgCoordinates(clientX, clientY, svgElement);
        const x = clickedX + 0.5;
        const y = clickedY + 0.5;
        this.currentLine.push({ ...this.lineStart, x2: x, y2: y });
        this.lineStart = { ...this.lineStart, x1: x, y1: y };
    }
    connectNodeAt(clientX, clientY, cNode) {
        if (!this.lineStart)
            return;
        const svgElement = this.getSVG(identity(cNode.closest('Substation')));
        if (!svgElement)
            return;
        const { clickedX, clickedY } = svgCoordinates(clientX, clientY, svgElement);
        const x2 = clickedX + 0.5;
        const y2 = clickedY + 0.5;
        const content = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
        let nodeIndex = 1;
        while (content === null || content === void 0 ? void 0 : content.querySelector(`circle[id="${identity(cNode)}$node${nodeIndex}"]`))
            nodeIndex++;
        this.currentLine.push({ ...this.lineStart, x2, y2 });
        this.currentLine.forEach(segment => (segment.to = nodeIndex));
        this.connectToConnectivityNode(cNode);
    }
    connectToConnectivityNode(cNode) {
        const edits = [];
        const parent = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
        if (!parent)
            return;
        this.currentLine.forEach(({ x1, y1, x2, y2, from, to }) => {
            const fromId = `${identity(from.parentElement).toString()}/${from.getAttribute('name')}`;
            const toId = `${identity(cNode)}$node${to}`;
            const node = this.doc.createElement('line');
            node.setAttribute('x1', x1.toString());
            node.setAttribute('y1', y1.toString());
            node.setAttribute('x2', x2.toString());
            node.setAttribute('y2', y2.toString());
            node.setAttributeNS(sldNs, 'from', fromId);
            node.setAttributeNS(sldNs, 'to', toId);
            const clickTarget = node.cloneNode();
            clickTarget.setAttribute('stroke', 'transparent');
            clickTarget.setAttribute('stroke-width', '.6');
            node.setAttribute('stroke', 'black');
            node.setAttribute('stroke-width', '0.06');
            edits.push({ parent, node, reference: null });
            edits.push({ parent, node: clickTarget, reference: null });
        });
        const { x2, y2, from, to } = this.currentLine[this.currentLine.length - 1];
        const node = this.doc.createElement('circle');
        node.setAttribute('cx', x2.toString());
        node.setAttribute('cy', y2.toString());
        node.setAttribute('r', '0.1');
        node.setAttribute('id', `${identity(cNode)}$node${to}`);
        edits.push({ parent, node, reference: null });
        edits.push({
            element: from,
            attributes: { connectivityNode: cNode.getAttribute('pathName') },
        });
        this.dispatchEvent(newEditEvent(edits));
        this.reset();
    }
    connectTerminal(terminal) {
        const [x, y] = connectionPoint(terminal);
        if (!this.lineStart) {
            this.lineStart = { x1: x, y1: y, from: terminal };
            return;
        }
        this.currentLine.push({ ...this.lineStart, x2: x, y2: y });
        this.currentLine.forEach(segment => (segment.to = terminal));
        this.createConnectivityNode();
    }
    createConnectivityNode() {
        if (!this.doc || !this.lineStart)
            return;
        const edits = [];
        const { from: terminal } = this.lineStart;
        const parent = terminal.closest('Bay');
        const nodeNames = Array.from(parent.querySelectorAll(':scope > ConnectivityNode')).map(node => node.getAttribute('name'));
        let nodeIndex = 1;
        while (nodeNames.includes(`L${nodeIndex}`))
            nodeIndex++;
        const name = `L${nodeIndex}`;
        const path = ['Substation', 'VoltageLevel', 'Bay']
            .map(tag => { var _a; return (_a = terminal.closest(tag)) === null || _a === void 0 ? void 0 : _a.getAttribute('name'); })
            .join('/');
        const pathName = `${path}/${name}`;
        const node = this.doc.createElement('ConnectivityNode');
        node.setAttribute('name', name);
        node.setAttribute('pathName', pathName);
        [
            terminal,
            this.currentLine[this.currentLine.length - 1].to,
        ].forEach(element => edits.push({ element, attributes: { connectivityNode: pathName } }));
        const priv = this.doc.createElement('Private');
        priv.setAttribute('type', 'Transpower-SLD-v0');
        priv.setAttribute('xmlns', svgNs);
        priv.setAttribute('xmlns:esld', sldNs);
        this.currentLine.forEach(({ x1, y1, x2, y2, from, to }, segment) => {
            const fromId = `${identity(from.parentElement).toString()}/${from.getAttribute('name')}`;
            const toId = `${identity(to.parentElement).toString()}/${to.getAttribute('name')}`;
            const line = this.doc.createElement('line');
            line.setAttribute('x1', x1.toString());
            line.setAttribute('y1', y1.toString());
            line.setAttribute('x2', x2.toString());
            line.setAttribute('y2', y2.toString());
            line.setAttributeNS(sldNs, 'segment', segment.toString());
            line.setAttributeNS(sldNs, 'from', fromId);
            line.setAttributeNS(sldNs, 'to', toId);
            const clickTarget = line.cloneNode();
            clickTarget.setAttribute('stroke', 'transparent');
            clickTarget.setAttribute('stroke-width', '0.6');
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', '0.06');
            priv.appendChild(line);
            priv.appendChild(clickTarget);
        });
        node.appendChild(priv);
        const reference = getReference(parent, 'ConnectivityNode');
        edits.push({ parent, node, reference });
        this.dispatchEvent(newEditEvent(edits));
        this.reset();
    }
    renderEquipment(equipment) {
        var _a, _b, _c, _d, _e, _f;
        const { x, y, dir } = attributes(equipment);
        const [input, output] = Array.from((_a = equipment.children) !== null && _a !== void 0 ? _a : []).filter(child => child.tagName === 'Terminal');
        const deg = degrees[dir];
        const inGrounded = (input === null || input === void 0 ? void 0 : input.getAttribute('cNodeName')) === 'grounded'
            ? svg `<line x1="0.5" y1="-0.1" x2="0.5" y2="0" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`
            : nothing;
        const outGrounded = (output === null || output === void 0 ? void 0 : output.getAttribute('cNodeName')) === 'grounded'
            ? svg `<line x1="0.5" y1="1.1" x2="0.5" y2="1" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`
            : nothing;
        const inOpen = ((_b = input === null || input === void 0 ? void 0 : input.closest('Substation')) === null || _b === void 0 ? void 0 : _b.querySelector(`ConnectivityNode[pathName="${input.getAttribute('connectivityNode')}"] > Private[type="Transpower-SLD-v0"]`)) ||
            !input ||
            ((_c = this.lineStart) === null || _c === void 0 ? void 0 : _c.from) === input ||
            inGrounded !== nothing
            ? nothing
            : svg `<circle cx="0.5" cy="0" r="0.2" opacity="0.4" fill="green" stroke="lightgreen" @click=${() => this.connectTerminal(input)} />`;
        const outOpen = ((_d = output === null || output === void 0 ? void 0 : output.closest('Substation')) === null || _d === void 0 ? void 0 : _d.querySelector(`ConnectivityNode[pathName="${output.getAttribute('connectivityNode')}"] > Private[type="Transpower-SLD-v0"]`)) ||
            !output ||
            ((_e = this.lineStart) === null || _e === void 0 ? void 0 : _e.from) === output ||
            outGrounded !== nothing
            ? nothing
            : svg `<circle cx="0.5" cy="1" r="0.2" opacity="0.4" fill="green" stroke="lightgreen" @click=${() => this.connectTerminal(output)} />`;
        const eqType = (_f = equipment.getAttribute('type')) !== null && _f !== void 0 ? _f : '';
        const id = ['CBR', 'CTR', 'VTR', 'DIS', 'IFL'].includes(eqType)
            ? eqType
            : 'ConductingEquipment';
        return svg `<g class="equipment" transform="translate(${x} ${y}) rotate(${deg}, 0.5, 0.5)">
      ${inGrounded}
      ${outGrounded}
      <title>${equipment.getAttribute('name')}</title>
      <use href="#${id}" />
      <rect x=".1" y=".1" width=".8" height=".8" fill="transparent"
        @click=${() => (this.placing = equipment)}
        @contextmenu=${(e) => {
            e.preventDefault();
            this.rotateEquipment(equipment);
        }}
        />
      ${inOpen}
      ${outOpen}
    </g>`;
    }
    renderBus(bus) {
        let { x, y, w, h } = attributes(bus);
        if (h === 1) {
            h = 0.2;
            y += 0.4;
        }
        else if (w === 1) {
            w = 0.2;
            x += 0.4;
        }
        return svg `<g>
      <rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      opacity="0.5"
      fill="orange"
      />
    </g>`;
    }
    renderConnectivityNode(cNode) {
        const content = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
        if (!content)
            return nothing;
        const svgContent = content.innerHTML;
        return staticSvg `<g class="node" @click=${(e) => this.connectNodeAt(e.clientX, e.clientY, cNode)}>
       ${unsafeStatic(svgContent)}
      <title>${cNode.getAttribute('pathName')}</title>
      </g>`;
    }
    renderBay(bay) {
        const { x, y, w, h } = attributes(bay);
        const placeTarget = this.placing && isValidTarget(bay, this.placing)
            ? svg `<rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      @click=${(e) => this.placeAt(e.clientX, e.clientY, bay)}
      fill="url(#dots)" />`
            : nothing;
        return svg `<g>
      <text x="${x + 0.1}" y="${y - 0.2}" style="font: 0.8px sans-serif;" @click=${() => (this.placing = bay)}>
        ${bay.getAttribute('name')}
      </text>
      <rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      fill="transparent" stroke="blue" stroke-dasharray=".2 .2" />
      ${placeTarget}
    </g>`;
    }
    renderVoltageLevel(voltageLevel) {
        const { x, y, w, h } = attributes(voltageLevel);
        const bays = [];
        const busses = [];
        getChildren(voltageLevel).forEach(child => {
            const { bus } = attributes(child);
            if (bus)
                busses.push(child);
            else
                bays.push(child);
        });
        const placeTarget = this.placing && isValidTarget(voltageLevel, this.placing)
            ? svg `
      <rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      @click=${(e) => this.placeAt(e.clientX, e.clientY, voltageLevel)}
      fill="url(#dots)" />
    `
            : nothing;
        return svg `<g id="${identity(voltageLevel)}">
      <text @click=${() => (this.placing = voltageLevel)} x="${x}.1" y="${y - 0.2}" style="font: 0.9px sans-serif;">
        ${voltageLevel.getAttribute('name')}
      </text>
      <rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      fill="transparent" stroke="orange" />
      ${bays.map(b => this.renderBay(b))}
      ${busses.map(b => this.renderBus(b))}
      ${placeTarget}
    </g>`;
    }
    renderSubstation(substation) {
        const { w, h } = attributes(substation);
        const placeTarget = this.placing && isValidTarget(substation, this.placing)
            ? svg `<rect
      width="${w}"
      height="${h}"
      @click=${(e) => this.placeAt(e.clientX, e.clientY, substation)}
      fill="url(#dots)" />`
            : nothing;
        const resizeTarget = this.resizing
            ? svg `<rect
      width="${w}"
      height="${h}"
      @click=${(e) => this.resizeTo(e.clientX, e.clientY)}
      fill="url(#dots)" />`
            : nothing;
        const lineTarget = this.lineStart
            ? svg `<rect
      width="${w}"
      height="${h}"
      @click=${(e) => this.lineTo(e.clientX, e.clientY)}
      fill="url(#dots)" />`
            : nothing;
        return html `<h3>${substation.getAttribute('name')}</h3>
      <svg
        id=${identity(substation)}
        viewBox="0 0 ${w} ${h}"
        width="${w * gridSize}"
        height="${h * gridSize}"
        style="margin: 20px;"
        stroke-width="0.1"
        xmlns="${svgNs}"
      >
        ${symbols}
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        ${getChildren(substation).map(vl => this.renderVoltageLevel(vl))}
        ${placeTarget} ${resizeTarget} ${lineTarget}
        ${this.currentLine.map(({ x1, y1, x2, y2 }) => svg `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                      stroke="black" stroke-width="0.06" />`)}
        ${Array.from(substation.querySelectorAll('VoltageLevel > Bay > ConductingEquipment')).map(e => this.renderEquipment(e))}
        ${Array.from(substation.querySelectorAll('VoltageLevel > Bay > ConnectivityNode')).map(c => this.renderConnectivityNode(c))}
      </svg>`;
    }
    render() {
        var _a, _b;
        const substations = Array.from((_b = (_a = this.doc) === null || _a === void 0 ? void 0 : _a.documentElement.children) !== null && _b !== void 0 ? _b : []).filter(child => child.tagName === 'Substation' &&
            Array.from(child.attributes)
                .map(a => a.value)
                .includes(sldNs));
        return html `<menu>
        <li>
          <button @click=${() => this.insertSubstation()}>S</button>
        </li>
        <li>
          <button @click=${() => this.placeVoltageLevel()}>V</button>
        </li>
        <li>
          <button @click=${() => this.placeBay()}>B</button>
        </li>
        <li>
          <button @click=${() => this.placeEquipment()}>E</button>
        </li>
        <li>
          <button @click=${() => this.reset()}>X</button>
        </li>
      </menu>
      <main>${substations.map(s => this.renderSubstation(s))}</main>`;
    }
    reset() {
        this.placing = undefined;
        this.resizing = undefined;
        this.lineStart = undefined;
        this.currentLine = [];
    }
    placeEquipment() {
        if (!this.doc)
            return;
        const eqType = prompt('Equipment type', 'CBR');
        if (!eqType)
            return;
        const name = prompt('Equipment name', `${eqType}1`);
        if (!name)
            return;
        const equipment = this.doc.createElement('ConductingEquipment');
        equipment.setAttribute('type', eqType);
        equipment.setAttribute('name', name);
        equipment.setAttributeNS(sldNs, 'esld:w', '8');
        equipment.setAttributeNS(sldNs, 'esld:h', '8');
        this.placing = equipment;
    }
    placeBay() {
        if (!this.doc)
            return;
        const name = prompt('Bay name', 'Bay X');
        if (!name)
            return;
        const bay = this.doc.createElement('Bay');
        bay.setAttribute('name', name);
        bay.setAttributeNS(sldNs, 'esld:w', '8');
        bay.setAttributeNS(sldNs, 'esld:h', '8');
        this.placing = bay;
    }
    placeVoltageLevel() {
        if (!this.doc)
            return;
        const name = prompt('Voltage Level name', '220kV');
        if (!name)
            return;
        const voltageLevel = this.doc.createElement('VoltageLevel');
        voltageLevel.setAttribute('name', name);
        voltageLevel.setAttributeNS(sldNs, 'esld:w', '10');
        voltageLevel.setAttributeNS(sldNs, 'esld:h', '10');
        this.placing = voltageLevel;
    }
    insertSubstation() {
        var _a, _b;
        if (!this.doc)
            return;
        const name = prompt('Substation name', 'Substation');
        if (!name)
            return;
        const width = parseInt((_a = prompt('width', '50')) !== null && _a !== void 0 ? _a : '50', 10);
        const height = parseInt((_b = prompt('height', '25')) !== null && _b !== void 0 ? _b : '25', 10);
        if (!width || !height)
            return;
        const substation = this.doc.createElement('Substation');
        substation.setAttribute('name', name);
        substation.setAttribute('xmlns:esld', sldNs);
        substation.setAttributeNS(sldNs, 'esld:w', width.toString());
        substation.setAttributeNS(sldNs, 'esld:h', height.toString());
        this.dispatchEvent(newEditEvent({
            parent: this.doc.documentElement,
            node: substation,
            reference: getReference(this.doc.documentElement, 'Substation'),
        }));
    }
    firstUpdated() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape')
                this.reset();
        }, true);
    }
}
Designer.styles = css `
    g.equipment:hover g.terminal > circle {
      stroke: green;
    }
    menu {
      position: fixed;
      bottom: 20px;
      left: 20px;
      list-style-type: none;
      display: flex;
      padding: 0;
      margin: 0;
      gap: 5px;
      z-index: 100;
    }
  `;
__decorate([
    state()
], Designer.prototype, "doc", void 0);
__decorate([
    state()
], Designer.prototype, "editCount", void 0);
__decorate([
    state()
], Designer.prototype, "placing", void 0);
__decorate([
    state()
], Designer.prototype, "resizing", void 0);
__decorate([
    state()
], Designer.prototype, "lineStart", void 0);
__decorate([
    state()
], Designer.prototype, "currentLine", void 0);
//# sourceMappingURL=oscd-designer-nogrid.js.map