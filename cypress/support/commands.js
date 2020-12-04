// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('getInternalLinks', () => { 
  const links = [];
  return cy.get('a', { log: false }).each($el => {
    const href = $el.attr('href');
    if (href && href.startsWith('/')) {
      links.push(href.split('#')[0]);
    }
  }).then(() => links);
});

Cypress.Commands.add('angularNavigateByUrl', (url) => { 
  return cy.window('body', { log: false }).then(win => {
    cy.log(`Angular nav to '${url}' `);
    win.cypressNavigateByUrl(url)
    cy.url().should('contain', url);
    cy.get('#main h1').should('not.contain', 'ERROR 404');
  });
});