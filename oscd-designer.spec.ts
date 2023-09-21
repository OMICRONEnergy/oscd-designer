/* eslint-disable no-unused-expressions */
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import type { Button } from '@material/mwc-button';

import { EditEvent, handleEdit } from '@openscd/open-scd-core';

import { IconButton } from '@material/mwc-icon-button';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import Designer from './oscd-designer.js';
import { SLDEditor } from './sld-editor.js';

customElements.define('oscd-designer', Designer);

export const emptyDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
</SCL>`;

export const substationDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
  <Substation name ="S1" desc="No SLD xmlns attribute here"></Substation>
</SCL>`;

export const voltageLevelDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
  <Substation name="S1" xmlns:esld="https://transpower.co.nz/SCL/SSD/SLD/v0" esld:w="50" esld:h="25">
    <VoltageLevel name="V1" esld:x="1" esld:y="1" esld:w="48" esld:h="23"/>
  </Substation>
</SCL>`;

export const bayDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
  <Substation xmlns:esld="https://transpower.co.nz/SCL/SSD/SLD/v0" name="S1" esld:w="50" esld:h="25">
    <VoltageLevel name="V1" esld:x="1" esld:y="1" esld:w="13" esld:h="13">
      <Bay name="B1" esld:x="2" esld:y="2" esld:w="3" esld:h="3">
        <ConnectivityNode name="L1" pathName="S1/V1/B1/L1"/>
      </Bay>
    </VoltageLevel>
    <VoltageLevel name="V2" esld:x="15" esld:y="1" esld:w="13" esld:h="13">
      <Bay name="B1" esld:x="20" esld:y="11" esld:w="1" esld:h="1"/>
    </VoltageLevel>
  </Substation>
</SCL>`;

