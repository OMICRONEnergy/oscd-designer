/* eslint-disable no-unused-expressions */
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { handleEdit } from '@openscd/open-scd-core';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { identity } from '@openscd/oscd-scl';
import Designer from './oscd-designer.js';
function middleOf(element) {
    const { x, y, width, height } = element.getBoundingClientRect();
    return [
        Math.floor(x + window.pageXOffset + width / 2),
        Math.floor(y + window.pageYOffset + height / 2),
    ];
}
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
export const equipmentDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
  <Substation xmlns:esld="https://transpower.co.nz/SCL/SSD/SLD/v0" name="S1" esld:w="50" esld:h="25">
    <VoltageLevel name="V1" esld:x="1" esld:y="1" esld:w="13" esld:h="13">
      <Bay name="B1" esld:x="2" esld:y="2" esld:w="3" esld:h="3">
      </Bay>
    </VoltageLevel>
    <VoltageLevel name="V2" esld:x="15" esld:y="1" esld:w="23" esld:h="23">
      <Bay name="B1" esld:x="20" esld:y="11" esld:w="6" esld:h="6">
        <ConductingEquipment type="CBR" name="CBR1" esld:x="26" esld:y="14"/>
        <ConductingEquipment type="BAT" name="BAT1" esld:x="26" esld:y="14"/>
      </Bay>
    </VoltageLevel>
  </Substation>
