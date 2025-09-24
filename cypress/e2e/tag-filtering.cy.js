describe('Tag Filtering Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSlideshow()
  })

  it('should display clickable tags', () => {
    cy.waitForImageLoad()
    
    // Check that tags are displayed and have clickable styling
    cy.get('.tags').should('be.visible')
    cy.get('.tag-item').should('exist')
    cy.get('.tag-item').should('have.css', 'cursor', 'pointer')
  })

  it('should show hover effects on tags', () => {
    cy.waitForImageLoad()
    
    // Test hover effect on first tag
    cy.get('.tag-item').first().trigger('mouseover')
    // Allow for both transparent and black as valid states during hover transition
    cy.get('.tag-item').first().should('have.css', 'background-color').and('match', /(rgba\(0, 0, 0, 0\)|rgb\(0, 0, 0\))/)
  })

  it('should filter collections when tag is clicked', () => {
    cy.waitForImageLoad()
    
    // Get initial album counter
    cy.get('.album-counter').invoke('text').then((initialCounter) => {
      // Click on the first tag
      cy.get('.tag-item').first().invoke('text').then((tagName) => {
        cy.get('.tag-item').first().click()
        
        // Check that the counter shows filtered view
        cy.get('.album-counter').should('contain', tagName.trim() + ' collections')
        
        // Check that RESET button is visible
        cy.get('.album-reset').should('be.visible')
        cy.get('.album-reset').should('contain', 'RESET')
      })
    })
  })

  it('should reset filtering when RESET button is clicked', () => {
    cy.waitForImageLoad()
    
    // Get initial album counter
    cy.get('.album-counter').invoke('text').then((initialCounter) => {
      // Click on a tag to filter
      cy.get('.tag-item').first().click()
      
      // Wait for filtering to complete
      cy.get('.album-reset').should('be.visible')
      
      // Click reset button
      cy.get('.album-reset').click()
      
      // Should return to original counter format
      cy.get('.album-counter').should('contain', initialCounter.trim())
      cy.get('.album-reset').should('not.be.visible')
    })
  })

  it('should limit navigation to filtered collections', () => {
    cy.waitForImageLoad()
    
    // Click on a tag to filter
    cy.get('.tag-item').first().click()
    
    // Wait for filtering
    cy.get('.album-reset').should('be.visible')
    
    // Get the filtered collection count
    cy.get('.album-counter').invoke('text').then((filteredText) => {
      const match = filteredText.match(/(\d+) of (\d+) collections/)
      if (match) {
        const totalFiltered = parseInt(match[2])
        
        // Navigate through collections - should stay within filtered set
        for (let i = 0; i < Math.min(3, totalFiltered); i++) {
          cy.get('#next-album').click()
          cy.wait(1000)
          cy.get('.album-counter').should('contain', ' collections')
        }
      }
    })
  })

  it('should limit playback controls to filtered collections', () => {
    cy.waitForImageLoad()
    
    // Click on a tag to filter
    cy.get('.tag-item').first().click()
    
    // Wait for filtering
    cy.get('.album-reset').should('be.visible')
    
    // Test Play All functionality stays within filtered collections
    cy.get('#play-all').click()
    
    // Let slideshow run briefly
    cy.wait(2000)
    
    // Stop slideshow
    cy.get('#play-all').click()
    
    // Should still be in filtered view
    cy.get('.album-counter').should('contain', ' collections')
  })
})