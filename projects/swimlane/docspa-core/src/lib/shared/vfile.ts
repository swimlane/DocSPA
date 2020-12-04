import VFILE from 'vfile';
import { join } from './utils';

import type * as vfile from 'vfile';
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

export interface SectionData {
  id: string;
  text: string;
  heading: string;
  source: string;
  depth: number;
  name: string;
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

export function VFile(doc: vfile.VFileCompatible): VFile {
  return VFILE(doc) as VFile;
}

export function isVfile(x: unknown): x is VFile {
  return x instanceof VFILE;
}

export function getBasePath(_: VFile) {
  return _.history[0];
}

export function getFullPath(_: VFile) {
  return join(_.cwd, _.path);
}

export interface Preset extends unified.Preset {
  reporter?: (vfile: VFile) => {};
}
