/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
/* eslint-disable no-return-assign */
/* eslint-disable no-debugger */

import { LitElement, html, css, svg, nothing } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { query, state } from 'lit/decorators.js';

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

const sldNs = 'https://transpower.com/SCL/SSD/SLD/v0';
const gridSize = 25;

const dirs = ['E', 'S', 'W', 'N'] as const;

type Dir = (typeof dirs)[number];

type Attrs = {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: Dir;
  bus: boolean;
};

function direction(str: string | null): Dir {
  const dir = str?.toUpperCase();
  if (dirs.includes(dir as Dir)) return dir as Dir;
  return 'S';
}

function attributes(element: Element): Attrs {
  const [x, y, w, h] = ['x', 'y', 'w', 'h'].map(name =>
    parseInt(element.getAttributeNS(sldNs, name) ?? '1', 10)
  );
  const dir = direction(element.getAttributeNS(sldNs, 'dir'));
  const bus = ['true', '1'].includes(
    element.getAttributeNS(sldNs, 'bus')?.trim() ?? 'false'
  );

  return { x, y, w, h, bus, dir };
}

export default class Designer extends LitElement {
  @state()
  doc!: XMLDocument;

  @state()
  editCount = -1;

  @query('main > svg')
  svg!: SVGGraphicsElement;

  @state()
  get substation(): Element {
    return Array.from(this.doc.querySelectorAll(':root > Substation')).find(
      substation =>
        Array.from(substation.attributes)
          .map(a => a.value)
          .includes(sldNs)
    )!;
  }

  @state()
  mouseX = 0;

  @state()
  mouseY = 0;

  @state()
  paintingVoltageLevel?: { at?: [number, number] };

  svgCoordinates(clientX: number, clientY: number) {
    const p = new DOMPoint(clientX, clientY);
    const { x, y } = p.matrixTransform(this.svg.getScreenCTM()?.inverse());
    return [Math.floor(x), Math.floor(y)];
  }

  renderSubstation() {
    if (!this.substation) return nothing;

    const { w, h } = attributes(this.substation);

    return html`<p>${this.mouseX},${this.mouseY}</p>
      <svg
        id=${identity(this.substation)}
        viewBox="0 0 ${w} ${h}"
        width="${w * gridSize}"
        stroke-width="0.06"
        xmlns="http://www.w3.org/2000/svg"
        @mousemove=${(e: MouseEvent) => {
          const [x, y] = this.svgCoordinates(e.clientX, e.clientY);
          this.mouseX = x;
          this.mouseY = y;
        }}
      >
        ${symbols}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="transparent"
          stroke="lightgrey"
        />
        ${symbols} ${this.renderVoltageLevels()}
        ${this.paintingVoltageLevel
          ? svg`<rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"
        @click=${() =>
          this.paintingVoltageLevel!.at
            ? this.insertVoltageLevel()
            : (this.paintingVoltageLevel = {
                at: [this.mouseX, this.mouseY],
              })}/>`
          : nothing}
        ${this.paintingVoltageLevel?.at ? this.previewVoltageLevel() : nothing}
      </svg>`;
  }

  renderVoltageLevels() {
    const voltageLevels = Array.from(
      this.substation.querySelectorAll(':scope > VoltageLevel')
    );
    return voltageLevels.map(level => {
      const { x, y, w, h } = attributes(level);
      return svg`<g id="${identity(level)}">
          <text x="${x}" y="${
        y - 0.1
      }" style="font: 0.8px sans-serif;">${level.getAttribute('name')}</text>
          <rect x="${x}" y="${y}" width="${w}" height="${h}"
            fill="none" stroke="orange" />
        </g>`;
    });
  }

  previewVoltageLevel() {
    if (!this.paintingVoltageLevel?.at) return nothing;
    const [x, y] = this.paintingVoltageLevel.at;
    const [w, h] = [this.mouseX - x, this.mouseY - y].map(c =>
      Math.max(1, c + 1)
    );
    return svg`<rect x="${x}" y="${y}" width="${w}" height="${h}"
      fill="none" stroke="orange" stroke-dasharray="0.06" />`;
  }

  renderMenu() {
    return html`
      <menu>
        <li>
          <button @click=${() => this.resizeSubstation()}>Resize</button>
          <button @click=${() => this.paintVoltageLevel()}>V</button>
        </li>
      </menu>
    `;
  }

  render() {
    if (!this.substation)
      return html`<main>
        <button @click=${() => this.insertSubstation()}>
          New Single Line Diagram
        </button>
      </main>`;
    return html`<main>
        <h2>${this.substation.getAttribute('name')}</h2>
        ${this.renderSubstation()}
      </main>
      ${this.renderMenu()}`;
  }

  reset() {
    this.paintingVoltageLevel = undefined;
  }

  paintVoltageLevel() {
    this.reset();
    this.paintingVoltageLevel = {};
  }

  insertVoltageLevel() {
    if (!this.paintingVoltageLevel?.at) return;
    const name = prompt('name', '220kV') || '220kV';
    const node = this.doc.createElement('VoltageLevel');
    node.setAttribute('name', name);
    const parent = this.substation;
    const reference = getReference(parent, 'VoltageLevel');
    const [x, y] = this.paintingVoltageLevel.at;
    const [w, h] = [this.mouseX - x, this.mouseY - y].map(c =>
      Math.max(1, c + 1)
    );
    node.setAttributeNS(sldNs, 'x', x.toString());
    node.setAttributeNS(sldNs, 'y', y.toString());
    node.setAttributeNS(sldNs, 'w', w.toString());
    node.setAttributeNS(sldNs, 'h', h.toString());
    this.dispatchEvent(newEditEvent({ parent, node, reference }));
    this.reset();
  }

  resizeSubstation() {
    const { w: oldW, h: oldH } = attributes(this.substation);
    const w = prompt('width', oldW.toString()) || oldW.toString();
    const h = prompt('width', oldH.toString()) || oldH.toString();
    this.dispatchEvent(
      newEditEvent({
        element: this.substation,
        attributes: {
          w: { namespaceURI: sldNs, value: w },
          h: { namespaceURI: sldNs, value: h },
        },
      })
    );
  }

  insertSubstation() {
    const parent = this.doc.documentElement;
    const node = this.doc.createElement('Substation');
    const reference = getReference(parent, 'Substation');
    let index = 1;
    while (this.doc.querySelector(`:root > Substation[name="AA${index}"]`))
      index += 1;
    node.setAttribute('name', `AA${index}`);
    node.setAttribute('xmlns:esld', sldNs);
    node.setAttributeNS(sldNs, 'esld:w', '50');
    node.setAttributeNS(sldNs, 'esld:h', '25');
    this.dispatchEvent(newEditEvent({ parent, node, reference }));
  }

  static styles = css`
    menu {
      position: fixed;
      bottom: 20px;
      left: 20px;
      list-style-type: none;
      display: flex;
      padding: 0;
      margin: 0;
      gap: 5px;
      opacity: 50%;
    }

    main {
      padding: 16px;
    }

    main > svg {
      overflow: visible;
    }
  `;
}
