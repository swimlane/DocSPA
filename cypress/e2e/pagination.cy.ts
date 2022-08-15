describe('pagination', () => {
  before(() => {
    cy.visit('/');
    cy.waitForNetworkIdle(1000);
  });

  it('has pagination links', () => {
    cy.get('app-root').find('footer').within(() => {
      cy.get('.pagination-item-title').should('have.length', 1);

      cy.get('.pagination-item--next a').contains('Quick start');
      cy.get('.pagination-item--next a').should('have.attr', 'href', '/quickstart');      
    });
  });

  it('can step', () => {
    const links = [
      '/',
      '/quickstart',
      '/content',
      '/themes',
      '/features',
      '/modules/',
      '/modules/core',
      '/modules/markdown',
      '/modules/markdown-elements',
      '/modules/docsify',
      '/modules/runtime',
      '/modules/search',
      '/modules/stackblitz'
    ];

    cy.get('.docsify-pagination-container').scrollIntoView().within(() => {
      links.slice(1).forEach(link => {
        cy.get('.next').should('have.attr', 'href', link);
        cy.get('.next').scrollIntoView()
        cy.get('.next').click();
        cy.url().should('contain', link);
      });

      cy.get('.next').should('not.exist');

      links.reverse().slice(1).forEach(link => {
        cy.get('.prev').should('have.attr', 'href', link);
        cy.get('.prev').scrollIntoView()
        cy.get('.prev').click();
        cy.url().should('contain', link);
      });

      cy.get('.prev').should('not.exist');      
    });
  });
});