/* eslint-disable no-unused-expressions */
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import type { Button } from '@material/mwc-button';

import { EditEvent, handleEdit } from '@openscd/open-scd-core';

import { IconButton } from '@material/mwc-icon-button';
import Designer from './oscd-designer.js';
import { newPlaceEvent, newResizeEvent, SLDEditor } from './sld-editor.js';

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
      .shadowRoot!.querySelector<Button>('mwc-icon-button[icon="margin"]')
      ?.click();
    await element.updateComplete;
    expect(element.doc.querySelector('Substation')).to.exist;
  });

  it('gives new substations unique names', async () => {
    element
      .shadowRoot!.querySelector<Button>('mwc-icon-button[icon="margin"]')
      ?.click();
    element
      .shadowRoot!.querySelector<Button>('mwc-icon-button[icon="margin"]')
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

  it('allows the user to place a voltage level', async () => {
    expect(element.doc.querySelector('VoltageLevel')).to.not.exist;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add Substation"]'
      )
      ?.click();
    await element.updateComplete;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add VoltageLevel"]'
      )
      ?.click();
    await element.updateComplete;
    expect(element)
      .property('placing')
      .to.have.property('tagName', 'VoltageLevel');
    const sldEditor =
      element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
    let rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    await element.updateComplete;
    sldEditor.sld.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: 200,
        clientY: 200,
      })
    );
    await sldEditor.updateComplete;
    rect.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 200,
        clientY: 200,
      })
    );
    await sldEditor.updateComplete;
    await element.updateComplete;
    expect(element)
      .property('resizing')
      .to.have.property('tagName', 'VoltageLevel');
    expect(element).to.have.property('placing', undefined);
    expect(element)
      .property('resizing')
      .to.have.property('tagName', 'VoltageLevel');
    rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    sldEditor.sld.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: 400,
        clientY: 400,
      })
    );
    await sldEditor.updateComplete;
    rect.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 400,
        clientY: 400,
      })
    );
    await sldEditor.updateComplete;
    await element.updateComplete;
    expect(sldEditor).to.have.property('resizing', undefined);
    expect(element.doc.querySelector('VoltageLevel')).to.exist;
    expect(element.doc.querySelector('VoltageLevel')).to.have.attribute(
      'x',
      '5'
    );
    expect(element.doc.querySelector('VoltageLevel')).to.have.attribute(
      'y',
      '3'
    );
    expect(element.doc.querySelector('VoltageLevel')).to.have.attribute(
      'w',
      '7'
    );
    expect(element.doc.querySelector('VoltageLevel')).to.have.attribute(
      'h',
      '8'
    );
  });

  it('allows the user to abort placing an element', async () => {
    expect(element.doc.querySelector('VoltageLevel')).to.not.exist;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add Substation"]'
      )
      ?.click();
    await element.updateComplete;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add VoltageLevel"]'
      )
      ?.click();
    await element.updateComplete;
    expect(element)
      .property('placing')
      .to.have.property('tagName', 'VoltageLevel');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);
    expect(element).to.have.property('placing', undefined);
  });

  it('gives new voltage levels unique names', async () => {
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add Substation"]'
      )
      ?.click();
    await element.updateComplete;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add VoltageLevel"]'
      )
      ?.click();
    await element.updateComplete;
    const sldEditor =
      element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
    let rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    await element.updateComplete;
    rect.dispatchEvent(
      newPlaceEvent({
        x: 1,
        y: 1,
        element: element.placing!,
        parent: sldEditor.substation,
      })
    );
    await element.updateComplete;
    rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    rect.dispatchEvent(
      newResizeEvent({
        w: 10,
        h: 10,
        element: element.resizing!,
      })
    );
    await element.updateComplete;
    await sldEditor.updateComplete;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add VoltageLevel"]'
      )
      ?.click();
    await element.updateComplete;
    rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    await element.updateComplete;
    rect.dispatchEvent(
      newPlaceEvent({
        x: 11,
        y: 11,
        element: element.placing!,
        parent: sldEditor.substation,
      })
    );
    await element.updateComplete;
    rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    rect.dispatchEvent(
      newResizeEvent({
        w: 20,
        h: 20,
        element: element.resizing!,
      })
    );
    await element.updateComplete;
    await sldEditor.updateComplete;
    const [name1, name2] = Array.from(
      element.doc.querySelectorAll('VoltageLevel')
    ).map(substation => substation.getAttribute('name'));
    expect(name1).not.to.equal(name2);
    expect(name1).to.exist;
    expect(name2).to.exist;
  });

  it('allows the user to resize an existing voltage level', async () => {
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add Substation"]'
      )
      ?.click();
    await element.updateComplete;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add VoltageLevel"]'
      )
      ?.click();
    await element.updateComplete;
    const sldEditor =
      element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
    let rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    await element.updateComplete;
    rect.dispatchEvent(
      newPlaceEvent({
        x: 1,
        y: 1,
        element: element.placing!,
        parent: sldEditor.substation,
      })
    );
    await element.updateComplete;
    rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    rect.dispatchEvent(
      newResizeEvent({
        w: 10,
        h: 10,
        element: element.resizing!,
      })
    );
    await element.updateComplete;
    await sldEditor.updateComplete;
    const moveHandle =
      sldEditor.shadowRoot!.querySelectorAll<SVGElement>('a.handle')[1];
    moveHandle.dispatchEvent(new MouseEvent('click'));
    await element.updateComplete;
    expect(element)
      .property('resizing')
      .to.exist.and.to.have.property('tagName', 'VoltageLevel');
    const voltageLevel = element.resizing!;
    rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    rect.dispatchEvent(
      newResizeEvent({
        w: 20,
        h: 20,
        element: element.resizing!,
      })
    );
    expect(voltageLevel).to.have.attribute('w', '20');
    expect(voltageLevel).to.have.attribute('h', '20');
  });

  it('allows the user to move an existing voltage level', async () => {
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add Substation"]'
      )
      ?.click();
    await element.updateComplete;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add VoltageLevel"]'
      )
      ?.click();
    await element.updateComplete;
    const sldEditor =
      element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
    let rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    await element.updateComplete;
    rect.dispatchEvent(
      newPlaceEvent({
        x: 1,
        y: 1,
        element: element.placing!,
        parent: sldEditor.substation,
      })
    );
    await element.updateComplete;
    rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    rect.dispatchEvent(
      newResizeEvent({
        w: 10,
        h: 10,
        element: element.resizing!,
      })
    );
    await element.updateComplete;
    await sldEditor.updateComplete;
    const moveHandle =
      sldEditor.shadowRoot!.querySelector<SVGElement>('a.handle')!;
    moveHandle.dispatchEvent(new MouseEvent('click'));
    await element.updateComplete;
    expect(element)
      .property('placing')
      .to.exist.and.to.have.property('tagName', 'VoltageLevel');
    const voltageLevel = element.placing!;
    rect = sldEditor.shadowRoot!.querySelector<SVGGraphicsElement>(
      'g.voltagelevel rect'
    )!;
    rect.dispatchEvent(
      newPlaceEvent({
        x: 20,
        y: 20,
        element: element.placing!,
        parent: element.placing!.parentElement!,
      })
    );
    expect(voltageLevel).to.have.attribute('x', '20');
    expect(voltageLevel).to.have.attribute('y', '20');
  });
});
