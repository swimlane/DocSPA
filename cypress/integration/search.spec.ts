import { dom } from '@swimlane/cy-dom-diff';

describe('Search', () => {
  before(() => cy.visit('/'));

  it('can search', () => {
    cy.get('app-root').find('aside.left-sidebar .docspa-search').as('search');

    cy.get('@search').find('input').as('input');
    cy.get('@input').should('have.attr', 'type', 'search');

    cy.get('@input').type('doc', { force: true });

    cy.get('.docspa-search--results-panel').find('.matching-post').as('matching');
    cy.get('@matching').should('have.length', 5);

    cy.get('@matching').eq(0).find('a').should('have.attr', 'href', '/modules/docsify#docsifypluginsmodule');
    cy.get('@matching').eq(1).find('a').should('have.attr', 'href', '/modules/search#docspasearchcomponent');
    cy.get('@matching').eq(2).find('a').should('have.attr', 'href', '/modules/stackblitz#docspastackblitzmodule');
    cy.get('@matching').eq(3).find('a').should('have.attr', 'href', '/modules/core#docspacoremodule');
    cy.get('@matching').eq(4).find('a').should('have.attr', 'href', '/#docspa');

    cy.get('@matching').eq(0).find('a').domMatch(dom`
      <h2><em class="search-keyword">Doc</em>sifyPluginsModule</h2>
      <h3></h3>
      <p>
        <em class="search-keyword">Doc</em>SPA supports many (but not all)
        <em class="search-keyword">doc</em>sify plugins .  To include
        <em class="search-keyword">doc</em>sify plugins add the
      </p>`);

    cy.get('@matching').eq(2).find('a').domMatch(dom`
      <h2><em class="search-keyword">Doc</em>spaStackblitzModule</h2>
      <h3></h3>
      <p>
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {
    <em class="search-keyword">Doc</em>spaCoreModule } from '@swimlane/
    <em class="search-keyword">doc</em>spa-core';
import {<em class="search-keyword">Doc</em>spaStackblitzModule } from
      </p>`);

    cy.get('@matching').eq(3).find('a').domMatch(dom`
      <h2><em class="search-keyword">Doc</em>spaCoreModule</h2>
      <h3></h3>
      <p>
        This module includes the core services and components required by
        <em class="search-keyword">Doc</em>SPA.  This module is required and should be imported using the  forRoot()  static method and
      </p>`);

    cy.get('@matching').eq(4).find('a').domMatch(dom`<h2>
      <em class="search-keyword">Doc</em>SPA</h2>
      <h3></h3>
      <p>Angular-powered<em class="search-keyword">doc</em>umentation
      </p>`);
  });
});
