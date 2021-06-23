import { dom } from '@swimlane/cy-dom-diff';

import { sidebar, navbar, noCover, pageAliases } from '../support/helpers';
import pkg from '../../package.json';

describe('The Features page', () => {
  beforeEach(() => {
    pageAliases();
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

  describe('remark plugins', () => {
    it('shows GFM', () => {
      cy.get('@content').find('#github-flavored-markdown').within(() => {
        cy.get('.contains-task-list').domMatch(dom`
        <li class="task-list-item">
          <input disabled type="checkbox">
          foo
        </li>
        <li class="task-list-item">
          <input checked disabled type="checkbox">
          baz
        </li>
        <li class="task-list-item">
          <input disabled type="checkbox">
          bim
        </li>
        <li class="task-list-item">
          <input disabled type="checkbox">
          lim
        </li>`);

        cy.get('table').should('exist');
      });
    });

    it('shows HTML', () => {
      cy.get('@content').find('#html-in-markdown').as('html');
      cy.get('@html').find('abbr').should('have.attr', 'title', 'Three Letter Acronym');
      cy.get('@html').find('iframe').should('have.attr', 'src', 'https://www.youtube.com/embed/qfYRSDMghQs');
    });

    it('shows blocks and notices', () => {
      cy.get('@content').find('#blocks-and-notices').as('blocks');
      cy.get('@blocks').find('.custom-block .notice').should('have.length', 4);
      cy.get('@blocks').find('.figure').should('have.length', 1);
      cy.get('@blocks').find('.figure').should('contain', 'Figure 1: Figure Title');
      cy.get('@blocks').find('.caption').should('have.length', 1);
      cy.get('@blocks').find('.caption').should('contain', 'Table 1: Table Title');

      cy.get('@blocks').find('p.note').should('contain', 'unit test');
      cy.get('@blocks').find('p.info').should('contain', 'unit test');
      cy.get('@blocks').find('p.tip').should('contain', 'my friend!');
      cy.get('@blocks').find('p.warn').should('contain', 'A warning');
    });

    it('shows code', () => {
      cy.get('@content').find('#code').as('code');
      cy.get('@code').find('pre').should('have.class', 'language-js');
      cy.get('@code').find('.line-highlight').should('have.length', 2);
    });

    it('renders mermaid', () => {
      cy.get('@content').find('#code').as('code');
      cy.get('@content').find('#mermaid').as('mermaid');
      cy.get('@mermaid').find('md-mermaid svg').should('exist');
    });

    it('displays math', () => {
      cy.get('@content').find('#math').within(() => {
        cy.get('.math .katex-display').should('have.length', 1);
        cy.get('.math .katex-display annotation').should('have.text', 'E^2=(mc^2)^2+(pc)^2');
      });
    });

    it('displays emoji', () => {
      cy.get('@content').find('#emoji').as('emoji');
      cy.get('@emoji').find('p').should('have.text', '💯 🎱 💯');
    });

    describe('remark-attr', () => {
      it('renders ids', () => {
        cy.get('#ids h3').should('contain', 'IDs');
      });

      it('renders styles', () => {
        cy.get('#styles > div.custom-block > :nth-child(1)').domMatch(dom`
          <em style="color:red; font-size: large">Doc</em>
          <em style="color:blue">SPA</em>`);
        cy.get('#styles > div.custom-block > :nth-child(2)').domMatch(dom`
            <img
            class="medium-zoom-image"
            src="docs/assets/docspa_mark-only.png"
            style="width: 100px; border: 10px solid lightgrey; padding: 10px;"
          >`);
      });

      it('renders classes', () => {
        cy.get('#classes > div.custom-block > p').domMatch(dom`<code class="badge note">
            note
          </code>
          <em class="badge info">
            info
          </em>
          <strong
            class="badge tip"
            title="This is a tip"
          >
            tip
          </strong>
          <strong
            class="badge warn"
            title="Watch out!!"
          >
            warn
          </strong>`);
      });

      it('renders attributes', () => {
        cy.get('#attributes > div.custom-block > :nth-child(1)').domMatch(dom`<img
          data-no-zoom
          src="docs/assets/docspa_mark-only.png"
          width="30px"
        >`);
      });
    });
  });

  describe('docsify plugins', () => {
    it('renders zoom images', () => {
      cy.get('@content').find('#zoom-image').as('zoom');
      cy.get('@zoom').find('img').should('have.class', 'medium-zoom-image');
      // TODO: Check click action
    });

    it('renders copy code', () => {
      cy.get('@content').find('#copy-code').as('copy-code');
      cy.get('@copy-code').find('button').should('have.class', 'docsify-copy-code-button');
      // TODO: Check click action
      // Bug... button gets rendered multiple times!!
    });
  });

  describe('right sidebar', () => {
    beforeEach(() => {
      cy.get('@rightbar').find('md-toc a').as('links');
    });

    it('has edit this page link', () => {
      cy.get('@rightbar').find('md-edit-on-github a').contains('Edit this page');
      cy.get('@rightbar').find('md-edit-on-github a').should('have.attr', 'href', 'https://github.com/swimlane/docspa/edit/master/src/docs/features.md');
    });

    it('has toc', () => {
      cy.get('@links').should('have.length', 19); // includes sub page links
  
      cy.get('@links').eq(0).should('have.attr', 'href', '/features#github-flavored-markdown');
    });

    it('updates on scroll', () => {
      cy.get('@content').find('#markdown-attributes').scrollIntoView();
      cy.get('@links').eq(9).should('have.class', 'active');
    });
  });

  describe('custom elements', () => {
    it('renders md-toc', () => {
      cy.get('@content').find('#table-of-contents').as('toc');
      cy.get('@toc').find('md-toc a').should('have.length', 16);
      // TODO: check links
    });

    it('renders md-include', () => {
      cy.get('@content').find('#include').as('include');
      cy.get('@include').find('md-include').contains('This is the contents of embed.md');
      // TODO: add an check links
    });

    it('renders md-env', () => {
      cy.get('@content').find('#environment-variables').as('environment-variables');
      cy.get('@environment-variables').find('md-env').eq(0).should('contain', pkg.version);
      cy.get('@environment-variables').find('md-env').eq(1).should('contain', 'false');
    });

    it('renders runtime templates', () => {
      cy.get('@content').find('#runtime').as('runtime');
      cy.get('@runtime').find('template').should('contain', 'Hello World')
      cy.get('@runtime').find('template button').should('contain', 'Click me: 0');
    });
  });

  it('has pagination', () => {
    cy.get('@content').find('.pagination-item-title').should('have.length', 2);
    cy.get('@content').find('.pagination-item-title').first().contains('Themes');
    cy.get('@content').find('.pagination-item-title').last().contains('Modules');
    // TODO: check links
  });
});