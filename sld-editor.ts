import { css, html, nothing, LitElement, svg, TemplateResult } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ref } from 'lit/directives/ref.js';

import { newEditEvent } from '@openscd/open-scd-core';

import type { Dialog } from '@material/mwc-dialog';
import type { SingleSelectedEvent } from '@material/mwc-list';
import type { TextField } from '@material/mwc-textfield';

import '@material/mwc-dialog';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item.js';
import '@material/mwc-textfield';

import { identity } from '@openscd/oscd-scl';
import { equipmentGraphic, movePath, resizePath, symbols } from './icons.js';
import { attributes, sldNs } from './util.js';

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

type Rect = [number, number, number, number];

function contains([x1, y1, w1, h1]: Rect, [x2, y2, w2, h2]: Rect) {
  return x1 <= x2 && y1 <= y2 && x1 + w1 >= x2 + w2 && y1 + h1 >= y2 + h2;
}

function overlaps([x1, y1, w1, h1]: Rect, [x2, y2, w2, h2]: Rect) {
  if (x1 >= x2 + w2 || x2 >= x1 + w1) return false;
  if (y1 >= y2 + h2 || y2 >= y1 + h1) return false;
  return true;
}

function containsRect(
  element: Element,
  x0: number,
  y0: number,
  w0: number,
  h0: number
): boolean {
  const {
    pos: [x, y],
    dim: [w, h],
  } = attributes(element);
  return contains([x, y, w, h], [x0, y0, w0, h0]);
}

function overlapsRect(
  element: Element,
  x0: number,
  y0: number,
  w0: number,
  h0: number
): boolean {
  const {
    pos: [x, y],
    dim: [w, h],
  } = attributes(element);
  return overlaps([x, y, w, h], [x0, y0, w0, h0]);
}

