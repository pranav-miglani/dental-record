/**
 * E2E Tests for Mobile App
 * Using Detox for React Native E2E testing
 */

describe('App E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Authentication Flow', () => {
    it('should show login screen on app launch', async () => {
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should login successfully with valid credentials', async () => {
      await element(by.id('mobile-number-input')).typeText('9999999999');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('dashboard-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error on invalid credentials', async () => {
      await element(by.id('mobile-number-input')).typeText('9999999999');
      await element(by.id('password-input')).typeText('wrong-password');
      await element(by.id('login-button')).tap();

      await expect(element(by.id('error-message'))).toBeVisible();
    });

    it('should navigate to password reset screen', async () => {
      await element(by.id('forgot-password-link')).tap();
      await expect(element(by.id('password-reset-screen'))).toBeVisible();
    });
  });

  describe('Patient Management', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('mobile-number-input')).typeText('9999999999');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should navigate to patients screen', async () => {
      await element(by.id('patients-tab')).tap();
      await expect(element(by.id('patients-screen'))).toBeVisible();
    });

    it('should search for patients', async () => {
      await element(by.id('patients-tab')).tap();
      await element(by.id('patient-search-input')).typeText('John');
      await expect(element(by.id('patient-list'))).toBeVisible();
    });

    it('should view patient details', async () => {
      await element(by.id('patients-tab')).tap();
      await element(by.id('patient-item-0')).tap();
      await expect(element(by.id('patient-detail-screen'))).toBeVisible();
    });
  });

  describe('Procedure Management', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('mobile-number-input')).typeText('9999999999');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should navigate to procedures screen', async () => {
      await element(by.id('procedures-tab')).tap();
      await expect(element(by.id('procedures-screen'))).toBeVisible();
    });

    it('should view procedure details', async () => {
      await element(by.id('procedures-tab')).tap();
      await element(by.id('procedure-item-0')).tap();
      await expect(element(by.id('procedure-detail-screen'))).toBeVisible();
    });
  });

  describe('Profile', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('mobile-number-input')).typeText('9999999999');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should view profile screen', async () => {
      await element(by.id('profile-tab')).tap();
      await expect(element(by.id('profile-screen'))).toBeVisible();
    });

    it('should logout successfully', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();
      await expect(element(by.id('login-screen'))).toBeVisible();
    });
  });
});

