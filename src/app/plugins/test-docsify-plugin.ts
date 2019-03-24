export function timestampPlugin(hooks: any) {
  /* hooks.beforeEach((md: string) => {
    return `**${new Date()}**\n\n${md}`;
  }); */
  hooks.afterEach((html: string) => {
    return `${html}<!-- HTML generated ${new Date()} -->`;
  });
}
