export const sldNs = 'https://transpower.co.nz/SCL/SSD/SLD/v0';

export type Attrs = {
  pos: [number, number];
  dim: [number, number];
};

export function attributes(element: Element): Attrs {
  const [x, y, w, h] = ['x', 'y', 'w', 'h'].map(name =>
    parseInt(element.getAttributeNS(sldNs, name) ?? '0', 10)
  );

  const pos = [x, y].map(d => Math.max(0, d)) as [number, number];
  const dim = [w, h].map(d => Math.max(1, d)) as [number, number];

  return { pos, dim };
}
