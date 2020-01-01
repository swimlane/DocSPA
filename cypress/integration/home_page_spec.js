const pkg = require('../../package.json');
const { sidebar, navbar } = require('../support/helpers');

describe('The Home page', () => {
  beforeEach(() => {
    cy.get('app-root').find('aside.left-sidebar').as('sidebar');
    cy.get('app-root').find('aside.right-sidebar').as('rightbar');
    cy.get('app-root').find('nav.app-nav').as('navbar');
    cy.get('app-root').find('section.content').as('content');
  });

  before(() => cy.visit('/'));

  it('has a title and metadata', () => {
    cy.title().should('eq', 'DocSPA');
    cy.get('head meta[name="description"]')
      .should('have.attr', 'content', 'An Angular-powered documentation SPA.');
    cy.get('head meta[name="keywords"]')
      .should('have.attr', 'content', 'documentation,angular,spa');
    cy.get('head meta[name="author"]')
      .should('have.attr', 'content', 'Swimlane');
  });
  
  it('has a coverpage', () => {
    cy.get('body').should('have.class', 'ready');

    cy.get('app-root').find('.cover-main').as('coverpage');
    cy.get('@coverpage').find('h2').contains('DocSPA');
    cy.get('@coverpage').find('blockquote').contains('An Angular-powered documentation SPA');
  
    cy.get('@coverpage').find('img').should('have.attr', 'data-no-zoom', 'true');
    cy.get('@coverpage').find('img').should('have.attr', 'src', 'docs/assets/docspa_mark-only.png');
    cy.get('@coverpage').find('a').should('have.length', 2);

    cy.get('@coverpage').find('md-env').contains(pkg.version);
  });

  it('has a sidebar', sidebar);
  it('has a navbar', navbar);

  it('has content', () => {
    cy.get('@content').find('h1').contains('DocSPA');
    cy.get('@content').find('footer').contains('Made with DocSPA');

    cy.get('@content').find('h1 a, h2 a, h3 a').first().should('have.attr', 'href').and('matches', /^\/#.*/);
    cy.get('@content').find('docspa-md-include > p a').first().should('have.attr', 'href', 'https://custom-elements-everywhere.com/#angular');
    // cy.get('@content').find('docspa-md-include > p a').last().should('have.attr', 'href', 'https://www.swimlane.com');
    cy.get('@content').find('docspa-md-include > p a').eq(1).should('have.attr', 'href', '/quickstart');
  });

  it('can search', () => {
    cy.get('app-root').find('aside.left-sidebar .search').as('search');

    cy.get('@search').find('input').as('input');
    cy.get('@input').should('have.attr', 'type', 'search');
    cy.get('@search').find('.results-panel a').should('have.length', 0);
    
    cy.get('@input').type('doc', { force: true });
    cy.get('@search').find('.results-panel a').should('have.length', 4);

    // TODO: check links
  });

  it('has pagination', () => {
    cy.get('@content').find('.pagination-item-title').should('have.length', 1);
    cy.get('@content').find('.pagination-item-title').contains('Quick start');
  });
});
