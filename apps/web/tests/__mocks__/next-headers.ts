export function cookies() {
  return {
    get: () => undefined,
    set: () => {},
    delete: () => {},
    has: () => false,
    getAll: () => [],
  };
}

export function headers() {
  return new Headers();
}
