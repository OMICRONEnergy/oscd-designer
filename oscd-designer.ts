import { LitElement, html, css, nothing } from 'lit';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { property, state } from 'lit/decorators.js';

import { Edit, newEditEvent, Update } from '@openscd/open-scd-core';
import { getReference } from '@openscd/oscd-scl';

import '@material/mwc-button';
import '@material/mwc-fab';
import '@material/mwc-icon-button';
import '@material/mwc-icon';

import './sld-editor.js';

import { bayIcon, equipmentIcon, voltageLevelIcon } from './icons.js';
import {
  attributes,
  ConnectDetail,
  ConnectEvent,
  connectionStartPoints,
  elementPath,
  isBusBar,
  PlaceEvent,
  Point,
  privType,
  removeNode,
  removeTerminal,
  reparentElement,
  ResizeEvent,
  sldNs,
  StartConnectDetail,
  StartConnectEvent,
  StartEvent,
  xmlnsNs,
} from './util.js';

function makeBusBar(doc: XMLDocument, nsp: string) {
  const busBar = doc.createElementNS(doc.documentElement.namespaceURI, 'Bay');
  busBar.setAttribute('name', 'BB1');
  busBar.setAttributeNS(sldNs, `${nsp}:w`, '2');
  const cNode = doc.createElementNS(
    doc.documentElement.namespaceURI,
    'ConnectivityNode'
  );
  cNode.setAttribute('name', 'L');
  const priv = doc.createElementNS(doc.documentElement.namespaceURI, 'Private');
  priv.setAttribute('type', privType);
  const section = doc.createElementNS(sldNs, `${nsp}:Section`);
  section.setAttribute('bus', 'true');
  const v1 = doc.createElementNS(sldNs, `${nsp}:Vertex`);
  v1.setAttributeNS(sldNs, `${nsp}:x`, '0.5');
  v1.setAttributeNS(sldNs, `${nsp}:y`, '0.5');
  section.appendChild(v1);
  const v2 = doc.createElementNS(sldNs, `${nsp}:Vertex`);
  v2.setAttributeNS(sldNs, `${nsp}:x`, '1.5');
  v2.setAttributeNS(sldNs, `${nsp}:y`, '0.5');
  section.appendChild(v2);
  priv.appendChild(section);
  cNode.appendChild(priv);
  busBar.appendChild(cNode);
  return busBar;
}

function cutSectionAt(
  section: Element,
  index: number,
  [x, y]: Point,
  nsPrefix: string
): Edit[] {
  const parent = section.parentElement!;
  const edits = [] as Edit[];
  const vertices = Array.from(section.getElementsByTagNameNS(sldNs, 'Vertex'));
  const vertexAtXY = vertices.find(
    ve =>
      ve.getAttributeNS(sldNs, 'x') === x.toString() &&
      ve.getAttributeNS(sldNs, 'y') === y.toString()
  );

  if (
    vertexAtXY === vertices[0] ||
    vertexAtXY === vertices[vertices.length - 1]
  )
    return [];

  const newSection = section.cloneNode(true) as Element;
  Array.from(newSection.getElementsByTagNameNS(sldNs, 'Vertex'))
    .slice(0, index + 1)
    .forEach(vertex => vertex.remove());
  const v = vertices[index].cloneNode() as Element;
  v.setAttributeNS(sldNs, `${nsPrefix}:x`, x.toString());
  v.setAttributeNS(sldNs, `${nsPrefix}:y`, y.toString());
  v.removeAttribute('at');
  newSection.prepend(v);
  edits.push({
    node: newSection,
    parent,
    reference: section.nextElementSibling,
  });

  vertices.slice(index + 1).forEach(vertex => edits.push({ node: vertex }));

  if (!vertexAtXY) {
    const v2 = v.cloneNode();
    edits.push({ node: v2, parent: section, reference: null });
  }

  return edits;
}

export default class Designer extends LitElement {
  @property()
  doc!: XMLDocument;

  @property()
  editCount = -1;

  @state()
  gridSize = 32;

  @state()
  nsp = 'esld';

  @state()
  templateElements: Record<string, Element> = {};

