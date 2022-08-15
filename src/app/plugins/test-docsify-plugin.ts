export function timestampPlugin(hooks: { afterEach: (arg0: (html: string) => string) => void; }): void {
  /* hooks.beforeEach((md: string) => {
    return `**${new Date()}**\n\n${md}`;
  }); */
  hooks.afterEach((html: string) => {
    return `${html}<!-- HTML generated ${new Date()} -->`;
  });
}
