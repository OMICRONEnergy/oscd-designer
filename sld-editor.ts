import { LitElement, html, css } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { customElement, property, query, state } from 'lit/decorators.js';

import { newEditEvent } from '@openscd/open-scd-core';
// import { getReference, identity } from '@openscd/oscd-scl';

import type { Dialog } from '@material/mwc-dialog';
import type { TextField } from '@material/mwc-textfield';

import '@material/mwc-dialog';
import '@material/mwc-textfield';

// import { symbols } from './icons.js';

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

  @query('#resizeSubstationUI')
  resizeSubstationUI!: Dialog;

  @query('#substationWidthUI')
  substationWidthUI!: TextField;

  @query('#substationHeightUI')
  substationHeightUI!: TextField;

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
    return html`<h2>
        ${this.substation.getAttribute('name')}
        <mwc-icon-button
          icon="settings_overscan"
          label="Resize Substation"
          @click=${() => this.resizeSubstationUI.show()}
        ></mwc-icon-button>
      </h2>
      <svg
        viewBox="0 0 ${w} ${h}"
        width="${w * this.gridSize}"
        height="${h * this.gridSize}"
        stroke-width="0.1"
        fill="none"
        style="pointer-events: all;"
      >
        <rect width="100%" height="100%" stroke="lightgrey"></rect>
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
            label="width"
            value="${w}"
            dialogInitialFocus
          ></mwc-textfield>
          <mwc-textfield
            id="substationHeightUI"
            type="number"
            min="1"
            step="1"
            label="height"
            value="${h}"
          ></mwc-textfield>
        </div>
        <mwc-button dialogAction="resize" slot="primaryAction"
          >resize</mwc-button
        >
        <mwc-button dialogAction="close" slot="secondaryAction"
          >cancel</mwc-button
        >
      </mwc-dialog> `;
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
