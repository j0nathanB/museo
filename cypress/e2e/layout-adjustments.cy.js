describe('Layout Width Adjustments', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSlideshow()
  })

  it('should have layout container with 100vw max-width and no margin', () => {
    // Layout container should use full viewport width (check computed value)
    cy.get('.layout-container').invoke('css', 'max-width').should('include', '1000px') // 100vw of 1000px viewport
    
    // Layout container should have no margin
    cy.get('.layout-container').should('have.css', 'margin', '0px')
  })

  it('should have right container with 40vw width', () => {
    // Right container should be approximately 40vw (allowing for padding/margins)
    cy.get('.right-container').then(($el) => {
      const width = parseFloat($el.css('width'))
      const viewportWidth = Cypress.config('viewportWidth')
      const expectedWidth = viewportWidth * 0.4 // 40vw
      expect(width).to.be.closeTo(expectedWidth, 50) // Allow 50px tolerance
    })
  })

  it('should maintain proper layout proportions', () => {
    // Verify proportions: left should be approximately 1.5x the width of right
    cy.get('.left-container').then(($left) => {
      cy.get('.right-container').then(($right) => {
        const leftWidth = parseFloat($left.css('width'))
        const rightWidth = parseFloat($right.css('width'))
        expect(leftWidth / rightWidth).to.be.closeTo(1.5, 0.2) // 60vw / 40vw = 1.5, allow more tolerance
      })
    })
  })

  it('should span full viewport width', () => {
    // Layout container should span the full viewport width
    cy.get('.layout-container').then(($el) => {
      const rect = $el[0].getBoundingClientRect()
      const viewportWidth = Cypress.config('viewportWidth')
      
      // Container should be close to full viewport width (allowing for scrollbars)
      expect(rect.width).to.be.closeTo(viewportWidth, 20)
    })
  })

  it('should maintain existing functionality with new layout', () => {
    // Verify that slideshow still works with adjusted layout
    cy.get('.slideshow-container').should('be.visible')
    cy.get('.album-data').should('be.visible')
    
    // Navigation should still be functional
    cy.get('#play-pause').should('be.visible')
    cy.get('#prev-slide').should('be.visible')
    cy.get('#next-slide').should('be.visible')
    
    // Counters should still be visible and functional
    cy.get('.album-counter').should('be.visible')
    cy.get('.slide-counter').should('be.visible')
  })
})