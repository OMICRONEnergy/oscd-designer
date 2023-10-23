import { css, html, nothing, LitElement, svg, TemplateResult } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ref } from 'lit/directives/ref.js';

import { Edit, newEditEvent } from '@openscd/open-scd-core';

import type { Dialog } from '@material/mwc-dialog';
import type { SingleSelectedEvent } from '@material/mwc-list';
import type { TextField } from '@material/mwc-textfield';

import '@material/mwc-dialog';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item.js';
import '@material/mwc-textfield';

import { getReference, identity } from '@openscd/oscd-scl';
import { equipmentGraphic, movePath, resizePath, symbols } from './icons.js';
import {
  attributes,
  connectionStartPoints,
  elementPath,
  newConnectEvent,
  newPlaceEvent,
  newResizeEvent,
  newRotateEvent,
  newStartConnectEvent,
  newStartPlaceEvent,
  newStartResizeEvent,
  Point,
  privType,
  removeTerminal,
  sldNs,
  svgNs,
} from './util.js';

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

function cleanPath(path: Point[]) {
  let i = path.length - 2;
  while (i > 0) {
    const [x, y] = path[i];
    const [nx, ny] = path[i + 1];
    const [px, py] = path[i - 1];

    if (
      (x === nx && y === ny) ||
      (x === nx && x === px) ||
      (y === ny && y === py)
    )
      path.splice(i, 1);
    i -= 1;
  }
}

const parentTags: Partial<Record<string, string>> = {
  ConductingEquipment: 'Bay',
  Bay: 'VoltageLevel',
  VoltageLevel: 'Substation',
};

const singleTerminal = new Set([
  'VTR',
  'GEN',
  'MOT',
  'FAN',
  'PMP',
  'EFN',
  'BAT',
  'RRC',
  'SAR',
  'SMC',
  'IFL',
]);

