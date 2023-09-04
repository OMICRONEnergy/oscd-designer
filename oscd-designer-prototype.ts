/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
/* eslint-disable no-return-assign */
/* eslint-disable no-debugger */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */

import { LitElement, html, css, svg, nothing } from 'lit';
import { svg as staticSvg, unsafeStatic } from 'lit/static-html.js';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { query, state } from 'lit/decorators.js';

import { Edit, newEditEvent } from '@openscd/open-scd-core';
import { getReference, identity } from '@openscd/oscd-scl';

import { symbols } from './icons.js';

/*
// open-scd editor action for backwards compatibility
function newCreateEvent(parent: Node, element: Node, reference?: Node | null) {
  return new CustomEvent('editor-action', {
    bubbles: true,
    composed: true,
    detail: { action: { new: { parent, element, reference } } },
  });
}
*/

const svgNs = 'http://www.w3.org/2000/svg';
const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';
const gridSize = 25;

const singleTerminal = [
  'VTR',
  'GEN',
  'MOT',
  'FAN',
  'PMP',
  'EFN',
  'BAT',
  'RRC',
  'SAR',
  'SMC',
  'IFL',
];

const dirs = ['E', 'S', 'W', 'N'] as const;

type Dir = (typeof dirs)[number];

const clockwise: Record<Dir, Dir> = { E: 'S', S: 'W', W: 'N', N: 'E' };

type Attrs = {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: Dir;
  bus: boolean;
};

function direction(str: string | null): Dir {
  const dir = str?.toUpperCase();
  if (dirs.includes(dir as Dir)) return dir as Dir;
  return 'S';
}

const degrees = { S: 0, W: 90, N: 180, E: 270 };

function attributes(element: Element): Attrs {
  const [x, y, w, h] = ['x', 'y', 'w', 'h'].map(name =>
    parseInt(element.getAttributeNS(sldNs, name) ?? '1', 10)
  );
  const dir = direction(element.getAttributeNS(sldNs, 'dir'));
  const bus = ['true', '1'].includes(
    element.getAttributeNS(sldNs, 'bus')?.trim() ?? 'false'
  );

  return { x, y, w, h, bus, dir };
}

const childTags: Partial<Record<string, string[]>> = {
  SCL: ['Substation'],
  Substation: ['VoltageLevel'],
  VoltageLevel: ['Bay'],
  Bay: ['ConductingEquipment', 'ConnectivityNode'],
  ConductingEquipment: ['Terminal'],
};

function getChildren(element: Element): Element[] {
  return Array.from(element.children).filter(child =>
    childTags[element.tagName]?.includes(child.tagName)
  );
}

function isValidTarget(target: Element, moving: Element) {
  return (
    childTags[target.tagName]?.includes(moving.tagName) &&
    [target, null].includes(moving.closest(target.tagName))
  );
}

function svgCoordinates(
  clientX: number,
  clientY: number,
  svgElement: SVGGraphicsElement
) {
  const p = new DOMPoint(clientX, clientY);
  const { x, y } = p.matrixTransform(svgElement.getScreenCTM()?.inverse());
  return { clickedX: Math.floor(x), clickedY: Math.floor(y) };
}

type LineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  from: Element;
  to?: Element | number;
};

export default class Designer extends LitElement {
  @state()
  doc?: XMLDocument;

  @state()
  editCount = -1;

  @state()
  placing?: Element;

  @state()
  resizing?: Element;

  getSVG(id: string | number) {
    if (Number.isNaN(id)) return null;
    return (
      this.shadowRoot?.querySelector<SVGGraphicsElement>(`svg#${id}`) ?? null
    );
  }

  insertAt(x: number, y: number, parent: Element) {
    if (!this.placing) return;
    this.placing.setAttributeNS(sldNs, 'x', x.toString());
    this.placing.setAttributeNS(sldNs, 'y', y.toString());

    this.dispatchEvent(
      newEditEvent({
        parent,
        node: this.placing,
        reference: getReference(parent, this.placing.tagName),
      })
    );
  }

  placeAt(clientX: number, clientY: number, target: Element) {
    if (!this.placing) return;
    const svgElement = this.getSVG(identity(target.closest('Substation')!));
    if (!svgElement) return;

    const { clickedX, clickedY } = svgCoordinates(clientX, clientY, svgElement);

    if (this.placing.closest(target.tagName) === target)
      this.dispatchEvent(
        newEditEvent({
          element: this.placing,
          attributes: {
            x: { namespaceURI: sldNs, value: clickedX.toString() },
            y: { namespaceURI: sldNs, value: clickedY.toString() },
          },
        })
      );
    else this.insertAt(clickedX, clickedY, target);

    if (
      !['ConductingEquipment', 'Substation', 'ConnectivityNode'].includes(
        this.placing.tagName
      )
    )
      this.resizing = this.placing;
    this.placing = undefined;
  }

  rotateEquipment(element: Element) {
    const { dir } = attributes(element);
    const value = clockwise[dir];
    this.dispatchEvent(
      newEditEvent({
        element,
        attributes: { dir: { namespaceURI: sldNs, value } },
      })
    );
  }

