import { dom } from '@swimlane/cy-dom-diff';

describe('Search', () => {
  before(() => cy.visit('/'));

  it('can search', () => {
    cy.get('app-root').find('aside.left-sidebar .docspa-search').as('search');

    cy.get('@search').find('input').as('input');
    cy.get('@input').should('have.attr', 'type', 'search');

    cy.get('@input').type('doc*', { force: true });

    cy.get('.docspa-search--results-panel').find('.docspa-search--item').as('matching');
    cy.get('@matching').should('have.length', 37);

    cy.get('@matching').eq(0).find('a').should('have.attr', 'href', '/modules/docsify#docsifypluginsmodule');
    cy.get('@matching').eq(1).find('a').should('have.attr', 'href', '/modules/search#docspasearchcomponent');
    cy.get('@matching').eq(2).find('a').should('have.attr', 'href', '/modules/stackblitz#docspastackblitzmodule');
    cy.get('@matching').eq(3).find('a').should('have.attr', 'href', '/modules/core#docspacoremodule');
    cy.get('@matching').eq(4).find('a').should('have.attr', 'href', '/#docspa');

    cy.get('@matching').eq(0).find('a').domMatch(dom`
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

    cy.get('@matching').eq(2).find('a h2').domMatch(dom`
      <em class="search-keyword">
        DocspaStackblitzModule
      </em>`);
  });
});
