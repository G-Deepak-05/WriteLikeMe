import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'WriteLikeMe',
  description: 'Make AI emails sound like you wrote them.',
  version: '1.0.0',
  action: {
    default_popup: 'index.html',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://mail.google.com/*'],
      js: ['src/content/index.tsx'],
    },
  ],
  permissions: ['storage', 'activeTab', 'scripting'],
  host_permissions: ['https://mail.google.com/*', 'https://integrate.api.nvidia.com/*'],
});
