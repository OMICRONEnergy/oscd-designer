import { LitElement, html, css, svg, nothing } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { customElement, property, query, state } from 'lit/decorators.js';

import { newEditEvent } from '@openscd/open-scd-core';
// import { getReference, identity } from '@openscd/oscd-scl';

import type { Dialog } from '@material/mwc-dialog';
import type { TextField } from '@material/mwc-textfield';

import '@material/mwc-dialog';
import '@material/mwc-textfield';

import { symbols } from './icons.js';

type DialogCloseEvent = CustomEvent<{ action: string }>;

const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';

type Attrs = {
  pos: [number, number];
  dim: [number, number];
};

function attributes(element: Element): Attrs {
  const [x, y, w, h] = ['x', 'y', 'w', 'h'].map(name =>
    parseInt(element.getAttributeNS(sldNs, name) ?? '1', 10)
  );

  return { pos: [x, y], dim: [w, h] };
}

export type ResizeDetail = {
  w: number;
  h: number;
  element: Element;
};
export type ResizeEvent = CustomEvent<ResizeDetail>;
export function newResizeEvent(detail: ResizeDetail): ResizeEvent {
  return new CustomEvent('oscd-sld-resize', {
    bubbles: true,
    composed: true,
    detail,
  });
}

export type PlaceDetail = {
  x: number;
  y: number;
  element: Element;
  parent: Element;
};
export type PlaceEvent = CustomEvent<PlaceDetail>;
export function newPlaceEvent(detail: PlaceDetail): PlaceEvent {
  return new CustomEvent('oscd-sld-place', {
    bubbles: true,
    composed: true,
    detail,
  });
}
export type StartEvent = CustomEvent<Element>;
function newStartPlaceEvent(detail: Element): StartEvent {
  return new CustomEvent('oscd-sld-start-place', {
    bubbles: true,
    composed: true,
    detail,
  });
}
function newStartResizeEvent(detail: Element): StartEvent {
  return new CustomEvent('oscd-sld-start-resize', {
    bubbles: true,
    composed: true,
    detail,
  });
}
declare global {
  interface ElementEventMap {
    ['oscd-sld-resize']: ResizeEvent;
    ['oscd-sld-place']: PlaceEvent;
    ['oscd-sld-start-resize']: StartEvent;
    ['oscd-sld-start-place']: StartEvent;
  }
}

