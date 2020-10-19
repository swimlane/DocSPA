import * as VFILE from 'vfile';
import * as MDAST from 'mdast';

interface UnknownData {
  [key: string]: unknown;
}

export interface TOCData {
  name: string;
  url: string;
  link: string | string[];
  fragment: string;
  content: string;
  depth: number;
}

interface FrontmatterData extends UnknownData {
  title: string;
  description: string;
  keywords: string;
  author: string;
}

interface DocSPAData extends UnknownData {
  url: string;
  notFound?: boolean;
  isPageContent?: boolean;
}

interface VFileData extends UnknownData {
  tocSearch?: TOCData[];
  matter?: FrontmatterData;
  title?: string;
  docspa?: DocSPAData;
}

export interface VFile extends VFILE.VFile {
  data: VFileData;
}

interface HData extends UnknownData {
  id?: string;
  originalUrl?: string;
  target?: string;
  download?: string;
}

interface NodeData extends UnknownData {
  hProperties?: HData;
}

export interface Heading extends MDAST.Heading {
  data?: NodeData;
}

export interface Link extends MDAST.Link {
  depth: number;
  data?: NodeData;
}
