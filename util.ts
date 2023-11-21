import { Edit } from '@openscd/open-scd-core';
import { getReference } from '@openscd/oscd-scl';

export const privType = 'Transpower-SLD-Vertices';
export const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';
export const xmlnsNs = 'http://www.w3.org/2000/xmlns/';
export const svgNs = 'http://www.w3.org/2000/svg';
export const xlinkNs = 'http://www.w3.org/1999/xlink';

export const eqTypes = [
  'CAB',
  'CAP',
  'CBR',
  'CTR',
  'DIS',
  'GEN',
  'IFL',
  'LIN',
  'MOT',
  'REA',
  'RES',
  'SAR',
  'SMC',
  'VTR',
] as const;
export type EqType = (typeof eqTypes)[number];
export function isEqType(str: string): str is EqType {
  return eqTypes.includes(str as EqType);
}
export const ringedEqTypes = new Set(['GEN', 'MOT', 'SMC']);

export type Point = [number, number];
export type Attrs = {
  pos: Point;
  dim: Point;
  label: Point;
  flip: boolean;
  rot: 0 | 1 | 2 | 3;
  bus: boolean;
};

export function xmlBoolean(value?: string | null) {
  return ['true', '1'].includes(value?.trim() ?? 'false');
}

export function isBusBar(element: Element) {
  return (
    element.tagName === 'Bay' &&
    xmlBoolean(element.querySelector('Section[bus]')?.getAttribute('bus'))
  );
}

export function attributes(element: Element): Attrs {
  const [x, y, w, h, rotVal, labelX, labelY] = [
    'x',
    'y',
    'w',
    'h',
    'rot',
    'lx',
    'ly',
  ].map(name => parseFloat(element.getAttributeNS(sldNs, name) ?? '0'));
  const pos = [x, y].map(d => Math.max(0, d)) as Point;
  const dim = [w, h].map(d => Math.max(1, d)) as Point;
  const label = [labelX, labelY].map(d => Math.max(0, d)) as Point;

  const bus = xmlBoolean(element.getAttribute('bus'));
  const flip = xmlBoolean(element.getAttributeNS(sldNs, 'flip'));

  const rot = (((rotVal % 4) + 4) % 4) as 0 | 1 | 2 | 3;

  return { pos, dim, label, flip, rot, bus };
}

function pathString(...args: string[]) {
  return args.join('/');
}

export function elementPath(element: Element, ...rest: string[]): string {
  const pedigree = [];
  let child = element;
  while (child.parentElement && child.hasAttribute('name')) {
    pedigree.unshift(child.getAttribute('name')!);
    child = child.parentElement;
  }
  return pathString(...pedigree, ...rest);
}

function collinear(v0: Element, v1: Element, v2: Element) {
  const [[x0, y0], [x1, y1], [x2, y2]] = [v0, v1, v2].map(vertex =>
    ['x', 'y'].map(name => vertex.getAttributeNS(sldNs, name))
  );
  return (x0 === x1 && x1 === x2) || (y0 === y1 && y1 === y2);
}

export function removeNode(node: Element): Edit[] {
  const edits = [] as Edit[];

  if (xmlBoolean(node.querySelector(`Section[bus]`)?.getAttribute('bus'))) {
    Array.from(node.querySelectorAll('Section:not([bus])')).forEach(section =>
      edits.push({ node: section })
    );
    const sections = Array.from(node.querySelectorAll('Section[bus]'));
    const busSection = sections[0];
    Array.from(busSection.children)
      .slice(1)
      .forEach(vertex => edits.push({ node: vertex }));
    const lastVertex = sections[sections.length - 1].lastElementChild;
    if (lastVertex)
      edits.push({ parent: busSection, node: lastVertex, reference: null });
    sections.slice(1).forEach(section => edits.push({ node: section }));
  } else edits.push({ node });

  Array.from(
    node.ownerDocument.querySelectorAll(
      `Terminal[connectivityNode="${node.getAttribute('pathName')}"]`
    )
  ).forEach(terminal => edits.push({ node: terminal }));

  return edits;
}

function reverseSection(section: Element): Edit[] {
  const edits = [] as Edit[];

  Array.from(section.children)
    .reverse()
    .forEach(vertex =>
      edits.push({ parent: section, node: vertex, reference: null })
    );

  return edits;
}

