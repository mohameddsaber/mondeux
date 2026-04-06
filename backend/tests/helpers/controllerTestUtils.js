export const createMockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { _id: 'user-1', role: 'user' },
  headers: {},
  ...overrides,
});

export const createMockRes = () => ({
  statusCode: 200,
  body: null,
  cookies: [],
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  cookie(name, value, options) {
    this.cookies.push({ name, value, options });
    return this;
  },
  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  },
});

export const createStubRegistry = () => {
  const restores = [];

  return {
    stub(target, key, replacement) {
      const original = target[key];
      target[key] = replacement;
      restores.push(() => {
        target[key] = original;
      });
    },
    restoreAll() {
      while (restores.length > 0) {
        const restore = restores.pop();
        restore();
      }
    },
  };
};
