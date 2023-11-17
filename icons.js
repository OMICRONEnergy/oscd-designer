import { html, nothing, svg } from 'lit';
import { eqTypes, isEqType, ringedEqTypes } from './util.js';
export const resizePath = svg `<path
  d="M120 616v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm160 0v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160V296H600v-80h240v240h-80ZM120 936V696h80v160h160v80H120Z"
/>`;
export const movePath = svg `<path d="M480 976 310 806l57-57 73 73V616l-205-1 73 73-58 58L80 576l169-169 57 57-72 72h206V330l-73 73-57-57 170-170 170 170-57 57-73-73v206l205 1-73-73 58-58 170 170-170 170-57-57 73-73H520l-1 205 73-73 58 58-170 170Z"/>`;
const voltageLevelPath = svg `<path
    d="M 4 4 L 12.5 21 L 21 4"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linejoin="round"
    stroke-linecap="round"
  />`;
const bayPath = svg `<path
    d="M 3 2 L 22 2"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 3 5 L 22 5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 7 2 L 7 7.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 18 5 L 18 7.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 5.5 8.5 L 7 11 L 7 13 L 18 13 L 18 11 L 16.5 8.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 12.5 13 L 12.5 15"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 11 16 L 12.5 18.5 L 12.5 23"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="M 10.5 21 L 12.5 23 L 14.5 21"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />`;
export const voltageLevelIcon = html `<svg
  id="VoltageLevel"
  viewBox="0 0 25 25"
  width="24"
  height="24"
  slot="icon"
>
  ${voltageLevelPath}
</svg>`;
export const voltageLevelGraphic = html `<svg
  id="VoltageLevel"
  viewBox="0 0 25 25"
  width="24"
  height="24"
  slot="graphic"
>
  ${voltageLevelPath}
</svg>`;
export const bayIcon = html `<svg
  id="Bay"
  viewBox="0 0 25 25"
  width="24"
  height="24"
  slot="icon"
>
  ${bayPath}
</svg>`;
export const bayGraphic = html `<svg
  id="Bay"
  viewBox="0 0 25 25"
  width="24"
  height="24"
  slot="graphic"
>
  ${bayPath}
</svg>`;
const equipmentPaths = {
    CAB: svg `
  <path
    d="M 12.5,0 V 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <path
    d="M 9.4,4.2 H 15.6 L 12.5,8.3 Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <path
    d="m 12.5,8.3 v 9"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <path
    d="m 9.4,21.3 h 6.2 l -3.1,-4.1 z"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <path
    d="m 12.5,21.3 v 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  `,
    CAP: svg `
  <path
    d="M 6.5,10.1 H 18.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <path
    d="M 12.5,0 V 10.1"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <path
    d="M 6.5,14.9 H 18.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <path
    d="M 12.5,14.9 V 25"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  `,
    CBR: svg `
  <line
    x1="12.5"
    y1="0"
    x2="12.5"
    y2="4"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="25"
    x2="12.5"
    y2="21"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="21"
    x2="4"
    y2="5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="9.5"
    y1="1"
    x2="15.5"
    y2="7"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="9.5"
    y1="7"
    x2="15.5"
    y2="1"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  `,
    CTR: svg `
  <line
    x1="12.5"
    y1="0"
    x2="12.5"
    y2="25"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="12.5"
    r="7.5"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  `,
    DIS: svg `
  <path
    d="M 12.5 0 L 12.5 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d=" M 12.5 25 L 12.5 21"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 12.5 21 L 4 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 8 4 L 17 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  `,
    GEN: svg `
  <path
    d="m 16.2,12.5 v 4.2 q -0.2,0.2 -0.6,0.6 -0.4,0.4 -1.1,0.7 -0.7,0.3 -1.8,0.3 -1.8,0 -2.9,-1.2 -1.1,-1.2 -1.1,-3.6 v -2.1 q 0,-2.4 1,-3.6 1,-1.1 2.9,-1.1 1.7,0 2.6,0.9 0.9,0.9 1,2.6 h -1.4 q -0.1,-1.1 -0.6,-1.6 -0.5,-0.6 -1.5,-0.6 -1.3,0 -1.8,0.9 -0.5,0.9 -0.5,2.6 v 2.1 q 0,1.8 0.7,2.7 0.7,0.9 1.9,0.9 1,0 1.4,-0.3 0.4,-0.3 0.6,-0.5 v -2.6 h -2.1 v -1.2 z"
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0.3"
    stroke-linecap="round"
  />
  `,
    IFL: svg `
  <path
    d="M 12.5 0 L 12.5 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 12.5 25 L 12.5 21"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <polygon
    points="4,4 12.5,21 21,4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  `,
    LIN: svg `
  <path
    d="M 12.5,0 V 25"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="m 10.3,12.5 4.3,-2.5"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="m 10.3,15 4.3,-2.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  `,
    MOT: svg `
  <path
    d="m 12.5,15.5 2.3,-7.8 h 1.4 v 9.6 h -1.1 v -3.7 l 0.1,-3.7 -2.3,7.4 h -0.9 L 9.8,9.8 9.9,13.6 v 3.7 H 8.8 V 7.7 h 1.4 z"
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0.3"
    stroke-linecap="round"
  />
  `,
    REA: svg `
  <path
    d="m 4.5,12.5 h 8 V 0"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="m 4.5,12.5 a 8,8 0 0 1 8,-8 8,8 0 0 1 8,8 8,8 0 0 1 -8,8"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 12.5,20.5 V 25"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  `,
    RES: svg `
  <path
    d="M 12.5,0 V 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="m 12.5 25 v -4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <rect
    y="4"
    x="8.5"
    height="17"
    width="8"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  `,
    SAR: svg `
  <path
    d="M 12.5,0 V 8"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <path
    d="m 12.5,21 v 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="10"
    y1="24.25"
    x2="15"
    y2="24.25"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 11.2,8 12.5,11 13.8,8 Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="1"
    stroke-linecap="round"
  />
  <rect
    y="4"
    x="8.5"
    height="17"
    width="8"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  `,
    SMC: svg `
  <path
    d="m 16.6,12.5 c -0.7,1.4 -1.3,2.8 -2.1,2.8 -1.5,0 -2.6,-5.6 -4.1,-5.6 -0.7,0 -1.4,1.4 -2.1,2.8"
    stroke="currentColor"
    fill="none"
    stroke-width="1.2"
    stroke-linecap="round"
  />
  `,
    VTR: svg `
  <line
    x1="12.5"
    y1="0"
    x2="12.5"
    y2="5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="10"
    r="5"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="15"
    r="5"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
`,
};
export const eqRingPath = svg `
  <path
    d="M 12.5,0 V 4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    />
  <circle
    cx="12.5"
    cy="12.5"
    r="8.5"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  `;
