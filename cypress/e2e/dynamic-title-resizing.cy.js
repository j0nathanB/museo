describe('Dynamic Title Re-sizing', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSlideshow()
  })

  it('should have a resizeAlbumTitles function available globally', () => {
    // Check that the function exists in window object
    cy.window().should('have.property', 'resizeAlbumTitles')
    cy.window().its('resizeAlbumTitles').should('be.a', 'function')
  })

  it('should automatically resize titles that are too wide for their container', () => {
    // Wait for album data to load
    cy.get('.album-title').should('be.visible')
    
    // Check that titles fit within their containers
    cy.get('.album-title').each(($title) => {
      cy.wrap($title).then(($el) => {
        const element = $el[0]
        // Verify that the title doesn't overflow its container
        expect(element.scrollWidth).to.be.at.most(element.clientWidth + 1) // Allow 1px tolerance
      })
    })
  })

  it('should resize titles when font size is too large', () => {
    // Test the function with manual control to avoid infinite loops
    cy.get('.album-title').first().then(($title) => {
      const originalText = $title.text()
      
      // Set a long title that should trigger resizing
      const longTitle = 'This is a very long album title that should be resized to fit within the container width available to it'
      cy.wrap($title).invoke('text', longTitle)
      
      // Get initial font size
      cy.wrap($title).invoke('css', 'fontSize').then((initialFontSize) => {
        
        // Trigger the resize function
        cy.window().then((win) => {
          win.resizeAlbumTitles()
        })
        
        // Check that font was reduced or title fits
        cy.wrap($title).should(($el) => {
          const element = $el[0]
          const currentFontSize = parseFloat(window.getComputedStyle(element).fontSize)
          
          // Either font size was reduced OR title fits within container
          const fontWasReduced = currentFontSize < parseFloat(initialFontSize)
          const titleFits = element.scrollWidth <= element.clientWidth + 1
          
          expect(fontWasReduced || titleFits).to.be.true
        })
        
        // Restore original text
        cy.wrap($title).invoke('text', originalText)
      })
    })
  })

  it('should not modify titles that already fit', () => {
    // Get a title that already fits
    cy.get('.album-title').first().then(($title) => {
      const originalFontSize = parseFloat($title.css('font-size'))
      const originalText = $title.text()
      
      // Set a short title that definitely fits
      cy.wrap($title).invoke('text', 'Short')
      
      // Trigger the resize function
      cy.window().then((win) => {
        win.resizeAlbumTitles()
      })
      
      // Check that the font size wasn't changed
      cy.wrap($title).should(($el) => {
        const newFontSize = parseFloat($el.css('font-size'))
        expect(newFontSize).to.equal(originalFontSize)
      })
      
      // Restore original text
      cy.wrap($title).invoke('text', originalText)
    })
  })

  it('should work with multiple titles at once', () => {
    // Check that the function can handle multiple titles
    cy.get('.album-title').should('have.length.at.least', 1)
    
    // Trigger resize on all titles
    cy.window().then((win) => {
      win.resizeAlbumTitles()
    })
    
    // Verify all titles fit after resizing
    cy.get('.album-title').each(($title) => {
      cy.wrap($title).should(($el) => {
        const element = $el[0]
        expect(element.scrollWidth).to.be.at.most(element.clientWidth + 1)
      })
    })
  })

  it('should be called automatically when albums change', () => {
    // Navigate to next album
    cy.get('#next-album').click()
    cy.waitForSlideshow()
    
    // Verify that titles in the new album also fit properly
    cy.get('.album-title').should('be.visible')
    cy.get('.album-title').each(($title) => {
      cy.wrap($title).then(($el) => {
        const element = $el[0]
        expect(element.scrollWidth).to.be.at.most(element.clientWidth + 1)
      })
    })
  })

  it('should maintain minimum readable font size', () => {
    // Set an extremely long title to test minimum size
    cy.get('.album-title').first().then(($title) => {
      const originalText = $title.text()
      
      // Set an extremely long title
      const veryLongTitle = 'A'.repeat(1000) // 1000 characters
      cy.wrap($title).invoke('text', veryLongTitle)
      
      // Trigger the resize function
      cy.window().then((win) => {
        win.resizeAlbumTitles()
      })
      
      // Check that font size doesn't go below a reasonable minimum (e.g., 12px)
      cy.wrap($title).should(($el) => {
        const fontSize = parseFloat($el.css('font-size'))
        expect(fontSize).to.be.at.least(12)
      })
      
      // Restore original text
      cy.wrap($title).invoke('text', originalText)
    })
  })

  it('should preserve the brutalist typography system properties', () => {
    // After resizing, other typography properties should remain unchanged
    cy.get('.album-title').first().then(($title) => {
      // Trigger resize
      cy.window().then((win) => {
        win.resizeAlbumTitles()
      })
      
      // Verify other properties are maintained
      cy.wrap($title).should('have.css', 'font-family').and('include', 'Inter Tight')
      cy.wrap($title).should('have.css', 'font-weight', '700')
      cy.wrap($title).should('have.css', 'color', 'rgb(17, 17, 17)')
      cy.wrap($title).should('have.css', 'text-align', 'left')
    })
  })
})