</SCL>`;
describe('Designer', () => {
    let element;
    beforeEach(async () => {
        const doc = new DOMParser().parseFromString(emptyDocString, 'application/xml');
        element = await fixture(html `<oscd-designer
        docName="testDoc"
        .doc=${doc}
        @oscd-edit=${({ detail }) => {
            handleEdit(detail);
            element.editCount += 1;
        }}
      ></oscd-designer>`);
    });
    afterEach(async () => {
        await resetMouse();
    });
    it('shows a placeholder message while no document is loaded', async () => {
        var _a;
        element = await fixture(html `<oscd-designer></oscd-designer>`);
        expect((_a = element.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('p')).to.contain.text('SCL');
    });
    it('adds the SLD XML namespace to any substations lacking it', async () => {
        const doc = new DOMParser().parseFromString(substationDocString, 'application/xml');
        element = await fixture(html `<oscd-designer
        docName="testDoc"
        .doc=${doc}
        @oscd-edit=${({ detail }) => {
            handleEdit(detail);
            element.editCount += 1;
        }}
      ></oscd-designer>`);
        expect(doc.querySelector('Substation')).to.have.attribute('xmlns:esld');
    });
    it('adds a substation on add button click', async () => {
        var _a;
        expect(element.doc.querySelector('Substation')).to.not.exist;
        (_a = element
            .shadowRoot.querySelector('[label="Add Substation"]')) === null || _a === void 0 ? void 0 : _a.click();
        expect(element.doc.querySelector('Substation')).to.exist;
    });
    it('gives new substations unique names', async () => {
        var _a, _b;
        (_a = element
            .shadowRoot.querySelector('[label="Add Substation"]')) === null || _a === void 0 ? void 0 : _a.click();
        (_b = element
            .shadowRoot.querySelector('[label="Add Substation"]')) === null || _b === void 0 ? void 0 : _b.click();
        const [name1, name2] = Array.from(element.doc.querySelectorAll('Substation')).map(substation => substation.getAttribute('name'));
        expect(name1).not.to.equal(name2);
    });
    it('zooms in on zoom in button click', async () => {
        var _a;
        const initial = element.gridSize;
        (_a = element.shadowRoot.querySelector('[icon="zoom_in"]')) === null || _a === void 0 ? void 0 : _a.click();
        expect(element.gridSize).to.be.greaterThan(initial);
    });
    it('zooms out on zoom out button click', async () => {
        var _a;
        const initial = element.gridSize;
        (_a = element.shadowRoot.querySelector('[icon="zoom_out"]')) === null || _a === void 0 ? void 0 : _a.click();
        expect(element.gridSize).to.be.lessThan(initial);
    });
    it('does not zoom out past a positive minimum value', async () => {
        var _a;
        for (let i = 0; i < 20; i += 1)
            (_a = element
                .shadowRoot.querySelector('[icon="zoom_out"]')) === null || _a === void 0 ? void 0 : _a.click();
        expect(element.gridSize).to.be.greaterThan(0);
    });
    describe('given a substation', () => {
        beforeEach(async () => {
            var _a;
            (_a = element
                .shadowRoot.querySelector('[label="Add Substation"]')) === null || _a === void 0 ? void 0 : _a.click();
            await element.updateComplete;
        });
        it('allows resizing substations', async () => {
            var _a, _b, _c, _d, _e, _f;
            const sldEditor = element.shadowRoot.querySelector('sld-editor');
            (_b = (_a = sldEditor.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('h2 > mwc-icon-button')) === null || _b === void 0 ? void 0 : _b.click();
            sldEditor.substationWidthUI.value = '50';
            sldEditor.substationHeightUI.value = '25';
            (_d = (_c = sldEditor.shadowRoot) === null || _c === void 0 ? void 0 : _c.querySelector('mwc-button[slot="primaryAction"]')) === null || _d === void 0 ? void 0 : _d.click();
            expect(element).to.have.property('editCount', 0);
            sldEditor.substationWidthUI.value = '1337';
            sldEditor.substationHeightUI.value = '42';
            (_f = (_e = sldEditor.shadowRoot) === null || _e === void 0 ? void 0 : _e.querySelector('mwc-button[slot="primaryAction"]')) === null || _f === void 0 ? void 0 : _f.click();
            expect(sldEditor.substation).to.have.attribute('esld:h', '42');
            expect(sldEditor.substation).to.have.attribute('esld:w', '1337');
        });
        it('allows placing a new voltage level', async () => {
            var _a;
            (_a = element
                .shadowRoot.querySelector('[label="Add VoltageLevel"]')) === null || _a === void 0 ? void 0 : _a.click();
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
            expect(element.doc.querySelector('VoltageLevel')).to.have.attribute('x', '5');
            expect(element.doc.querySelector('VoltageLevel')).to.have.attribute('y', '3');
            expect(element.doc.querySelector('VoltageLevel')).to.have.attribute('w', '7');
            expect(element.doc.querySelector('VoltageLevel')).to.have.attribute('h', '8');
        });
        it('gives new voltage levels unique names', async () => {
            var _a, _b;
            (_a = element
                .shadowRoot.querySelector('[label="Add VoltageLevel"]')) === null || _a === void 0 ? void 0 : _a.click();
            await sendMouse({ type: 'click', position: [200, 200] });
            await sendMouse({ type: 'click', position: [300, 300] });
            (_b = element
                .shadowRoot.querySelector('[label="Add VoltageLevel"]')) === null || _b === void 0 ? void 0 : _b.click();
            await sendMouse({ type: 'click', position: [350, 350] });
            await sendMouse({ type: 'click', position: [450, 450] });
            const [name1, name2] = Array.from(element.doc.querySelectorAll('VoltageLevel')).map(substation => substation.getAttribute('name'));
            expect(name1).not.to.equal(name2);
            expect(name1).to.exist;
            expect(name2).to.exist;
        });
        it('allows the user to abort placing an element', async () => {
            var _a;
            (_a = element
                .shadowRoot.querySelector('[label="Add VoltageLevel"]')) === null || _a === void 0 ? void 0 : _a.click();
            expect(element)
                .property('placing')
                .to.have.property('tagName', 'VoltageLevel');
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            window.dispatchEvent(event);
            expect(element).to.have.property('placing', undefined);
        });
        describe('with a voltage level', () => {
            beforeEach(async () => {
                const doc = new DOMParser().parseFromString(voltageLevelDocString, 'application/xml');
                element.doc = doc;
                await element.updateComplete;
            });
            it('forbids undersizing the substation', async () => {
                var _a, _b, _c, _d;
                const sldEditor = element.shadowRoot.querySelector('sld-editor');
                (_b = (_a = sldEditor.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('h2 > mwc-icon-button')) === null || _b === void 0 ? void 0 : _b.click();
                sldEditor.substationWidthUI.value = '30';
                sldEditor.substationHeightUI.value = '20';
                (_d = (_c = sldEditor.shadowRoot) === null || _c === void 0 ? void 0 : _c.querySelector('mwc-button[slot="primaryAction"]')) === null || _d === void 0 ? void 0 : _d.click();
                expect(sldEditor.substation).to.have.attribute('esld:h', '25');
                expect(sldEditor.substation).to.have.attribute('esld:w', '50');
            });
            it('allows resizing voltage levels', async () => {
                const sldEditor = element.shadowRoot.querySelector('sld-editor');
                const moveHandle = sldEditor.shadowRoot.querySelectorAll('a.handle')[1];
                moveHandle.dispatchEvent(new PointerEvent('click'));
                expect(element)
                    .property('resizing')
                    .to.exist.and.to.have.property('tagName', 'VoltageLevel');
                const voltageLevel = element.resizing;
                expect(voltageLevel).to.have.attribute('esld:w', '48');
                expect(voltageLevel).to.have.attribute('esld:h', '23');
                await sendMouse({ type: 'click', position: [300, 300] });
                expect(voltageLevel).to.have.attribute('esld:w', '8');
                expect(voltageLevel).to.have.attribute('esld:h', '7');
            });
            it('allows moving voltage levels', async () => {
                const sldEditor = element.shadowRoot.querySelector('sld-editor');
                const moveHandle = sldEditor.shadowRoot.querySelector('a.handle');
                moveHandle.dispatchEvent(new PointerEvent('click'));
                expect(element)
                    .property('placing')
                    .to.exist.and.to.have.property('tagName', 'VoltageLevel');
                const voltageLevel = element.placing;
                expect(voltageLevel).to.have.attribute('esld:x', '1');
                expect(voltageLevel).to.have.attribute('esld:y', '1');
                await sendMouse({ type: 'click', position: [100, 150] });
                expect(voltageLevel).to.have.attribute('esld:x', '2');
                expect(voltageLevel).to.have.attribute('esld:y', '2');
            });
            it('forbids moving voltage levels out of bounds', async () => {
                const sldEditor = element.shadowRoot.querySelector('sld-editor');
                const moveHandle = sldEditor.shadowRoot.querySelector('a.handle');
                moveHandle.dispatchEvent(new PointerEvent('click'));
                expect(element)
                    .property('placing')
                    .to.exist.and.to.have.property('tagName', 'VoltageLevel');
                const voltageLevel = element.placing;
                expect(voltageLevel).to.have.attribute('esld:x', '1');
                expect(voltageLevel).to.have.attribute('esld:y', '1');
                await sendMouse({ type: 'click', position: [200, 200] });
                expect(voltageLevel).to.have.attribute('esld:x', '1');
                expect(voltageLevel).to.have.attribute('esld:y', '1');
            });
            it('allows placing a new bay', async () => {
                var _a;
                (_a = element.shadowRoot.querySelector('[label="Add Bay"]')) === null || _a === void 0 ? void 0 : _a.click();
                expect(element).property('placing').to.have.property('tagName', 'Bay');
                const sldEditor = element.shadowRoot.querySelector('sld-editor');
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
                    const doc = new DOMParser().parseFromString(bayDocString, 'application/xml');
                    element.doc = doc;
                    await element.updateComplete;
                });
                it('allows resizing bays', async () => {
                    const sldEditor = element.shadowRoot.querySelector('sld-editor');
                    const moveHandle = sldEditor.shadowRoot.querySelectorAll('g.bay a.handle')[1];
                    moveHandle.dispatchEvent(new PointerEvent('click'));
                    expect(element)
                        .property('resizing')
                        .to.exist.and.to.have.property('tagName', 'Bay');
                    const bay = element.resizing;
                    expect(bay).to.have.attribute('esld:w', '3');
                    expect(bay).to.have.attribute('esld:h', '3');
                    await sendMouse({ type: 'click', position: [400, 400] });
                    expect(bay).to.have.attribute('esld:w', '10');
                    expect(bay).to.have.attribute('esld:h', '9');
                });
                it('forbids resizing bays out of bounds', async () => {
                    const sldEditor = element.shadowRoot.querySelector('sld-editor');
                    const moveHandle = sldEditor.shadowRoot.querySelectorAll('g.bay a.handle')[1];
                    moveHandle.dispatchEvent(new PointerEvent('click'));
                    expect(element)
                        .property('resizing')
                        .to.exist.and.to.have.property('tagName', 'Bay');
                    const bay = element.resizing;
                    expect(bay).to.have.attribute('esld:w', '3');
                    expect(bay).to.have.attribute('esld:h', '3');
                    await sendMouse({ type: 'click', position: [600, 400] });
                    expect(bay).to.have.attribute('esld:w', '3');
                    expect(bay).to.have.attribute('esld:h', '3');
                });
                it('forbids undersizing voltage levels containing bays', async () => {
                    const sldEditor = element.shadowRoot.querySelector('sld-editor');
                    const moveHandle = sldEditor.shadowRoot.querySelectorAll('g.voltagelevel > a.handle')[1];
                    moveHandle.dispatchEvent(new PointerEvent('click'));
                    expect(element)
                        .property('resizing')
                        .to.exist.and.to.have.property('tagName', 'VoltageLevel');
                    const voltageLevel = element.resizing;
                    expect(voltageLevel).to.have.attribute('esld:w', '13');
                    expect(voltageLevel).to.have.attribute('esld:h', '13');
                    await sendMouse({ type: 'click', position: [100, 100] });
                    expect(voltageLevel).to.have.attribute('esld:w', '13');
                    expect(voltageLevel).to.have.attribute('esld:h', '13');
                });
                it('allows moving bays', async () => {
                    const sldEditor = element.shadowRoot.querySelector('sld-editor');
                    sldEditor
                        .shadowRoot.querySelector('g.bay a.handle')
                        .dispatchEvent(new PointerEvent('click'));
                    expect(element)
                        .property('placing')
                        .to.exist.and.to.have.property('tagName', 'Bay');
                    const bay = element.placing;
                    await sendMouse({ type: 'click', position: [200, 200] });
                    expect(bay).to.have.attribute('esld:x', '5');
                    expect(bay).to.have.attribute('esld:y', '3');
                });
                it('renames reparented bays if necessary', async () => {
                    const sldEditor = element.shadowRoot.querySelector('sld-editor');
                    sldEditor
                        .shadowRoot.querySelector('g.bay a.handle')
                        .dispatchEvent(new PointerEvent('click'));
                    const bay = element.placing;
                    expect(bay.parentElement).to.have.attribute('name', 'V1');
                    expect(bay).to.have.attribute('name', 'B1');
                    await sendMouse({ type: 'click', position: [600, 200] });
                    expect(element).to.have.property('placing', undefined);
                    expect(bay).to.have.attribute('esld:x', '18');
                    expect(bay).to.have.attribute('esld:y', '3');
                    expect(bay.parentElement).to.have.attribute('name', 'V2');
                    expect(bay).to.have.attribute('name', 'B2');
                    sldEditor
                        .shadowRoot.querySelector('g.bay a.handle')
                        .dispatchEvent(new PointerEvent('click'));
                    await sendMouse({ type: 'click', position: [200, 200] });
                    expect(bay).to.have.attribute('esld:x', '5');
                    expect(bay).to.have.attribute('esld:y', '3');
                    expect(bay.parentElement).to.have.attribute('name', 'V1');
                    expect(bay).to.have.attribute('name', 'B2');
                });
                it("updates reparented bays' connectivity node paths", async () => {
                    const sldEditor = element.shadowRoot.querySelector('sld-editor');
                    sldEditor
                        .shadowRoot.querySelector('g.bay a.handle')
                        .dispatchEvent(new PointerEvent('click'));
                    const bay = element.placing;
                    const cNode = bay.querySelector('ConnectivityNode');
                    expect(cNode).to.have.attribute('pathName', 'S1/V1/B1/L1');
                    await sendMouse({ type: 'click', position: [600, 200] });
                    expect(element).to.have.property('placing', undefined);
                    expect(cNode).to.have.attribute('pathName', 'S1/V2/B2/L1');
                });
                it('moves a bay when its parent voltage level is moved', async () => {
                    const sldEditor = element.shadowRoot.querySelector('sld-editor');
                    sldEditor
                        .shadowRoot.querySelector('g.voltagelevel a.handle')
                        .dispatchEvent(new PointerEvent('click'));
                    const bay = element.placing.querySelector('Bay');
                    expect(bay).to.have.attribute('esld:x', '2');
                    expect(bay).to.have.attribute('esld:y', '2');
                    await sendMouse({ type: 'click', position: [100, 100] });
                    expect(bay).to.have.attribute('esld:x', '3');
                    expect(bay).to.have.attribute('esld:y', '1');
                });
                it('allows placing new conducting equipment', async () => {
                    var _a;
                    (_a = element
                        .shadowRoot.querySelector('[label="Add CBR"]')) === null || _a === void 0 ? void 0 : _a.click();
                    expect(element)
                        .property('placing')
                        .to.have.property('tagName', 'ConductingEquipment');
                    await sendMouse({ type: 'click', position: [150, 180] });
                    expect(element).to.have.property('placing', undefined);
                    expect(element).to.have.property('resizing', undefined);
                    const equipment = element.doc.querySelector('ConductingEquipment');
                    expect(equipment).to.exist;
                    expect(equipment).to.have.attribute('x', '3');
                    expect(equipment).to.have.attribute('y', '3');
                });
                describe('with conducting equipment', () => {
                    beforeEach(async () => {
                        const doc = new DOMParser().parseFromString(equipmentDocString, 'application/xml');
                        element.doc = doc;
                        await element.updateComplete;
                    });
                    it('moves equipment on left mouse button click', async () => {
                        const sldEditor = element.shadowRoot.querySelector('sld-editor');
                        const equipment = element.doc.querySelector('ConductingEquipment');
                        const id = identity(equipment);
                        const eqClickTarget = sldEditor
                            .shadowRoot.getElementById(id)
                            .querySelector('rect');
                        expect(equipment).to.not.have.attribute('esld:rot');
                        eqClickTarget.dispatchEvent(new PointerEvent('click'));
                        await sendMouse({ type: 'click', position: [150, 180] });
                        expect(equipment).to.have.attribute('esld:x', '3');
                        expect(equipment).to.have.attribute('esld:y', '3');
                    });
                    it('rotates equipment on middle mouse button click', () => {
                        const sldEditor = element.shadowRoot.querySelector('sld-editor');
                        const equipment = element.doc.querySelector('ConductingEquipment');
                        const id = identity(equipment);
                        const eqClickTarget = sldEditor
                            .shadowRoot.getElementById(id)
                            .querySelector('rect');
                        expect(equipment).to.not.have.attribute('esld:rot');
                        eqClickTarget.dispatchEvent(new PointerEvent('auxclick', { button: 1 }));
                        expect(equipment).to.have.attribute('esld:rot', '1');
                    });
                    it('displays a menu on equipment right click', async () => {
                        const sldEditor = element.shadowRoot.querySelector('sld-editor');
                        const equipment = element.doc.querySelector('ConductingEquipment');
                        const id = identity(equipment);
                        const eqClickTarget = sldEditor
                            .shadowRoot.getElementById(id)
                            .querySelector('rect');
                        eqClickTarget.dispatchEvent(new PointerEvent('contextmenu', { clientX: 750, clientY: 550 }));
                        await element.updateComplete;
                        expect(sldEditor)
                            .property('menu')
                            .to.exist.and.to.have.property('element', equipment);
                    });
                    it('flips the equipment on first menu item select', async () => {
                        const sldEditor = element.shadowRoot.querySelector('sld-editor');
                        const equipment = element.doc.querySelector('ConductingEquipment');
                        const id = identity(equipment);
                        let eqClickTarget = sldEditor
                            .shadowRoot.getElementById(id)
                            .querySelector('rect');
                        eqClickTarget.dispatchEvent(new PointerEvent('contextmenu'));
                        await element.updateComplete;
                        let item = sldEditor.shadowRoot.querySelector('mwc-list-item');
                        expect(equipment).to.not.have.attribute('esld:flip');
                        await sendMouse({ type: 'click', position: middleOf(item) });
                        expect(equipment).to.have.attribute('esld:flip', 'true');
                        eqClickTarget = sldEditor
                            .shadowRoot.getElementById(id)
                            .querySelector('rect');
                        eqClickTarget.dispatchEvent(new PointerEvent('contextmenu'));
                        await element.updateComplete;
                        item = sldEditor.shadowRoot.querySelector('mwc-list-item');
                        await sendMouse({ type: 'click', position: middleOf(item) });
                        expect(equipment).to.not.have.attribute('esld:flip');
                    });
                    it('rotates equipment on second menu item select', async () => {
                        const sldEditor = element.shadowRoot.querySelector('sld-editor');
                        const equipment = element.doc.querySelector('ConductingEquipment');
                        const id = identity(equipment);
                        const eqClickTarget = sldEditor
                            .shadowRoot.getElementById(id)
                            .querySelector('rect');
                        eqClickTarget.dispatchEvent(new PointerEvent('contextmenu'));
                        await element.updateComplete;
                        const item = sldEditor.shadowRoot.querySelector('mwc-list-item:nth-of-type(2)');
                        expect(equipment).to.not.have.attribute('esld:rot');
                        item.selected = true;
                        await element.updateComplete;
                        expect(equipment).to.have.attribute('esld:rot', '1');
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=oscd-designer.spec.js.map