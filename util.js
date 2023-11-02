export const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';
export function attributes(element) {
    var _a, _b;
    const [x, y, w, h, rotVal] = ['x', 'y', 'w', 'h', 'rot'].map(name => { var _a; return parseInt((_a = element.getAttributeNS(sldNs, name)) !== null && _a !== void 0 ? _a : '0', 10); });
    const pos = [x, y].map(d => Math.max(0, d));
    const dim = [w, h].map(d => Math.max(1, d));
    const flip = ['true', '1'].includes((_b = (_a = element.getAttributeNS(sldNs, 'flip')) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : 'false');
    const rot = (((rotVal % 4) + 4) % 4);
    return { pos, dim, flip, rot };
}
//# sourceMappingURL=util.js.map