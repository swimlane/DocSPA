import { sidebar, navbar, noCover } from '../support/helpers';

describe('The quickstart page', () => {
  beforeEach(() => {
    cy.get('app-root').find('aside.left-sidebar').as('sidebar');
    cy.get('app-root').find('aside.right-sidebar').as('rightbar');
    cy.get('app-root').find('nav.app-nav').as('navbar');
    cy.get('app-root').find('section.content').as('content');
  });

  before(() => cy.visit('/quickstart'));

  it('has a title', () => {
    cy.title().should('eq', 'DocSPA - Quick start')
  });

  it('has no cover', noCover);
  it('has a sidebar', sidebar);
  it('has a navbar', navbar);

  it('has content', () => {
    cy.get('@content').find('h1').contains('Quick start');
    cy.get('@content').find('footer').contains('Made with DocSPA');

    cy.get('@content').find('h1 a, h2 a, h3 a').first().should('have.attr', 'href').and('matches', /^\/quickstart#.*/);
  });

  it('has pagination', () => {
    cy.get('@content').find('.pagination-item-title').should('have.length', 2);
    cy.get('@content').find('.pagination-item-title').first().contains('DocSPA');
    cy.get('@content').find('.pagination-item-title').last().contains('Content');
  });
});