/**
 * Dynamic loading entrypoint for the security frontend plugin.
 * Re-exports the plugin for use with dynamic plugin loaders (e.g. Scalprum).
 */
export {
  SecurityFrontendPlugin,
  EntitySecurityFrontendContent,
  OverviewDisplayCardContent,
} from '../plugin';