  resizeTo(clientX: number, clientY: number) {
    if (!this.resizing) return;
    const svgElement = this.getSVG(
      identity(this.resizing.closest('Substation')!)
    );
    if (!svgElement) return;

    const { clickedX, clickedY } = svgCoordinates(clientX, clientY, svgElement);

    const { x: elementX, y: elementY, bus } = attributes(this.resizing);

    const w = Math.max(clickedX - elementX + 1, 1);
    const h = Math.max(clickedY - elementY + 1, 1);

    if (bus) {
      const horizontal = w > h;
      const [x1, y1] = [elementX, elementY].map(n => n + 0.5);
      let [x2, y2] = [x1, y1];
      if (horizontal) x2 += w - 1;
      else y2 += h - 1;

      const node = this.doc!.createElement('ConnectivityNode');
      node.setAttribute('name', 'L1');
      const [substationName, voltageLevelName, bayName] = [
        'Substation',
        'VoltageLevel',
        'Bay',
      ].map(tag => this.resizing!.closest(tag)?.getAttribute('name'));
      const path = [substationName, voltageLevelName, bayName].join('/');
      const pathName = `${path}/L1`;
      node.setAttribute('pathName', pathName);

      const priv = this.doc!.createElement('Private');
      priv.setAttribute('type', 'Transpower-SLD-v0');
      priv.setAttribute('xmlns', svgNs);
      priv.setAttribute('xmlns:esld', sldNs);
      node.appendChild(priv);

      const line = this.doc!.createElement('line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      const clickTarget = line.cloneNode() as Element;
      clickTarget.setAttribute('stroke', 'transparent');
      clickTarget.setAttribute('stroke-width', '0.6');
      clickTarget.setAttribute('stroke-linecap', 'square');
      line.setAttribute('stroke', 'black');
      line.setAttribute('stroke-width', '0.06');
      line.setAttribute('stroke-linecap', 'round');
      priv.appendChild(line);
      priv.appendChild(clickTarget);

      this.dispatchEvent(
        newEditEvent({ parent: this.resizing, node, reference: null })
      );
    } else
      this.dispatchEvent(
        newEditEvent({
          element: this.resizing,
          attributes: {
            w: { namespaceURI: sldNs, value: w.toString() },
            h: { namespaceURI: sldNs, value: h.toString() },
          },
        })
      );

    this.resizing = undefined;
  }

  @state()
  lineStart?: { x1: number; y1: number; from: Element };

  @state()
  currentLine: LineSegment[] = [];

  equipmentAt(x: number, y: number, substation: Element): Element | undefined {
    const eq = Array.from(
      substation.querySelectorAll(
        `:scope > VoltageLevel > Bay > ConductingEquipment`
      )
    ).find(
      e =>
        e.getAttributeNS(sldNs, 'x') === x.toString() &&
        e.getAttributeNS(sldNs, 'y') === y.toString()
    );
    return eq;
  }

  lineTo(clientX: number, clientY: number) {
    if (!this.lineStart) return;

    const svgElement = this.getSVG(
      identity(this.lineStart.from.closest('Substation'))
    );
    if (!svgElement) return;

    const { clickedX, clickedY } = svgCoordinates(clientX, clientY, svgElement);

    const x = clickedX + 0.5;
    const y = clickedY + 0.5;

    const { x1, y1, from } = this.lineStart;
    if (x1 !== x && y1 !== y) {
      const lastLine = this.currentLine[this.currentLine.length - 1];
      if (lastLine) {
        const horizontal = lastLine.y1 === lastLine.y2;
        if (horizontal) {
          lastLine.x2 = x;
          this.lineStart = { ...this.lineStart, x1: x };
        } else {
          lastLine.y2 = y;
          this.lineStart = { ...this.lineStart, y1: y };
        }
      } else {
        const horizontal = ['W', 'E'].includes(
          attributes(from.closest('ConductingEquipment')!).dir
        );
        if (horizontal) {
          this.currentLine.push({ ...this.lineStart, x2: x, y2: y1 });
          this.lineStart = { ...this.lineStart, x1: x };
        } else {
          this.currentLine.push({ ...this.lineStart, x2: x1, y2: y });
          this.lineStart = { ...this.lineStart, y1: y };
        }
      }
    }

    this.currentLine.push({ ...this.lineStart, x2: x, y2: y });

    this.lineStart = { ...this.lineStart, x1: x, y1: y };
  }

  connectNodeAt(clientX: number, clientY: number, cNode: Element) {
    if (!this.lineStart) return;

    const svgElement = this.getSVG(identity(cNode.closest('Substation')));
    if (!svgElement) return;

    const { clickedX, clickedY } = svgCoordinates(clientX, clientY, svgElement);
    const x = clickedX + 0.5;
    const y = clickedY + 0.5;

    const { x1, y1, from } = this.lineStart;
    if (x1 !== x && y1 !== y) {
      const lastLine = this.currentLine[this.currentLine.length - 1];
      if (lastLine) {
        const horizontal = lastLine.y1 === lastLine.y2;
        if (horizontal) {
          lastLine.x2 = x;
          this.lineStart = { ...this.lineStart, x1: x };
        } else {
          lastLine.y2 = y;
          this.lineStart = { ...this.lineStart, y1: y };
        }
      } else {
        const horizontal = ['W', 'E'].includes(
          attributes(from.closest('ConductingEquipment')!).dir
        );
        if (horizontal) {
          this.currentLine.push({ ...this.lineStart, x2: x, y2: y1 });
          this.lineStart = { ...this.lineStart, x1: x };
        } else {
          this.currentLine.push({ ...this.lineStart, x2: x1, y2: y });
          this.lineStart = { ...this.lineStart, y1: y };
        }
      }
    }

    const content = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
    let nodeIndex = 1;
    while (
      content?.querySelector(`circle[id="${identity(cNode)}$node${nodeIndex}"]`)
    )
      nodeIndex++;

    this.currentLine.push({ ...this.lineStart, x2: x, y2: y });
    this.currentLine.forEach(segment => (segment.to = nodeIndex));
    this.connectToConnectivityNode(cNode);
  }

  connectToConnectivityNode(cNode: Element) {
    const edits: Edit[] = [];
    const parent = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
    if (!parent) return;
    this.currentLine.forEach(({ x1, y1, x2, y2, from, to }, segment) => {
      const fromId = `${identity(
        from.parentElement
      ).toString()}/${from.getAttribute('name')}`;
      const toId = `${identity(cNode)}$node${to as number}`;
      const node = this.doc!.createElement('line');
      node.setAttribute('x1', x1.toString());
      node.setAttribute('y1', y1.toString());
      node.setAttribute('x2', x2.toString());
      node.setAttribute('y2', y2.toString());
      node.setAttributeNS(sldNs, 'segment', `${fromId}//${segment.toString()}`);
      node.setAttributeNS(sldNs, 'from', fromId);
      node.setAttributeNS(sldNs, 'to', toId);
      const clickTarget = node.cloneNode() as Element;
      clickTarget.setAttribute('stroke', 'transparent');
      clickTarget.setAttribute('stroke-width', '.6');
      clickTarget.setAttribute('stroke-linecap', 'square');
      node.setAttribute('stroke', 'black');
      node.setAttribute('stroke-width', '0.06');
      node.setAttribute('stroke-linecap', 'round');
      edits.push({ parent, node, reference: null });
      edits.push({ parent, node: clickTarget, reference: null });
    });
    const { x2, y2, from, to } = this.currentLine[this.currentLine.length - 1];
    const node = this.doc!.createElement('circle');
    node.setAttribute('cx', x2.toString());
    node.setAttribute('cy', y2.toString());
    node.setAttribute('r', '0.1');
    node.setAttribute('id', `${identity(cNode)}$node${to}`);
    edits.push({ parent, node, reference: null });
    edits.push({
      element: from,
      attributes: {
        connectivityNode: cNode.getAttribute('pathName'),
        cNodeName: cNode.getAttribute('name'),
        bayName: cNode.closest('Bay')?.getAttribute('name'),
        voltageLevelName: cNode.closest('VoltageLevel')?.getAttribute('name'),
        substationName: cNode.closest('Substation')?.getAttribute('name'),
      },
    });

    edits.push(this.breakLineAt(x2, y2, cNode, `${identity(cNode)}$node${to}`));

    this.dispatchEvent(newEditEvent(edits));

    this.reset();
  }

  breakLineAt(x: number, y: number, cNode: Element, nodeId: string): Edit[] {
    const edits: Edit[] = [];

    const priv = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
    const lines = Array.from(priv?.children ?? []).filter(e => {
      if (e.tagName !== 'line') return false;
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map(name =>
        parseFloat(e.getAttribute(name) ?? 'NaN')
      );
      const vertical = x1 === x2;
      const horizontal = y1 === y2;
      const between = (a: number, t: number, b: number) =>
        (a <= t && t <= b) || (a >= t && t >= b);
      if (vertical) return x === x1 && between(y1, y, y2);
      if (horizontal) return y === y1 && between(x1, x, x2);
      return false;
    });
    if (!lines.length) debugger;

    lines.forEach(line => {
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map(name =>
        parseFloat(line.getAttribute(name) ?? 'NaN')
      );
      const vertical = x1 === x2;
      const horizontal = y1 === y2;

      const newLine = line.cloneNode() as Element;

      if (horizontal) {
        const ltr = x1 < x2;
        if (ltr) {
          newLine.setAttribute('x1', x.toString());
          newLine.setAttributeNS(sldNs, 'from', nodeId);
          edits.push({
            element: line,
            attributes: {
              x2: x.toString(),
              to: { namespaceURI: sldNs, value: nodeId },
            },
          });
        } else {
          newLine.setAttribute('x2', x.toString());
          newLine.setAttributeNS(sldNs, 'to', nodeId);
          edits.push({
            element: line,
            attributes: {
              x1: x.toString(),
              from: { namespaceURI: sldNs, value: nodeId },
            },
          });
        }
      } else if (vertical) {
        const td = y1 < y2;
        if (td) {
          newLine.setAttribute('y1', y.toString());
          newLine.setAttributeNS(sldNs, 'from', nodeId);
          edits.push({
            element: line,
            attributes: {
              y2: y.toString(),
              to: { namespaceURI: sldNs, value: nodeId },
            },
          });
        } else {
          newLine.setAttribute('y2', y.toString());
          newLine.setAttributeNS(sldNs, 'to', nodeId);
          edits.push({
            element: line,
            attributes: {
              y1: y.toString(),
              from: { namespaceURI: sldNs, value: nodeId },
            },
          });
        }
      }

      edits.push({
        parent: priv!,
        node: newLine,
        reference: line.nextElementSibling,
      });
    });
    const line = lines[0];

    const from = line.getAttributeNS(sldNs, 'from');
    const to = line.getAttributeNS(sldNs, 'to');
    const [segmentFrom, segmentCount] =
      line.getAttributeNS(sldNs, 'segment')?.split('//') ?? [];
    const segmentIndex = parseInt(segmentCount, 10);

    Array.from(priv?.children ?? [])
      .filter(c => c.tagName === 'line')
      .forEach(line2 => {
        const from2 = line2.getAttributeNS(sldNs, 'from');
        const to2 = line2.getAttributeNS(sldNs, 'to');
        const [segmentFrom2, segmentCount2] =
          line2.getAttributeNS(sldNs, 'segment')?.split('//') ?? [];
        const segmentIndex2 = parseInt(segmentCount2, 10);

        if (
          segmentFrom === segmentFrom2 &&
          segmentIndex2 > segmentIndex &&
          from2 === from
        ) {
          edits.push({
            element: line2,
            attributes: { from: { namespaceURI: sldNs, value: nodeId } },
          });
        }
        if (
          segmentFrom === segmentFrom2 &&
          segmentIndex2 < segmentIndex &&
          to2 === to
        ) {
          edits.push({
            element: line2,
            attributes: { to: { namespaceURI: sldNs, value: nodeId } },
          });
        }
      });

    return edits;
  }

  connectionPoint(terminal: Element): [[number, number], [number, number]] {
    const equipment = terminal.closest('ConductingEquipment');
    if (!equipment)
      return [
        [NaN, NaN],
        [NaN, NaN],
      ];
    const { x, y, dir } = attributes(equipment);
    const input =
      Array.from(equipment.children)
        .filter(c => c.tagName === 'Terminal')
        .findIndex(t => t === terminal) === 0;
    const terminalPoints: Record<Dir, [number, number]> = {
      S: [x + 0.5, input ? y : y + 1],
      N: [x + 0.5, input ? y + 1 : y],
      E: [input ? x : x + 1, y + 0.5],
      W: [input ? x + 1 : x, y + 0.5],
    };
    const connectionPoints: Record<Dir, [number, number]> = {
      S: [x + 0.5, input ? y - 0.5 : y + 1.5],
      N: [x + 0.5, input ? y + 1.5 : y - 0.5],
      E: [input ? x - 0.5 : x + 1.5, y + 0.5],
      W: [input ? x + 1.5 : x - 0.5, y + 0.5],
    };

    return [connectionPoints[dir], terminalPoints[dir]];
  }

  disconnectEquipment(equipment: Element) {
    const terminals = Array.from(equipment.children).filter(
      c => c.tagName === 'Terminal'
    );

    terminals.forEach(terminal => {
      const cnName = terminal.getAttribute('cNodeName');
      if (cnName && cnName !== 'grounded') this.disconnectTerminal(terminal);
    });
  }

  disconnectTerminal(terminal: Element) {
    const edits: Edit[] = [];

    const cNode = terminal
      .closest('Substation')
      ?.querySelector(
        `ConnectivityNode[pathName="${terminal.getAttribute(
          'connectivityNode'
        )}"]`
      );

    if (!cNode) throw new Error(`no cNode for terminal ${identity(terminal)}`);

    const priv = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
    if (!priv) return;
    const lines = Array.from(priv.children ?? [])
      .filter(c => c.tagName === 'line')
      .filter(line => {
        const [from, to] = ['from', 'to'].map(name =>
          line.getAttributeNS(sldNs, name)
        );
        return [from, to].includes(
          `${identity(terminal.parentElement)}/${terminal.getAttribute('name')}`
        );
      });

    const terminalIDs = new Set(
      lines
        .flatMap(line =>
          ['from', 'to'].map(name => line.getAttributeNS(sldNs, name))
        )
        .filter(id => !priv.querySelector(`circle[id="${id}"]`))
    );
    edits.push(
      [...terminalIDs]
        .map(id => {
          const [eqId, termName] = (id ?? '').split('/');
          const [ss, vl, bay, ce] = eqId.split('>');
          return cNode
            .closest('SCL')!
            ?.querySelector(`:scope > Substation[name="${ss}"]`)
            ?.querySelector(`:scope > VoltageLevel[name="${vl}"]`)
            ?.querySelector(`:scope > Bay[name="${bay}"]`)
            ?.querySelector(`:scope > ConductingEquipment[name="${ce}"]`)
            ?.querySelector(`:scope > Terminal[name="${termName}"]`);
        })
        .filter(e => e)
        .map(element => ({
          element: element as Element,
          attributes: {
            cNodeName: null,
            connectivityNode: null,
            bayName: null,
            voltageLevelName: null,
            substationName: null,
          },
        }))
    );

    if (
      cNode
        .closest('Substation')!
        .querySelectorAll(
          `Terminal[connectivityNode="${cNode.getAttribute('pathName')}"]`
        ).length <= 2
    ) {
      const terms = cNode
        .closest('Substation')!
        .querySelectorAll(
          `Terminal[connectivityNode="${cNode.getAttribute('pathName')}"]`
        );
      terms.forEach(term =>
        edits.push({
          element: term,
          attributes: {
            cNodeName: null,
            connectivityNode: null,
            bayName: null,
            voltageLevelName: null,
            substationName: null,
          },
        })
      );

      if (cNode.closest('Bay')!.children.length > 1) {
        edits.push({ node: cNode });
      }
    }

    edits.push(lines.map(node => ({ node })));

    const nodeIDs = new Set(
      lines
        .flatMap(line =>
          ['from', 'to'].map(name => line.getAttributeNS(sldNs, name))
        )
        .filter(id => priv.querySelector(`circle[id="${id}"]`))
    );

    if (nodeIDs.size > 1) {
      console.error('removing two nodes!!!');
      debugger;
    }

    [...nodeIDs].forEach(
      id => edits.push(this.patchOutNode(cNode, id!))
      // this.dispatchEvent(newEditEvent(this.patchOutNode(cNode, id!)))
    );
    this.dispatchEvent(newEditEvent(edits));
  }

  patchOutNode(cNode: Element, nodeId: string) {
    const priv = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
    if (!priv) throw new Error(`no priv for ${nodeId}`);
    const node = priv.querySelector(`circle[id="${nodeId}"]`);
    const edits: Edit[] = [];
    if (node) edits.push({ node });
    else throw new Error(`No node ${nodeId}`);

    const [x, y] = ['cx', 'cy'].map(name => node!.getAttribute(name));

    const lines = Array.from(priv.querySelectorAll('line'));
    const linesToNode = lines.filter(
      line => line.getAttributeNS(sldNs, 'to') === nodeId
    );
    const linesFromNode = lines.filter(
      line => line.getAttributeNS(sldNs, 'from') === nodeId
    );

    const adjacentToNode = linesToNode.filter(
      line => line.getAttribute('x2') === x && line.getAttribute('y2') === y
    );
    const adjacentFromNode = linesFromNode.filter(
      line => line.getAttribute('x1') === x && line.getAttribute('y1') === y
    );

    const lineToNode = adjacentToNode.find(
      line => line.getAttribute('stroke') === 'black'
    )!;
    const lineFromNode = adjacentFromNode.find(
      line => line.getAttribute('stroke') === 'black'
    )!;
    /*
    const targetToNode = adjacentToNode.find(
      line => line.getAttribute('stroke') === 'transparent'
    )!;
    const targetFromNode = adjacentFromNode.find(
      line => line.getAttribute('stroke') === 'transparent'
    )!;
     */

    const from = lineToNode.getAttributeNS(sldNs, 'from');
    const to = lineFromNode.getAttributeNS(sldNs, 'to');
    /*
    const [x2, y2] = ['x2', 'y2'].map(name => lineFromNode.getAttribute(name));
     */

    linesToNode.forEach(element =>
      edits.push({
        element,
        attributes: { to: { namespaceURI: sldNs, value: to } },
      })
    );

    linesFromNode.forEach(element =>
      edits.push({
        element,
        attributes: { from: { namespaceURI: sldNs, value: from } },
      })
    );

    /*
    edits.push({ node: lineFromNode }, { node: targetFromNode });
    [lineToNode, targetToNode].forEach(element =>
      edits.push({ element, attributes: { x2, y2 } })
    );
     */

    return edits;
  }

  groundTerminal(terminal: Element) {
    const edits: Edit[] = [];
    const bay = terminal.closest('Bay');
    const [substationName, voltageLevelName, bayName] = [
      'Substation',
      'VoltageLevel',
      'Bay',
    ].map(tag => terminal.closest(tag)?.getAttribute('name'));
    if (!bay) return;
    let groundedNode = bay.querySelector('ConnectivityNode[name="grounded"]');
    if (!groundedNode) {
      const name = 'grounded';
      const pathName = `${substationName}/${voltageLevelName}/${bayName}/${name}`;
      groundedNode = this.doc!.createElement('ConnectivityNode');
      groundedNode.setAttribute('name', name);
      groundedNode.setAttribute('pathName', pathName);
      edits.push({
        parent: bay,
        node: groundedNode,
        reference: getReference(bay, 'ConnectivityNode'),
      });
    }
    edits.push({
      element: terminal,
      attributes: {
        cNodeName: 'grounded',
        connectivityNode: groundedNode.getAttribute('pathName'),
        substationName,
        voltageLevelName,
        bayName,
      },
    });
    this.dispatchEvent(newEditEvent(edits));
  }

  connectTerminal(terminal: Element) {
    const [[x, y], [tx, ty]] = this.connectionPoint(terminal);
    if (!this.lineStart) {
      this.currentLine.push({ x1: tx, y1: ty, x2: x, y2: y, from: terminal });
      this.lineStart = { x1: x, y1: y, from: terminal };
      return;
    }

    const { x1, y1, from } = this.lineStart;
    if (x1 !== x && y1 !== y) {
      const lastLine = this.currentLine[this.currentLine.length - 1];
      if (lastLine) {
        const horizontal = lastLine.y1 === lastLine.y2;
        if (horizontal) {
          lastLine.x2 = x;
          this.lineStart = { ...this.lineStart, x1: x };
        } else {
          lastLine.y2 = y;
          this.lineStart = { ...this.lineStart, y1: y };
        }
      } else {
        const horizontal = ['W', 'E'].includes(
          attributes(from.closest('ConductingEquipment')!).dir
        );
        if (horizontal) {
          this.currentLine.push({ ...this.lineStart, x2: x, y2: y1 });
          this.lineStart = { ...this.lineStart, x1: x };
        } else {
          this.currentLine.push({ ...this.lineStart, x2: x1, y2: y });
          this.lineStart = { ...this.lineStart, y1: y };
        }
      }
    }

    this.currentLine.push({ ...this.lineStart, x2: x, y2: y });
    this.currentLine.push({ ...this.lineStart, x1: x, y1: y, x2: tx, y2: ty });
    this.currentLine.forEach(segment => (segment.to = terminal));
    this.createConnectivityNode();
  }

  createConnectivityNode() {
    if (!this.doc || !this.lineStart) return;
    const edits: Edit[] = [];
    const { from: terminal } = this.lineStart;

    const parent = terminal.closest('Bay')!;
    const nodeNames = Array.from(
      parent.querySelectorAll(':scope > ConnectivityNode')
    ).map(node => node.getAttribute('name'));
    let nodeIndex = 1;
    while (nodeNames.includes(`L${nodeIndex}`)) nodeIndex++;
    const name = `L${nodeIndex}`;

    const [substationName, voltageLevelName, bayName] = [
      'Substation',
      'VoltageLevel',
      'Bay',
    ].map(tag => terminal.closest(tag)?.getAttribute('name'));
    const path = [substationName, voltageLevelName, bayName].join('/');
    const pathName = `${path}/${name}`;

    const node = this.doc.createElement('ConnectivityNode');
    node.setAttribute('name', name);
    node.setAttribute('pathName', pathName);

    [
      terminal,
      this.currentLine[this.currentLine.length - 1].to as Element,
    ].forEach(element =>
      edits.push({
        element,
        attributes: {
          connectivityNode: pathName,
          cNodeName: name,
          bayName,
          voltageLevelName,
          substationName,
        },
      })
    );

    const priv = this.doc.createElement('Private');
    priv.setAttribute('type', 'Transpower-SLD-v0');
    priv.setAttribute('xmlns', svgNs);
    priv.setAttribute('xmlns:esld', sldNs);
    this.currentLine.forEach(({ x1, y1, x2, y2, from, to }, segment) => {
      const fromId = `${identity(
        from.parentElement
      ).toString()}/${from.getAttribute('name')}`;
      const toId = `${identity((to as Element).parentElement).toString()}/${(
        to as Element
      ).getAttribute('name')}`;
      const line = this.doc!.createElement('line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttributeNS(sldNs, 'segment', `${fromId}//${segment.toString()}`);
      line.setAttributeNS(sldNs, 'from', fromId);
      line.setAttributeNS(sldNs, 'to', toId);
      const clickTarget = line.cloneNode() as Element;
      clickTarget.setAttribute('stroke', 'transparent');
      clickTarget.setAttribute('stroke-width', '0.6');
      clickTarget.setAttribute('stroke-linecap', 'square');
      line.setAttribute('stroke', 'black');
      line.setAttribute('stroke-width', '0.06');
      line.setAttribute('stroke-linecap', 'round');
      priv.appendChild(line);
      priv.appendChild(clickTarget);
    });
    node.appendChild(priv);

    const reference = getReference(parent, 'ConnectivityNode');
    edits.push({ parent, node, reference });

    this.dispatchEvent(newEditEvent(edits));

    this.reset();
  }

  renderEquipment(equipment: Element) {
    const { x, y, dir } = attributes(equipment);
    const [input, output] = Array.from(equipment.children ?? []).filter(
      child => child.tagName === 'Terminal'
    );
    const deg = degrees[dir];

    const inGrounded =
      input?.getAttribute('cNodeName') === 'grounded'
        ? svg`<line x1="0.5" y1="-0.1" x2="0.5" y2="0" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`
        : nothing;
    const outGrounded =
      output?.getAttribute('cNodeName') === 'grounded'
        ? svg`<line x1="0.5" y1="1.1" x2="0.5" y2="1" stroke="black" stroke-width="0.06" marker-start="url(#grounded)" />`
        : nothing;

    const inOpen =
      input
        ?.closest('Substation')
        ?.querySelector(
          `ConnectivityNode[pathName="${input.getAttribute(
            'connectivityNode'
          )}"] > Private[type="Transpower-SLD-v0"]`
        ) ||
      !input ||
      this.lineStart?.from === input ||
      inGrounded !== nothing
        ? nothing
        : svg`<circle cx="0.5" cy="0" r="0.2" opacity="0.4"
    fill="green" stroke="lightgreen"
    @click=${() => this.connectTerminal(input)}
    @contextmenu=${(e: MouseEvent) => {
      e.preventDefault();
      this.groundTerminal(input);
    }}
      />`;

    const outOpen =
      output
        ?.closest('Substation')
        ?.querySelector(
          `ConnectivityNode[pathName="${output.getAttribute(
            'connectivityNode'
          )}"] > Private[type="Transpower-SLD-v0"]`
        ) ||
      !output ||
      this.lineStart?.from === output ||
      outGrounded !== nothing
        ? nothing
        : svg`<circle cx="0.5" cy="1" r="0.2" opacity="0.4"
      fill="green" stroke="lightgreen"
    @click=${() => this.connectTerminal(output)}
    @contextmenu=${(e: MouseEvent) => {
      e.preventDefault();
      this.groundTerminal(output);
    }}
      />`;

    const eqType = equipment.getAttribute('type') ?? '';
    const id = ['CBR', 'CTR', 'VTR', 'DIS', 'IFL'].includes(eqType)
      ? eqType
      : 'ConductingEquipment';

    return svg`<g class="equipment" transform="translate(${x} ${y}) rotate(${deg}, 0.5, 0.5)">
      ${inGrounded}
      ${outGrounded}
      <title>${equipment.getAttribute('name')}</title>
      <use href="#${id}" />
      <rect x=".1" y=".1" width=".8" height=".8" fill="transparent"
        @click=${() => {
          this.disconnectEquipment(equipment);
          this.placing = equipment;
        }}
        @contextmenu=${(e: MouseEvent) => {
          e.preventDefault();
          this.disconnectEquipment(equipment);
          this.rotateEquipment(equipment);
        }}
        />
      ${inOpen}
      ${outOpen}
    </g>`;
  }

  renderConnectivityNode(cNode: Element) {
    const content = cNode.querySelector('Private[type="Transpower-SLD-v0"]');
    if (!content) return nothing;
    const svgContent = content.innerHTML;
    return staticSvg`<g class="node" @click=${(e: MouseEvent) =>
      this.connectNodeAt(e.clientX, e.clientY, cNode)}>
       ${unsafeStatic(svgContent)}
      <title>${cNode.getAttribute('pathName')}</title>
      </g>`;
  }

  renderBay(bay: Element) {
    const { x, y, w, h } = attributes(bay);

    const placeTarget =
      this.placing && isValidTarget(bay, this.placing)
        ? svg`<rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      @click=${(e: MouseEvent) => this.placeAt(e.clientX, e.clientY, bay)}
      fill="url(#dots)" />`
        : nothing;
    return svg`<g>
      <text x="${x + 0.1}" y="${
      y - 0.2
    }" style="font: 0.8px sans-serif;" @click=${() => (this.placing = bay)}>
        ${bay.getAttribute('name')}
      </text>
      <rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      fill="transparent" stroke="blue" stroke-dasharray=".2 .2" />
      ${placeTarget}
    </g>`;
  }

  renderVoltageLevel(voltageLevel: Element) {
    const { x, y, w, h } = attributes(voltageLevel);
    const bays: Element[] = [];
    getChildren(voltageLevel).forEach(child => {
      const { bus } = attributes(child);
      if (!bus) bays.push(child);
    });

    const placeTarget =
      this.placing && isValidTarget(voltageLevel, this.placing)
        ? svg`
      <rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      @click=${(e: MouseEvent) =>
        this.placeAt(e.clientX, e.clientY, voltageLevel)}
      fill="url(#dots)" />
    `
        : nothing;

    return svg`<g id="${identity(voltageLevel)}">
      <text @click=${() => (this.placing = voltageLevel)} x="${x}.1" y="${
      y - 0.2
    }" style="font: 0.9px sans-serif;">
        ${voltageLevel.getAttribute('name')}
      </text>
      <rect
      x="${x}"
      y="${y}"
      width="${w}"
      height="${h}"
      fill="transparent" stroke="orange" />
      ${bays.map(b => this.renderBay(b))}
      ${placeTarget}
    </g>`;
  }

  renderSubstation(substation: Element) {
    const { w, h } = attributes(substation);
    const placeTarget =
      this.placing && isValidTarget(substation, this.placing)
        ? svg`<rect
      width="${w}"
      height="${h}"
      @click=${(e: MouseEvent) =>
        this.placeAt(e.clientX, e.clientY, substation)}
      fill="url(#dots)" />`
        : nothing;

    const resizeTarget = this.resizing
      ? svg`<rect
      width="${w}"
      height="${h}"
      @click=${(e: MouseEvent) => this.resizeTo(e.clientX, e.clientY)}
      fill="url(#dots)" />`
      : nothing;

    const lineTarget = this.lineStart
      ? svg`<rect
      width="${w}"
      height="${h}"
      @click=${(e: MouseEvent) => this.lineTo(e.clientX, e.clientY)}
      fill="url(#dots)" />`
      : nothing;

    return html`<h3>${substation.getAttribute('name')}</h3>
      <svg
        id=${identity(substation)}
        viewBox="0 0 ${w} ${h}"
        width="${w * gridSize}"
        height="${h * gridSize}"
        style="margin: 20px;"
        stroke-width="0.1"
        xmlns="${svgNs}"
      >
        ${symbols}
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        ${getChildren(substation).map(vl => this.renderVoltageLevel(vl))}
        ${placeTarget} ${resizeTarget} ${lineTarget}
        ${this.currentLine.map(
          ({ x1, y1, x2, y2 }) =>
            svg`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                      stroke="black" stroke-width="0.06" />`
        )}
        ${Array.from(
          substation.querySelectorAll(
            'VoltageLevel > Bay > ConductingEquipment'
          )
        ).map(e => this.renderEquipment(e))}
        ${Array.from(
          substation.querySelectorAll('VoltageLevel > Bay > ConnectivityNode')
        ).map(c => this.renderConnectivityNode(c))}
      </svg>`;
  }

  render() {
    const substations = Array.from(
      this.doc?.documentElement.children ?? []
    ).filter(
      child =>
        child.tagName === 'Substation' &&
        Array.from(child.attributes)
          .map(a => a.value)
          .includes(sldNs)
    );

    return html`<menu>
        <li>
          <button @click=${() => this.insertSubstation()}>S</button>
        </li>
        <li>
          <button @click=${() => this.placeVoltageLevel()}>VL</button>
        </li>
        <li>
          <button @click=${() => this.placeBay()}>Bay</button>
        </li>
        <li>
          <button @click=${() => this.placeBus()}>Bus</button>
        </li>
        <li>
          <button @click=${() => this.placeEquipment()}>E</button>
        </li>
        <li>
          <button @click=${() => this.reset()}>X</button>
        </li>
      </menu>
      <main>${substations.map(s => this.renderSubstation(s))}</main>`;
  }

  reset() {
    this.placing = undefined;
    this.resizing = undefined;
    this.lineStart = undefined;
    this.currentLine = [];
  }

  eqPlaced = 1;

  placeEquipment() {
    if (!this.doc) return;
    const eqType = prompt('Equipment type', 'CBR');
    if (!eqType) return;
    const name = prompt('Equipment name', `${eqType}${this.eqPlaced++}`);
    if (!name) return;
    const equipment = this.doc.createElement('ConductingEquipment');
    equipment.setAttribute('type', eqType);
    equipment.setAttribute('name', name);
    equipment.setAttributeNS(sldNs, 'esld:w', '8');
    equipment.setAttributeNS(sldNs, 'esld:h', '8');
    const input = this.doc.createElement('Terminal');
    input.setAttribute('name', 'T1');
    equipment.append(input);
    if (!singleTerminal.includes(eqType)) {
      const output = this.doc.createElement('Terminal');
      output.setAttribute('name', 'T2');
      equipment.append(output);
    }
    this.placing = equipment;
  }

  bussesPlaced = 1;

  placeBus() {
    if (!this.doc) return;
    const name = prompt('Bus name', `Bus ${this.bussesPlaced++}`);
    if (!name) return;
    const bus = this.doc.createElement('Bay');
    bus.setAttribute('name', name);
    bus.setAttributeNS(sldNs, 'bus', 'true');
    this.placing = bus;
  }

  baysPlaced = 1;

  placeBay() {
    if (!this.doc) return;
    const name = prompt('Bay name', `B${this.baysPlaced++}0`);
    if (!name) return;
    const bay = this.doc.createElement('Bay');
    bay.setAttribute('name', name);
    bay.setAttributeNS(sldNs, 'esld:w', '8');
    bay.setAttributeNS(sldNs, 'esld:h', '8');
    this.placing = bay;
  }

  vlPlaced = 0;

  placeVoltageLevel() {
    if (!this.doc) return;
    const name = prompt(
      'Voltage Level name',
      this.vlPlaced === 0
        ? '220kV'
        : this.vlPlaced === 1
        ? '33kV'
        : `VL${this.vlPlaced}`
    );
    if (!name) return;
    this.vlPlaced++;
    const voltageLevel = this.doc.createElement('VoltageLevel');
    voltageLevel.setAttribute('name', name);
    voltageLevel.setAttributeNS(sldNs, 'esld:w', '10');
    voltageLevel.setAttributeNS(sldNs, 'esld:h', '10');
    this.placing = voltageLevel;
  }

  sPlaced = 1;

  insertSubstation() {
    if (!this.doc) return;
    const name = prompt('Substation name', `AA${this.sPlaced++}`);
    if (!name) return;
    const width = parseInt(prompt('width', '50') ?? '50', 10);
    const height = parseInt(prompt('height', '25') ?? '25', 10);
    if (!width || !height) return;
    const substation = this.doc.createElement('Substation');
    substation.setAttribute('name', name);
    substation.setAttribute('xmlns:esld', sldNs);
    substation.setAttributeNS(sldNs, 'esld:w', width.toString());
    substation.setAttributeNS(sldNs, 'esld:h', height.toString());
    this.dispatchEvent(
      newEditEvent({
        parent: this.doc.documentElement,
        node: substation,
        reference: getReference(this.doc.documentElement, 'Substation'),
      })
    );
  }

  firstUpdated() {
    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') this.reset();
      },
      true
    );
  }

  static styles = css`
    g.equipment:hover g.terminal > circle {
      stroke: green;
    }
    menu {
      position: fixed;
      bottom: 20px;
      left: 20px;
      list-style-type: none;
      display: flex;
      padding: 0;
      margin: 0;
      gap: 5px;
      z-index: 100;
    }
  `;
}
