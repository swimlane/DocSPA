import type * as mdast from 'mdast';

interface UnknownData {
  [key: string]: unknown;
}

interface HData extends UnknownData {
  id?: string;
  originalUrl?: string;
  target?: string;
  download?: string;
  source?: string;
  fragment?: string;
}

interface NodeData extends UnknownData {
  hProperties?: HData;
}

export interface Heading extends mdast.Heading {
  data?: NodeData;
}

export interface Link extends mdast.Link {
  depth: number;
  data?: NodeData;
}


export interface Codes {
  [key: string]: {
    tagName: string;
  };
}

export interface ShortCode extends mdast.Parent {
  type: 'shortcode';
  identifier: string;
  attributes: { [key: string]: any };
}