  @state()
  resizing?: Element;

  @state()
  placing?: Element;

  @state()
  connecting?: {
    equipment: Element;
    path: Point[];
    terminal: 'top' | 'bottom';
  };

  zoomIn(step = 4) {
    this.gridSize += step;
  }

  zoomOut(step = 4) {
    this.gridSize -= step;
    if (this.gridSize < 4) this.gridSize = 4;
  }

  startResizing(element: Element | undefined) {
    this.reset();
    this.resizing = element;
  }

  startPlacing(element: Element | undefined) {
    this.reset();
    this.placing = element;
  }

  startConnecting({ equipment, terminal }: StartConnectDetail) {
    this.reset();
    const { close, far } = connectionStartPoints(equipment)[terminal];
    if (equipment)
      this.connecting = {
        equipment,
        path: [close, far],
        terminal,
      };
  }

  reset() {
    this.placing = undefined;
    this.resizing = undefined;
    this.connecting = undefined;
  }

  handleKeydown = ({ key }: KeyboardEvent) => {
    if (key === 'Escape') this.reset();
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleKeydown);
  }

  updated(changedProperties: Map<string, any>) {
    if (!changedProperties.has('doc')) return;
    const sldNsPrefix = this.doc.documentElement.lookupPrefix(sldNs);
    if (sldNsPrefix) {
      this.nsp = sldNsPrefix;
    } else {
      this.doc.documentElement.setAttributeNS(xmlnsNs, 'xmlns:esld', sldNs);
      this.nsp = 'esld';
    }

    ['Substation', 'VoltageLevel', 'Bay', 'ConductingEquipment'].forEach(
      tag => {
        this.templateElements[tag] = this.doc.createElementNS(
          this.doc.documentElement.namespaceURI,
          tag
        );
      }
    );
    this.templateElements.BusBar = makeBusBar(this.doc, this.nsp);
  }

  rotateElement(element: Element) {
    const { rot } = attributes(element);
    const edits = [
      {
        element,
        attributes: {
          [`${this.nsp}:rot`]: {
            namespaceURI: sldNs,
            value: ((rot + 1) % 4).toString(),
          },
        },
      },
    ] as Edit[];
    if (element.tagName === 'ConductingEquipment') {
      Array.from(element.getElementsByTagName('Terminal'))
        .filter(terminal => terminal.getAttribute('cNodeName') !== 'grounded')
        .forEach(terminal => edits.push(...removeTerminal(terminal)));
    }
    this.dispatchEvent(newEditEvent(edits));
  }

  placeElement(element: Element, parent: Element, x: number, y: number) {
    const edits: Edit[] = [];
    if (element.parentElement !== parent) {
      edits.push(...reparentElement(element, parent));
    }
    if (element.localName !== 'Vertex')
      edits.push({
        element,
        attributes: {
          x: { namespaceURI: sldNs, value: x.toString() },
          y: { namespaceURI: sldNs, value: y.toString() },
        },
      });

    const {
      pos: [oldX, oldY],
    } = attributes(element);

    const dx = x - oldX;
    const dy = y - oldY;

    Array.from(
      element.querySelectorAll('Bay, ConductingEquipment, Vertex')
    ).forEach(descendant => {
      const {
        pos: [descX, descY],
      } = attributes(descendant);
      edits.push({
        element: descendant,
        attributes: {
          x: { namespaceURI: sldNs, value: (descX + dx).toString() },
          y: { namespaceURI: sldNs, value: (descY + dy).toString() },
        },
      });
    });

    if (element.tagName === 'ConductingEquipment') {
      Array.from(element.getElementsByTagName('Terminal'))
        .filter(terminal => terminal.getAttribute('cNodeName') !== 'grounded')
        .forEach(terminal => edits.push(...removeTerminal(terminal)));
    } else {
      Array.from(element.getElementsByTagName('ConnectivityNode')).forEach(
        cNode => {
          if (
            Array.from(
              this.doc.querySelectorAll(
                `Terminal[connectivityNode="${cNode.getAttribute('pathName')}"]`
              )
            ).find(terminal => terminal.closest(element.tagName) !== element)
          )
            edits.push(...removeNode(cNode));
        }
      );
      Array.from(element.getElementsByTagName('Terminal')).forEach(terminal => {
        const cNode = this.doc.querySelector(
          `ConnectivityNode[pathName="${terminal.getAttribute(
            'connectivityNode'
          )}"]`
        );
        if (cNode && cNode.closest(element.tagName) !== element)
          edits.push(...removeNode(cNode));
      });
    }

    if (element.localName === 'Vertex') {
      const bay = element.closest('Bay')!;
      const sections = Array.from(bay.querySelectorAll('Section[bus]'));
      const section = sections[0];
      const vertex = section.querySelector('Vertex')!;
      const lastSection = sections[sections.length - 1];
      const lastVertex = lastSection.querySelector('Vertex:last-of-type')!;
      const {
        pos: [x1, y1],
      } = attributes(vertex);
      const w = x - x1 + 1;
      const h = y - y1 + 1;
      if (isBusBar(bay)) {
        edits.push(...removeNode(section.closest('ConnectivityNode')!));
        edits.push({
          element: lastVertex,
          attributes: {
            x: { namespaceURI: sldNs, value: x.toString() },
            y: { namespaceURI: sldNs, value: y.toString() },
          },
        });
        edits.push({
          element: bay,
          attributes: {
            w: { namespaceURI: sldNs, value: w.toString() },
            h: { namespaceURI: sldNs, value: h.toString() },
          },
        });
      }
    }

    this.dispatchEvent(newEditEvent(edits));
    if (
      ['Bay', 'VoltageLevel'].includes(element.tagName) &&
      (!element.hasAttributeNS(sldNs, 'w') ||
        !element.hasAttributeNS(sldNs, 'h'))
    )
      this.startResizing(element);
    else this.reset();
  }

  connectEquipment({
    equipment,
    terminal,
    connectTo,
    toTerminal,
    path,
  }: ConnectDetail) {
    const edits = [] as Edit[];
    let cNode: Element;
    let connectivityNode: string;
    let cNodeName: string;
    let priv: Element;
    if (connectTo.tagName !== 'ConnectivityNode') {
      cNode = this.doc.createElementNS(
        this.doc.documentElement.namespaceURI,
        'ConnectivityNode'
      );
      cNode.setAttribute('name', 'L1');
      const bay = equipment.closest('Bay')!;
      edits.push(...reparentElement(cNode, bay));
      connectivityNode = (edits.find(
        e => 'attributes' in e && 'pathName' in e.attributes
      ) as Update | undefined)!.attributes.pathName as string;
      cNodeName =
        ((
          edits.find(e => 'attributes' in e && 'name' in e.attributes) as
            | Update
            | undefined
        )?.attributes.name as string | undefined) ??
        cNode.getAttribute('name')!;
      priv = this.doc.createElementNS(
        this.doc.documentElement.namespaceURI,
        'Private'
      );
      priv.setAttribute('type', privType);
      edits.push({
        parent: cNode,
        node: priv,
        reference: getReference(cNode, 'Private'),
      });
    } else {
      cNode = connectTo;
      connectivityNode = cNode.getAttribute('pathName')!;
      cNodeName = cNode.getAttribute('name')!;
      priv = cNode.querySelector(`Private[type="${privType}"]`)!;
    }
    const section = this.doc.createElementNS(sldNs, `${this.nsp}:Section`);
    edits.push({ parent: priv!, node: section, reference: null });
    const fromTermName = terminal === 'top' ? 'T1' : 'T2';
    const toTermName = toTerminal === 'top' ? 'T1' : 'T2';
    path.forEach(([x, y], i) => {
      const vertex = this.doc.createElementNS(sldNs, `${this.nsp}:Vertex`);
      vertex.setAttributeNS(sldNs, `${this.nsp}:x`, x.toString());
      vertex.setAttributeNS(sldNs, `${this.nsp}:y`, y.toString());
      if (i === 0)
        vertex.setAttribute('at', elementPath(equipment, fromTermName));
      else if (
        i === path.length - 1 &&
        connectTo.tagName !== 'ConnectivityNode'
      )
        vertex.setAttribute('at', elementPath(connectTo, toTermName));
      edits.push({ parent: section, node: vertex, reference: null });
    });
    if (connectTo.tagName === 'ConnectivityNode') {
      const [x, y] = path[path.length - 1];
      Array.from(priv.getElementsByTagNameNS(sldNs, 'Section')).find(s => {
        const sectionPath = Array.from(
          s.getElementsByTagNameNS(sldNs, 'Vertex')
        ).map(v => attributes(v).pos);
        for (let i = 0; i < sectionPath.length - 1; i += 1) {
          const [x0, y0] = sectionPath[i];
          const [x1, y1] = sectionPath[i + 1];
          if (
            (y0 === y &&
              y === y1 &&
              ((x0 < x && x < x1) || (x1 < x && x < x0))) ||
            (x0 === x &&
              x === x1 &&
              ((y0 < y && y < y1) || (y1 < y && y < y0))) ||
            (y0 === y && x0 === x)
          ) {
            edits.push(cutSectionAt(s, i, [x, y], this.nsp));
            return true;
          }
        }
        return false;
      });
    }
    const [substationName, voltageLevelName, bayName] = connectivityNode.split(
      '/',
      3
    );
    const fromTermElement = this.doc.createElementNS(
      this.doc.documentElement.namespaceURI,
      'Terminal'
    );
    fromTermElement.setAttribute('name', fromTermName);
    fromTermElement.setAttribute('connectivityNode', connectivityNode);
    fromTermElement.setAttribute('substationName', substationName);
    fromTermElement.setAttribute('voltageLevelName', voltageLevelName);
    fromTermElement.setAttribute('bayName', bayName);
    fromTermElement.setAttribute('cNodeName', cNodeName);
    edits.push({
      node: fromTermElement,
      parent: equipment,
      reference: getReference(equipment, 'Terminal'),
    });
    if (connectTo.tagName === 'ConductingEquipment') {
      const toTermElement = this.doc.createElementNS(
        this.doc.documentElement.namespaceURI,
        'Terminal'
      );
      toTermElement.setAttribute('name', toTermName);
      toTermElement.setAttribute('connectivityNode', connectivityNode);
      toTermElement.setAttribute('substationName', substationName);
      toTermElement.setAttribute('voltageLevelName', voltageLevelName);
      toTermElement.setAttribute('bayName', bayName);
      toTermElement.setAttribute('cNodeName', cNodeName);
      edits.push({
        node: toTermElement,
        parent: connectTo,
        reference: getReference(connectTo, 'Terminal'),
      });
    }
    this.reset();
    this.dispatchEvent(newEditEvent(edits));
  }

  render() {
    if (!this.doc) return html`<p>Please open an SCL document</p>`;
    return html`<main>
      ${Array.from(this.doc.querySelectorAll(':root > Substation')).map(
        subs =>
          html`<sld-editor
            .doc=${this.doc}
            .editCount=${this.editCount}
            .substation=${subs}
            .gridSize=${this.gridSize}
            .resizing=${this.resizing}
            .placing=${this.placing}
            .connecting=${this.connecting}
            @oscd-sld-start-resize=${({ detail }: StartEvent) => {
              this.startResizing(detail);
            }}
            @oscd-sld-start-place=${({ detail }: StartEvent) => {
              this.startPlacing(detail);
            }}
            @oscd-sld-start-connect=${({ detail }: StartConnectEvent) => {
              this.startConnecting(detail);
            }}
            @oscd-sld-resize=${({ detail: { element, w, h } }: ResizeEvent) => {
              this.dispatchEvent(
                newEditEvent({
                  element,
                  attributes: {
                    w: { namespaceURI: sldNs, value: w.toString() },
                    h: { namespaceURI: sldNs, value: h.toString() },
                  },
                })
              );
              this.reset();
            }}
            @oscd-sld-place=${({
              detail: { element, parent, x, y },
            }: PlaceEvent) => this.placeElement(element, parent, x, y)}
            @oscd-sld-connect=${({ detail }: ConnectEvent) =>
              this.connectEquipment(detail)}
            @oscd-sld-rotate=${({ detail }: StartEvent) =>
              this.rotateElement(detail)}
          ></sld-editor>`
      )}
      <nav>
        ${Array.from(this.doc.documentElement.children).find(
          c => c.tagName === 'Substation'
        )
          ? html``
          : nothing}${Array.from(
          this.doc.querySelectorAll(':root > Substation > VoltageLevel > Bay')
        ).find(bay => !isBusBar(bay))
          ? ['CTR', 'VTR', 'DIS', 'CBR', 'IFL']
              .map(
                eqType => html`<mwc-fab
                  mini
                  label="Add ${eqType}"
                  @click=${() => {
                    const element =
                      this.templateElements.ConductingEquipment!.cloneNode() as Element;
                    element.setAttribute('type', eqType);
                    element.setAttribute('name', `${eqType}1`);
                    this.startPlacing(element);
                  }}
                  style="--mdc-theme-secondary: #fff; --mdc-theme-on-secondary: rgb(0, 0, 0 / 0.83)"
                  >${equipmentIcon(eqType)}</mwc-fab
                >`
              )
              .concat()
          : nothing}${this.doc.querySelector(
          ':root > Substation > VoltageLevel'
        )
          ? html`<mwc-fab
                mini
                icon="horizontal_rule"
                @click=${() => {
                  const element = this.templateElements.BusBar!.cloneNode(
                    true
                  ) as Element;
                  this.startPlacing(element);
                }}
                label="Add Bus Bar"
                style="--mdc-theme-secondary: #fff; --mdc-theme-on-secondary: rgb(0, 0, 0 / 0.83)"
              >
              </mwc-fab
              ><mwc-fab
                mini
                label="Add Bay"
                @click=${() => {
                  const element =
                    this.templateElements.Bay!.cloneNode() as Element;
                  this.startPlacing(element);
                }}
                style="--mdc-theme-secondary: #12579B;"
              >
                ${bayIcon}
              </mwc-fab>`
          : nothing}${Array.from(this.doc.documentElement.children).find(
          c => c.tagName === 'Substation'
        )
          ? html`<mwc-fab
              mini
              label="Add VoltageLevel"
              @click=${() => {
                const element =
                  this.templateElements.VoltageLevel!.cloneNode() as Element;
                this.startPlacing(element);
              }}
              style="--mdc-theme-secondary: #F5E214; --mdc-theme-on-secondary: rgb(0, 0, 0 / 0.83);"
            >
              ${voltageLevelIcon}
            </mwc-fab>`
          : nothing}<mwc-fab
          mini
          icon="margin"
          @click=${() => this.insertSubstation()}
          label="Add Substation"
          style="--mdc-theme-secondary: #BB1326;"
        >
        </mwc-fab>
        <mwc-icon-button
          icon="zoom_in"
          label="Zoom In"
          @click=${() => this.zoomIn()}
        >
        </mwc-icon-button
        ><mwc-icon-button
          icon="zoom_out"
          label="Zoom Out"
          @click=${() => this.zoomOut()}
        >
        </mwc-icon-button
        >${this.placing || this.resizing
          ? html`<mwc-icon-button
              icon="close"
              label="Cancel action"
              @click=${() => this.reset()}
            >
            </mwc-icon-button>`
          : nothing}
      </nav>
    </main>`;
  }

  insertSubstation() {
    const parent = this.doc.documentElement;
    const node = this.doc.createElementNS(
      this.doc.documentElement.namespaceURI,
      'Substation'
    );
    const reference = getReference(parent, 'Substation');
    let index = 1;
    while (this.doc.querySelector(`:root > Substation[name="S${index}"]`))
      index += 1;
    node.setAttribute('name', `S${index}`);
    node.setAttributeNS(sldNs, `${this.nsp}:w`, '50');
    node.setAttributeNS(sldNs, `${this.nsp}:h`, '25');
    this.dispatchEvent(newEditEvent({ parent, node, reference }));
  }

  static styles = css`
    main {
      padding: 16px;
    }

    div {
      margin-top: 12px;
    }

    nav {
      position: fixed;
      bottom: 4px;
      left: 4px;
    }
  `;
}
