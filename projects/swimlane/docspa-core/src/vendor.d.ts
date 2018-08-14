declare module 'vfile' {
  export default class VFile {
    path: string;
    contents: string;
    basename: string;
    extname: string;
    stem: string;
    dirname: string;
    cwd: string;
    history: string[];

    data: { [key: string]: any };

    constructor(options: Partial<VFile>) 
  }
}