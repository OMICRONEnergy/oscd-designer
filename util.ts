export const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';

export type Attrs = {
  pos: [number, number];
  dim: [number, number];
  flip: boolean;
  rot: 0 | 1 | 2 | 3;
};

export function attributes(element: Element): Attrs {
  const [x, y, w, h, rotVal] = ['x', 'y', 'w', 'h', 'rot'].map(name =>
    parseInt(element.getAttributeNS(sldNs, name) ?? '0', 10)
  );
  const pos = [x, y].map(d => Math.max(0, d)) as [number, number];
  const dim = [w, h].map(d => Math.max(1, d)) as [number, number];

  const flip = ['true', '1'].includes(
    element.getAttributeNS(sldNs, 'flip')?.trim() ?? 'false'
  );

  const rot = (((rotVal % 4) + 4) % 4) as 0 | 1 | 2 | 3;

  return { pos, dim, flip, rot };
}
