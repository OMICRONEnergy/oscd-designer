import { LitElement, html, css } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { property, state } from 'lit/decorators.js';

import { newEditEvent } from '@openscd/open-scd-core';
import { getReference } from '@openscd/oscd-scl';

import './sld-editor.js';

import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-icon';

const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';

export default class Designer extends LitElement {
  @property()
  doc!: XMLDocument;

  @property()
  editCount = -1;

  @state()
  gridSize = 32;

  zoomIn(step = 4) {
    this.gridSize += step;
  }

  zoomOut(step = 4) {
    this.gridSize -= step;
    if (this.gridSize < 4) this.gridSize = 4;
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
      </nav>
      <div>
        <mwc-button
          @click=${() => this.insertSubstation()}
          label="Add Substation"
          icon="add"
        ></mwc-button>
      </div>
    </main>`;
  }

  insertSubstation() {
    const parent = this.doc.documentElement;
    const node = this.doc.createElement('Substation');
    const reference = getReference(parent, 'Substation');
    let index = 1;
    while (this.doc.querySelector(`:root > Substation[name="S${index}"]`))
      index += 1;
    node.setAttribute('name', `S${index}`);
    node.setAttribute('xmlns:esld', sldNs);
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
