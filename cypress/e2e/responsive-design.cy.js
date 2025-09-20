describe('Responsive Design and UI Components', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSlideshow()
  })

  it('should display correctly on desktop viewport', () => {
    cy.viewport(1280, 720)
    
    // Check layout containers are properly sized
    cy.get('.left-container').should('be.visible')
    cy.get('.right-container').should('be.visible')
    
    // Check image constraints
    cy.get('.slides img').should('have.css', 'max-height')
    cy.get('.slides img').should('have.css', 'max-width')
  })

  it('should display correctly on tablet viewport', () => {
    cy.viewport(768, 1024)
    
    cy.get('.layout-container').should('be.visible')
    cy.get('.slideshow-container').should('be.visible')
    
    // Verify navigation is still accessible
    cy.get('#prev-slide').should('be.visible')
    cy.get('#next-slide').should('be.visible')
  })

  it('should display correctly on mobile viewport', () => {
    cy.viewport(375, 667)
    
    cy.get('.layout-container').should('be.visible')
    
    // Navigation should still be functional on mobile
    cy.get('#prev-slide').should('be.visible')
    cy.get('#next-slide').should('be.visible')
    cy.get('#random-slide').should('be.visible')
  })

  it('should have proper hover effects on desktop', () => {
    cy.viewport(1280, 720)
    
    // Test hover effect on navigation
    cy.get('#prev-slide').trigger('mouseover')
    cy.get('#prev-slide').should('have.css', 'background-color', 'rgb(0, 0, 0)')
    
    cy.get('#next-slide').trigger('mouseover')
    cy.get('#next-slide').should('have.css', 'background-color', 'rgb(0, 0, 0)')
  })

  it('should properly handle SVG images', () => {
    // This test assumes there are SVG images in the dataset
    // We'll need to navigate until we find one or mock the data
    cy.waitForImageLoad()
    
    // Check if current image is SVG and has proper width attribute
    cy.get('.slides img').then(($img) => {
      const src = $img.attr('src')
      if (src && src.includes('svg')) {
        cy.wrap($img).should('have.attr', 'width', '1200px')
      }
    })
  })

  it('should maintain proper aspect ratios for images', () => {
    cy.waitForImageLoad()
    
    cy.get('.slides img').should('have.css', 'max-height', '75vh')
    cy.get('.slides img').should('have.css', 'max-width', '100%')
  })
})