describe('Main navigation', () => {
  beforeEach(() => {
    cy.get('app-root').find('aside.left-sidebar').as('sidebar');
    cy.get('app-root').find('aside.right-sidebar').as('rightbar');
    cy.get('app-root').find('nav.app-nav').as('navbar');
  });

  before(() => cy.visit('/'));

  it('start on readme', () => {
    cy.url().should('eq', 'http://localhost:4200/');
    cy.get('section.content').find('h1').contains('DocSPA');
  });

  it('to features page', () => {
    cy.get('@sidebar').find('md-toc[path="features"] a').first().click({ force: true });
    cy.url().should('include', '/features');
    cy.get('section.content').find('h1[id="content-features"]').contains('Content Features');
  });

  it('to content page', () => {
    cy.get('@sidebar').find('md-toc[path="content"] a').first().click({ force: true });
    cy.url().should('include', '/content');
    cy.get('section.content').find('h1[id="content"]').contains('Content');
  });

  it('to customization page', () => {
    cy.get('@sidebar').find('md-toc[path="modules/"] a').first().click({ force: true });
    cy.url().should('include', '/modules/');
    cy.get('section.content').find('h1[id="modules"]').contains('Modules');
  });

  it('to quickstart page', () => {
    cy.get('@sidebar').find('md-toc[path="quickstart"] a').first().click({ force: true });
    cy.url().should('include', '/quickstart');
    cy.get('section.content').find('h1[id="quick-start"]').contains('Quick start');
  });

  it('content links', () => {
    cy.get('@sidebar').find('md-toc[path="/"] a').first().click({ force: true });
    cy.url().should('eq', 'http://localhost:4200/#docspa');
    cy.get('section.content').find('h1').contains('DocSPA');
    cy.get('section.content').find('a[href="/quickstart"]').first().click({ force: true });
    cy.url().should('include', '/quickstart');
    cy.get('section.content').find('h1[id="quick-start"]').contains('Quick start');
    cy.get('section.content').find('.info > a').first().click({ force: true });
    cy.get('section.content').find('h1[id="adding-docspa-to-a-angular-cli-app"]').contains('Adding DocSPA to a angular cli app');
    cy.get('section.content').find('a[href="/modules/#docspacoremodule"]').click({ force: true });
    cy.url().should('include', 'modules/#docspacoremodule');
    cy.get('section.content').find('h1[id="modules"]').contains('Modules');
  });
});