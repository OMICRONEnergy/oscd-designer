import { getReference } from '@openscd/oscd-scl';
export const privType = 'Transpower-SLD-Vertices';
export const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';
export const xmlnsNs = 'http://www.w3.org/2000/xmlns/';
export const svgNs = 'http://www.w3.org/2000/svg';
export function xmlBoolean(value) {
    var _a;
    return ['true', '1'].includes((_a = value === null || value === void 0 ? void 0 : value.trim()) !== null && _a !== void 0 ? _a : 'false');
}
export function isBusBar(element) {
    var _a;
    return (element.tagName === 'Bay' &&
        xmlBoolean((_a = element.querySelector('Section[bus]')) === null || _a === void 0 ? void 0 : _a.getAttribute('bus')));
}
export function attributes(element) {
    const [x, y, w, h, rotVal, labelX, labelY] = [
        'x',
        'y',
        'w',
        'h',
        'rot',
        'lx',
        'ly',
    ].map(name => { var _a; return parseFloat((_a = element.getAttributeNS(sldNs, name)) !== null && _a !== void 0 ? _a : '0'); });
    const pos = [x, y].map(d => Math.max(0, d));
    const dim = [w, h].map(d => Math.max(1, d));
    const label = [labelX, labelY].map(d => Math.max(0, d));
    const bus = xmlBoolean(element.getAttribute('bus'));
    const flip = xmlBoolean(element.getAttributeNS(sldNs, 'flip'));
    const rot = (((rotVal % 4) + 4) % 4);
    return { pos, dim, label, flip, rot, bus };
}
function pathString(...args) {
    return args.join('/');
}
export function elementPath(element, ...rest) {
    const pedigree = [];
    let child = element;
    while (child.parentElement && child.hasAttribute('name')) {
        pedigree.unshift(child.getAttribute('name'));
        child = child.parentElement;
    }
    return pathString(...pedigree, ...rest);
}
function collinear(v0, v1, v2) {
    const [[x0, y0], [x1, y1], [x2, y2]] = [v0, v1, v2].map(vertex => ['x', 'y'].map(name => vertex.getAttributeNS(sldNs, name)));
    return (x0 === x1 && x1 === x2) || (y0 === y1 && y1 === y2);
}
export function removeNode(node) {
    var _a;
    const edits = [];
    if (xmlBoolean((_a = node.querySelector(`Section[bus]`)) === null || _a === void 0 ? void 0 : _a.getAttribute('bus'))) {
        Array.from(node.querySelectorAll('Section:not([bus])')).forEach(section => edits.push({ node: section }));
        const sections = Array.from(node.querySelectorAll('Section[bus]'));
        const busSection = sections[0];
        Array.from(busSection.children)
            .slice(1)
            .forEach(vertex => edits.push({ node: vertex }));
        const lastVertex = sections[sections.length - 1].lastElementChild;
        if (lastVertex)
            edits.push({ parent: busSection, node: lastVertex, reference: null });
        sections.slice(1).forEach(section => edits.push({ node: section }));
    }
    else
        edits.push({ node });
    Array.from(node.ownerDocument.querySelectorAll(`Terminal[connectivityNode="${node.getAttribute('pathName')}"]`)).forEach(terminal => edits.push({ node: terminal }));
    return edits;
}
function reverseSection(section) {
    const edits = [];
    Array.from(section.children)
        .reverse()
        .forEach(vertex => edits.push({ parent: section, node: vertex, reference: null }));
    return edits;
}
function healSectionCut(cut) {
    const [x, y] = ['x', 'y'].map(name => cut.getAttributeNS(sldNs, name));
    const isCut = (vertex) => vertex !== cut &&
        vertex.getAttributeNS(sldNs, 'x') === x &&
        vertex.getAttributeNS(sldNs, 'y') === y;
    const cutVertices = Array.from(cut.closest('Private').getElementsByTagNameNS(sldNs, 'Section')).flatMap(section => Array.from(section.children).filter(isCut));
    const cutSections = cutVertices.map(v => v.parentElement);
    if (cutSections.length > 2)
        return [];
    if (cutSections.length < 2)
        return removeNode(cut.closest('ConnectivityNode'));
    const [busA, busB] = cutSections.map(section => xmlBoolean(section.getAttribute('bus')));
    if (busA !== busB)
        return [];
    const edits = [];
    const [sectionA, sectionB] = cutSections;
    if (isCut(sectionA.firstElementChild))
        edits.push(reverseSection(sectionA));
    const sectionBChildren = Array.from(sectionB.children);
    if (isCut(sectionB.lastElementChild))
        sectionBChildren.reverse();
    sectionBChildren
        .slice(1)
        .forEach(node => edits.push({ parent: sectionA, node, reference: null }));
    const cutA = Array.from(sectionA.children).find(isCut);
    const neighbourA = isCut(sectionA.firstElementChild)
        ? sectionA.children[1]
        : sectionA.children[sectionA.childElementCount - 2];
    const neighbourB = sectionBChildren[1];
    if (neighbourA &&
        cutA &&
        neighbourB &&
        collinear(neighbourA, cutA, neighbourB))
        edits.push({ node: cutA });
    edits.push({ node: sectionB });
    return edits;
}
function updateTerminals(parent, cNode, substationName, voltageLevelName, bayName, cNodeName, connectivityNode) {
    const updates = [];
    const [oldSubstationName, oldVoltageLevelName, oldBayName] = [
        'Substation',
        'VoltageLevel',
        'Bay',
    ].map(tag => { var _a, _b; return (_b = (_a = cNode.closest(tag)) === null || _a === void 0 ? void 0 : _a.getAttribute('name')) !== null && _b !== void 0 ? _b : ''; });
    const oldCNodeName = cNode.getAttribute('name');
    const oldConnectivityNode = `${oldSubstationName}/${oldVoltageLevelName}/${oldBayName}/${oldCNodeName}`;
    const terminals = Array.from(parent.ownerDocument.querySelectorAll(`Terminal[substationName="${oldSubstationName}"][voltageLevelName="${oldVoltageLevelName}"][bayName="${oldBayName}"][cNodeName="${oldCNodeName}"], Terminal[connectivityNode="${oldConnectivityNode}"]`));
    terminals.forEach(terminal => {
        updates.push({
            element: terminal,
            attributes: {
                substationName,
                voltageLevelName,
                bayName,
                connectivityNode,
                cNodeName,
            },
        });
    });
    return updates;
}
function updateConnectivityNodes(element, parent, name) {
    var _a;
    const updates = [];
    const cNodes = Array.from(element.getElementsByTagName('ConnectivityNode'));
    if (element.tagName === 'ConnectivityNode')
        cNodes.push(element);
    const substationName = parent.closest('Substation').getAttribute('name');
    let voltageLevelName = (_a = parent.closest('VoltageLevel')) === null || _a === void 0 ? void 0 : _a.getAttribute('name');
    if (element.tagName === 'VoltageLevel')
        voltageLevelName = name;
    cNodes.forEach(cNode => {
        var _a, _b;
        let cNodeName = cNode.getAttribute('name');
        if (element === cNode)
            cNodeName = name;
        let bayName = (_b = (_a = cNode.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute('name')) !== null && _b !== void 0 ? _b : '';
        if (element.tagName === 'Bay')
            bayName = name;
        if (parent.tagName === 'Bay' && parent.hasAttribute('name'))
            bayName = parent.getAttribute('name');
        if (cNodeName && bayName) {
            const pathName = `${substationName}/${voltageLevelName}/${bayName}/${cNodeName}`;
            updates.push({
                element: cNode,
                attributes: {
                    pathName,
                },
            });
            if (substationName && voltageLevelName && bayName)
                updates.push(...updateTerminals(parent, cNode, substationName, voltageLevelName, bayName, cNodeName, pathName));
        }
    });
    return updates;
}
function uniqueName(element, parent) {
    var _a, _b;
    const children = Array.from(parent.children);
    const oldName = element.getAttribute('name');
    if (oldName &&
        !children.find(child => child.getAttribute('name') === oldName))
        return oldName;
    const baseName = (_b = (_a = element.getAttribute('name')) === null || _a === void 0 ? void 0 : _a.replace(/[0-9]*$/, '')) !== null && _b !== void 0 ? _b : element.tagName.charAt(0);
    let index = 1;
    function hasName(child) {
        return child.getAttribute('name') === baseName + index.toString();
    }
    while (children.find(hasName))
        index += 1;
    return baseName + index.toString();
}
export function reparentElement(element, parent) {
    const edits = [];
    edits.push({
        node: element,
        parent,
        reference: getReference(parent, element.tagName),
    });
    const newName = uniqueName(element, parent);
    if (newName !== element.getAttribute('name'))
        edits.push({ element, attributes: { name: newName } });
    edits.push(...updateConnectivityNodes(element, parent, newName));
    return edits;
}
export function removeTerminal(terminal) {
    const edits = [];
    edits.push({ node: terminal });
    const pathName = terminal.getAttribute('connectivityNode');
    const cNode = terminal.ownerDocument.querySelector(`ConnectivityNode[pathName="${pathName}"]`);
    const otherTerminals = Array.from(terminal.ownerDocument.querySelectorAll(`Terminal[connectivityNode="${pathName}"]`)).filter(t => t !== terminal);
    if (cNode &&
        otherTerminals.length &&
        otherTerminals.some(t => t.closest('Bay')) &&
        otherTerminals.every(t => t.closest('Bay') !== cNode.closest('Bay')) &&
        !isBusBar(cNode.closest('Bay'))) {
        const newParent = otherTerminals
            .find(t => t.closest('Bay'))
            .closest('Bay');
        if (newParent)
            edits.push(...reparentElement(cNode, newParent));
    }
    const priv = cNode === null || cNode === void 0 ? void 0 : cNode.querySelector(`Private[type="${privType}"]`);
    const vertex = priv === null || priv === void 0 ? void 0 : priv.querySelector(`Vertex[*|uuid="${terminal.getAttributeNS(sldNs, 'uuid')}"]`);
    const section = vertex === null || vertex === void 0 ? void 0 : vertex.parentElement;
    if (!section)
        return edits;
    edits.push({ node: section });
    const cut = vertex === section.lastElementChild
        ? section.firstElementChild
        : section.lastElementChild;
    if (cut)
        edits.push(...healSectionCut(cut));
    return edits;
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
export function newPlaceLabelEvent(detail) {
    return new CustomEvent('oscd-sld-place-label', {
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
export function newStartPlaceLabelEvent(detail) {
    return new CustomEvent('oscd-sld-start-place-label', {
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