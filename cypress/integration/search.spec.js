describe('Search', () => {
  before(() => cy.visit('/'));

  it('can search', () => {
    cy.get('app-root').find('aside.left-sidebar .search').as('search');

    cy.get('@search').find('input').as('input');
    cy.get('@input').should('have.attr', 'type', 'search');
    cy.get('@search').find('.results-panel a').should('have.length', 0);
    
    cy.get('@input').type('doc', { force: true });
    cy.get('@search').find('.results-panel .matching-post').as('matching');
    cy.get('@matching').should('have.length', 4);

    cy.get('@matching').eq(0).find('a').should('have.attr', 'href', '/#docspa');
    cy.get('@matching').eq(2).find('a').should('have.attr', 'href', '/modules/core#docspacoremodule');
    cy.get('@matching').eq(3).find('a').should('have.attr', 'href', '/modules/docsify#docsifypluginsmodule');
    cy.get('@matching').eq(1).find('a').should('have.attr', 'href', '/modules/stackblitz#docspastackblitzmodule');

    cy.get('@matching').eq(0).find('h2').should('have.text', 'DocSPA');
    cy.get('@matching').eq(2).find('h2').should('have.text', 'DocspaCoreModule');
    cy.get('@matching').eq(3).find('h2').should('have.text', 'DocsifyPluginsModule');
    cy.get('@matching').eq(1).find('h2').should('have.text', 'DocspaStackblitzModule');
  });
});