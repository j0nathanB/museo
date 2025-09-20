describe('Data Loading and API Integration', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should fetch album data from external API', () => {
    // Intercept the API call to verify it's being made
    cy.intercept('GET', '**/floaties.json').as('getAlbums')
    
    // Wait for the API call to complete
    cy.wait('@getAlbums').then((interception) => {
      expect(interception.response.statusCode).to.eq(200)
      expect(interception.response.body).to.be.an('array')
      expect(interception.response.body.length).to.be.greaterThan(0)
    })
    
    // Verify slideshow loads after data fetch
    cy.waitForSlideshow()
  })

  it('should handle network errors gracefully', () => {
    // Intercept and force a network error
    cy.intercept('GET', '**/floaties.json', { forceNetworkError: true }).as('getAlbumsError')
    
    cy.visit('/')
    
    // The app should handle this gracefully (exact behavior depends on error handling implementation)
    // For now, we just verify the page loads without crashing
    cy.get('body').should('be.visible')
  })

  it('should process album data correctly', () => {
    cy.intercept('GET', '**/floaties.json').as('getAlbums')
    
    cy.wait('@getAlbums')
    cy.waitForSlideshow()
    
    // Verify that album data is displayed
    cy.get('.album-data').should('be.visible')
    cy.get('.album-data .album-title').should('exist')
    
    // Verify counters are populated with data from API
    cy.get('.album-counter').should('not.be.empty')
    cy.get('.slide-counter').should('not.be.empty')
  })

  it('should extract and display album metadata', () => {
    cy.waitForSlideshow()
    
    // Check for album title
    cy.get('.album-data .album-title').should('be.visible').and('not.be.empty')
    
    // Check for tags (if present)
    cy.get('.album-data .tags').should('exist')
    
    // Check for link to original source
    cy.get('.album-data a').should('have.attr', 'href').and('not.be.empty')
  })
})