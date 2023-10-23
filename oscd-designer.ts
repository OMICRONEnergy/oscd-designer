import { LitElement, html, css, nothing } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { property, state } from 'lit/decorators.js';

import { Edit, newEditEvent } from '@openscd/open-scd-core';
import { getReference } from '@openscd/oscd-scl';

import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-icon';

import './sld-editor.js';

import type { PlaceEvent, ResizeEvent, StartEvent } from './sld-editor.js';
import { bayIcon, equipmentIcon, voltageLevelIcon } from './icons.js';
import { attributes } from './util.js';

const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';
const xmlnsNS = 'http://www.w3.org/2000/xmlns/';

function uniqueName(element: Element, parent: Element): string {
  const children = Array.from(parent.children);
  const oldName = element.getAttribute('name');
  if (
    oldName &&
    !children.find(child => child.getAttribute('name') === oldName)
  )
    return oldName;

  const baseName =
    element.getAttribute('name')?.replace(/[0-9]*$/, '') ??
    element.tagName.charAt(0);
  let index = 1;
  function hasName(child: Element) {
    return child.getAttribute('name') === baseName + index.toString();
  }
  while (children.find(hasName)) index += 1;

  return baseName + index.toString();
}

function updateConnectivityNodes(
  element: Element,
  parent: Element,
  name: string
) {
  const updates = [] as Edit[];

  const cNodes = Array.from(element.getElementsByTagName('ConnectivityNode'));
  const substationName = parent.closest('Substation')!.getAttribute('name');
  let voltageLevelName = parent.closest('VoltageLevel')?.getAttribute('name');
  if (element.tagName === 'VoltageLevel') voltageLevelName = name;

  cNodes.forEach(cNode => {
    const cNodeName = cNode.getAttribute('name');
    let bayName = cNode.parentElement!.getAttribute('name');
    if (element.tagName === 'Bay') bayName = name;

    if (cNodeName && bayName) {
      const pathName = `${substationName}/${voltageLevelName}/${bayName}/${cNodeName}`;
      updates.push({
        element: cNode,
        attributes: {
          pathName,
        },
      });
    }
  });
  return updates;
}

function reparentElement(element: Element, parent: Element): Edit[] {
  const edits: Edit[] = [];
  edits.push({
    node: element,
    parent,
    reference: getReference(parent, element.tagName),
  });
  const newName = uniqueName(element, parent);
  if (newName !== element.getAttribute('name'))
    edits.push({ element, attributes: { name: newName } });
  edits.push(...updateConnectivityNodes(element, parent, newName));
  return edits;
}

export default class Designer extends LitElement {
  @property()
  doc!: XMLDocument;

  @property()
  editCount = -1;

  @state()
  templateElements: Record<string, Element> = {};

  @state()
  gridSize = 32;

  @state()
  placing?: Element;

  @state()
  resizing?: Element;

  zoomIn(step = 4) {
    this.gridSize += step;
  }

  zoomOut(step = 4) {
    this.gridSize -= step;
    if (this.gridSize < 4) this.gridSize = 4;
  }

  startPlacing(element: Element | undefined) {
    this.reset();
    this.placing = element;
  }

  startResizing(element: Element | undefined) {
    this.reset();
    this.resizing = element;
  }

  reset() {
    this.placing = undefined;
    this.resizing = undefined;
  }

