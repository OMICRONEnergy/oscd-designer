/* eslint-disable no-unused-expressions */
import { html } from 'lit';
import { expect, fixture } from '@open-wc/testing';

import { Button } from '@material/mwc-button';
import { IconButton } from '@material/mwc-icon-button';

import { EditEvent, handleEdit } from '@openscd/open-scd-core';

import type { SLDEditor } from './sld-editor.js';
import './sld-editor.js';

function timeout(ms = 100) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

export const sclDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
<Substation></Substation>
</SCL>`;

describe('Designer', () => {
  let element: SLDEditor;
  beforeEach(async () => {
    const doc = new DOMParser().parseFromString(
      sclDocString,
      'application/xml'
    );
    element = await fixture(
      html`<sld-editor
        docName="testDoc"
        .doc=${doc}
        .substation=${doc.querySelector('Substation')}
        .editCount=${0}
        @oscd-edit=${({ detail }: EditEvent) => {
          handleEdit(detail);
          if (element) element.editCount += 1;
        }}
      ></sld-editor>`
    );
  });

  it('allows the user to resize the substation being edited', async () => {
    element.shadowRoot
      ?.querySelector<IconButton>('mwc-icon-button[icon="settings_overscan"]')
      ?.click();
    await element.resizeSubstationUI.updateComplete;
    element.substationHeightUI.value = '42';
    element.substationWidthUI.value = '1337';
    element.shadowRoot
      ?.querySelector<Button>('mwc-button[dialogAction="resize"]')
      ?.click();
    await timeout(80);
    await element.resizeSubstationUI.updateComplete;
    await element.updateComplete;
    expect(element.substation).to.have.attribute('h', '42');
    expect(element.substation).to.have.attribute('w', '1337');
  });
});
