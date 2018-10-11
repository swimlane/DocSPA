const pkg = require('../../package.json');

// TODO: Test with fixtures
describe('DocSPA', () => {
  beforeEach(() => {
    cy.get('app-root').find('aside.left-sidebar').as('sidebar');
    cy.get('app-root').find('aside.right-sidebar').as('rightbar');
    cy.get('app-root').find('nav.app-nav').as('navbar');
    cy.get('app-root').find('section.content').as('content');
  });

  const sidebar = () => { // TODO: check active link
    cy.get('@sidebar').find('h1').contains('DocSPA');
    cy.get('@sidebar').find('md-toc').should('have.length', 5);

    cy.get('@sidebar').find('md-toc a').should('have.length', 29);
    cy.get('@sidebar').find('md-toc a').should('have.attr', 'href').and('matches',/^\/.*/);

    cy.get('@sidebar').find('md-toc a').first().should('have.attr', 'href', '/#introduction');
    cy.get('@sidebar').find('md-toc a').last().should('have.attr', 'href', 'features#docsify-plugins');

    cy.get('@rightbar').find('md-toc').should('have.length', 1);
  };

  const navbar = () => {
    cy.get('@navbar').find('a').should('have.length', 1);
    cy.get('@navbar').find('a').should('have.attr', 'href', 'https://github.com/swimlane/docspa') 
  };

  const noCover = () => {
    cy.get('app-root').find('.cover-main').should('have.length', 0);
  };

  describe('The Home page', () => {
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

      cy.get('app-root').find('.cover-main').as('coverpage');
      cy.get('@coverpage').find('h2').contains('DocSPA');
      cy.get('@coverpage').find('blockquote').contains('An Angular-powered documentation SPA');
    
      cy.get('@coverpage').find('img').should('have.attr', 'data-no-zoom', 'true');
      cy.get('@coverpage').find('img').should('have.attr', 'src', 'docs/logo.png');
      cy.get('@coverpage').find('a').should('have.length', 2);

      cy.get('@coverpage').find('env-var').contains(pkg.version);
    });

    it('has a sidebar', sidebar);
    it('has a navbar', navbar);

    it('has content', () => {
      cy.get('@content').find('h1').contains('DocSPA');
      cy.get('@content').find('footer').contains('Made with DocSPA');

      cy.get('@content').find('h1 a, h2 a, h3 a').first().should('have.attr', 'href').and('matches', /^\/#.*/);
      cy.get('@content').find('docspa-md-embed > p a').first().should('have.attr', 'href', 'https://custom-elements-everywhere.com/#angular');
      // cy.get('@content').find('docspa-md-embed > p a').last().should('have.attr', 'href', 'https://www.swimlane.com');
      cy.get('@content').find('docspa-md-embed > p a').eq(1).should('have.attr', 'href', '/quickstart');
    });

    it('can search', () => {
      cy.get('app-root').find('aside.left-sidebar .search').as('search');

      cy.get('@search').find('input').as('input');
      cy.get('@input').should('have.attr', 'type', 'search');
      cy.get('@search').find('.results-panel a').should('have.length', 0);
      
      cy.get('@input').type('doc', { force: true });
      cy.get('@search').find('.results-panel a').should('have.length', 3);
    });

    it('has pagination', () => {
      cy.get('@content').find('.pagination-item-title').should('have.length', 1);
      cy.get('@content').find('.pagination-item-title').contains('Quick start');
    });
  });
  
  describe('The Features page', () => {
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
      cy.get('@content').find('pre.language-javascript .line-highlight').should('have.length', 15);
    });
  
    it('runs other plugins', () => {
      cy.get('@content').find('.mermaid svg').should('have.length', 3);
    });
  
    it('has custom elements', () => {
      cy.get('@content').find('md-toc a').should('have.length', 7);
      cy.get('@content').find('md-embed').contains('This is the contents of embed.md');
      cy.get('@content').find('env-var').contains(pkg.version);
      cy.get('@content').find('ngx-charts-bar-vertical svg').should('have.length', 1);
    });

    it('has pagination', () => {
      cy.get('@content').find('.pagination-item-title').should('have.length', 1);
      cy.get('@content').find('.pagination-item-title').contains('Customization');
    });
  });

  describe('The quickstart page', () => {
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
      cy.get('@content').find('img[data-cy]').should($lis => {
        expect($lis).to.have.length(3);
        expect($lis.eq(0)).to.have.attr('src', 'docs/sub/logo.png');
        expect($lis.eq(1)).to.have.attr('src', 'docs/logo.png');
        expect($lis.eq(2)).to.have.attr('src', 'docs/logo.png');
      });
    });

    it('links', () => {
      cy.get('@content').find('a[data-cy]').should($lis => {
        expect($lis).to.have.length(3);
        expect($lis.eq(0)).to.have.attr('href', '/sub/');
        expect($lis.eq(1)).to.have.attr('href', '/');
        expect($lis.eq(2)).to.have.attr('href', '/');
      });
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
});