  handleKeydown = ({ key }: KeyboardEvent) => {
    if (key === 'Escape') this.reset();
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleKeydown);
  }

  updated(changedProperties: Map<string, any>) {
    if (!changedProperties.has('doc')) return;
    ['Substation', 'VoltageLevel', 'Bay', 'ConductingEquipment'].forEach(
      tag => {
        this.templateElements[tag] = this.doc.createElementNS(
          this.doc.documentElement.namespaceURI,
          tag
        );
      }
    );
  }

  placeElement(element: Element, parent: Element, x: number, y: number) {
    const edits: Edit[] = [];
    if (element.parentElement !== parent) {
      edits.push(...reparentElement(element, parent));
    }
    edits.push({
      element,
      attributes: {
        x: { namespaceURI: sldNs, value: x.toString() },
        y: { namespaceURI: sldNs, value: y.toString() },
      },
    });

    const {
      pos: [oldX, oldY],
    } = attributes(element);

    const dx = x - oldX;
    const dy = y - oldY;

    Array.from(element.querySelectorAll('Bay, ConductingEquipment')).forEach(
      descendant => {
        const {
          pos: [descX, descY],
        } = attributes(descendant);
        edits.push({
          element: descendant,
          attributes: {
            x: { namespaceURI: sldNs, value: (descX + dx).toString() },
            y: { namespaceURI: sldNs, value: (descY + dy).toString() },
          },
        });
      }
    );

    this.dispatchEvent(newEditEvent(edits));
    if (
      ['Bay', 'VoltageLevel'].includes(this.placing!.tagName) &&
      !this.placing!.hasAttributeNS(sldNs, 'w') &&
      !this.placing!.hasAttributeNS(sldNs, 'h')
    )
      this.startResizing(this.placing);
    else this.reset();
  }

  render() {
    if (!this.doc) return html`<p>Please open an SCL document</p>`;
    return html`<main>
      ${Array.from(this.doc.querySelectorAll(':root > Substation')).map(
        subs =>
          html`<sld-editor
            .doc=${this.doc}
            .editCount=${this.editCount}
            .substation=${subs}
            .gridSize=${this.gridSize}
            .placing=${this.placing}
            .resizing=${this.resizing}
            @oscd-sld-start-place=${({ detail }: StartEvent) => {
              this.startPlacing(detail);
            }}
            @oscd-sld-start-resize=${({ detail }: StartEvent) => {
              this.startResizing(detail);
            }}
            @oscd-sld-resize=${({ detail: { element, w, h } }: ResizeEvent) => {
              this.dispatchEvent(
                newEditEvent({
                  element,
                  attributes: {
                    w: { namespaceURI: sldNs, value: w.toString() },
                    h: { namespaceURI: sldNs, value: h.toString() },
                  },
                })
              );
              this.reset();
            }}
            @oscd-sld-place=${({
              detail: { element, parent, x, y },
            }: PlaceEvent) => this.placeElement(element, parent, x, y)}
          ></sld-editor>`
      )}
      <nav>
        ${Array.from(this.doc.documentElement.children).find(c =>
          c.querySelector(':scope > VoltageLevel > Bay')
        )
          ? ['CTR', 'VTR', 'DIS', 'CBR', 'IFL'].map(
              eqType => html`<mwc-fab
                mini
                label="Add ${eqType}"
                @click=${() => {
                  const element =
                    this.templateElements.ConductingEquipment!.cloneNode() as Element;
                  element.setAttribute('type', eqType);
                  element.setAttribute('name', `${eqType}1`);
                  this.startPlacing(element);
                }}
              >
                ${equipmentIcon(eqType)}
              </mwc-fab>`
            )
          : nothing}
        ${Array.from(this.doc.documentElement.children).find(c =>
          c.querySelector(':scope > VoltageLevel')
        )
          ? html`<mwc-fab
              mini
              label="Add Bay"
              @click=${() => {
                const element =
                  this.templateElements.Bay!.cloneNode() as Element;
                this.startPlacing(element);
              }}
            >
              ${bayIcon}
            </mwc-fab>`
          : nothing}
        ${Array.from(this.doc.documentElement.children).find(
          c => c.tagName === 'Substation'
        )
          ? html`<mwc-fab
              mini
              label="Add VoltageLevel"
              @click=${() => {
                const element =
                  this.templateElements.VoltageLevel!.cloneNode() as Element;
                this.startPlacing(element);
              }}
            >
              ${voltageLevelIcon}
            </mwc-fab>`
          : nothing}
        <mwc-fab
          mini
          icon="margin"
          @click=${() => this.insertSubstation()}
          label="Add Substation"
        >
        </mwc-fab>
        <mwc-icon-button
          icon="zoom_in"
          label="Zoom In"
          @click=${() => this.zoomIn()}
        >
        </mwc-icon-button>
        <mwc-icon-button
          icon="zoom_out"
          label="Zoom Out"
          @click=${() => this.zoomOut()}
        >
        </mwc-icon-button>
        ${this.placing || this.resizing
          ? html`<mwc-icon-button
              icon="close"
              label="Cancel action"
              @click=${() => this.reset()}
            >
            </mwc-icon-button>`
          : nothing}
      </nav>
    </main>`;
  }

  insertSubstation() {
    const parent = this.doc.documentElement;
    const node = this.doc.createElementNS(
      this.doc.documentElement.namespaceURI,
      'Substation'
    );
    const reference = getReference(parent, 'Substation');
    let index = 1;
    while (this.doc.querySelector(`:root > Substation[name="S${index}"]`))
      index += 1;
    node.setAttribute('name', `S${index}`);
    node.setAttributeNS(xmlnsNS, 'xmlns:esld', sldNs);
    node.setAttributeNS(sldNs, 'esld:w', '50');
    node.setAttributeNS(sldNs, 'esld:h', '25');
    this.dispatchEvent(newEditEvent({ parent, node, reference }));
  }

  static styles = css`
    main {
      padding: 16px;
    }

    div {
      margin-top: 12px;
    }

    nav {
      position: fixed;
      bottom: 4px;
      left: 4px;
    }
  `;
}
