import type * as vfile from 'vfile';
import type * as mdast from 'mdast';
import type * as toc from 'mdast-util-toc';
import type * as unified from 'unified';

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

export interface TOCOptions extends toc.TOCOptions {
  minDepth?: number;
}

interface SectionData {
  id: string;
  text: string;
  heading: string;
  source: string;
}

interface VFileData extends UnknownData {
  tocOptions?: TOCOptions;
  tocSearch?: TOCData[];
  matter?: FrontmatterData;
  title?: string;
  docspa?: DocSPAData;
  sections?: SectionData[];
}

export interface VFile extends vfile.VFile {
  data: VFileData;
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

export interface Preset extends unified.Preset {
  reporter?: (vfile: VFile) => {};
}

