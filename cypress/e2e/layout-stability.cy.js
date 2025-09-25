describe('Layout Stability', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should prevent initial layout shift in right container elements', () => {
    // Test that album navigation and collection info maintain stable positions during load
    
    // Check initial positions of right container elements before full load
    cy.get('.album-counter').then($counter => {
      const initialCounterTop = $counter[0].getBoundingClientRect().top
      
      // Wait for slideshow to fully load
      cy.waitForSlideshow()
      
      // Verify album navigation position hasn't shifted significantly
      cy.get('.album-counter').then($counterAfter => {
        const finalCounterTop = $counterAfter[0].getBoundingClientRect().top
        // Allow for minor pixel differences but prevent major shifts (>10px)
        expect(Math.abs(finalCounterTop - initialCounterTop)).to.be.lessThan(10)
      })
    })
  })

  it('should maintain stable album navigation position during data loading', () => {
    cy.get('.album-navigation').first().then($nav => {
      const initialNavTop = $nav[0].getBoundingClientRect().top
      
      // Wait for full data load
      cy.waitForSlideshow()
      cy.waitForImageLoad()
      
      // Check that navigation hasn't shifted down significantly
      cy.get('.album-navigation').first().then($navAfter => {
        const finalNavTop = $navAfter[0].getBoundingClientRect().top
        expect(Math.abs(finalNavTop - initialNavTop)).to.be.lessThan(10)
      })
    })
  })

  it('should prevent collection info from causing layout shift', () => {
    cy.get('.album-data').then($data => {
      const initialDataTop = $data[0].getBoundingClientRect().top
      
      // Wait for album data to load
      cy.waitForSlideshow()
      cy.get('.album-title').should('be.visible')
      
      // Verify album data container position is stable
      cy.get('.album-data').then($dataAfter => {
        const finalDataTop = $dataAfter[0].getBoundingClientRect().top
        expect(Math.abs(finalDataTop - initialDataTop)).to.be.lessThan(10)
      })
    })
  })

  it('should maintain right container height consistency', () => {
    // Check that right container maintains consistent height during loading
    cy.get('.right-container').then($container => {
      const initialHeight = $container[0].getBoundingClientRect().height
      
      cy.waitForSlideshow()
      
      cy.get('.right-container').then($containerAfter => {
        const finalHeight = $containerAfter[0].getBoundingClientRect().height
        // Right container should maintain the same height (90vh)
        expect(Math.abs(finalHeight - initialHeight)).to.be.lessThan(5)
      })
    })
  })

  it('should prevent album data content from expanding container', () => {
    // Test that album data loading doesn't cause container expansion
    cy.waitForSlideshow()
    
    // Navigate to ensure we test with different content lengths
    cy.get('#next-album').click()
    cy.waitForSlideshow()
    
    cy.get('.album-data').then($data => {
      const dataHeight = $data[0].scrollHeight
      const containerHeight = $data[0].clientHeight
      
      // Album data should be constrained to its container height
      // If content overflows, it should scroll rather than expand
      if (dataHeight > containerHeight) {
        cy.get('.album-data').should('have.css', 'overflow', 'hidden')
      }
    })
  })
})