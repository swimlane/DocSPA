export const sidebar = () => { // TODO: check active link
  cy.get('@sidebar').find('img').should('have.attr', 'src', 'docs/assets/docspa-inline-125px.png');
  cy.get('@sidebar').find('md-toc').should('have.length', 6);

  cy.get('@sidebar').find('md-toc a').should('have.length', 52);
  cy.get('@sidebar').find('md-toc a').should('have.attr', 'href').and('matches',/^\/.*/);

  cy.get('@sidebar').find('md-toc a').first().should('have.attr', 'href', '/#docspa');
  cy.get('@sidebar').find('md-toc a').last().should('have.attr', 'href', 'features#environment-variables');

  cy.get('@rightbar').find('md-toc').should('have.length', 1);
};

export const navbar = () => {
  cy.get('@navbar').find('a').should('have.length', 2);
  cy.get('@navbar').find('a').last().should('have.attr', 'href', 'https://github.com/swimlane/docspa') 
};

export const noCover = () => {
  cy.get('app-root').find('.cover-main').should('have.length', 0);
};