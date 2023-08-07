import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import Designer from './oscd-designer.js';
customElements.define('sld-designer', Designer);
export const sclDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
  <DataTypeTemplates></DataTypeTemplates>
</SCL>`;
describe('Designer', () => {
    let element;
    beforeEach(async () => {
        element = await fixture(html `<sld-designer></sld-designer>`);
    });
    it('does nothing yet', () => expect(element).to.exist);
});
//# sourceMappingURL=oscd-designer.spec.js.map