import * as wasm from './wasm_hello_world_bg';

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString =
  typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
      return cachedTextEncoder.encodeInto(arg, view);
    }
    : function (arg, view) {
      const buf = cachedTextEncoder.encode(arg);
      view.set(buf);
      return {
        read: arg.length,
        written: buf.length,
      };
    };

let cachegetUint8Memory = null;
function getUint8Memory() {
  if (
    cachegetUint8Memory === null ||
    cachegetUint8Memory.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory;
}

function passStringToWasm(arg) {
  let len = arg.length;
  let ptr = wasm.__wbindgen_malloc(len);

  const mem = getUint8Memory();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = wasm.__wbindgen_realloc(ptr, len, (len = offset + arg.length * 3));
    const view = getUint8Memory().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}
/**
 * @param {string} name
 */
export function greet(name) {
  wasm.greet(passStringToWasm(name), WASM_VECTOR_LEN);
}

let cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

function getStringFromWasm(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

export const __wbg_alert_84709ef345bc4a68 = function (arg0, arg1) {
  alert(getStringFromWasm(arg0, arg1));
};
