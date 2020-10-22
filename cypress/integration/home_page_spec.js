import { dom } from '@swimlane/cy-dom-diff';

const pkg = require('../../package.json');
const { sidebar, navbar, pageAliases } = require('../support/helpers');

describe('The Home page', () => {
  beforeEach(() => {
    pageAliases();
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

    cy.get('app-root').find('.cover-main').within(() => {
      cy.get('p').first().domMatch(dom`
        <img
          alt="DocSPA Logo"
          class="docspa-logo"
          data-no-zoom="true"
          src="docs/assets/docspa_mark-only.png"
        >`);

      const SEMVER = /([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?/

      cy.get('h2').first().domMatch(dom`
        DocSPA
          <small>
          <md-env
            ng-version="${SEMVER}"
            var="version"
          >
            ${pkg.version}
          </md-env>
        </small>`);

      cy.get('blockquote').contains('An Angular-powered documentation SPA');
    
      cy.get('a').should('have.length', 2);    
    });
  });

  it('has a sidebar', sidebar);
  it('has a navbar', navbar);

  it('has expanded left nav', () => {
    cy.get('@sidebar').find('md-toc > ul > li > a').as('links');
    cy.get('@links').should('have.length', 5);

    cy.get('@links').eq(0).should('have.attr', 'href', '/#docspa');
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
  
      cy.get('@links').eq(0).should('have.attr', 'href', '/#introduction');
      cy.get('@links').eq(1).should('have.attr', 'href', '/#how-it-works');
      cy.get('@links').eq(2).should('have.attr', 'href', '/#features');
      cy.get('@links').eq(3).should('have.attr', 'href', '/#todo');
      cy.get('@links').eq(4).should('have.attr', 'href', '/#why-not-x');
      cy.get('@links').eq(5).should('have.attr', 'href', '/#credits');
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

    cy.get('@content').find('h1 a, h2 a, h3 a').first().should('have.attr', 'href').and('matches', /^\/#.*/);
    cy.get('@content').find('section[id="introduction"] > p a').first().should('have.attr', 'href', 'https://custom-elements-everywhere.com/#angular');
    cy.get('@content').find('section[id="introduction"] > p a').eq(1).should('have.attr', 'href', '/quickstart');
  });

  it('has pagination', () => {
    cy.get('@footer').find('.pagination-item-title').should('have.length', 1);

    cy.get('@footer').find('.pagination-item--next a').contains('Quick start');
    cy.get('@footer').find('.pagination-item--next a').should('have.attr', 'href', '/quickstart');
  });
});