@customElement('sld-editor')
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export class SLDEditor extends LitElement {
  @property()
  doc!: XMLDocument;

  @property()
  substation!: Element;

  @property()
  editCount = -1;

  @property()
  gridSize = 24;

  @state()
  placing?: Element;

  @state()
  resizing?: Element;

  @query('#resizeSubstationUI')
  resizeSubstationUI!: Dialog;

  @query('#substationWidthUI')
  substationWidthUI!: TextField;

  @query('#substationHeightUI')
  substationHeightUI!: TextField;

  @query('svg#sld')
  sld!: SVGGraphicsElement;

  @state()
  mouseX = 0;

  @state()
  mouseY = 0;

  svgCoordinates(clientX: number, clientY: number) {
    const p = new DOMPoint(clientX, clientY);
    const { x, y } = p.matrixTransform(this.sld.getScreenCTM()?.inverse());
    return [Math.floor(x), Math.floor(y)];
  }

  resizeSubstation({ detail: { action } }: DialogCloseEvent) {
    if (action !== 'resize') return;
    const {
      dim: [oldW, oldH],
    } = attributes(this.substation);
    const [w, h] = [this.substationWidthUI, this.substationHeightUI].map(ui =>
      parseInt(ui.value ?? '1', 10).toString()
    );

    if (w === oldW.toString() && h === oldH.toString()) return;
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

  firstUpdated() {
    if (
      Array.from(this.substation.attributes)
        .concat(Array.from(this.doc.documentElement.attributes))
        .find(a => a.value === sldNs)
    )
      return;
    this.dispatchEvent(
      newEditEvent({
        element: this.substation,
        attributes: {
          'xmlns:esld': {
            value: sldNs,
            namespaceURI: 'http://www.w3.org/2000/xmlns/',
          },
        },
      })
    );
  }

  render() {
    const {
      dim: [w, h],
    } = attributes(this.substation);
    const placingTarget =
      this.placing?.tagName === 'VoltageLevel' ||
      this.resizing?.tagName === 'VoltageLevel'
        ? svg`<rect width="100%" height="100%" fill="url(#grid)"></rect>
        ${this.placing ? this.renderVoltageLevel(this.placing) : nothing}
      `
        : nothing;
    return html`<h2>
        ${this.substation.getAttribute('name')}
        <mwc-icon-button
          label="Resize Substation"
          @click=${() => this.resizeSubstationUI.show()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 96 960 960"
            width="24"
          >
            <path
              fill="black"
              opacity="0.83"
              d="M120 616v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm160 0v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160V296H600v-80h240v240h-80ZM120 936V696h80v160h160v80H120Z"
            />
          </svg>
        </mwc-icon-button>
      </h2>

      <svg
        id="sld"
        viewBox="0 0 ${w} ${h}"
        width="${w * this.gridSize}"
        height="${h * this.gridSize}"
        stroke-width="0.1"
        fill="none"
        @mousemove=${(e: MouseEvent) => {
          const [x, y] = this.svgCoordinates(e.clientX, e.clientY);
          this.mouseX = x;
          this.mouseY = y;
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
          :focus-within > .handle,
          .handle:hover {
            visibility: visible;
          }
        </style>
        ${symbols}
        <rect width="100%" height="100%" fill="white"></rect>
        ${placingTarget}
        ${Array.from(this.substation.children)
          .filter(child => child.tagName === 'VoltageLevel')
          .map(vl => this.renderVoltageLevel(vl))}
      </svg>
      <mwc-dialog
        id="resizeSubstationUI"
        heading="Resize ${this.substation.getAttribute('name')}"
        @closed=${(event: DialogCloseEvent) => this.resizeSubstation(event)}
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
          ></mwc-textfield>
          <mwc-textfield
            id="substationHeightUI"
            type="number"
            min="1"
            step="1"
            label="Height"
            value="${h}"
          ></mwc-textfield>
        </div>
        <mwc-button dialogAction="resize" slot="primaryAction"
          >resize</mwc-button
        >
        <mwc-button dialogAction="close" slot="secondaryAction"
          >cancel</mwc-button
        >
      </mwc-dialog>`;
  }

  renderVoltageLevel(voltageLevel: Element) {
    const attrs = attributes(voltageLevel);
    const title = voltageLevel.getAttribute('name') || 'UNNAMED VL';
    let {
      pos: [x, y],
      dim: [w, h],
    } = attrs;
    let handleClick: (() => void) | undefined;

    if (this.resizing === voltageLevel) {
      w = Math.max(1, this.mouseX - x + 1);
      h = Math.max(1, this.mouseY - y + 1);
      handleClick = () => {
        this.dispatchEvent(
          newResizeEvent({
            w,
            h,
            element: voltageLevel,
          })
        );
      };
    }

    if (this.placing === voltageLevel) {
      x = this.mouseX;
      y = this.mouseY;
      handleClick = () => {
        this.dispatchEvent(
          newPlaceEvent({
            x,
            y,
            element: voltageLevel,
            parent: this.substation,
          })
        );
      };
    }

    let moveHandle = svg``;
    let resizeHandle = svg``;

    if (this.placing === voltageLevel)
      moveHandle = svg`
      <foreignObject x="${x + 1.2}" y="${
        y - 0.2
      }" width="1" height="1" style="pointer-events: none; overflow: visible;">
        <div style="width: 1px; height: 1px; font-size: 0.6px; overflow: visible; font-family: 'Roboto', sans-serif;">
        (${x},${y})
        </div>
      </foreignObject>
    `;
    else if (!this.placing && !this.resizing)
      moveHandle = svg`
<a class="handle" href="#0" @click=${() =>
        this.dispatchEvent(newStartPlaceEvent(voltageLevel))}>
  <svg xmlns="http://www.w3.org/2000/svg" height="1" viewBox="0 96 960 960" width="1" x="${x}" y="${y}">
    <rect pointer-events="all" fill="white" x="10%" y="20%" width="80%" height="80%"></rect>
    <path opacity="0.83" fill="black" d="M480 976 310 806l57-57 73 73V616l-205-1 73 73-58 58L80 576l169-169 57 57-72 72h206V330l-73 73-57-57 170-170 170 170-57 57-73-73v206l205 1-73-73 58-58 170 170-170 170-57-57 73-73H520l-1 205 73-73 58 58-170 170Z"/>
  </svg>
</a>
    `;

    if (this.resizing === voltageLevel)
      resizeHandle = svg`
      <foreignObject x="${w + x + 0.2}" y="${
        h + y - 1.2
      }" width="1" height="1" style="pointer-events: none; overflow: visible;">
        <div style="width: 1px; height: 1px; font-size: 0.6px; overflow: visible; font-family: 'Roboto', sans-serif;">
        (${w}x${h})
        </div>
      </foreignObject>
    `;
    else if (!this.placing && !this.resizing)
      resizeHandle = svg`
<a class="handle" href="#0" @click=${() =>
        this.dispatchEvent(newStartResizeEvent(voltageLevel))}>
  <svg xmlns="http://www.w3.org/2000/svg" height="1" viewBox="0 96 960 960" width="1" x="${
    w + x - 1
  }" y="${h + y - 1}">
    <rect pointer-events="all" fill="white" x="10%" y="20%" width="80%" height="80%"></rect>
    <path fill="black" opacity="0.83" d="M120 616v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm160 0v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160V296H600v-80h240v240h-80ZM120 936V696h80v160h160v80H120Z"/>
  </svg>
</a>
      `;

    return svg`<g class="voltagelevel" tabindex="0" pointer-events="all" style="outline: none;">
      <rect pointer-events="all"
    @click=${
      handleClick || nothing
    } x="${x}" y="${y}" width="${w}" height="${h}" fill="white" stroke="#F5E214" stroke-width="0.06"></rect>
      ${moveHandle}
      ${resizeHandle}
      <text x="${x + 0.1}" y="${
      y - 0.2
    }" fill="black" style="font: 0.6px sans-serif;" pointer-events="all">${title}</text>
    </g>`;
  }

  static styles = css`
    h2 {
      font-family: Roboto;
      font-weight: 400;
      font-size: 24px;
      margin-bottom: 4px;
    }
    mwc-icon-button {
      --mdc-icon-button-size: 28px;
      --mdc-icon-size: 24px;
    }
  `;
}
