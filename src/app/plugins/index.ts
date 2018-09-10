export function tabsHook(hook) {
  const toggleState = function(tabs) {
    tabs.forEach(tab => {
      const state = this === tab ? 'open' : 'closed';
      tab = tab.closest('.tab');
      tab.setAttribute('data-state', state);
    });
  };

  hook.doneEach(() => {
    [].slice.call(document.querySelectorAll('.tabs')).forEach(tabSet => {
      const tabs = [].slice.call(tabSet.querySelectorAll('.tabs .tab .custom-block-heading'));
      tabs.forEach((tab, i) => {
        const state = i === 0 ? 'open' : 'closed';
        tab.closest('.tab').setAttribute('data-state', state);
        tab.addEventListener('click', toggleState.bind(tab, tabs), false);
      });
    });
  });
}
