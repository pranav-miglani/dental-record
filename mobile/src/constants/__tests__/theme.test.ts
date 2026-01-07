import {theme, darkTheme} from '../theme';

describe('Theme', () => {
  describe('theme (light)', () => {
    it('should have primary color', () => {
      expect(theme.colors.primary).toBe('#2196F3');
    });

    it('should have secondary color', () => {
      expect(theme.colors.secondary).toBe('#03DAC6');
    });

    it('should have error color', () => {
      expect(theme.colors.error).toBe('#B00020');
    });

    it('should have background color', () => {
      expect(theme.colors.background).toBe('#FFFFFF');
    });
  });

  describe('darkTheme', () => {
    it('should have dark background', () => {
      expect(darkTheme.colors.background).toBe('#121212');
    });

    it('should have light text on dark background', () => {
      expect(darkTheme.colors.text).toBe('#FFFFFF');
    });
  });
});

