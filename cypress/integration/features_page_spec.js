const { sidebar, navbar, noCover } = require('../support/helpers');
const pkg = require('../../package.json');

describe('The Features page', () => {
  beforeEach(() => {
    cy.get('app-root').find('aside.left-sidebar').as('sidebar');
    cy.get('app-root').find('aside.right-sidebar').as('rightbar');
    cy.get('app-root').find('nav.app-nav').as('navbar');
    cy.get('app-root').find('section.content').as('content');
  });

  before(() => cy.visit('/features'));

  it('has a title', () => {
    cy.title().should('eq', 'DocSPA - Content Features')
  });

  it('has no cover', noCover);
  it('has a sidebar', sidebar);
  it('has a navbar', navbar);

  it('has content', () => {
    cy.get('@content').find('h1').contains('Features');
    cy.get('@content').find('footer').contains('Made with DocSPA');

    cy.get('@content').find('h1 a, h2 a, h3 a').first().should('have.attr', 'href').and('matches', /^\/features#.*/);
  });

  it('runs remark plugins', () => {
    cy.get('@content').find('.custom-block .notice').should('have.length', 4);
    cy.get('@content').find('.math .katex-display').should('have.length', 1);
    cy.get('@content').find('pre.language-js > code .line-highlight').should('have.length', 2);
  });

  it('runs other plugins', () => {
    cy.get('@content').find('.mermaid svg').should('have.length', 2);
  });

  it('has custom elements', () => {
    cy.get('@content').find('md-toc a').should('have.length', 15);
    // cy.get('@content').find('md-include').contains('This is the contents of embed.md');
    cy.get('@content').find('md-env').contains(pkg.version);
    // cy.get('@content').find('ngx-charts-bar-vertical svg').should('have.length', 1);
  });

  it('has pagination', () => {
    cy.get('@content').find('.pagination-item-title').should('have.length', 1);
    cy.get('@content').find('.pagination-item-title').contains('Modules');
  });
});