const parentTags: Partial<Record<string, string>> = {
  ConductingEquipment: 'Bay',
  Bay: 'VoltageLevel',
  VoltageLevel: 'Substation',
};

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

  @state()
  menu?: { element: Element; top: number; left: number };

  svgCoordinates(clientX: number, clientY: number) {
    const p = new DOMPoint(clientX, clientY);
    const { x, y } = p.matrixTransform(this.sld.getScreenCTM()!.inverse());
    return [x, y].map(coord => Math.max(0, Math.floor(coord)));
  }

  canPlaceAt(element: Element, x: number, y: number, w: number, h: number) {
    if (element.tagName === 'Substation') return true;

    const overlappingSibling = Array.from(
      this.substation.querySelectorAll(element.tagName)
    ).find(sibling => sibling !== element && overlapsRect(sibling, x, y, w, h));
    if (overlappingSibling) {
      return false;
    }

    const containingParent =
      element.tagName === 'VoltageLevel'
        ? containsRect(this.substation, x, y, w, h)
        : Array.from(
            this.substation.querySelectorAll(parentTags[element.tagName]!)
          ).find(parent => containsRect(parent, x, y, w, h));
    if (containingParent) return true;
    return false;
  }

  canResizeTo(element: Element, w: number, h: number) {
    const {
      pos: [x, y],
      dim: [oldW, oldH],
    } = attributes(element);

    if (
      !this.canPlaceAt(element, x, y, w, h) &&
      this.canPlaceAt(element, x, y, oldW, oldH)
    )
      return false;

    const lostChild = Array.from(element.children).find(child => {
      if (parentTags[child.tagName] !== element.tagName) return false;
      const {
        pos: [cx, cy],
        dim: [cw, ch],
      } = attributes(child);

      return !contains([x, y, w, h], [cx, cy, cw, ch]);
    });
    if (lostChild) return false;

    return true;
  }

  renderedPosition(container: Element): [number, number] {
    let {
      pos: [x, y],
    } = attributes(container);
    if (
      this.placing &&
      container.closest(this.placing.tagName) === this.placing
    ) {
      const {
        pos: [parentX, parentY],
      } = attributes(this.placing);
      x += this.mouseX - parentX;
      y += this.mouseY - parentY;
    }
    return [x, y];
  }

  firstUpdated() {
    if (
      Array.from(this.substation.attributes)
        .concat(Array.from(this.doc.documentElement.attributes))
        .find(a => a.value === sldNs && a.name === 'xmlns:esld')
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

  handleKeydown = ({ key }: KeyboardEvent) => {
    if (key === 'Escape') this.menu = undefined;
  };

  handleClick = (_e: MouseEvent) => {
    this.menu = undefined;
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('click', this.handleClick);
  }

  render() {
    const {
      dim: [w, h],
    } = attributes(this.substation);

    const placingTarget =
      this.placing?.tagName === 'VoltageLevel'
        ? svg`<rect width="100%" height="100%" fill="url(#grid)"></rect>
      `
        : nothing;

    let placingElement = svg``;
    if (this.placing) {
      if (
        this.placing.tagName === 'VoltageLevel' ||
        this.placing.tagName === 'Bay'
      )
        placingElement = svg`${this.renderContainer(this.placing, true)}`;
      else if (this.placing.tagName === 'ConductingEquipment')
        placingElement = this.renderEquipment(this.placing, true);
    }

    let placingIndicator = svg``;
    if (this.placing) {
      const {
        dim: [w0, h0],
      } = attributes(this.placing);
      const invalid = !this.canPlaceAt(
        this.placing,
        this.mouseX,
        this.mouseY,
        w0,
        h0
      );
      placingIndicator = svg`
      <foreignObject x="${this.mouseX + 1}" y="${this.mouseY}"
          width="1" height="1" class="preview"
          style="pointer-events: none; overflow: visible;">
        <span class="${classMap({ indicator: true, invalid })}">
        (${this.mouseX},${this.mouseY})
        </span>
      </foreignObject>
    `;
    }
    let resizingIndicator = svg``;
    if (this.resizing) {
      const {
        pos: [x, y],
      } = attributes(this.resizing);
      const newW = Math.max(1, this.mouseX - x + 1);
      const newH = Math.max(1, this.mouseY - y + 1);
      const invalid = !this.canResizeTo(this.resizing, newW, newH);
      resizingIndicator = svg`
      <foreignObject x="${this.mouseX + 1}" y="${this.mouseY}"
        width="1" height="1" class="preview"
        style="pointer-events: none; overflow: visible;">
        <span class="${classMap({ indicator: true, invalid })}">
        (${newW}&times;${newH})
        </span>
      </foreignObject>
    `;
    }

    let menu = html``;
    if (this.menu) {
      const { element } = this.menu;
      const [name, type, desc] = ['name', 'type', 'desc'].map(
        attr => element.getAttribute(attr) ?? ''
      );
      menu = html`
        <menu
          style="position: fixed; top: ${this.menu.top}px; left: ${this.menu
            .left}px; background: var(--oscd-base3, white); margin: 0px; padding: 0px; box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23); --mdc-list-vertical-padding: 0px;"
          ${ref(async (m?: Element) => {
            if (!(m instanceof HTMLElement)) return;
            await this.updateComplete;
            const { bottom, right } = m.getBoundingClientRect();
            if (bottom > window.innerHeight) {
              m.style.removeProperty('top');
              // eslint-disable-next-line no-param-reassign
              m.style.bottom = '0px';
            }
            if (right > window.innerWidth) {
              m.style.removeProperty('left');
              // eslint-disable-next-line no-param-reassign
              m.style.right = '0px';
            }
          })}
        >
          <mwc-list
            @selected=${({ detail: { index } }: SingleSelectedEvent) => {
              const { flip, rot } = attributes(element);
              [
                () => {
                  this.dispatchEvent(
                    newEditEvent({
                      element,
                      attributes: {
                        'esld:flip': {
                          namespaceURI: sldNs,
                          value: flip ? null : 'true',
                        },
                      },
                    })
                  );
                },
                () => {
                  this.dispatchEvent(
                    newEditEvent({
                      element,
                      attributes: {
                        'esld:rot': {
                          namespaceURI: sldNs,
                          value: ((rot + 1) % 4).toString(),
                        },
                      },
                    })
                  );
                },
                () => this.dispatchEvent(newStartPlaceEvent(element)),
              ][index]();
              this.menu = undefined;
            }}
          >
            <mwc-list-item graphic="icon">
              <span>Mirror</span>
              <mwc-icon slot="graphic">flip</mwc-icon>
            </mwc-list-item>
            <mwc-list-item graphic="icon">
              <span>Rotate</span>
              <mwc-icon slot="graphic">rotate_90_degrees_cw</mwc-icon>
            </mwc-list-item>
            <mwc-list-item graphic="icon">
              <span>Move</span>
              <mwc-icon slot="graphic">drag_pan</mwc-icon>
            </mwc-list-item>
            <li divider role="separator"></li>
            <mwc-list-item twoline graphic="avatar" noninteractive>
              <span>${name}</span>
              <span slot="secondary">${type}${desc}</span>
              ${equipmentGraphic(type)}
            </mwc-list-item>
          </mwc-list>
        </menu>
      `;
    }

    return html`<section>
      <h2>
        ${this.substation.getAttribute('name')}
        <mwc-icon-button
          label="Resize Substation"
          @click=${() => this.resizeSubstationUI.show()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 96 960 960"
          >
            ${resizePath}
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
          .indicator {
            font-size: 0.6px;
            overflow: visible;
            font-family: 'Roboto', sans-serif;
            background: white;
            color: #2b2b2b;
          }
          .indicator.invalid {
            color: #bb1326;
          }
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
          rect {
            shape-rendering: crispEdges;
          }
          section:not(:hover) .preview {
            visibility: hidden;
          }
          .preview {
            opacity: 0.8;
          }
        </style>
        ${symbols}
        <rect width="100%" height="100%" fill="white"></rect>
        ${placingTarget}
        ${Array.from(this.substation.children)
          .filter(child => child.tagName === 'VoltageLevel')
          .map(vl => svg`${this.renderContainer(vl)}`)}
        ${placingElement} ${placingIndicator} ${resizingIndicator}
      </svg>
      ${menu}
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
            .validityTransform=${(value: string, validity: ValidityState) => {
              const {
                dim: [_w, oldH],
              } = attributes(this.substation);
              if (
                validity.valid &&
                !this.canResizeTo(this.substation, parseInt(value, 10), oldH)
              ) {
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
            .validityTransform=${(value: string, validity: ValidityState) => {
              const {
                dim: [oldW, _h],
              } = attributes(this.substation);
              if (
                validity.valid &&
                !this.canResizeTo(this.substation, oldW, parseInt(value, 10))
              ) {
                return { valid: false, rangeUnderflow: true };
              }
              return {};
            }}
          ></mwc-textfield>
        </div>
        <mwc-button
          slot="primaryAction"
          @click=${() => {
            const valid = Array.from(
              this.resizeSubstationUI.querySelectorAll('mwc-textfield')
            ).every(textField => textField.checkValidity());
            if (!valid) return;
            const {
              dim: [oldW, oldH],
            } = attributes(this.substation);
            const [newW, newH] = [
              this.substationWidthUI,
              this.substationHeightUI,
            ].map(ui => parseInt(ui.value ?? '1', 10).toString());
            this.resizeSubstationUI.close();
            if (newW === oldW.toString() && newH === oldH.toString()) return;
            this.dispatchEvent(
              newEditEvent({
                element: this.substation,
                attributes: {
                  'esld:w': { namespaceURI: sldNs, value: newW },
                  'esld:h': { namespaceURI: sldNs, value: newH },
                },
              })
            );
          }}
          >resize</mwc-button
        >
        <mwc-button dialogAction="close" slot="secondaryAction"
          >cancel</mwc-button
        >
      </mwc-dialog>
    </section>`;
  }

  renderContainer(bayOrVL: Element, preview = false): TemplateResult<2> {
    const name = bayOrVL.getAttribute('name') ?? '';
    const isVL = bayOrVL.tagName === 'VoltageLevel';
    if (this.placing === bayOrVL && !preview) return svg``;
    /*
    const preview =
      this.placing !== undefined &&
      bayOrVL.closest(this.placing.tagName) === this.placing;
     */
    const [x, y] = this.renderedPosition(bayOrVL);
    let {
      dim: [w, h],
    } = attributes(bayOrVL);
    let handleClick: (() => void) | undefined;
    let invalid = false;

    if (this.resizing === bayOrVL) {
      w = Math.max(1, this.mouseX - x + 1);
      h = Math.max(1, this.mouseY - y + 1);
      if (this.canResizeTo(bayOrVL, w, h))
        handleClick = () => {
          this.dispatchEvent(
            newResizeEvent({
              w,
              h,
              element: bayOrVL,
            })
          );
        };
      else invalid = true;
    }

    if (this.placing === bayOrVL) {
      let parent: Element | undefined;
      if (isVL) parent = this.substation;
      else
        parent = Array.from(
          this.substation.querySelectorAll(':root > Substation > VoltageLevel')
        ).find(vl => containsRect(vl, x, y, w, h));
      if (parent && this.canPlaceAt(bayOrVL, x, y, w, h))
        handleClick = () => {
          this.dispatchEvent(
            newPlaceEvent({
              x,
              y,
              element: bayOrVL,
              parent: parent!,
            })
          );
        };
      else invalid = true;
    }

    let moveHandle = svg``;
    let resizeHandle = svg``;
    let placingTarget = svg``;
    if (
      this.resizing === bayOrVL ||
      (isVL && this.placing?.tagName === 'Bay') ||
      (!isVL && this.placing?.tagName === 'ConductingEquipment')
    )
      placingTarget = svg`<rect x="${x}" y="${y}" width="${w}" height="${h}"
        @click=${handleClick || nothing} fill="url(#grid)"></rect>`;

    if (!this.placing && !this.resizing)
      moveHandle = svg`
<a class="handle" href="#0" @click=${() =>
        this.dispatchEvent(newStartPlaceEvent(bayOrVL))}>
  <svg xmlns="http://www.w3.org/2000/svg" height="1" width="1"
    viewBox="0 96 960 960" x="${x}" y="${y}">
    <rect fill="white" x="10%" y="20%" width="80%" height="80%"></rect>
    ${movePath}
  </svg>
</a>
    `;

    if (!this.placing && !this.resizing)
      resizeHandle = svg`
<a class="handle" href="#0" @click=${() =>
        this.dispatchEvent(newStartResizeEvent(bayOrVL))}>
  <svg xmlns="http://www.w3.org/2000/svg" height="1" width="1"
    viewBox="0 96 960 960" x="${w + x - 1}" y="${h + y - 1}">
    <rect fill="white" x="10%" y="20%" width="80%" height="80%"></rect>
    ${resizePath}
  </svg>
</a>
      `;

    return svg`<g class=${classMap({
      voltagelevel: isVL,
      bay: !isVL,
      preview,
    })} tabindex="0" pointer-events="all" style="outline: none;">
      <rect
    @click=${
      handleClick || nothing
    } x="${x}" y="${y}" width="${w}" height="${h}"
      fill="white" stroke-dasharray="${isVL ? nothing : '0.18'}" stroke="${
      // eslint-disable-next-line no-nested-ternary
      invalid ? '#BB1326' : isVL ? '#F5E214' : '#12579B'
    }" stroke-width="0.06"></rect>
      <text x="${x + 0.1}" y="${y - 0.2}" fill="#2b2b2b" pointer-events="none"
      style="font: 0.6px sans-serif;">${name}</text>
      ${moveHandle}
      ${Array.from(bayOrVL.children)
        .filter(child => child.tagName === 'Bay')
        .map(bay => this.renderContainer(bay))}
      ${Array.from(bayOrVL.children)
        .filter(child => child.tagName === 'ConductingEquipment')
        .map(equipment => this.renderEquipment(equipment))}
      ${placingTarget}
      ${resizeHandle}
    </g>`;
  }

  renderEquipment(equipment: Element, preview = false) {
    if (this.placing === equipment && !preview) return svg``;

    const [x, y] = this.renderedPosition(equipment);
    const { flip, rot } = attributes(equipment);
    const deg = 90 * rot;

    const eqType = equipment.getAttribute('type')!;
    const symbol = ['CBR', 'CTR', 'VTR', 'DIS', 'IFL'].includes(eqType)
      ? eqType
      : 'ConductingEquipment';

    let handleClick = () => {
      this.dispatchEvent(newStartPlaceEvent(equipment));
    };

    if (this.placing === equipment) {
      const parent = Array.from(
        this.substation.querySelectorAll(
          ':root > Substation > VoltageLevel > Bay'
        )
      ).find(vl => containsRect(vl, x, y, 1, 1));
      if (parent && this.canPlaceAt(equipment, x, y, 1, 1))
        handleClick = () => {
          this.dispatchEvent(
            newPlaceEvent({
              x,
              y,
              element: equipment,
              parent,
            })
          );
        };
    }

    const id = equipment.parentElement ? identity(equipment) : nothing;

    return svg`<g class="${classMap({
      equipment: true,
      preview: this.placing === equipment,
    })}"
    id="${id}"
    transform="translate(${x} ${y}) rotate(${deg})${
      flip ? ' scale(-1,1)' : ''
    }" transform-origin="0.5 0.5">
      <title>${equipment.getAttribute('name')}</title>
      <use href="#${symbol}" />
      <rect width="1" height="1" fill="none" pointer-events="all"
        @click=${handleClick}
        @auxclick=${({ button }: MouseEvent) => {
          if (button === 1)
            // middle mouse button
            this.dispatchEvent(
              newEditEvent({
                element: equipment,
                attributes: {
                  'esld:rot': {
                    namespaceURI: sldNs,
                    value: ((rot + 1) % 4).toString(),
                  },
                },
              })
            );
        }}
        @contextmenu=${(e: MouseEvent) => {
          this.menu = { element: equipment, left: e.clientX, top: e.clientY };
          e.preventDefault();
        }}
        />
    </g>`;
  }

  static styles = css`
    h2 {
      font-family: Roboto;
      font-weight: 300;
      font-size: 24px;
      margin-bottom: 4px;
      --mdc-icon-button-size: 28px;
      --mdc-icon-size: 24px;
    }
  `;
}
