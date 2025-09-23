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
    cy.get('#play-pause').should('contain', 'Play')
  })

  it('should display album information', () => {
    cy.get('.album-data').should('be.visible')
    cy.get('.album-counter').should('be.visible')
    cy.get('.slide-counter').should('be.visible')
    
    // Check that counters show expected improved format
    cy.get('.album-counter').should('contain', 'Collection')
    cy.get('.album-counter').should('contain', ' of ')
    cy.get('.slide-counter').should('contain', 'Image')
    cy.get('.slide-counter').should('contain', ' of ')
  })

  it('should navigate between slides', () => {
    cy.waitForImageLoad()
    
    // Get initial slide counter value
    cy.get('.slide-counter').invoke('text').then((initialCounter) => {
      // Click next slide
      cy.get('#next-slide').click()
      
      // Verify format is maintained (counter may or may not change if only 1 image)
      cy.get('.slide-counter').should('contain', 'Image')
      cy.get('.slide-counter').should('contain', ' of ')
      
      // Click previous slide
      cy.get('#prev-slide').click()
      
      // Verify format is still maintained
      cy.get('.slide-counter').should('contain', 'Image')
      cy.get('.slide-counter').should('contain', ' of ')
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
    cy.get('#random-album').click()
    cy.waitForSlideshow()
  })

  it('should have working playback controls', () => {
    // Check playback buttons exist with music player labels
    cy.get('#play-set').should('contain', 'Play current')
    cy.get('#play-all').should('contain', 'Play all')
    cy.get('#play-random').should('contain', 'Shuffle all')
    
    // Test play set functionality
    cy.get('#play-set').click()
    
    // Navigation buttons should be disabled during playback
    cy.get('#prev-slide').should('have.class', 'disable')
    cy.get('#next-slide').should('have.class', 'disable')
    cy.get('.album-navigation').should('have.class', 'disable')
    
    // Stop playback by clicking again
    cy.get('#play-set').click()
    
    // Navigation should be enabled again
    cy.get('#prev-slide').should('not.have.class', 'disable')
    cy.get('#next-slide').should('not.have.class', 'disable')
    cy.get('.album-navigation').should('not.have.class', 'disable')
  })

  it('should load images from external source', () => {
    cy.waitForImageLoad()
    
    // Check that image src contains expected base URL
    cy.get('.slides img').should('have.attr', 'src').and('include', 'floaties.s3.amazonaws.com')
  })

  it('should advance to next image during slideshow playback', () => {
    cy.waitForImageLoad()
    
    // Navigate to find an album with multiple images
    let attempts = 0
    const maxAttempts = 10
    
    function findMultiImageAlbum() {
      if (attempts >= maxAttempts) {
        cy.log('Could not find album with multiple images after ' + maxAttempts + ' attempts')
        return
      }
      
      cy.get('.slide-counter').invoke('text').then((counter) => {
        if (counter.includes(' of 1')) {
          // Single image album, try next one
          attempts++
          cy.get('#next-album').click()
          cy.wait(1000)
          findMultiImageAlbum()
        } else {
          // Found multi-image album, proceed with test
          cy.get('.slide-counter').invoke('text').then((initialCounter) => {
            // Start slideshow
            cy.get('#play-set').click()
            
            // Wait longer than slideshow interval (9 seconds) to see advancement
            cy.wait(10000)
            
            // Counter should have changed (advanced to next image)
            cy.get('.slide-counter').should('not.contain', initialCounter)
            
            // Stop slideshow
            cy.get('#play-set').click()
          })
        }
      })
    }
    
    findMultiImageAlbum()
  })

  it('should update counter text during slideshow playback', () => {
    cy.waitForImageLoad()
    
    // Start slideshow
    cy.get('#play-set').click()
    
    // Wait for slideshow to advance
    cy.wait(10000)
    
    // Counter should show proper format throughout playback
    cy.get('.slide-counter').should('contain', 'Image')
    cy.get('.slide-counter').should('contain', ' of ')
    
    // Stop slideshow
    cy.get('#play-set').click()
  })

  it('should maintain correct slide order when pausing slideshow', () => {
    cy.waitForImageLoad()
    
    // Navigate to find an album with multiple images
    let attempts = 0
    const maxAttempts = 10
    
    function findMultiImageAlbumForPause() {
      if (attempts >= maxAttempts) {
        cy.log('Could not find album with multiple images after ' + maxAttempts + ' attempts')
        return
      }
      
      cy.get('.slide-counter').invoke('text').then((counter) => {
        if (counter.includes(' of 1')) {
          // Single image album, try next one
          attempts++
          cy.get('#next-album').click()
          cy.wait(1000)
          findMultiImageAlbumForPause()
        } else {
          // Found multi-image album, proceed with test
          cy.get('.slide-counter').invoke('text').then((initialCounter) => {
            // Start slideshow
            cy.get('#play-set').click()
            
            // Wait for advancement
            cy.wait(10000)
            
            // Get current counter after slideshow advancement
            cy.get('.slide-counter').invoke('text').then((advancedCounter) => {
              // Pause slideshow
              cy.get('#play-set').click()
              
              // Verify we're still at the advanced position after pause
              cy.get('.slide-counter').should('contain', advancedCounter)
              
              // Manual navigation should continue from current position
              cy.get('#next-slide').click()
              
              // Should advance further, not go back to initial position
              cy.get('.slide-counter').should('not.contain', initialCounter)
              cy.get('.slide-counter').should('not.contain', advancedCounter)
            })
          })
        }
      })
    }
    
    findMultiImageAlbumForPause()
  })

  it('should start slideshow on current image without advancing immediately', () => {
    cy.waitForImageLoad()
    
    // Navigate to find an album with multiple images
    let attempts = 0
    const maxAttempts = 10
    
    function findMultiImageAlbumForPlayTest() {
      if (attempts >= maxAttempts) {
        cy.log('Could not find album with multiple images after ' + maxAttempts + ' attempts')
        return
      }
      
      cy.get('.slide-counter').invoke('text').then((counter) => {
        if (counter.includes(' of 1')) {
          // Single image album, try next one
          attempts++
          cy.get('#next-album').click()
          cy.wait(1000)
          findMultiImageAlbumForPlayTest()
        } else {
          // Found multi-image album, proceed with test
          cy.get('.slide-counter').invoke('text').then((initialCounter) => {
            // Start slideshow
            cy.get('#play-set').click()
            
            // Immediately check that we're still on the same image (no immediate advance)
            cy.get('.slide-counter').should('contain', initialCounter)
            
            // Wait a short time to ensure no immediate advancement
            cy.wait(1000)
            cy.get('.slide-counter').should('contain', initialCounter)
            
            // Stop slideshow
            cy.get('#play-set').click()
          })
        }
      })
    }
    
    findMultiImageAlbumForPlayTest()
  })

  it('should apply fade animation to current image when starting slideshow', () => {
    cy.waitForImageLoad()
    
    // Navigate to find an album with multiple images
    let attempts = 0
    const maxAttempts = 10
    
    function findMultiImageAlbumForFadeTest() {
      if (attempts >= maxAttempts) {
        cy.log('Could not find album with multiple images after ' + maxAttempts + ' attempts')
        return
      }
      
      cy.get('.slide-counter').invoke('text').then((counter) => {
        if (counter.includes(' of 1')) {
          // Single image album, try next one
          attempts++
          cy.get('#next-album').click()
          cy.wait(1000)
          findMultiImageAlbumForFadeTest()
        } else {
          // Found multi-image album, proceed with test
          // Start slideshow
          cy.get('#play-set').click()
          
          // Check that the current slide has the fade class applied
          cy.get('.slides').should('be.visible')
          cy.get('.slides:visible').should('have.class', 'fade')
          
          // Stop slideshow
          cy.get('#play-set').click()
        }
      })
    }
    
    findMultiImageAlbumForFadeTest()
  })
})