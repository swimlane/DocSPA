const pkg = require('../../package.json');
const { sidebar, navbar, pageAliases } = require('../support/helpers');

describe('page component is a subpage', () => {
  beforeEach(() => {
    pageAliases();
  });

  before(() => cy.visit('/docspa/'));

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

  it('has a sidebar', () => {
    cy.get('@sidebar').find('img').should('have.attr', 'src', 'docs/assets/docspa-inline-125px.png');
    cy.get('@sidebar').find('.sidebar-nav > ul, .sidebar-nav > p > md-toc > ul').should('have.length', 6);
  
    cy.get('@sidebar').find('ul li a').should('have.length.gt', 40);
    cy.get('@sidebar').find('ul li a').should('have.attr', 'href').and('matches',/^\/docspa\/.*/);
  
    cy.get('@sidebar').find('ul li a').first().should('have.attr', 'href', '/docspa/#docspa');
  
    // TODO: all TOC
    cy.get('@sidebar').find('ul li a').last().should('have.attr', 'href', '/docspa/modules/stackblitz');
  
    cy.get('@rightbar').find('md-toc').should('have.length', 1);
  });

  it('has a navbar', navbar);

  it('has expanded left nav', () => {
    cy.get('@sidebar').find('md-toc > ul > li > a').as('links');
    cy.get('@links').should('have.length', 5);

    cy.get('@links').eq(0).should('have.attr', 'href', '/docspa/#docspa');
    cy.get('@links').eq(0).should('have.class', 'router-link-active');
  });

  describe('right bar sidebar', () => {
    beforeEach(() => {
      cy.get('@rightbar').find('md-toc a').as('links');
    });

    it('has edit this page link', () => {
      cy.get('@rightbar').find('md-edit-on-github a').contains('Edit this page');
      cy.get('@rightbar').find('md-edit-on-github a').should('have.attr', 'href', 'https://github.com/swimlane/docspa/edit/master/src/docs//README.md');
    });

    it('has toc', () => {
      cy.get('@links').should('have.length', 6);
  
      cy.get('@links').eq(0).should('have.attr', 'href', '/docspa/#introduction');
      cy.get('@links').eq(1).should('have.attr', 'href', '/docspa/#how-it-works');
      cy.get('@links').eq(2).should('have.attr', 'href', '/docspa/#features');
      cy.get('@links').eq(3).should('have.attr', 'href', '/docspa/#todo');
      cy.get('@links').eq(4).should('have.attr', 'href', '/docspa/#why-not-x');
      cy.get('@links').eq(5).should('have.attr', 'href', '/docspa/#credits');
    });

    it('updates on scroll', () => {
      cy.get('@content').find('#todo').scrollIntoView();
      cy.get('@links').eq(3).should('have.class', 'active');
      cy.get('@links').eq(4).should('have.class', 'active');
      cy.get('@links').eq(5).should('have.class', 'active');
    });
  });

  it('has content', () => {
    cy.get('@content').find('h1').contains('DocSPA');
    cy.get('@content').find('footer').contains('Made with DocSPA');

    cy.get('@content').find('h1 a, h2 a, h3 a').first().should('have.attr', 'href').and('matches', /^\/docspa\/#.*/);
    cy.get('@content').find('section[id="introduction"] > p a').first().should('have.attr', 'href', 'https://custom-elements-everywhere.com/#angular');
    cy.get('@content').find('section[id="introduction"] > p a').eq(1).should('have.attr', 'href', '/docspa/quickstart');
  });

  it('can search', () => {
    cy.get('app-root').find('aside.left-sidebar .search').as('search');

    cy.get('@search').find('input').as('input');
    cy.get('@input').should('have.attr', 'type', 'search');
    cy.get('@search').find('.results-panel a').should('have.length', 0);
    
    cy.get('@input').type('doc', { force: true });
    cy.get('@search').find('.results-panel .matching-post').as('matching');
    cy.get('@matching').should('have.length', 4);

    cy.get('@matching').find('a').eq(0).should('have.attr', 'href', '/docspa/');
    cy.get('@matching').find('a').eq(1).should('have.attr', 'href', '/docspa/modules/core');
    cy.get('@matching').find('a').eq(2).should('have.attr', 'href', '/docspa/modules/docsify');
    cy.get('@matching').find('a').eq(3).should('have.attr', 'href', '/docspa/modules/stackblitz');

    cy.get('@matching').find('h2').eq(0).should('have.text', 'DocSPA');
    cy.get('@matching').find('h2').eq(1).should('have.text', 'DocspaCoreModule');
    cy.get('@matching').find('h2').eq(2).should('have.text', 'DocsifyPluginsModule');
    cy.get('@matching').find('h2').eq(3).should('have.text', 'DocspaStackblitzModule');
  });

  it('has pagination', () => {
    cy.get('@footer').find('.pagination-item-title').should('have.length', 1);

    cy.get('@footer').find('.pagination-item--next a').contains('Quick start');
    cy.get('@footer').find('.pagination-item--next a').should('have.attr', 'href', '/docspa/quickstart');
  });
});
