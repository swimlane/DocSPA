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

    cy.get('@matching').find('a').eq(0).should('have.attr', 'href', '/');
    cy.get('@matching').find('a').eq(1).should('have.attr', 'href', '/modules/core');
    cy.get('@matching').find('a').eq(2).should('have.attr', 'href', '/modules/docsify');
    cy.get('@matching').find('a').eq(3).should('have.attr', 'href', '/modules/stackblitz');

    cy.get('@matching').find('h2').eq(0).should('have.text', 'DocSPA');
    cy.get('@matching').find('h2').eq(1).should('have.text', 'DocspaCoreModule');
    cy.get('@matching').find('h2').eq(2).should('have.text', 'DocsifyPluginsModule');
    cy.get('@matching').find('h2').eq(3).should('have.text', 'DocspaStackblitzModule');
  });
});