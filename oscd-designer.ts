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
import { voltageLevelIcon } from './icons.js';

const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';
const xmlnsNS = 'http://www.w3.org/2000/xmlns/';

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
    if (changedProperties.has('doc'))
      ['Substation', 'VoltageLevel', 'Bay'].forEach(tag => {
        this.templateElements[tag] = this.doc.createElementNS(
          this.doc.documentElement.namespaceURI,
          tag
        );
      });
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
            }: PlaceEvent) => {
              const edits: Edit[] = [];
              if (element.parentElement !== parent) {
                edits.push({
                  node: element,
                  parent,
                  reference: getReference(parent, element.tagName),
                });
              }
              edits.push({
                element,
                attributes: {
                  x: { namespaceURI: sldNs, value: x.toString() },
                  y: { namespaceURI: sldNs, value: y.toString() },
                },
              });
              this.dispatchEvent(newEditEvent(edits));
              if (
                !this.placing!.hasAttributeNS(sldNs, 'w') &&
                !this.placing!.hasAttributeNS(sldNs, 'h')
              )
                this.startResizing(this.placing);
              else this.reset();
            }}
          ></sld-editor>`
      )}
      <nav>
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
        ${Array.from(this.doc.documentElement.children).find(
          c => c.tagName === 'Substation'
        )
          ? html` <mwc-icon-button
              label="Add VoltageLevel"
              @click=${() => {
                const element =
                  this.templateElements.VoltageLevel!.cloneNode() as Element;
                let index = 1;
                while (this.doc.querySelector(`VoltageLevel[name="V${index}"]`))
                  index += 1;
                element.setAttribute('name', `V${index}`);
                this.startPlacing(element);
              }}
            >
              ${voltageLevelIcon}
            </mwc-icon-button>`
          : nothing}
        <mwc-icon-button
          @click=${() => this.insertSubstation()}
          label="Add Substation"
          icon="margin"
        ></mwc-icon-button>
        ${this.placing || this.resizing
          ? html`<mwc-icon-button
              icon="close"
              label="Cancel action"
              @click=${() => this.reset()}
            ></mwc-icon-button>`
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
