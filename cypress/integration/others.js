const { sidebar, navbar, noCover } = require('../support/helpers');

describe('Other pages', () => {
  beforeEach(() => {
    cy.get('app-root').find('aside.left-sidebar').as('sidebar');
    cy.get('app-root').find('aside.right-sidebar').as('rightbar');
    cy.get('app-root').find('nav.app-nav').as('navbar');
    cy.get('app-root').find('section.content').as('content');
  });

  describe('Page not found', () => {
    before(() => cy.visit('/not-found'));

    it('has a title', () => {
      cy.title().should('eq', 'DocSPA - ERROR 404')
    });
  
    it('has no cover', noCover);
    it('sidebar', sidebar);
    it('navbar', navbar);
  
    it('has content', () => {
      cy.get('@content').find('h1', { timeout: 6000 }).contains('ERROR 404');
    });
  });

  describe('Sub directory readme not found', () => {
    before(() => cy.visit('/sub')); // note: this does not match sub/

    it('has a title', () => {
      cy.title().should('eq', 'DocSPA - ERROR 404')
    });
  
    it('has no cover', noCover);
    it('sidebar', sidebar);
    it('navbar', navbar);
  
    it('has content', () => {
      cy.get('@content').find('h1', { timeout: 6000 }).contains('ERROR 404');
    });
  });
  
  describe('The Sub page', () => {
    before(() => cy.visit('/sub/'));

    it('has a title', () => {
      cy.title().should('eq', 'DocSPA - Test Sub Page');
      cy.get('head meta[name="description"]')
        .should('have.attr', 'content', 'This is only for testing');
      cy.get('head meta[name="keywords"]')
        .should('have.attr', 'content', 'testing,one,two,three');
      cy.get('head meta[name="author"]')
        .should('have.attr', 'content', 'J. Harshbarger');
    });
  
    it('has a cover', () => {
      cy.get('app-root').find('.cover-main').as('coverpage');
      cy.get('@coverpage').find('h2').contains('Sub Cover');
    });
  
    it('has a sidebar', () => {
      cy.get('@sidebar').find('.sidebar-nav li a').should('have.length', 6);
      cy.get('@sidebar').find('.sidebar-nav li a').should('have.attr', 'href').and('matches', /^[\/]?sub\/.*/); 
    });
  
    it('has a navbar', () => {
      cy.get('@navbar').find('a').should('have.length', 6);
      cy.get('@navbar').find('a').should('have.attr', 'href').and('matches', /^[\/]?sub\/.*/);
    });
  
    it('has content', () => {
      cy.get('@content').find('h1').contains('This is the sub readme');
      cy.get('@content').find('h1 a').should('have.attr', 'href').and('matches', /^[\/]?sub\/#sub/);
      cy.get('@content').find('footer').contains('Made with DocSPA');
    });

    it('images', () => {
      cy.get('@content').find('section[id="images"] img').as('images');
      cy.get('@images').should('have.length', 3);
      cy.get('@images').eq(0).should('have.attr', 'src', 'docs/sub/logo.png');
      cy.get('@images').eq(1).should('have.attr', 'src', 'docs/assets/docspa_mark-only.png');
      cy.get('@images').eq(2).should('have.attr', 'src', 'docs/assets/docspa_mark-only.png');
    });

    it('links', () => {
      cy.get('@content').find('section[id="links"] > p a[href]').as('links');
      cy.get('@links').should('have.length', 3);
      cy.get('@links').eq(0).should('have.attr', 'href', '/sub/');
      cy.get('@links').eq(1).should('have.attr', 'href', '/');
      cy.get('@links').eq(2).should('have.attr', 'href', '/');
    });
  });
  
  describe('The Sub-sub A page', () => {
    before(() => cy.visit('/sub/sub/a'));

    it('has a title', () => {
      cy.title().should('eq', 'DocSPA - Sub A')
    });
  
    it('has no cover', noCover);
  
    it('has a sidebar', () => {
      cy.get('@sidebar').find('.sidebar-nav li a').should('have.length', 6);
      cy.get('@sidebar').find('.sidebar-nav li a').should('have.attr', 'href').and('matches', /^[\/]?sub\/.*/); 
    });
  
    it('has a navbar', () => {
      cy.get('@navbar').find('a').should('have.length', 6);
      cy.get('@navbar').find('a').should('have.attr', 'href').and('matches', /^[\/]?sub\/.*/);
    });
  
    it('has content', () => {
      cy.get('@content').find('h1').contains('Sub A');
      cy.get('@content').find('footer').contains('Made with DocSPA');
      cy.get('@content').find('p > a').each(($el, index, $list) => {
        (index > 0) && cy.wrap($el).should('have.attr', 'href').and('matches', /^[\/]?sub\/.*/);
      });
    });
  });

  describe('Page not found in subdir', () => {
    before(() => cy.visit('/sub/here-too'));

    it('has a title', () => {
      cy.title().should('eq', 'DocSPA - ERROR 404')
    });
  
    it('has no cover', noCover);

    it('has a sidebar', () => {
      cy.get('@sidebar').find('.sidebar-nav li a').should('have.length', 6);
      cy.get('@sidebar').find('.sidebar-nav li a').should('have.attr', 'href').and('matches', /^[\/]?sub\/.*/); 
    });
  
    it('has a navbar', () => {
      cy.get('@navbar').find('a').should('have.length', 6);
      cy.get('@navbar').find('a').should('have.attr', 'href').and('matches', /^[\/]?sub\/.*/);
    });
  
    it('has content', () => {
      cy.get('@content').find('h1', { timeout: 6000 }).contains('ERROR 404');
    });
  });

  describe('Sub navigation', () => {
    before(() => cy.visit('/sub/'));

    afterEach(() => {
      cy.get('@sidebar').find('a[href="/sub/"]').click({ force: true });
      cy.get('@content').find('section[id="sub"] > h1').contains('This is the sub readme');
    })

    it('start on readme', () => {
      cy.get('@content').find('section[id="sub"] > h1').contains('This is the sub readme');
    });

    it('to page a', () => {
      cy.get('@content').find('a[href="/sub/a"]').click({ force: true });
      cy.get('@content').find('section[id="a"] > h1').contains('A');
    });

    it('to page b', () => {
      cy.get('@content').find('a[href="/sub/b"]').click({ force: true });
      cy.get('@content').find('section[id="b"] > h1').contains('B');
    });

    it('to sub page a', () => {
      cy.get('@content').find('a[href="/sub/sub/a"]').click({ force: true });
      cy.get('@content').find('section[id="sub-a"] > h1').contains('Sub A');
    });

    it('to sub page b', () => {
      cy.get('@content').find('a[href="/sub/sub/b"]').click({ force: true });
      cy.get('@content').find('section[id="sub-b"]> h1').contains('Sub B');
    });

    it('to page missing page a', () => {
      cy.get('@content').find('a').contains('./sub/missing_a').click({ force: true });
      cy.get('@content').find('h1').should('contain', 'ERROR 404');
    });

    it('to page missing page b', () => {
      cy.get('@content').find('a[href="/sub/sub/missing_b"]').click({ force: true });
      cy.get('@content').find('h1').should('contain', 'ERROR 404');
    });
  });

  describe('Test Page', () => {
    before(() => cy.visit('/sub/test'));

    it('check links', () => {
      cy.get('@content').find('section[id="links"] > h1').contains('Links');
      cy.get('@content').find('a').eq(0).should('have.attr', 'href', '/sub/test#links');

      cy.get('@content').find('a').eq(1).should('have.attr', 'href', '/sub/a');
      cy.get('@content').find('a').eq(2).should('have.attr', 'href', '/sub/a');
      cy.get('@content').find('a').eq(3).should('have.attr', 'href', '/features');
      cy.get('@content').find('a').eq(4).should('have.attr', 'href', '/features');
      cy.get('@content').find('a').eq(5).should('have.attr', 'href', 'http://localhost/docspa/');
      cy.get('@content').find('a').eq(6).should('have.attr', 'href', 'http://www.google.com/');
      cy.get('@content').find('a').eq(7).should('have.attr', 'href', '/sub/logo.png');
      cy.get('@content').find('a').eq(8).should('have.attr', 'href', 'docs/sub/logo.png');
      cy.get('@content').find('a').eq(9).should('have.attr', 'href', './logo.png');

      // cy.get('@content').find('a').eq(0).should('have.attr', 'href', '/sub/test#links');
      // cy.get('@content').find('a').eq(1).should('have.attr', 'href', '/sub/logo.png');
      // cy.get('@content').find('a').eq(2).should('have.attr', 'href', '/docs/sub/logo.png');
      // cy.get('@content').find('img').eq(0).should('have.attr', 'src', '/docs/sub/logo.png');
    });
  });
});
