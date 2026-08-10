// Thrown for problems the customer caused (bad input, sold-out item, stale
// price) -- these get a friendly message back to the browser. Anything
// else (DB errors, network errors) is an unexpected server error and
// should not leak details to the client.
export class CheckoutError extends Error {}
