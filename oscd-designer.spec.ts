/* eslint-disable no-unused-expressions */
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import type { Button } from '@material/mwc-button';

import { EditEvent, handleEdit } from '@openscd/open-scd-core';

import { IconButton } from '@material/mwc-icon-button';
import Designer from './oscd-designer.js';

customElements.define('oscd-designer', Designer);

export const sclDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
</SCL>`;

describe('Designer', () => {
  let element: Designer;
  beforeEach(async () => {
    const doc = new DOMParser().parseFromString(
      sclDocString,
      'application/xml'
    );
    element = await fixture(
      html`<oscd-designer
        docName="testDoc"
        .doc=${doc}
        @oscd-edit=${({ detail }: EditEvent) => {
          handleEdit(detail);
          element.editCount += 1;
        }}
      ></oscd-designer>`
    );
  });

  it('shows a placeholder message while no document is loaded', async () => {
    element = await fixture(html`<oscd-designer></oscd-designer>`);
    expect(element.shadowRoot?.querySelector('p')).to.contain.text('SCL');
  });

  it('adds a substation on add button click', async () => {
    expect(element.doc.querySelector('Substation')).to.not.exist;
    element
      .shadowRoot!.querySelector<Button>('mwc-button[icon="add"]')
      ?.click();
    await element.updateComplete;
    expect(element.doc.querySelector('Substation')).to.exist;
  });

  it('gives new substations unique names', async () => {
    element
      .shadowRoot!.querySelector<Button>('mwc-button[icon="add"]')
      ?.click();
    element
      .shadowRoot!.querySelector<Button>('mwc-button[icon="add"]')
      ?.click();
    await element.updateComplete;
    const [name1, name2] = Array.from(
      element.doc.querySelectorAll('Substation')
    ).map(substation => substation.getAttribute('name'));
    expect(name1).not.to.equal(name2);
  });

  it('zooms in on zoom in button click', async () => {
    const initial = element.gridSize;
    element
      .shadowRoot!.querySelector<IconButton>('mwc-icon-button[icon="zoom_in"]')
      ?.click();
    await element.updateComplete;
    expect(element.gridSize).to.be.greaterThan(initial);
  });

  it('zooms out on zoom out button click', async () => {
    const initial = element.gridSize;
    element
      .shadowRoot!.querySelector<IconButton>('mwc-icon-button[icon="zoom_out"]')
      ?.click();
    await element.updateComplete;
    expect(element.gridSize).to.be.lessThan(initial);
  });

  it('does not zoom out past a positive minimum value', async () => {
    for (let i = 0; i < 20; i += 1)
      element
        .shadowRoot!.querySelector<IconButton>(
          'mwc-icon-button[icon="zoom_out"]'
        )
        ?.click();
    await element.updateComplete;
    expect(element.gridSize).to.be.greaterThan(0);
  });
});
