describe('Peroflota Slideshow', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSlideshow()
  })

  it('should load the application and display initial content', () => {
    // Check basic layout structure
    cy.get('.layout-container').should('be.visible')
    cy.get('.left-container').should('be.visible')
    cy.get('.right-container').should('be.visible')
    
    // Check slideshow container exists
    cy.get('.slideshow-container').should('be.visible')
    
    // Check navigation elements exist
    cy.get('#prev-slide').should('contain', 'Previous image')
    cy.get('#next-slide').should('contain', 'Next image')
    cy.get('#random-slide').should('contain', 'Random image')
  })

  it('should display album information', () => {
    cy.get('.album-data').should('be.visible')
    cy.get('.album-counter').should('be.visible')
    cy.get('.slide-counter').should('be.visible')
    
    // Check that counters show expected format
    cy.get('.album-counter').should('match', /\d+ \/ \d+/)
    cy.get('.slide-counter').should('match', /\d+ \/ \d+/)
  })

  it('should navigate between slides', () => {
    cy.waitForImageLoad()
    
    // Get initial slide counter value
    cy.get('.slide-counter').invoke('text').then((initialCounter) => {
      // Click next slide
      cy.get('#next-slide').click()
      
      // Wait for slide change and verify counter changed
      cy.get('.slide-counter').should('not.contain', initialCounter)
      
      // Click previous slide
      cy.get('#prev-slide').click()
      
      // Should return to initial state
      cy.get('.slide-counter').should('contain', initialCounter)
    })
  })

  it('should navigate between albums', () => {
    // Get initial album counter value
    cy.get('.album-counter').invoke('text').then((initialCounter) => {
      // Click next album
      cy.get('#next-album').click()
      
      // Wait for album change and verify counter changed
      cy.get('.album-counter').should('not.contain', initialCounter)
      
      // Click previous album
      cy.get('#prev-album').click()
      
      // Should return to initial state
      cy.get('.album-counter').should('contain', initialCounter)
    })
  })

  it('should display random content', () => {
    cy.get('#random-slide').click()
    cy.waitForImageLoad()
    
    cy.get('#random-album').click()
    cy.waitForSlideshow()
  })

  it('should have working playback controls', () => {
    // Check playback buttons exist
    cy.get('#play-set').should('contain', 'Loop this set')
    cy.get('#play-all').should('contain', 'Loop through all')
    cy.get('#play-random').should('contain', 'Shuffle')
    
    // Test play set functionality
    cy.get('#play-set').click()
    
    // Navigation should be disabled during playback
    cy.get('.slide-navigation-container').should('have.class', 'disable')
    cy.get('.album-navigation').should('have.class', 'disable')
    
    // Stop playback by clicking again
    cy.get('#play-set').click()
    
    // Navigation should be enabled again
    cy.get('.slide-navigation-container').should('not.have.class', 'disable')
    cy.get('.album-navigation').should('not.have.class', 'disable')
  })

  it('should load images from external source', () => {
    cy.waitForImageLoad()
    
    // Check that image src contains expected base URL
    cy.get('.slides img').should('have.attr', 'src').and('include', 'floaties.s3.amazonaws.com')
  })
})