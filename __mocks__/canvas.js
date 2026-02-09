'use strict';

// Stub for jsdom when native canvas is not built (avoid canvas.node)
function noop() {}
const stub = { getContext: () => ({ fillRect: noop, clearRect: noop }), toDataURL: noop };
module.exports = {
  createCanvas: () => stub,
  Image: function () {},
};