function healSectionCut(cut: Element): Edit[] {
  const [x, y] = ['x', 'y'].map(name => cut.getAttributeNS(sldNs, name));

  const isCut = (vertex: Element) =>
    vertex !== cut &&
    vertex.getAttributeNS(sldNs, 'x') === x &&
    vertex.getAttributeNS(sldNs, 'y') === y;

  const cutVertices = Array.from(
    cut.closest('Private')!.getElementsByTagNameNS(sldNs, 'Section')
  ).flatMap(section => Array.from(section.children).filter(isCut));
  const cutSections = cutVertices.map(v => v.parentElement) as Element[];

  if (cutSections.length > 2) return [];
  if (cutSections.length < 2)
    return removeNode(cut.closest('ConnectivityNode')!);
  const [busA, busB] = cutSections.map(section =>
    xmlBoolean(section.getAttribute('bus'))
  );
  if (busA !== busB) return [];

  const edits = [] as Edit[];
  const [sectionA, sectionB] = cutSections as [Element, Element];
  if (isCut(sectionA.firstElementChild!)) edits.push(reverseSection(sectionA));
  const sectionBChildren = Array.from(sectionB.children);
  if (isCut(sectionB.lastElementChild!)) sectionBChildren.reverse();

  sectionBChildren
    .slice(1)
    .forEach(node => edits.push({ parent: sectionA, node, reference: null }));

  const cutA = Array.from(sectionA.children).find(isCut);
  const neighbourA = isCut(sectionA.firstElementChild!)
    ? sectionA.children[1]
    : sectionA.children[sectionA.childElementCount - 2];
  const neighbourB = sectionBChildren[1];
  if (
    neighbourA &&
    cutA &&
    neighbourB &&
    collinear(neighbourA, cutA, neighbourB)
  )
    edits.push({ node: cutA });
  edits.push({ node: sectionB });

  return edits;
}

