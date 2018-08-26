
declare module 'vfile' {
  class VFile {
    path: string;
    contents: string;
    basename: string;
    extname: string;
    stem: string;
    dirname: string;
    cwd: string;
    history: string[];
    messages: any[];
  
    data: { [key: string]: any };
  
    constructor(options: any) 
  }

  export = VFile;
}