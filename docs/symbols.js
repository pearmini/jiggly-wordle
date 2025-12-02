import * as d3 from "d3";

export const symbolSquare = symbol((ctx, x, y, width, height) => {
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
});

export const symbolCircle = (x, y, width, height) => {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;
  return `M ${cx + rx},${cy} A ${rx},${ry} 0 0,1 ${cx - rx},${cy} A ${rx},${ry} 0 0,1 ${cx + rx},${cy} Z`;
};

export const symbolDiamond = symbol((ctx, x, y, width, height) => {
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x, y + height / 2);
  ctx.lineTo(x + width / 2, y + height);
  ctx.lineTo(x + width, y + height / 2);
  ctx.closePath();
});

export const symbolX = symbol((ctx, x, y, width, height) => {
  const a = width / 4;
  const b = height / 4;
  ctx.moveTo(x + a, y);
  ctx.lineTo(x, y + b);
  ctx.lineTo(x + a, y + b * 2);
  ctx.lineTo(x, y + b * 3);
  ctx.lineTo(x + a, y + b * 4);
  ctx.lineTo(x + a * 2, y + b * 3);
  ctx.lineTo(x + a * 3, y + b * 4);
  ctx.lineTo(x + a * 4, y + b * 3);
  ctx.lineTo(x + a * 3, y + b * 2);
  ctx.lineTo(x + a * 4, y + b);
  ctx.lineTo(x + a * 3, y);
  ctx.lineTo(x + a * 2, y + b);
  ctx.closePath();
});

function symbol(generator) {
  return (...params) => {
    const context = d3.path();
    generator(context, ...params);
    return context.toString();
  };
}
