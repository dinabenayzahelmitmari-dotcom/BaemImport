
import "@testing-library/jest-dom";

// Silence known React Router v6 future-flag warnings during tests.
const originalWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((...args) => {
    const msg = String(args[0] || "");
    if (msg.includes("React Router Future Flag Warning")) return;
    originalWarn(...args);
  });
});

afterAll(() => {
  console.warn.mockRestore();
});
