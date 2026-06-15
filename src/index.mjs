/**
 * Node.js wrapper around the spartan2 wasm-bindgen module.
 *
 * Call `init()` once before using `prove` / `verify` / `load_pk`.
 * Run `npm run fetch:assets` first to download the wasm binaries.
 *
 * @example
 * import { init, CircuitKind, load_pk, prove, verify } from 'openac-rsa-x509';
 *
 * await init();
 * load_pk(CircuitKind.CertChainRs2048, pkBytes);
 * const { proof, public_values } = prove(CircuitKind.CertChainRs2048, witnessBytes);
 * const ok = verify(proof, vkBytes);
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const WASM_BG = join(HERE, "wasm", "spartan2_wasm_bg.wasm");

// Lazily imported so the module can be loaded even before fetch:assets runs;
// the error surfaces only when init() is called.
let _mod = null;
async function loadMod() {
  if (_mod) return _mod;
  try {
    _mod = await import("./wasm/spartan2_wasm.js");
  } catch (err) {
    throw new Error(
      `Could not import spartan2_wasm.js — did you run 'npm run fetch:assets'?\n  ${err.message}`,
    );
  }
  return _mod;
}

let _initialized = false;

/**
 * Initialize the wasm module.  Must be called once before any other export.
 * Safe to call multiple times; subsequent calls are no-ops.
 */
export async function init() {
  if (_initialized) return;
  const mod = await loadMod();

  let wasmBytes;
  try {
    wasmBytes = await readFile(WASM_BG);
  } catch {
    throw new Error(
      `Could not read ${WASM_BG} — did you run 'npm run fetch:assets'?`,
    );
  }

  // Pass the buffer directly; wasm-bindgen init() accepts ArrayBuffer /
  // TypedArray in addition to URLs and Response objects.
  await mod.default(wasmBytes);
  mod.wasm_init();
  _initialized = true;
}

/**
 * Generate a Spartan2 proof.
 *
 * @param {number} kind  - CircuitKind enum value
 * @param {Uint8Array} witnessBytes - `.wtns` binary produced by the Circom
 *   witness calculator for the corresponding circuit
 * @returns {{ proof: Uint8Array, public_values: string[] }}
 */
export async function prove(kind, witnessBytes) {
  if (!_initialized) throw new Error("Call init() before prove()");
  const { prove: _prove } = await loadMod();
  return _prove(kind, witnessBytes);
}

/**
 * Verify a Spartan2 proof.
 *
 * @param {Uint8Array} proofBytes
 * @param {Uint8Array} vkBytes - verifying key bytes
 * @returns {any} result from the wasm verifier
 */
export async function verify(proofBytes, vkBytes) {
  if (!_initialized) throw new Error("Call init() before verify()");
  const { verify: _verify } = await loadMod();
  return _verify(proofBytes, vkBytes);
}

/**
 * Load a proving key into the wasm module's static cache.
 *
 * @param {number} kind  - CircuitKind enum value
 * @param {Uint8Array} pkBytes
 */
export async function load_pk(kind, pkBytes) {
  if (!_initialized) throw new Error("Call init() before load_pk()");
  const { load_pk: _load_pk } = await loadMod();
  _load_pk(kind, pkBytes);
}

/**
 * Build split circuit inputs from raw cert / signature material.
 * See spartan2_wasm.js JSDoc for full parameter descriptions.
 */
export async function build_split_inputs(
  userCertDer,
  issuerCertDer,
  userSignatureB64,
  appIdBytes,
  serialHex,
  smtInputs,
  kIssuer,
  kUser,
  challenge,
) {
  if (!_initialized) throw new Error("Call init() before build_split_inputs()");
  const { build_split_inputs: _fn } = await loadMod();
  return _fn(
    userCertDer,
    issuerCertDer,
    userSignatureB64,
    appIdBytes,
    serialHex,
    smtInputs,
    kIssuer,
    kUser,
    challenge,
  );
}

/** @returns {number} RSA modulus bit-width of a DER-encoded certificate */
export async function cert_modulus_bits(certDer) {
  if (!_initialized) throw new Error("Call init() before cert_modulus_bits()");
  const { cert_modulus_bits: _fn } = await loadMod();
  return _fn(certDer);
}

/** @returns {string} Trimmed hex serial of a DER-encoded certificate */
export async function cert_serial_hex(certDer) {
  if (!_initialized) throw new Error("Call init() before cert_serial_hex()");
  const { cert_serial_hex: _fn } = await loadMod();
  return _fn(certDer);
}

/**
 * Assert pk_commit equality between cert-chain and user-sig public outputs.
 */
export async function link_verify(certPubs, userSigPubs) {
  if (!_initialized) throw new Error("Call init() before link_verify()");
  const { link_verify: _fn } = await loadMod();
  return _fn(certPubs, userSigPubs);
}

/** CircuitKind enum — resolved after the first import() call. */
export const CircuitKind = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!_mod) {
        throw new Error("Call init() before accessing CircuitKind");
      }
      return _mod.CircuitKind[prop];
    },
  },
);