const defaultEquipmentPath = svg `
  <circle
    cx="12.5"
    cy="12.5"
    r="11"
    stroke-width="1.5"
    stroke="currentColor"
    fill="none"
  />
  <path
    d=" M 7.5 17.5
    L 12 13
    Z"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="	M 11 7
      L 10 8
      C 5 13, 11 20, 17 15
      L 18 14
      Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linejoin="round"
  />
  <path
    d=" M 13 9
    L 16 6
    Z"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d=" M 16 12
    L 19 9
    Z"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
`;
export function equipmentPath(equipmentType) {
    if (equipmentType && isEqType(equipmentType))
        return equipmentPaths[equipmentType];
    return defaultEquipmentPath;
}
export function equipmentGraphic(equipmentType) {
    return html `<svg
    id="${equipmentType}"
    viewBox="0 0 25 25"
    width="24"
    height="24"
    slot="graphic"
  >
    ${equipmentPath(equipmentType)}
    ${equipmentType && ringedEqTypes.has(equipmentType) ? eqRingPath : nothing}
  </svg>`;
}
export function equipmentIcon(equipmentType) {
    return html `<svg
    id="${equipmentType}"
    viewBox="0 0 25 25"
    width="24"
    height="24"
    slot="icon"
  >
    ${equipmentPath(equipmentType)}
    ${ringedEqTypes.has(equipmentType) ? eqRingPath : nothing}
  </svg>`;
}
function equipmentSymbol(equipmentType) {
    return svg `<symbol
    id="${equipmentType}"
    viewBox="0 0 25 25"
    width="1" height="1"
  >
    ${equipmentPath(equipmentType)}
  </symbol>`;
}
export const connectivityNodeMarker = svg `<marker
  markerWidth="3" markerHeight="3"
  refX="12.5" refY="12.5"
  viewBox="0 0 25 25"
  id="circle"
>
  <circle
    fill="black"
    cx="12.5"
    cy="12.5"
    r="12.5"
  />
</marker>`;
export const groundedMarker = svg `<marker
  markerWidth="20" markerHeight="20"
  refX="12.5" refY="12.5"
  viewBox="0 0 25 25"
  id="grounded"
  orient="auto-start-reverse"
>
  <line
    y1="17"
    y2="8"
    x1="12.5"
    x2="12.5"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    y1="15.5"
    y2="9.5"
    x1="14.7"
    x2="14.7"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    y1="14.5"
    y2="10.5"
    x1="16.8"
    x2="16.8"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
</marker>`;
export const powerTransformerTwoWindingSymbol = svg `<symbol
  id="PTR"
  viewBox="0 0 25 25"
  width="1" height="1"
>
  <line
    x1="12.5"
    y1="2"
    x2="12.5"
    y2="5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="10"
    r="5"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="15"
    r="5"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="20"
    x2="12.5"
    y2="23"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</symbol>`;
export const symbols = svg `
  <defs>
  <pattern id="halfgrid" patternUnits="userSpaceOnUse" width="1" height="1" viewBox="0 0 1 1">
  <circle cx="0.1" cy="0.8" r="0.035" fill="#888" opacity="0.3" />
  <circle cx="0.6" cy="0.3" r="0.035" fill="#888" opacity="0.3" />
  <circle cx="0.1" cy="0.3" r="0.035" fill="#888" opacity="0.3" />
  <circle cx="0.6" cy="0.8" r="0.035" fill="#888" opacity="0.3" />
  </pattern>
  <pattern id="grid" patternUnits="userSpaceOnUse" width="1" height="1" viewBox="0 0 1 1">
  <line x1="0" y1="0" x2="0" y2="1" stroke="#888" stroke-opacity="0.3" stroke-width="0.06" />
  <line x1="0" y1="0" x2="1" y2="0" stroke="#888" stroke-opacity="0.3" stroke-width="0.06" />
  <line x1="1" y1="0" x2="1" y2="1" stroke="#888" stroke-opacity="0.3" stroke-width="0.06" />
  <line x1="0" y1="1" x2="1" y2="1" stroke="#888" stroke-opacity="0.3" stroke-width="0.06" />
  </pattern>
  ${eqTypes.map(eqType => equipmentSymbol(eqType))}
  ${equipmentSymbol('ConductingEquipment')}
  ${connectivityNodeMarker}
  ${groundedMarker}
  </defs>
`;
//# sourceMappingURL=icons.js.map