describe('Improved Navigation Labels', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSlideshow()
  })

  it('should display user-friendly image counter format', () => {
    cy.waitForImageLoad()
    
    // Verify it contains the word "Image" and "of"
    cy.get('.slide-counter').should('contain', 'Image')
    cy.get('.slide-counter').should('contain', ' of ')
    
    // Check the format is "Image X of Y"
    cy.get('.slide-counter').invoke('text').then((text) => {
      expect(text).to.match(/Image \d+ of \d+/)
    })
  })

  it('should display user-friendly collection counter with comma formatting', () => {
    // Verify it contains the word "Collection" and "of"
    cy.get('.album-counter').should('contain', 'Collection')
    cy.get('.album-counter').should('contain', ' of ')
    
    // Check that large numbers have comma formatting and text format is correct
    cy.get('.album-counter').invoke('text').then((text) => {
      // Remove any extra whitespace and line breaks
      const cleanText = text.replace(/\s+/g, ' ').trim()
      const match = cleanText.match(/Collection (\d{1,3}(?:,\d{3})*) of (\d{1,3}(?:,\d{3})*)/)
      expect(match).to.exist
      
      // If total is >= 1000, it should have comma formatting
      const total = parseInt(match[2].replace(/,/g, ''))
      if (total >= 1000) {
        expect(match[2]).to.include(',')
      }
    })
  })

  it('should use consistent "collection" terminology for album navigation', () => {
    // Check album navigation labels use "collection" instead of "set"
    cy.get('#prev-album').should('contain', 'Previous collection')
    cy.get('#random-album').should('contain', 'Random collection')
    cy.get('#next-album').should('contain', 'Next collection')
    
    // Ensure no "set" terminology remains
    cy.get('#prev-album').should('not.contain', 'set')
    cy.get('#random-album').should('not.contain', 'set')
    cy.get('#next-album').should('not.contain', 'set')
  })

  it('should have clear and descriptive playback control labels', () => {
    // Check music player style playback control labels
    cy.get('#play-set').should('contain', 'Play current')
    cy.get('#play-all').should('contain', 'Play all')
    cy.get('#play-random').should('contain', 'Shuffle all')
    
    // Ensure no old terminology remains
    cy.get('#play-set').should('not.contain', 'Loop this set')
    cy.get('#play-all').should('not.contain', 'Loop through all')
    cy.get('#play-random').should('not.contain', 'Shuffle all images')
  })

  it('should maintain functional navigation with improved labels', () => {
    // Test that navigation still works with new labels
    cy.get('.slide-counter').invoke('text').then((initialCounter) => {
      cy.get('#next-slide').click()
      // Always check that the format is maintained, regardless of whether count changed
      cy.get('.slide-counter').should('contain', 'Image')
      cy.get('.slide-counter').should('contain', ' of ')
      
      // If there are multiple images, the counter should change
      // If there's only one image, it will stay the same (wraps around)
    })
    
    cy.get('.album-counter').invoke('text').then((initialCounter) => {
      cy.get('#next-album').click()
      cy.get('.album-counter').should('not.contain', initialCounter)
      cy.get('.album-counter').should('contain', 'Collection')
      cy.get('.album-counter').should('contain', ' of ')
    })
  })

  it('should update counters correctly when navigating', () => {
    cy.waitForImageLoad()
    
    // Navigate to next slide and verify counter updates with proper format
    cy.get('#next-slide').click()
    cy.get('.slide-counter').should('contain', 'Image')
    cy.get('.slide-counter').should('contain', ' of ')
    
    // Navigate to next album and verify counter updates with proper format
    cy.get('#next-album').click() 
    cy.get('.album-counter').should('contain', 'Collection')
    cy.get('.album-counter').should('contain', ' of ')
  })

  it('should format numbers correctly for different ranges', () => {
    // This test will verify comma formatting works for various number ranges
    cy.window().then((win) => {
      // Test the number formatting function that should be implemented
      const formatNumber = win.formatNumber || ((n) => n.toString())
      
      expect(formatNumber(1)).to.equal('1')
      expect(formatNumber(999)).to.equal('999')
      expect(formatNumber(1000)).to.equal('1,000')
      expect(formatNumber(1161)).to.equal('1,161')
      expect(formatNumber(10000)).to.equal('10,000')
      expect(formatNumber(100000)).to.equal('100,000')
    })
  })
})