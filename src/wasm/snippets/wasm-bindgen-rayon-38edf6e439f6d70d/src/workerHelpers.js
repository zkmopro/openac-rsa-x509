// Node.js stub for wasm-bindgen-rayon workerHelpers.
// startWorkers is wired into the wasm import object but is only invoked when
// initThreadPool() is called.  We do not call initThreadPool() in Node.js, so
// this is safe to leave unimplemented.
export function startWorkers(_module, _memory, _builder) {
  return Promise.reject(
    new Error("startWorkers: thread pool is not supported in Node.js; do not call initThreadPool()"),
  );
}
