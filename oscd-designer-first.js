import { __decorate } from "tslib";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-loop-func */
/* eslint-disable no-nested-ternary */
import { LitElement, html, css, svg } from 'lit';
import { state } from 'lit/decorators.js';
// open-scd editor action for backwards compatibility
function newCreateEvent(parent, element, reference) {
    return new CustomEvent('editor-action', {
        bubbles: true,
        composed: true,
        detail: { action: { new: { parent, element, reference } } },
    });
}
function isDir(dir) {
    return dir === 'horizontal' || dir === 'vertical';
}
const sxy = 'http://www.iec.ch/61850/2003/SCLcoordinates';
function sxyAttrs(element) {
    var _a, _b;
    const x = parseInt((_a = element.getAttributeNS(sxy, 'x')) !== null && _a !== void 0 ? _a : '', 10) || 0;
    const y = parseInt((_b = element.getAttributeNS(sxy, 'y')) !== null && _b !== void 0 ? _b : '', 10) || 0;
    const dirAttr = element.getAttributeNS(sxy, 'dir');
    const dir = isDir(dirAttr) ? dirAttr : 'vertical';
    return { x, y, dir };
}
function positionedElement(element) {
    var _a, _b;
    const x = parseInt((_a = element.getAttributeNS(sxy, 'x')) !== null && _a !== void 0 ? _a : '', 10) || 0;
    const y = parseInt((_b = element.getAttributeNS(sxy, 'y')) !== null && _b !== void 0 ? _b : '', 10) || 0;
    const dirAttr = element.getAttributeNS(sxy, 'dir');
    const dir = isDir(dirAttr) ? dirAttr : 'vertical';
    return { x, y, dir, element };
}
function setDimensions(diagram, content) {
    const dia = { ...diagram };
    dia.width = Math.max(...content.map(e => e.x + e.width)) + 2;
    dia.height = Math.max(...content.map(e => e.y + e.height)) + 2;
    return dia;
}
function bayDiagram(bay) {
    const diagram = {
        ...positionedElement(bay),
        width: 2,
        height: 2,
        equipment: Array.from(bay.children)
            .filter(child => child.tagName === 'ConductingEquipment')
            .map(eq => ({
            ...positionedElement(eq),
            width: 1,
            height: 1,
            icon: eq.getAttribute('type') || 'general',
        })),
    };
    return setDimensions(diagram, diagram.equipment);
}
function voltageLevelDiagram(voltageLevel) {
    const diagram = {
        ...positionedElement(voltageLevel),
        width: 2,
        height: 2,
        bays: [],
        busBars: [],
    };
    for (const bay of Array.from(voltageLevel.children).filter(c => c.tagName === 'Bay')) {
        if (!bay.querySelector(':scope > ConductingEquipment'))
            diagram.busBars.push({
                ...positionedElement(bay),
                width: 10,
                height: 1,
            });
        else
            diagram.bays.push(bayDiagram(bay));
    }
    return setDimensions(diagram, diagram.busBars.concat(diagram.bays));
}
function substationDiagram(substation) {
    const diagram = {
        ...positionedElement(substation),
        width: 2,
        height: 2,
        voltageLevels: [],
    };
    Array.from(substation.children)
        .filter(c => c.tagName === 'VoltageLevel')
        .forEach(vl => diagram.voltageLevels.push(voltageLevelDiagram(vl)));
    return setDimensions(diagram, diagram.voltageLevels);
}
function renderSubstation(substation) {
    const diagram = substationDiagram(substation);
    const { x, y, width, height } = diagram;
    return svg `<svg x="${x}" y="${y}" width="${width}" height="${height}">
          <rect x="0" y="0" width="100%" height="100%" fill="#cbda" />
    </svg>`;
}
export default class Designer extends LitElement {
    constructor() {
        super(...arguments);
        this.scale = 1;
        this.top = 0;
        this.left = 0;
        this.substationIndex = 0;
    }
    handleMove(evt) {
        if (!(evt.buttons % 2))
            return;
        evt.preventDefault();
        this.left -= (evt.movementX * this.scale) / devicePixelRatio;
        this.top -= (evt.movementY * this.scale) / devicePixelRatio;
        if (this.left < 0)
            this.left = 0;
        if (this.top < 0)
            this.top = 0;
    }
    handleWheel(evt) {
        evt.preventDefault();
        console.warn(this.scale);
        this.scale += (evt.deltaY * this.scale) / 500;
        if (this.scale < 0.2)
            this.scale = 0.2;
    }
    render() {
        var _a, _b;
        const substations = Array.from((_b = (_a = this.doc) === null || _a === void 0 ? void 0 : _a.documentElement.children) !== null && _b !== void 0 ? _b : []).filter(child => child.tagName === 'Substation');
        const [x, y, w, h] = [
            this.left,
            this.top,
            100 * this.scale,
            100 * this.scale,
        ];
        return html `
      <svg
        @mousemove=${(e) => this.handleMove(e)}
        @wheel=${(e) => this.handleWheel(e)}
        viewBox="${x} ${y} ${w} ${h}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="pattern-dots"
          x="0"
          y="0"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle
            id="pattern-dot"
            cx="1.5"
            cy="1.5"
            r="0.2"
            fill="#abcd"
          ></circle>
        </pattern>
        <rect
          x="0"
          y="0"
          width="1000"
          height="1000"
          fill="url(#pattern-dots)"
        ></rect>
        ${substations.map(renderSubstation)}
      </svg>
    `;
    }
}
Designer.styles = css `
    svg {
      margin: 12px;
      min-height: vmax;
      min-width: vmax;
    }
  `;
__decorate([
    state()
], Designer.prototype, "doc", void 0);
__decorate([
    state()
], Designer.prototype, "scale", void 0);
__decorate([
    state()
], Designer.prototype, "top", void 0);
__decorate([
    state()
], Designer.prototype, "left", void 0);
__decorate([
    state()
], Designer.prototype, "substationIndex", void 0);
//# sourceMappingURL=oscd-designer-first.js.map