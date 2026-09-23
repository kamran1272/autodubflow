export const createBrowserSession = async () => ({
  status: 'ready',
  browser: 'playwright',
  note: 'Browser automation is intentionally not implemented yet. This is the future service boundary.',
});

export const browserSessionStatus = 'browser-session-ready';
