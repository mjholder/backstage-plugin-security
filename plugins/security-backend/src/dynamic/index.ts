import type { BackendFeature } from '@backstage/backend-plugin-api';
import { securityPlugin } from '../plugin';

/**
 * Dynamic plugin installer for use with @backstage/backend-dynamic-feature-service.
 * When this package is loaded as a dynamic plugin, the loader looks for this named export.
 */
export const dynamicPluginInstaller = {
  kind: 'new' as const,
  install(): BackendFeature {
    return securityPlugin;
  },
};
