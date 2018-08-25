// copy of https://github.com/montogeek/remark-custom-blockquotes with
// https://github.com/montogeek/remark-custom-blockquotes/pull/2 pending merge
import {
  customBlockquotes as _customBlockquotes,
  customBlockquotesOptions
} from '@swimlane/docspa-remark-preset/plugins/remark-custom-blockquotes';

export const customBlockquotes = [_customBlockquotes, customBlockquotesOptions];