function updateTerminals(
  parent: Element,
  cNode: Element,
  substationName: string,
  voltageLevelName: string,
  bayName: string,
  cNodeName: string,
  connectivityNode: string
) {
  const updates = [] as Edit[];

  const [oldSubstationName, oldVoltageLevelName, oldBayName] = [
    'Substation',
    'VoltageLevel',
    'Bay',
  ].map(tag => cNode.closest(tag)?.getAttribute('name') ?? '');
  const oldCNodeName = cNode.getAttribute('name');
  const oldConnectivityNode = `${oldSubstationName}/${oldVoltageLevelName}/${oldBayName}/${oldCNodeName}`;

  const terminals = Array.from(
    parent.ownerDocument.querySelectorAll(
      `Terminal[substationName="${oldSubstationName}"][voltageLevelName="${oldVoltageLevelName}"][bayName="${oldBayName}"][cNodeName="${oldCNodeName}"], Terminal[connectivityNode="${oldConnectivityNode}"]`
    )
  );
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

function updateConnectivityNodes(
  element: Element,
  parent: Element,
  name: string
) {
  const updates = [] as Edit[];

  const cNodes = Array.from(element.getElementsByTagName('ConnectivityNode'));
  if (element.tagName === 'ConnectivityNode') cNodes.push(element);
  const substationName = parent.closest('Substation')!.getAttribute('name');
  let voltageLevelName = parent.closest('VoltageLevel')?.getAttribute('name');
  if (element.tagName === 'VoltageLevel') voltageLevelName = name;

  cNodes.forEach(cNode => {
    let cNodeName = cNode.getAttribute('name');
    if (element === cNode) cNodeName = name;
    let bayName = cNode.parentElement?.getAttribute('name') ?? '';
    if (element.tagName === 'Bay') bayName = name;
    if (parent.tagName === 'Bay' && parent.hasAttribute('name'))
      bayName = parent.getAttribute('name')!;

    if (cNodeName && bayName) {
      const pathName = `${substationName}/${voltageLevelName}/${bayName}/${cNodeName}`;
      updates.push({
        element: cNode,
        attributes: {
          pathName,
        },
      });
      if (substationName && voltageLevelName && bayName)
        updates.push(
          ...updateTerminals(
            parent,
            cNode,
            substationName,
            voltageLevelName,
            bayName,
            cNodeName,
            pathName
          )
        );
    }
  });
  return updates;
}

function uniqueName(element: Element, parent: Element): string {
  const children = Array.from(parent.children);
  const oldName = element.getAttribute('name');
  if (
    oldName &&
    !children.find(child => child.getAttribute('name') === oldName)
  )
    return oldName;

  const baseName =
    element.getAttribute('name')?.replace(/[0-9]*$/, '') ??
    element.getAttribute('type') ??
    element.tagName.charAt(0);
  let index = 1;
  function hasName(child: Element) {
    return child.getAttribute('name') === baseName + index.toString();
  }
  while (children.find(hasName)) index += 1;

  return baseName + index.toString();
}

export function reparentElement(element: Element, parent: Element): Edit[] {
  const edits: Edit[] = [];
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

export function removeTerminal(terminal: Element): Edit[] {
  const edits = [] as Edit[];

  edits.push({ node: terminal });
  const pathName = terminal.getAttribute('connectivityNode');
  const cNode = terminal.ownerDocument.querySelector(
    `ConnectivityNode[pathName="${pathName}"]`
  );

  const otherTerminals = Array.from(
    terminal.ownerDocument.querySelectorAll(
      `Terminal[connectivityNode="${pathName}"]`
    )
  ).filter(t => t !== terminal);

  if (
    cNode &&
    otherTerminals.length &&
    otherTerminals.some(t => t.closest('Bay')) &&
    otherTerminals.every(t => t.closest('Bay') !== cNode.closest('Bay')) &&
    !isBusBar(cNode.closest('Bay')!)
  ) {
    const newParent = otherTerminals
      .find(t => t.closest('Bay'))!
      .closest('Bay');
    if (newParent) edits.push(...reparentElement(cNode, newParent));
  }

  const priv = cNode?.querySelector(`Private[type="${privType}"]`);
  const vertex = priv?.querySelector(
    `Vertex[*|uuid="${terminal.getAttributeNS(sldNs, 'uuid')}"]`
  );
  const section = vertex?.parentElement;
  if (!section) return edits;
  edits.push({ node: section });

  const cut =
    vertex === section.lastElementChild
      ? section.firstElementChild
      : section.lastElementChild;

  if (cut) edits.push(...healSectionCut(cut));

  return edits;
}

export function connectionStartPoints(equipment: Element): {
  top: { close: Point; far: Point };
  bottom: { close: Point; far: Point };
} {
  const {
    pos: [x, y],
    rot,
  } = attributes(equipment);

  const top = {
    close: [
      [x + 0.5, y],
      [x + 1, y + 0.5],
      [x + 0.5, y + 1],
      [x, y + 0.5],
    ][rot] as Point,
    far: [
      [x + 0.5, y - 0.5],
      [x + 1.5, y + 0.5],
      [x + 0.5, y + 1.5],
      [x - 0.5, y + 0.5],
    ][rot] as Point,
  };
  const bottom = {
    close: [
      [x + 0.5, y + 1],
      [x, y + 0.5],
      [x + 0.5, y],
      [x + 1, y + 0.5],
    ][rot] as Point,
    far: [
      [x + 0.5, y + 1.5],
      [x - 0.5, y + 0.5],
      [x + 0.5, y - 0.5],
      [x + 1.5, y + 0.5],
    ][rot] as Point,
  };

  return { top, bottom };
}

export type ResizeDetail = {
  w: number;
  h: number;
  element: Element;
};
export type ResizeEvent = CustomEvent<ResizeDetail>;
export function newResizeEvent(detail: ResizeDetail): ResizeEvent {
  return new CustomEvent('oscd-sld-resize', {
    bubbles: true,
    composed: true,
    detail,
  });
}

export type PlaceLabelDetail = {
  x: number;
  y: number;
  element: Element;
};
export type PlaceDetail = {
  x: number;
  y: number;
  element: Element;
  parent: Element;
};
export type PlaceEvent = CustomEvent<PlaceDetail>;
export function newPlaceEvent(detail: PlaceDetail): PlaceEvent {
  return new CustomEvent('oscd-sld-place', {
    bubbles: true,
    composed: true,
    detail,
  });
}

export type PlaceLabelEvent = CustomEvent<PlaceLabelDetail>;
export function newPlaceLabelEvent(detail: PlaceLabelDetail): PlaceLabelEvent {
  return new CustomEvent('oscd-sld-place-label', {
    bubbles: true,
    composed: true,
    detail,
  });
}

export type ConnectDetail = {
  equipment: Element;
  path: Point[];
  terminal: 'top' | 'bottom';
  connectTo: Element;
  toTerminal?: 'top' | 'bottom';
};
export type ConnectEvent = CustomEvent<ConnectDetail>;
export function newConnectEvent(detail: ConnectDetail): ConnectEvent {
  return new CustomEvent('oscd-sld-connect', {
    bubbles: true,
    composed: true,
    detail,
  });
}
export type StartEvent = CustomEvent<Element>;
export function newRotateEvent(detail: Element): StartEvent {
  return new CustomEvent('oscd-sld-rotate', {
    bubbles: true,
    composed: true,
    detail,
  });
}
export function newStartResizeEvent(detail: Element): StartEvent {
  return new CustomEvent('oscd-sld-start-resize', {
    bubbles: true,
    composed: true,
    detail,
  });
}
export function newStartPlaceEvent(detail: Element): StartEvent {
  return new CustomEvent('oscd-sld-start-place', {
    bubbles: true,
    composed: true,
    detail,
  });
}
export function newStartPlaceLabelEvent(detail: Element): StartEvent {
  return new CustomEvent('oscd-sld-start-place-label', {
    bubbles: true,
    composed: true,
    detail,
  });
}
export type StartConnectDetail = {
  equipment: Element;
  terminal: 'top' | 'bottom';
};
export type StartConnectEvent = CustomEvent<StartConnectDetail>;
export function newStartConnectEvent(
  detail: StartConnectDetail
): StartConnectEvent {
  return new CustomEvent('oscd-sld-start-connect', {
    bubbles: true,
    composed: true,
    detail,
  });
}

declare global {
  interface ElementEventMap {
    ['oscd-sld-resize']: ResizeEvent;
    ['oscd-sld-place']: PlaceEvent;
    ['oscd-sld-place-label']: PlaceLabelEvent;
    ['oscd-sld-connect']: ConnectEvent;
    ['oscd-sld-rotate']: StartEvent;
    ['oscd-sld-start-resize']: StartEvent;
    ['oscd-sld-start-place']: StartEvent;
    ['oscd-sld-start-place-label']: StartEvent;
    ['oscd-sld-start-connect']: StartConnectEvent;
  }
}
