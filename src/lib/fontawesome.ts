import { config } from '@fortawesome/fontawesome-svg-core';

// Prevent FontAwesome from adding its CSS since we'll import it manually
// This prevents CSP violations from inline styles
config.autoAddCss = false; 