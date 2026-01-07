const {device, expect, element, by, waitFor} = require('detox');
const adapter = require('detox/runners/jest/adapter');
const specReporter = require('detox/runners/jest/specReporter');

// Set the default timeout
jest.setTimeout(120000);

jasmine.getEnv().addReporter(adapter);
jasmine.getEnv().addReporter(specReporter);

beforeAll(async () => {
  await device.launchApp();
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterEach(async () => {
  await adapter.afterEach();
});

afterAll(async () => {
  await adapter.afterAll();
});

