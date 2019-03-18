export { infoString, infoStringToAttr } from '@swimlane/docspa-remark-preset/dist/module/plugins/misc';
import { customBlocksOptions } from '@swimlane/docspa-remark-preset/dist/module/plugins/remark-custom-blocks';

import remarkCustomBlocks from 'remark-custom-blocks';

export const customBlocks = [remarkCustomBlocks, customBlocksOptions];

