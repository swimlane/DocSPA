import { dom } from '@swimlane/cy-dom-diff';

describe('Search', () => {
  before(() => {
    cy.visit('/');
    cy.waitForNetworkIdle(1000);
    cy.get('body', { timeout: 10000 }).should('have.class', 'ready');
  });

  it('can search', () => {
    cy.get('#main').scrollIntoView();

    cy.get('app-root')
      .find('aside.left-sidebar .docspa-search', { timeout: 10000 })
      .should('exist')
        .find('input')
        .should('have.attr', 'type', 'search')
        .type('doc*');

    cy.get('.docspa-search--results-panel').find('.docspa-search--item').within(() => {
      cy.root().should('have.length', 37);

      cy.root().eq(0).find('a').should('have.attr', 'href', '/modules/docsify#docsifypluginsmodule');
      cy.root().eq(1).find('a').should('have.attr', 'href', '/modules/search#docspasearchcomponent');
      cy.root().eq(2).find('a').should('have.attr', 'href', '/modules/stackblitz#docspastackblitzmodule');
      cy.root().eq(3).find('a').should('have.attr', 'href', '/modules/core#docspacoremodule');
      cy.root().eq(4).find('a').should('have.attr', 'href', '/#docspa');

      cy.root().eq(0).find('a').domMatch(dom`
        <h2>
          <em class="search-keyword">
            DocsifyPluginsModule
          </em>
        </h2>
        <h3>
        </h3>
        <p>
          <em class="search-keyword">
            DocSPA
          </em>
          supports many (but not all)
          <em class="search-keyword">
            docsify
          </em>
          plugins .  To include
          <em class="search-keyword">
            docsify
          </em>
          plugins add the
        </p>`);

      cy.root().eq(2).find('a h2').domMatch(dom`
        <em class="search-keyword">
          DocspaStackblitzModule
        </em>`);
    });

  });
});
