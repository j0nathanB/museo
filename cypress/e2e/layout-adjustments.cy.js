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

  it('should have right container with 30vw width', () => {
    // Right container should be 30vw (check computed value: 30% of 1000px = 300px)
    cy.get('.right-container').invoke('css', 'width').should('include', '300px')
  })

  it('should maintain proper layout proportions', () => {
    // Left container should still be 60vw (check computed value: 60% of 1000px = 600px)
    cy.get('.left-container').invoke('css', 'width').should('include', '600px')
    
    // Right container should be 30vw (check computed value: 30% of 1000px = 300px)
    cy.get('.right-container').invoke('css', 'width').should('include', '300px')
    
    // Verify proportions: left should be twice the width of right
    cy.get('.left-container').then(($left) => {
      cy.get('.right-container').then(($right) => {
        const leftWidth = parseFloat($left.css('width'))
        const rightWidth = parseFloat($right.css('width'))
        expect(leftWidth / rightWidth).to.be.closeTo(2, 0.1) // 60vw / 30vw = 2
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