describe('Designer', () => {
  let element: Designer;

  beforeEach(async () => {
    const doc = new DOMParser().parseFromString(
      emptyDocString,
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

  afterEach(async () => {
    await resetMouse();
  });

  it('shows a placeholder message while no document is loaded', async () => {
    element = await fixture(html`<oscd-designer></oscd-designer>`);
    expect(element.shadowRoot?.querySelector('p')).to.contain.text('SCL');
  });

  it('adds the SLD XML namespace to any substations lacking it', async () => {
    const doc = new DOMParser().parseFromString(
      substationDocString,
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
    expect(doc.querySelector('Substation')).to.have.attribute('xmlns:esld');
  });

  it('adds a substation on add button click', async () => {
    expect(element.doc.querySelector('Substation')).to.not.exist;
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add Substation"]'
      )
      ?.click();
    expect(element.doc.querySelector('Substation')).to.exist;
  });

  it('gives new substations unique names', async () => {
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add Substation"]'
      )
      ?.click();
    element
      .shadowRoot!.querySelector<Button>(
        'mwc-icon-button[label="Add Substation"]'
      )
      ?.click();
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
    expect(element.gridSize).to.be.greaterThan(initial);
  });

  it('zooms out on zoom out button click', async () => {
    const initial = element.gridSize;
    element
      .shadowRoot!.querySelector<IconButton>('mwc-icon-button[icon="zoom_out"]')
      ?.click();
    expect(element.gridSize).to.be.lessThan(initial);
  });

  it('does not zoom out past a positive minimum value', async () => {
    for (let i = 0; i < 20; i += 1)
      element
        .shadowRoot!.querySelector<IconButton>(
          'mwc-icon-button[icon="zoom_out"]'
        )
        ?.click();
    expect(element.gridSize).to.be.greaterThan(0);
  });

  describe('given a substation', () => {
    beforeEach(async () => {
      element
        .shadowRoot!.querySelector<Button>(
          'mwc-icon-button[label="Add Substation"]'
        )
        ?.click();
      await element.updateComplete;
    });

    it('allows resizing substations', async () => {
      const sldEditor =
        element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
      sldEditor.shadowRoot
        ?.querySelector<IconButton>('h2 > mwc-icon-button')
        ?.click();
      sldEditor.substationWidthUI.value = '50';
      sldEditor.substationHeightUI.value = '25';
      sldEditor.shadowRoot
        ?.querySelector<Button>('mwc-button[slot="primaryAction"]')
        ?.click();
      expect(element).to.have.property('editCount', 0);
      sldEditor.substationWidthUI.value = '1337';
      sldEditor.substationHeightUI.value = '42';
      sldEditor.shadowRoot
        ?.querySelector<Button>('mwc-button[slot="primaryAction"]')
        ?.click();
      expect(sldEditor.substation).to.have.attribute('esld:h', '42');
      expect(sldEditor.substation).to.have.attribute('esld:w', '1337');
    });

    it('allows placing a new voltage level', async () => {
      element
        .shadowRoot!.querySelector<Button>(
          'mwc-icon-button[label="Add VoltageLevel"]'
        )
        ?.click();
      expect(element)
        .property('placing')
        .to.have.property('tagName', 'VoltageLevel');
      await sendMouse({ type: 'click', position: [200, 200] });
      expect(element).to.have.property('placing', undefined);
      expect(element)
        .property('resizing')
        .to.have.property('tagName', 'VoltageLevel');
      await sendMouse({ type: 'click', position: [400, 400] });
      expect(element).to.have.property('resizing', undefined);
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

    it('gives new voltage levels unique names', async () => {
      element
        .shadowRoot!.querySelector<Button>(
          'mwc-icon-button[label="Add VoltageLevel"]'
        )
        ?.click();
      await sendMouse({ type: 'click', position: [200, 200] });
      await sendMouse({ type: 'click', position: [300, 300] });
      element
        .shadowRoot!.querySelector<Button>(
          'mwc-icon-button[label="Add VoltageLevel"]'
        )
        ?.click();
      await sendMouse({ type: 'click', position: [350, 350] });
      await sendMouse({ type: 'click', position: [450, 450] });
      const [name1, name2] = Array.from(
        element.doc.querySelectorAll('VoltageLevel')
      ).map(substation => substation.getAttribute('name'));
      expect(name1).not.to.equal(name2);
      expect(name1).to.exist;
      expect(name2).to.exist;
    });

    it('allows the user to abort placing an element', async () => {
      element
        .shadowRoot!.querySelector<Button>(
          'mwc-icon-button[label="Add VoltageLevel"]'
        )
        ?.click();
      expect(element)
        .property('placing')
        .to.have.property('tagName', 'VoltageLevel');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);
      expect(element).to.have.property('placing', undefined);
    });

    describe('with a voltage level', () => {
      beforeEach(async () => {
        const doc = new DOMParser().parseFromString(
          voltageLevelDocString,
          'application/xml'
        );
        element.doc = doc;
        await element.updateComplete;
      });

      it('forbids undersizing the substation', async () => {
        const sldEditor =
          element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
        sldEditor.shadowRoot
          ?.querySelector<IconButton>('h2 > mwc-icon-button')
          ?.click();
        sldEditor.substationWidthUI.value = '30';
        sldEditor.substationHeightUI.value = '20';
        sldEditor.shadowRoot
          ?.querySelector<Button>('mwc-button[slot="primaryAction"]')
          ?.click();
        expect(sldEditor.substation).to.have.attribute('esld:h', '25');
        expect(sldEditor.substation).to.have.attribute('esld:w', '50');
      });

      it('allows resizing voltage levels', async () => {
        const sldEditor =
          element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
        const moveHandle =
          sldEditor.shadowRoot!.querySelectorAll<SVGElement>('a.handle')[1];
        moveHandle.dispatchEvent(new MouseEvent('click'));
        expect(element)
          .property('resizing')
          .to.exist.and.to.have.property('tagName', 'VoltageLevel');
        const voltageLevel = element.resizing!;
        expect(voltageLevel).to.have.attribute('esld:w', '48');
        expect(voltageLevel).to.have.attribute('esld:h', '23');
        await sendMouse({ type: 'click', position: [300, 300] });
        expect(voltageLevel).to.have.attribute('esld:w', '8');
        expect(voltageLevel).to.have.attribute('esld:h', '7');
      });

      it('allows moving voltage levels', async () => {
        const sldEditor =
          element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
        const moveHandle =
          sldEditor.shadowRoot!.querySelector<SVGElement>('a.handle')!;
        moveHandle.dispatchEvent(new MouseEvent('click'));
        expect(element)
          .property('placing')
          .to.exist.and.to.have.property('tagName', 'VoltageLevel');
        const voltageLevel = element.placing!;
        expect(voltageLevel).to.have.attribute('esld:x', '1');
        expect(voltageLevel).to.have.attribute('esld:y', '1');
        await sendMouse({ type: 'click', position: [100, 150] });
        expect(voltageLevel).to.have.attribute('esld:x', '2');
        expect(voltageLevel).to.have.attribute('esld:y', '2');
      });

      it('forbids moving voltage levels out of bounds', async () => {
        const sldEditor =
          element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
        const moveHandle =
          sldEditor.shadowRoot!.querySelector<SVGElement>('a.handle')!;
        moveHandle.dispatchEvent(new MouseEvent('click'));
        expect(element)
          .property('placing')
          .to.exist.and.to.have.property('tagName', 'VoltageLevel');
        const voltageLevel = element.placing!;
        expect(voltageLevel).to.have.attribute('esld:x', '1');
        expect(voltageLevel).to.have.attribute('esld:y', '1');
        await sendMouse({ type: 'click', position: [200, 200] });
        expect(voltageLevel).to.have.attribute('esld:x', '1');
        expect(voltageLevel).to.have.attribute('esld:y', '1');
      });

      it('allows placing a new bay', async () => {
        element
          .shadowRoot!.querySelector<Button>('mwc-icon-button[label="Add Bay"]')
          ?.click();
        expect(element).property('placing').to.have.property('tagName', 'Bay');
        const sldEditor =
          element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
        await sendMouse({ type: 'click', position: [200, 200] });
        expect(element).to.have.property('placing', undefined);
        expect(element).property('resizing').to.have.property('tagName', 'Bay');
        await sendMouse({ type: 'click', position: [400, 400] });
        expect(sldEditor).to.have.property('resizing', undefined);
        const bay = element.doc.querySelector('Bay');
        expect(bay).to.exist;
        expect(bay).to.have.attribute('x', '5');
        expect(bay).to.have.attribute('y', '3');
        expect(bay).to.have.attribute('w', '7');
        expect(bay).to.have.attribute('h', '8');
      });

      describe('with a bay', () => {
        beforeEach(async () => {
          const doc = new DOMParser().parseFromString(
            bayDocString,
            'application/xml'
          );
          element.doc = doc;
          await element.updateComplete;
        });

        it('allows resizing bays', async () => {
          const sldEditor =
            element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
          const moveHandle =
            sldEditor.shadowRoot!.querySelectorAll<SVGElement>(
              'g.bay a.handle'
            )[1];
          moveHandle.dispatchEvent(new MouseEvent('click'));
          expect(element)
            .property('resizing')
            .to.exist.and.to.have.property('tagName', 'Bay');
          const bay = element.resizing!;
          expect(bay).to.have.attribute('esld:w', '3');
          expect(bay).to.have.attribute('esld:h', '3');
          await sendMouse({ type: 'click', position: [400, 400] });
          expect(bay).to.have.attribute('esld:w', '10');
          expect(bay).to.have.attribute('esld:h', '9');
        });

        it('forbids resizing bays out of bounds', async () => {
          const sldEditor =
            element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
          const moveHandle =
            sldEditor.shadowRoot!.querySelectorAll<SVGElement>(
              'g.bay a.handle'
            )[1];
          moveHandle.dispatchEvent(new MouseEvent('click'));
          expect(element)
            .property('resizing')
            .to.exist.and.to.have.property('tagName', 'Bay');
          const bay = element.resizing!;
          expect(bay).to.have.attribute('esld:w', '3');
          expect(bay).to.have.attribute('esld:h', '3');
          await sendMouse({ type: 'click', position: [600, 400] });
          expect(bay).to.have.attribute('esld:w', '3');
          expect(bay).to.have.attribute('esld:h', '3');
        });

        it('forbids undersizing voltage levels containing bays', async () => {
          const sldEditor =
            element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
          const moveHandle =
            sldEditor.shadowRoot!.querySelectorAll<SVGElement>('a.handle')[1];
          moveHandle.dispatchEvent(new MouseEvent('click'));
          expect(element)
            .property('resizing')
            .to.exist.and.to.have.property('tagName', 'VoltageLevel');
          const voltageLevel = element.resizing!;
          expect(voltageLevel).to.have.attribute('esld:w', '13');
          expect(voltageLevel).to.have.attribute('esld:h', '13');
          await sendMouse({ type: 'click', position: [100, 100] });
          expect(voltageLevel).to.have.attribute('esld:w', '13');
          expect(voltageLevel).to.have.attribute('esld:h', '13');
        });

        it('allows moving bays', async () => {
          const sldEditor =
            element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
          sldEditor
            .shadowRoot!.querySelector<SVGElement>('g.bay a.handle')!
            .dispatchEvent(new MouseEvent('click'));
          expect(element)
            .property('placing')
            .to.exist.and.to.have.property('tagName', 'Bay');
          const bay = element.placing!;
          await sendMouse({ type: 'click', position: [200, 200] });
          expect(bay).to.have.attribute('esld:x', '5');
          expect(bay).to.have.attribute('esld:y', '3');
        });

        it('renames reparented bays if necessary', async () => {
          const sldEditor =
            element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
          sldEditor
            .shadowRoot!.querySelector<SVGElement>('g.bay a.handle')!
            .dispatchEvent(new MouseEvent('click'));
          const bay = element.placing!;
          expect(bay.parentElement).to.have.attribute('name', 'V1');
          expect(bay).to.have.attribute('name', 'B1');
          await sendMouse({ type: 'click', position: [600, 200] });
          expect(element).to.have.property('placing', undefined);
          expect(bay).to.have.attribute('esld:x', '18');
          expect(bay).to.have.attribute('esld:y', '3');
          expect(bay.parentElement).to.have.attribute('name', 'V2');
          expect(bay).to.have.attribute('name', 'B2');
          sldEditor
            .shadowRoot!.querySelector<SVGElement>('g.bay a.handle')!
            .dispatchEvent(new MouseEvent('click'));
          await sendMouse({ type: 'click', position: [200, 200] });
          expect(bay).to.have.attribute('esld:x', '5');
          expect(bay).to.have.attribute('esld:y', '3');
          expect(bay.parentElement).to.have.attribute('name', 'V1');
          expect(bay).to.have.attribute('name', 'B2');
        });

        it("updates reparented bays' connectivity node paths", async () => {
          const sldEditor =
            element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
          sldEditor
            .shadowRoot!.querySelector<SVGElement>('g.bay a.handle')!
            .dispatchEvent(new MouseEvent('click'));
          const bay = element.placing!;
          const cNode = bay.querySelector('ConnectivityNode')!;
          expect(cNode).to.have.attribute('pathName', 'S1/V1/B1/L1');
          await sendMouse({ type: 'click', position: [600, 200] });
          expect(element).to.have.property('placing', undefined);
          expect(cNode).to.have.attribute('pathName', 'S1/V2/B2/L1');
        });

        it('moves a bay when its parent voltage level is moved', async () => {
          const sldEditor =
            element.shadowRoot!.querySelector<SLDEditor>('sld-editor')!;
          sldEditor
            .shadowRoot!.querySelector<SVGElement>('g.voltagelevel a.handle')!
            .dispatchEvent(new MouseEvent('click'));
          const bay = element.placing!.querySelector('Bay')!;
          expect(bay).to.have.attribute('esld:x', '2');
          expect(bay).to.have.attribute('esld:y', '2');
          await sendMouse({ type: 'click', position: [100, 100] });
          expect(bay).to.have.attribute('esld:x', '3');
          expect(bay).to.have.attribute('esld:y', '1');
        });
      });
    });
  });
});
