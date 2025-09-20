describe('Music Player Interface Pattern', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSlideshow()
  })

  it('should have Play/Pause button in slide navigation instead of Random image', () => {
    // Should not have the old "Random image" button
    cy.get('#random-slide').should('not.exist')
    
    // Should have new Play/Pause button
    cy.get('#play-pause').should('exist')
    cy.get('#play-pause').should('contain', 'Play')
    
    // Play/Pause button should be in the slide navigation container
    cy.get('.slide-navigation-container #play-pause').should('exist')
  })

  it('should have music player style playback control labels', () => {
    // Check updated playback control labels
    cy.get('#play-set').should('contain', 'Play current')
    cy.get('#play-all').should('contain', 'Play all')
    cy.get('#play-random').should('contain', 'Shuffle all')
    
    // Ensure no old terminology remains
    cy.get('#play-set').should('not.contain', 'Loop this collection')
    cy.get('#play-all').should('not.contain', 'Loop all collections')
    cy.get('#play-random').should('not.contain', 'Shuffle all images')
  })

  it('should toggle Play/Pause button text when clicked', () => {
    // Initially should show "Play"
    cy.get('#play-pause').should('contain', 'Play')
    
    // Click to start playing
    cy.get('#play-pause').click()
    
    // Should change to "Pause"
    cy.get('#play-pause').should('contain', 'Pause')
    
    // Click again to pause
    cy.get('#play-pause').click()
    
    // Should change back to "Play"
    cy.get('#play-pause').should('contain', 'Play')
  })

  it('should control slideshow playback with Play/Pause button', () => {
    // Click Play/Pause to start slideshow
    cy.get('#play-pause').click()
    
    // Navigation buttons should be disabled during playback (but not the container)
    cy.get('#prev-slide').should('have.class', 'disable')
    cy.get('#next-slide').should('have.class', 'disable')
    cy.get('.album-navigation').should('have.class', 'disable')
    
    // Stop playback by clicking Play/Pause again
    cy.get('#play-pause').click()
    
    // Navigation should be enabled again
    cy.get('#prev-slide').should('not.have.class', 'disable')
    cy.get('#next-slide').should('not.have.class', 'disable')
    cy.get('.album-navigation').should('not.have.class', 'disable')
  })

  it('should maintain existing navigation functionality', () => {
    // Previous and Next buttons should still exist and work
    cy.get('#prev-slide').should('contain', 'Previous image')
    cy.get('#next-slide').should('contain', 'Next image')
    
    // Test navigation still works
    cy.get('.slide-counter').invoke('text').then((initialCounter) => {
      cy.get('#next-slide').click()
      cy.get('.slide-counter').should('contain', 'Image')
      cy.get('.slide-counter').should('contain', ' of ')
    })
  })

  it('should not have random image functionality', () => {
    // Should not have any elements with random-slide id
    cy.get('#random-slide').should('not.exist')
    
    // Should not have any buttons with "Random image" text
    cy.get('*').should('not.contain', 'Random image')
  })

  it('should sync Play/Pause state with other playback controls', () => {
    // Start playback with "Play current" button
    cy.get('#play-set').click()
    
    // Play/Pause button should show "Pause" when other controls start playback
    cy.get('#play-pause').should('contain', 'Pause')
    
    // Click Play/Pause to stop
    cy.get('#play-pause').click()
    
    // Should show "Play" again
    cy.get('#play-pause').should('contain', 'Play')
    
    // Navigation should be enabled
    cy.get('#prev-slide').should('not.have.class', 'disable')
    cy.get('#next-slide').should('not.have.class', 'disable')
  })

  it('should have proper button layout in slide navigation', () => {
    // Check that slide navigation has exactly 3 buttons
    cy.get('.slide-navigation-container > div').should('have.length', 3)
    
    // Check the order: Previous, Play/Pause, Next
    cy.get('.slide-navigation-container > div').eq(0).find('a').should('contain', 'Previous image')
    cy.get('.slide-navigation-container > div').eq(1).find('a').should('contain', 'Play')
    cy.get('.slide-navigation-container > div').eq(2).find('a').should('contain', 'Next image')
  })
})