function renderMenuFooter(element: Element) {
  const [name, type] = ['name', 'type'].map(
    attr => element.getAttribute(attr) ?? ''
  );
  return html`<mwc-list-item twoline graphic="avatar" noninteractive>
    <span>${name}</span>
    <span slot="secondary">${type}</span>
    ${equipmentGraphic(type)}
  </mwc-list-item>`;
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
  gridSize = 32;

  @property()
  nsp = 'esld';

  @property()
  placing?: Element;

  @property()
  resizing?: Element;

  @property()
  connecting?: {
    equipment: Element;
    path: Point[];
    terminal: 'top' | 'bottom';
  };

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
  mouseX2 = 0;

  @state()
  mouseY2 = 0;

  @state()
  menu?: { element: Element; top: number; left: number };

  svgCoordinates(clientX: number, clientY: number) {
    const p = new DOMPoint(clientX, clientY);
    const { x, y } = p.matrixTransform(this.sld.getScreenCTM()!.inverse());
    return [x, y].map(coord => Math.max(0, coord));
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

  renderedPosition(container: Element): Point {
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

  nearestOpenTerminal(equipment?: Element): 'top' | 'bottom' | undefined {
    if (!equipment) return undefined;
    const topTerminal = equipment.querySelector('Terminal[name="T1"]');
    const bottomTerminal = equipment.querySelector('Terminal:not([name="T1"])');
    const oneSided = singleTerminal.has(equipment.getAttribute('type')!);
    if (topTerminal && bottomTerminal) return undefined;
    if (oneSided && (topTerminal || bottomTerminal)) return undefined;
    if (oneSided) return 'top';
    if (topTerminal) return 'bottom';
    if (bottomTerminal) return 'top';

    const [mX2, mY2] = [this.mouseX2, this.mouseY2].map(n => n % 1);
    const { rot } = attributes(equipment);
    if (rot === 0 && mY2 === 0.5) return 'bottom';
    if (rot === 1 && mX2 === 0) return 'bottom';
    if (rot === 2 && mY2 === 0) return 'bottom';
    if (rot === 3 && mX2 === 0.5) return 'bottom';
    return 'top';
  }

  groundTerminal(equipment: Element, name: 'T1' | 'T2') {
    const bay = equipment.closest('Bay')!;
    const edits: Edit[] = [];
    let grounded = bay.querySelector(
      ':scope > ConnectivityNode[name="grounded"]'
    );
    let pathName = grounded?.getAttribute('pathName');
    if (!pathName) {
      pathName = elementPath(equipment.closest('Bay'), 'grounded');
      grounded = this.doc.createElementNS(
        this.doc.documentElement.namespaceURI,
        'ConnectivityNode'
      );
      grounded.setAttribute('name', 'grounded');
      grounded.setAttribute('pathName', pathName);
      edits.push({
        parent: bay,
        node: grounded,
        reference: getReference(bay, 'ConnectivityNode'),
      });
    }
    const terminal = this.doc.createElementNS(
      this.doc.documentElement.namespaceURI,
      'Terminal'
    );
    terminal.setAttribute('name', name);
    terminal.setAttribute('cNodeName', 'grounded');
    const sName = equipment.closest('Substation')!.getAttribute('name');
    if (sName) terminal.setAttribute('substationName', sName);
    const vlName = equipment.closest('VoltageLevel')!.getAttribute('name');
    if (vlName) terminal.setAttribute('voltageLevelName', vlName);
    const bName = equipment.closest('Bay')!.getAttribute('name');
    if (bName) terminal.setAttribute('bayName', bName);
    terminal.setAttribute('connectivityNode', pathName);
    edits.push({
      parent: equipment,
      node: terminal,
      reference: getReference(equipment, 'Terminal'),
    });
    this.dispatchEvent(newEditEvent(edits));
  }

  flipElement(element: Element) {
    const { flip } = attributes(element);
    this.dispatchEvent(
      newEditEvent({
        element,
        attributes: {
          [`${this.nsp}:flip`]: {
            namespaceURI: sldNs,
            value: flip ? null : 'true',
          },
        },
      })
    );
  }

  renderMenu() {
    if (!this.menu) return html``;
    const { element } = this.menu;

    const items: { handler: () => void; content: TemplateResult }[] = [
      {
        content: html`<mwc-list-item graphic="icon">
          <span>Mirror</span>
          <mwc-icon slot="graphic">flip</mwc-icon>
        </mwc-list-item>`,
        handler: () => this.flipElement(element),
      },
      {
        content: html`<mwc-list-item graphic="icon">
          <span>Rotate</span>
          <mwc-icon slot="graphic">rotate_90_degrees_cw</mwc-icon>
        </mwc-list-item>`,
        handler: () => {
          this.dispatchEvent(newRotateEvent(element));
        },
      },
      {
        content: html`<mwc-list-item graphic="icon">
          <span>Move</span>
          <mwc-icon slot="graphic">drag_pan</mwc-icon>
        </mwc-list-item>`,
        handler: () => this.dispatchEvent(newStartPlaceEvent(element)),
      },
    ];

    const { rot } = attributes(element);
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
    const icon = (kind: 'connect' | 'ground' | 'disconnect', top: boolean) =>
      icons[kind][top ? rot % 4 : (rot + 2) % 4];
    const text = (kind: 'connect' | 'ground' | 'disconnect', top: boolean) =>
      texts[kind][top ? rot % 4 : (rot + 2) % 4];
    const item = (kind: 'connect' | 'ground' | 'disconnect', top: boolean) =>
      html`<mwc-list-item graphic="icon">
        <span>${text(kind, top)}</span>
        <mwc-icon slot="graphic">${icon(kind, top)}</mwc-icon>
      </mwc-list-item>`;

    const topTerminal = element.querySelector('Terminal[name="T1"]');
    const bottomTerminal = element.querySelector('Terminal:not([name="T1"])');

    if (!singleTerminal.has(element.getAttribute('type')!)) {
      if (bottomTerminal)
        items.unshift({
          handler: () =>
            this.dispatchEvent(newEditEvent(removeTerminal(bottomTerminal))),
          content: item('disconnect', false),
        });
      else
        items.unshift(
          {
            handler: () =>
              this.dispatchEvent(
                newStartConnectEvent({ equipment: element, terminal: 'bottom' })
              ),
            content: item('connect', false),
          },
          {
            handler: () => this.groundTerminal(element, 'T2'),
            content: item('ground', false),
          }
        );
    }
    if (topTerminal)
      items.unshift({
        handler: () =>
          this.dispatchEvent(newEditEvent(removeTerminal(topTerminal))),
        content: item('disconnect', true),
      });
    else
      items.unshift(
        {
          handler: () =>
            this.dispatchEvent(
              newStartConnectEvent({ equipment: element, terminal: 'top' })
            ),
          content: item('connect', true),
        },
        {
          handler: () => this.groundTerminal(element, 'T1'),
          content: item('ground', true),
        }
      );

    return html`
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
            items[index]?.handler();
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
    const {
      dim: [w, h],
    } = attributes(this.substation);

    const placingTarget =
      this.placing?.tagName === 'VoltageLevel'
        ? svg`<rect width="100%" height="100%" fill="url(#grid)"></rect>`
        : nothing;

    let placingElement = svg``;
    if (this.placing) {
      if (
        this.placing.tagName === 'VoltageLevel' ||
        this.placing.tagName === 'Bay'
      )
        placingElement = svg`${this.renderContainer(this.placing, true)}`;
      else if (this.placing.tagName === 'ConductingEquipment')
        placingElement = this.renderEquipment(this.placing, { preview: true });
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

    const connectionPreview = [];
    if (this.connecting) {
      const { equipment, path, terminal } = this.connecting;
      let i = 0;
      while (i < path.length - 2) {
        const [x1, y1] = path[i];
        const [x2, y2] = path[i + 1];
        connectionPreview.push(
          svg`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke-linecap="square" stroke="black" stroke-width="0.06" />`
        );
        i += 1;
      }

      const [[x1, y1], [oldX2, oldY2]] = path.slice(-2);
      const vertical = x1 === oldX2;

      let x3 = this.mouseX + 0.5;
      let y3 = this.mouseY + 0.5;
      let [x4, y4] = [x3, y3];

      const targetEq = Array.from(
        this.substation.querySelectorAll('ConductingEquipment')
      )
        .filter(eq => eq !== equipment)
        .find(eq => {
          const {
            pos: [x, y],
          } = attributes(eq);
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

      connectionPreview.push(
        svg`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke-linecap="square" stroke="black" stroke-width="0.06" />`,
        svg`<line x1="${x2}" y1="${y2}" x2="${x3}" y2="${y3}"
                stroke-linecap="square" stroke="black" stroke-width="0.06" />`,
        svg`<line x1="${x3}" y1="${y3}" x2="${x4}" y2="${y4}"
                stroke-linecap="square" stroke="black" stroke-width="0.06" />`
      );
      connectionPreview.push(
        svg`<rect width="100%" height="100%" fill="url(#grid)"
      @click=${() => {
        path[path.length - 1] = [x2, y2];
        path.push([x3, y3]);
        path.push([x4, y4]);
        cleanPath(path);
        this.requestUpdate();
        if (targetEq && toTerminal)
          this.dispatchEvent(
            newConnectEvent({
              equipment,
              terminal,
              path,
              connectTo: targetEq,
              toTerminal,
            })
          );
      }}></rect>`
      );
    }

    const menu = this.renderMenu();

    return html`<section>
      <h2>
        ${this.substation.getAttribute('name')}
        <mwc-icon-button
          label="Resize Substation"
          @click=${() => this.resizeSubstationUI.show()}
        >
          <svg xmlns="${svgNs}" width="24" height="24" viewBox="0 96 960 960">
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
          this.mouseX = Math.floor(x);
          this.mouseY = Math.floor(y);
          this.mouseX2 = Math.floor(x * 2) / 2;
          this.mouseY2 = Math.floor(y * 2) / 2;
        }}
      >
        <style>
          .indicator {
            font-size: 0.6px;
            overflow: visible;
            font-family: 'Roboto', sans-serif;
            background: white;
            color: rgb(0, 0, 0 / 0.83);
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
            opacity: 0.83;
          }
        </style>
        ${symbols}
        <rect width="100%" height="100%" fill="white"></rect>
        ${placingTarget}
        ${Array.from(this.substation.children)
          .filter(child => child.tagName === 'VoltageLevel')
          .map(vl => svg`${this.renderContainer(vl)}`)}
        ${placingElement} ${placingIndicator} ${resizingIndicator}
        ${connectionPreview}
        ${this.connecting?.equipment.closest('Substation') === this.substation
          ? Array.from(
              this.substation.querySelectorAll('ConductingEquipment')
            ).map(eq => this.renderEquipment(eq, { connect: true }))
          : nothing}
        ${Array.from(this.substation.querySelectorAll('ConnectivityNode'))
          .filter(
            node =>
              node.getAttribute('name') !== 'grounded' &&
              !(
                this.placing &&
                node.closest(this.placing.tagName) === this.placing
              )
          )
          .map(cNode => this.renderConnectivityNode(cNode))}
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
                  [`${this.nsp}:w`]: { namespaceURI: sldNs, value: newW },
                  [`${this.nsp}:h`]: { namespaceURI: sldNs, value: newH },
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

    if (!this.placing && !this.resizing && !this.connecting) {
      moveHandle = svg`
<a class="handle" href="#0" @click=${() =>
        this.dispatchEvent(newStartPlaceEvent(bayOrVL))}>
  <svg xmlns="${svgNs}" height="1" width="1"
    viewBox="0 96 960 960" x="${x}" y="${y}">
    <rect fill="white" x="10%" y="20%" width="80%" height="80%"></rect>
    ${movePath}
  </svg>
</a>
    `;
      resizeHandle = svg`
<a class="handle" href="#0" @click=${() =>
        this.dispatchEvent(newStartResizeEvent(bayOrVL))}>
  <svg xmlns="${svgNs}" height="1" width="1"
    viewBox="0 96 960 960" x="${w + x - 1}" y="${h + y - 1}">
    <rect fill="white" x="10%" y="20%" width="80%" height="80%"></rect>
    ${resizePath}
  </svg>
</a>
      `;
    }

    return svg`<g id="${
      bayOrVL.parentElement ? identity(bayOrVL) : nothing
    }" class=${classMap({
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
      <text x="${x + 0.1}" y="${y - 0.2}" fill="#000000" fill-opacity="0.83"
      pointer-events="none" style="font: 0.6px sans-serif;">${name}</text>
      ${moveHandle}
      ${Array.from(bayOrVL.children)
        .filter(child => child.tagName === 'Bay')
        .map(bay => this.renderContainer(bay))}
      ${Array.from(bayOrVL.children)
        .filter(child => child.tagName === 'ConductingEquipment')
        .map(equipment => this.renderEquipment(equipment))}
        ${
          preview
            ? Array.from(bayOrVL.querySelectorAll('ConnectivityNode'))
                .filter(child => child.getAttribute('name') !== 'grounded')
                .map(cNode => this.renderConnectivityNode(cNode))
            : nothing
        }
      ${placingTarget}
      ${resizeHandle}
    </g>`;
  }

  renderEquipment(
    equipment: Element,
    { preview = false, connect = false } = {}
  ) {
    if (this.placing === equipment && !preview) return svg``;
    if (
      this.connecting?.equipment.closest('Substation') === this.substation &&
      !connect
    )
      return svg``;

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

    const terminals = Array.from(equipment.children).filter(
      c => c.tagName === 'Terminal'
    );
    const topTerminal = terminals.find(t => t.getAttribute('name') === 'T1');
    const bottomTerminal = terminals.find(t => t.getAttribute('name') !== 'T1');

    const topConnector =
      topTerminal || this.placing || this.resizing || this.connecting
        ? nothing
        : svg`<circle cx="0.5" cy="0" r="0.2" opacity="0.4"
      fill="#BB1326" stroke="#F5E214"
    @click=${() =>
      this.dispatchEvent(newStartConnectEvent({ equipment, terminal: 'top' }))}
    @contextmenu=${(e: MouseEvent) => {
      e.preventDefault();
      this.groundTerminal(equipment, 'T1');
    }}
      />`;

    const topIndicator =
      !this.connecting ||
      this.connecting.equipment === equipment ||
      (this.connecting &&
        this.mouseX === x &&
        this.mouseY === y &&
        this.nearestOpenTerminal(equipment) === 'top') ||
      topTerminal
        ? nothing
        : svg`<polygon points="0.3,0 0.7,0 0.5,0.4" 
                fill="#12579B" opacity="0.4" />`;

    const topGrounded =
      topTerminal?.getAttribute('cNodeName') === 'grounded'
        ? svg`<line x1="0.5" y1="-0.1" x2="0.5" y2="0" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`
        : nothing;

    const bottomConnector =
      bottomTerminal ||
      this.placing ||
      this.resizing ||
      this.connecting ||
      singleTerminal.has(eqType)
        ? nothing
        : svg`<circle cx="0.5" cy="1" r="0.2" opacity="0.4"
      fill="#BB1326" stroke="#F5E214"
    @click=${() =>
      this.dispatchEvent(
        newStartConnectEvent({ equipment, terminal: 'bottom' })
      )}
    @contextmenu=${(e: MouseEvent) => {
      e.preventDefault();
      this.groundTerminal(equipment, 'T2');
    }}
      />`;

    const bottomIndicator =
      !this.connecting ||
      this.connecting.equipment === equipment ||
      (this.connecting &&
        this.mouseX === x &&
        this.mouseY === y &&
        this.nearestOpenTerminal(equipment) === 'bottom') ||
      bottomTerminal ||
      singleTerminal.has(eqType)
        ? nothing
        : svg`<polygon points="0.3,1 0.7,1 0.5,0.6" 
                fill="#12579B" opacity="0.4" />`;

    const bottomGrounded =
      bottomTerminal?.getAttribute('cNodeName') === 'grounded'
        ? svg`<line x1="0.5" y1="1.1" x2="0.5" y2="1" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`
        : nothing;

    return svg`<g class="${classMap({
      equipment: true,
      preview: this.placing === equipment,
    })}"
    id="${equipment.parentElement ? identity(equipment) : nothing}"
    transform="translate(${x} ${y}) rotate(${deg})${
      flip ? ' scale(-1,1)' : ''
    }" transform-origin="0.5 0.5">
      <title>${equipment.getAttribute('name')}</title>
      <use href="#${symbol}" pointer-events="none" />
      <rect width="1" height="1" fill="none" pointer-events="${
        connect ? 'none' : 'all'
      }"
        @click=${handleClick}
        @auxclick=${({ button }: MouseEvent) => {
          if (button === 1)
            // middle mouse button
            this.dispatchEvent(newRotateEvent(equipment));
        }}
        @contextmenu=${(e: MouseEvent) => {
          this.menu = { element: equipment, left: e.clientX, top: e.clientY };
          e.preventDefault();
        }}
      />
      ${topConnector}
      ${topIndicator}
      ${topGrounded}
      ${bottomConnector}
      ${bottomIndicator}
      ${bottomGrounded}
    </g>`;
  }

  renderConnectivityNode(cNode: Element) {
    const priv = cNode.querySelector(`Private[type="${privType}"]`);
    if (!priv) return nothing;
    const circles = [] as TemplateResult<2>[];
    const intersections = Object.entries(
      Array.from(priv.querySelectorAll('Vertex'))
        .map(v => this.renderedPosition(v))
        .reduce((obj, pos) => {
          const ret = obj;
          const key = JSON.stringify(pos);
          if (ret[key]) ret[key].count += 1;
          else ret[key] = { val: pos, count: 1 };
          return ret;
        }, {} as Record<string, { val: Point; count: number }>)
    )
      .filter(([_, { count }]) => count > 2)
      .map(([_, { val }]) => val);
    intersections.forEach(([x, y]) =>
      circles.push(svg`<circle fill="black" cx="${x}" cy="${y}" r="0.15" />`)
    );
    const lines = [] as TemplateResult<2>[];
    const sections = Array.from(priv.getElementsByTagNameNS(sldNs, 'Section'));
    sections.forEach(section => {
      const vertices = Array.from(
        section.getElementsByTagNameNS(sldNs, 'Vertex')
      ).map(vertex => this.renderedPosition(vertex));
      let i = 0;
      while (i < vertices.length - 1) {
        const [x1, y1] = vertices[i];
        const [x2, y2] = vertices[i + 1];
        const handleClick = this.connecting
          ? () => {
              const { equipment, path, terminal } = this.connecting!;
              if (
                equipment.querySelector(
                  `Terminal[connectivityNode="${cNode.getAttribute(
                    'pathName'
                  )}"]`
                )
              )
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
              this.dispatchEvent(
                newConnectEvent({
                  equipment,
                  terminal,
                  path,
                  connectTo: cNode,
                })
              );
            }
          : nothing;
        lines.push(
          svg`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke-linecap="square" stroke="black" stroke-width="0.06" />`
        );
        lines.push(
          svg`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                pointer-events="all" @click=${handleClick}
                stroke="none" stroke-width="${
                  this.connecting ? '1' : '0.4'
                }" />`
        );
        if (this.connecting && ![x2, y2].find(n => Number.isInteger(n)))
          lines.push(
            svg`<rect x="${x2 - 0.5}" y="${y2 - 0.5}" width="1" height="1"
                pointer-events="all" @click=${handleClick}
                fill="none" />`
          );
        i += 1;
      }
    });
    return svg`<g class="node" id="${identity(cNode)}" >
        <title>${cNode.getAttribute('pathName')}</title>
        ${circles}
        ${lines}
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