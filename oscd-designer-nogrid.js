import { __decorate } from "tslib";
/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
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
const sldNs = 'https://transpower.com/SCL/SSD/SLD/v0';
const gridSize = 24;
const dirs = ['E', 'S', 'W', 'N'];
function direction(str) {
    const dir = str === null || str === void 0 ? void 0 : str.toUpperCase();
    if (dirs.includes(dir))
        return dir;
    return 'S';
}
const clockwise = { E: 'S', S: 'W', W: 'N', N: 'E' };
function attributes(element) {
    var _a, _b;
    const [x, y, w, h] = ['x', 'y', 'w', 'h'].map(name => { var _a; return parseInt((_a = element.getAttributeNS(sldNs, name)) !== null && _a !== void 0 ? _a : '1', 10); });
    const dir = direction(element.getAttributeNS(sldNs, 'dir'));
    const bus = ['true', '1'].includes((_b = (_a = element.getAttributeNS(sldNs, 'bus')) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : 'false');
    return { x, y, w, h, dir, bus };
}
const children = {
    SCL: ['Substation'],
    Substation: ['VoltageLevel'],
    VoltageLevel: ['Bay'],
    Bay: ['ConductingEquipment', 'Terminal'],
};
function canContain(parent, child) {
    var _a, _b, _c;
    return (_c = (_a = children[parent.tagName]) === null || _a === void 0 ? void 0 : _a.includes((_b = child === null || child === void 0 ? void 0 : child.tagName) !== null && _b !== void 0 ? _b : '')) !== null && _c !== void 0 ? _c : false;
}
export default class Designer extends LitElement {
    constructor() {
        super(...arguments);
        this.editCount = -1;
        this.created = 0;
    }
    /*
    moveTo(x: number, y: number, parent: Element) {
      console.log('moving', this.placing, 'to', parent, x, y);
      if (!this.placing) return;
      if (
        this.placing.parentElement !== parent &&
        this.placing.tagName !== 'Terminal'
      )
        this.dispatchEvent(newEditEvent({ node: this.placing, parent }));
      this.dispatchEvent(
        newEditEvent({
          element: this.placing,
          attributes: {
            x: { namespaceURI: sldNs, value: x.toString() },
            y: { namespaceURI: sldNs, value: y.toString() },
          },
        })
      );
    }
  
    createAt(x: number, y: number, parent: Element) {
      if (!this.placing) return;
      this.placing.setAttributeNS(sldNs, 'x', x.toString());
      this.placing.setAttributeNS(sldNs, 'y', y.toString());
      this.placing.setAttributeNS(sldNs, 'w', '5');
      this.placing.setAttributeNS(sldNs, 'h', '5');
      this.placing.setAttribute('name', this.placing.tagName + this.created);
      this.created += 1;
      this.dispatchEvent(newEditEvent({ node: this.placing, parent }));
    }
  
    placeAt(x: number, y: number, parent: Element) {
      if (!this.placing) return;
      if (this.placing.parentElement) this.moveTo(x, y, parent);
      else this.createAt(x, y, parent);
      this.placing = undefined;
    }
  
    place(element: Element | undefined) {
      console.log('placing', element);
      this.resizing = undefined;
      this.placing = element;
    }
  
    resizeTo(targetX: number, targetY: number) {
      if (!this.resizing) return;
      const { x, y } = attributes(this.resizing);
      const w = Math.max(1, targetX - x + 1).toString();
      const h = Math.max(1, targetY - y + 1).toString();
      this.dispatchEvent(
        newEditEvent({
          element: this.resizing,
          attributes: {
            w: { namespaceURI: sldNs, value: w },
            h: { namespaceURI: sldNs, value: h },
          },
        })
      );
      this.resizing = undefined;
    }
  
    rotate(element: Element | undefined) {
      if (!element) return;
      const { dir } = attributes(element);
  
      this.dispatchEvent(
        newEditEvent({
          element,
          attributes: {
            dir: { namespaceURI: sldNs, value: clockwise[dir] },
          },
        })
      );
    }
     */
    renderEquipment(equipment) {
        var _a;
        console.log(this);
        const { x, y, dir } = attributes(equipment);
        const [input, output] = Array.from((_a = equipment.children) !== null && _a !== void 0 ? _a : []).filter(child => child.tagName === 'Terminal');
        let [inX, outX, inY, outY] = [x, x, y, y];
        if (dir === 'S') {
            inY -= 1;
            outY += 1;
        }
        else if (dir === 'N') {
            inY += 1;
            outY -= 1;
        }
        else if (dir === 'E') {
            inX -= 1;
            outX += 1;
        }
        else if (dir === 'W') {
            inX += 1;
            outX -= 1;
        }
        const inTerminal = input
            ? html `<div
          class="clickable terminal"
          style="grid-column: ${inX}; grid-row: ${inY};"
        >
          <abbr title="${input.getAttribute('connectivityNode')}"
            >${input.getAttribute('cNodeName')}</abbr
          >
        </div>`
            : undefined;
        const outTerminal = output
            ? html `<div
          class="clickable terminal"
          style="grid-column: ${outX}; grid-row: ${outY};"
        >
          <abbr title="${output.getAttribute('connectivityNode')}"
            >${output.getAttribute('cNodeName')}</abbr
          >
        </div>`
            : undefined;
        return html `<div
        class="clickable equipment"
        style="grid-column: ${x}; grid-row: ${y};"
      >
        <abbr title=${equipment.getAttribute('name')}
          >${equipment.getAttribute('type')}</abbr
        >
      </div>
      ${inTerminal} ${outTerminal}`;
    }
    renderBay(bay) {
        var _a;
        const { x, y, w, h, bus } = attributes(bay);
        const equipment = Array.from((_a = bay.children) !== null && _a !== void 0 ? _a : []).filter(child => child.tagName === 'ConductingEquipment');
        return html `<section
      class="${classMap({
            bus,
            bay: !bus,
        })}"
      style="grid-column: ${x} / span ${w}; grid-row: ${y} / span ${h};"
    >
      <span
        class="clickable label"
        @contextmenu=${(e) => {
            e.preventDefault();
        }}
      >
        ${bay.getAttribute('name')}
      </span>
      ${equipment.map(e => this.renderEquipment(e))}
    </section>`;
    }
    renderVoltageLevel(voltageLevel) {
        var _a;
        const { x, y, w, h } = attributes(voltageLevel);
        const bays = Array.from((_a = voltageLevel.children) !== null && _a !== void 0 ? _a : []).filter(child => child.tagName === 'Bay');
        return html `<section
      class="voltagelevel"
      style="grid-column: ${x} / span ${w}; grid-row: ${y} / span ${h};"
    >
      <span class="clickable label">${voltageLevel.getAttribute('name')}</span>
      ${bays.map(b => this.renderBay(b))}
    </section>`;
    }
    renderSubstation(substation) {
        var _a;
        const { x, y, w, h } = attributes(substation);
        const voltageLevels = Array.from((_a = substation.children) !== null && _a !== void 0 ? _a : []).filter(child => child.tagName === 'VoltageLevel');
        return html `<section
      class="substation"
      style="grid-column: ${x} / span ${w}; grid-row: ${y} / span ${h};"
    >
      <span class="clickable label">${substation.getAttribute('name')}</span>
      ${voltageLevels.map(vl => this.renderVoltageLevel(vl))}
    </section>`;
    }
    render() {
        var _a, _b;
        const substations = Array.from((_b = (_a = this.doc) === null || _a === void 0 ? void 0 : _a.documentElement.children) !== null && _b !== void 0 ? _b : []).filter(child => child.tagName === 'Substation' &&
            Array.from(child.attributes)
                .map(a => a.value)
                .includes(sldNs));
        return html ` <menu>
        <li>
          <button
            @click=${() => {
            var _a;
            const substation = (_a = this.doc) === null || _a === void 0 ? void 0 : _a.createElement('Substation');
            substation === null || substation === void 0 ? void 0 : substation.setAttribute('xmlns:esld', sldNs);
        }}
          >
            S
          </button>
        </li>
        <li>
          <button>V</button>
        </li>
        <li>
          <button>B</button>
        </li>
        <li>
          <button>E</button>
        </li>
        <li>
          <button>X</button>
        </li>
      </menu>
      <main>${substations.map(s => this.renderSubstation(s))}</main>`;
    }
}
Designer.styles = css `
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
//# sourceMappingURL=oscd-designer-nogrid.js.map