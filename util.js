export const privType = 'Transpower-SLD-Vertices';
export const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';
export const xmlnsNs = 'http://www.w3.org/2000/xmlns/';
export const svgNs = 'http://www.w3.org/2000/svg';
function pathString(...args) {
    return args.join('/');
}
export function elementPath(element, ...rest) {
    const pedigree = [];
    let child = element;
    while ((child === null || child === void 0 ? void 0 : child.parentElement) && child.hasAttribute('name')) {
        pedigree.unshift(child.getAttribute('name'));
        child = child.parentElement;
    }
    return pathString(...pedigree, ...rest);
}
export function attributes(element) {
    var _a, _b;
    const [x, y, w, h, rotVal] = ['x', 'y', 'w', 'h', 'rot'].map(name => { var _a; return parseFloat((_a = element.getAttributeNS(sldNs, name)) !== null && _a !== void 0 ? _a : '0'); });
    const pos = [x, y].map(d => Math.max(0, d));
    const dim = [w, h].map(d => Math.max(1, d));
    const flip = ['true', '1'].includes((_b = (_a = element.getAttributeNS(sldNs, 'flip')) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : 'false');
    const rot = (((rotVal % 4) + 4) % 4);
    return { pos, dim, flip, rot };
}
export function connectionStartPoints(equipment) {
    const { pos: [x, y], rot, } = attributes(equipment);
    const top = {
        close: [
            [x + 0.5, y],
            [x + 1, y + 0.5],
            [x + 0.5, y + 1],
            [x, y + 0.5],
        ][rot],
        far: [
            [x + 0.5, y - 0.5],
            [x + 1.5, y + 0.5],
            [x + 0.5, y + 1.5],
            [x - 0.5, y + 0.5],
        ][rot],
    };
    const bottom = {
        close: [
            [x + 0.5, y + 1],
            [x, y + 0.5],
            [x + 0.5, y],
            [x + 1, y + 0.5],
        ][rot],
        far: [
            [x + 0.5, y + 1.5],
            [x - 0.5, y + 0.5],
            [x + 0.5, y - 0.5],
            [x + 1.5, y + 0.5],
        ][rot],
    };
    return { top, bottom };
}
export function newResizeEvent(detail) {
    return new CustomEvent('oscd-sld-resize', {
        bubbles: true,
        composed: true,
        detail,
    });
}
export function newPlaceEvent(detail) {
    return new CustomEvent('oscd-sld-place', {
        bubbles: true,
        composed: true,
        detail,
    });
}
export function newConnectEvent(detail) {
    return new CustomEvent('oscd-sld-connect', {
        bubbles: true,
        composed: true,
        detail,
    });
}
export function newRotateEvent(detail) {
    return new CustomEvent('oscd-sld-rotate', {
        bubbles: true,
        composed: true,
        detail,
    });
}
export function newStartResizeEvent(detail) {
    return new CustomEvent('oscd-sld-start-resize', {
        bubbles: true,
        composed: true,
        detail,
    });
}
export function newStartPlaceEvent(detail) {
    return new CustomEvent('oscd-sld-start-place', {
        bubbles: true,
        composed: true,
        detail,
    });
}
export function newStartConnectEvent(detail) {
    return new CustomEvent('oscd-sld-start-connect', {
        bubbles: true,
        composed: true,
        detail,
    });
}
//# sourceMappingURL=util.js.map