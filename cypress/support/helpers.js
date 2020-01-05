export const sidebar = () => { // TODO: check active link
  cy.get('@sidebar').find('img').should('have.attr', 'src', 'docs/assets/docspa-inline-125px.png');
  cy.get('@sidebar').find('.sidebar-nav > ul, .sidebar-nav > p > md-toc > ul').should('have.length', 6);

  cy.get('@sidebar').find('ul li a').should('have.length.gt', 40);
  cy.get('@sidebar').find('ul li a').should('have.attr', 'href').and('matches',/^\/.*/);

  cy.get('@sidebar').find('ul li a').first().should('have.attr', 'href', '/#docspa');

  // TODO: all TOC
  cy.get('@sidebar').find('ul li a').last().should('have.attr', 'href', '/modules/stackblitz');

  cy.get('@rightbar').find('md-toc').should('have.length', 1);
};

export const navbar = () => {
  cy.get('@navbar').find('a').should('have.length', 2);
  cy.get('@navbar').find('a').last().should('have.attr', 'href', 'https://github.com/swimlane/docspa') 
};

export const noCover = () => {
  cy.get('app-root').find('.cover-main').should('have.length', 0);
};

export const pageAliases = () => {
  cy.get('app-root').find('aside.left-sidebar').as('sidebar');
  cy.get('app-root').find('aside.right-sidebar').as('rightbar');
  cy.get('app-root').find('nav.app-nav').as('navbar');
  cy.get('app-root').find('section.content').as('content');
  cy.get('app-root').find('footer').as('footer');
};
