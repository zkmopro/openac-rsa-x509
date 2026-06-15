/* tslint:disable */
/* eslint-disable */

export enum CircuitKind {
    CertChainRs2048 = 0,
    CertChainRs4096 = 1,
    UserSigRs2048 = 2,
}

/**
 * `smt_inputs`: `null`/`undefined` fills zero defaults; otherwise a snake_case
 * `SmtCircuitInputs` object. `k_issuer` is 17 (RSA-2048) or 34 (RSA-4096);
 * `k_user` must be 17. `challenge` is the verifier-issued per-session field
 * element (decimal string) bound into the user-sig proof.
 */
export function build_split_inputs(user_cert_der: Uint8Array, issuer_cert_der: Uint8Array, user_signature_b64: string, app_id_bytes: Uint8Array, serial_hex: string, smt_inputs: any, k_issuer: number, k_user: number, challenge: string): any;

/**
 * RSA modulus bit width of the cert's `subjectPublicKey`. Used by the web
 * app to pick `certChainRS2048` vs `certChainRS4096` from the real
 * issuer key, rather than guessing from the issuer DN string.
 */
export function cert_modulus_bits(cert_der: Uint8Array): number;

/**
 * Trimmed-hex serial of an X.509 cert. Called after HiPKI `/sign` returns —
 * that cert may differ from the `/pkcs11info` entry, and the circuit keys
 * off the signing cert's serial.
 */
export function cert_serial_hex(cert_der: Uint8Array): string;

export function drop_pk(kind: CircuitKind): void;

export function initThreadPool(num_threads: number): Promise<any>;

/**
 * Assert pk_commit equality between a cert-chain proof's public values and a
 * user-sig proof's public values. Both are passed as Vec<String> (debug-printed
 * scalars) to match what `prove()` and `verify()` return to JS.
 */
export function link_verify(cert_pubs: string[], user_sig_pubs: string[]): any;

export function load_pk(kind: CircuitKind, pk_bytes: Uint8Array): void;

/**
 * Begin a streaming PK load. `low_memory_mode` picks the storage shape:
 *
 * * `false` (eager): one pre-reserved `Vec<u8>`, deserialized from a
 *   slice. Fastest per byte; wasm peak holds the raw buffer alongside
 *   the `ProverKey` being built.
 * * `true` (streaming): each chunk is its own `Vec<u8>`; finalize reads
 *   through a draining `Read` adapter that drops each chunk once
 *   consumed so the wasm allocator can reuse the freed capacity for
 *   `ProverKey` allocations still in flight. Slower per byte but cuts
 *   the transient peak. Use under the iOS WKWebView WebContent jetsam
 *   cap; non-web binding consumers use `load_pk(bytes)` and don't touch
 *   this path.
 */
export function load_pk_begin(kind: CircuitKind, total_size: number, low_memory_mode: boolean): void;

/**
 * Discard the in-flight buffer without finalizing. Safe to call when no
 * load is in flight.
 */
export function load_pk_cancel(kind: CircuitKind): void;

/**
 * Append a chunk to the in-flight buffer. The cumulative length is bounded
 * by the `total_size` announced in `load_pk_begin` so a caller cannot quietly
 * overshoot (which would force a reallocation in eager mode and a silent
 * drift between announced and actual bytes in streaming mode).
 */
export function load_pk_chunk(kind: CircuitKind, chunk: Uint8Array): void;

/**
 * Deserialize the accumulated bytes into a ProverKey and stash it. The
 * in-flight buffer is moved out of the static so a finalize failure
 * leaves no leftover state for the next attempt.
 */
export function load_pk_finish(kind: CircuitKind): void;

export function prove(kind: CircuitKind, wtns_bytes: Uint8Array): any;

export function verify(proof_bytes: Uint8Array, vk_bytes: Uint8Array): any;

export function wasm_init(): void;

export class wbg_rayon_PoolBuilder {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    build(): void;
    numThreads(): number;
    receiver(): number;
}

export function wbg_rayon_start_worker(receiver: number): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly drop_pk: (a: number) => void;
    readonly link_verify: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly load_pk: (a: number, b: number, c: number) => [number, number];
    readonly load_pk_begin: (a: number, b: number, c: number) => [number, number];
    readonly load_pk_cancel: (a: number) => void;
    readonly load_pk_chunk: (a: number, b: number, c: number) => [number, number];
    readonly load_pk_finish: (a: number) => [number, number];
    readonly prove: (a: number, b: number, c: number) => [number, number, number];
    readonly verify: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly wasm_init: () => void;
    readonly build_split_inputs: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: any, l: number, m: number, n: number, o: number) => [number, number, number];
    readonly cert_modulus_bits: (a: number, b: number) => [number, number, number];
    readonly cert_serial_hex: (a: number, b: number) => [number, number, number, number];
    readonly __wbg_wbg_rayon_poolbuilder_free: (a: number, b: number) => void;
    readonly initThreadPool: (a: number) => any;
    readonly wbg_rayon_poolbuilder_build: (a: number) => void;
    readonly wbg_rayon_poolbuilder_numThreads: (a: number) => number;
    readonly wbg_rayon_poolbuilder_receiver: (a: number) => number;
    readonly wbg_rayon_start_worker: (a: number) => void;
    readonly memory: WebAssembly.Memory;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_thread_destroy: (a?: number, b?: number, c?: number) => void;
    readonly __wbindgen_start: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number }} module - Passing `SyncInitInput` directly is deprecated.
 * @param {WebAssembly.Memory} memory - Deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number } | SyncInitInput, memory?: WebAssembly.Memory): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number }} module_or_path - Passing `InitInput` directly is deprecated.
 * @param {WebAssembly.Memory} memory - Deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number } | InitInput | Promise<InitInput>, memory?: WebAssembly.Memory): Promise<InitOutput>;
