describe('Museo Typography & Spacing Design System', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSlideshow()
  })

  it('should have correct font families applied', () => {
    // Body text should use IBM Plex Sans Regular
    cy.get('body').should('have.css', 'font-family').and('include', 'IBM Plex Sans')
    
    // Album title (H1-level content) should use Inter Tight Bold
    cy.get('.album-title').should('have.css', 'font-family').and('include', 'Inter Tight')
    cy.get('.album-title').should('have.css', 'font-weight', '700')
    
    // Metadata (counters) should use Space Mono (alternative to Atkins Hyperlegible Mono)
    cy.get('.album-counter').should('have.css', 'font-family').and('include', 'Space Mono')
    cy.get('.slide-counter').should('have.css', 'font-family').and('include', 'Space Mono')
    
    // Tags should be metadata style
    cy.get('.tags').should('have.css', 'font-family').and('include', 'Space Mono')
  })

  it('should have correct type scale and typography', () => {
    // H1 (album title) - 64px, line-height 1.1
    cy.get('.album-title').should('have.css', 'font-size', '64px')
    cy.get('.album-title').should('have.css', 'line-height').then((lineHeight) => {
      expect(parseFloat(lineHeight) / 64).to.be.closeTo(1.1, 0.05)
    })
    
    // Body text - 16px, line-height 1.6
    cy.get('body').should('have.css', 'font-size', '16px')
    cy.get('body').should('have.css', 'line-height').then((lineHeight) => {
      expect(parseFloat(lineHeight) / 16).to.be.closeTo(1.6, 0.05)
    })
    
    // Metadata - 12px, line-height 1.3, uppercase
    cy.get('.album-counter').should('have.css', 'font-size', '12px')
    cy.get('.album-counter').should('have.css', 'text-transform', 'uppercase')
    cy.get('.slide-counter').should('have.css', 'font-size', '12px')
    cy.get('.slide-counter').should('have.css', 'text-transform', 'uppercase')
    
    // Tags - 14px caption style
    cy.get('.tags').should('have.css', 'font-size', '14px')
    cy.get('.tags').should('have.css', 'line-height').then((lineHeight) => {
      expect(parseFloat(lineHeight) / 14).to.be.closeTo(1.4, 0.05)
    })
  })

  it('should have brutalist color scheme', () => {
    // Background should be white
    cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)')
    
    // Text should be dark on white background
    cy.get('body').should('have.css', 'color', 'rgb(17, 17, 17)')
    
    // Links should be safety orange
    cy.get('.album-data a').should('have.css', 'color', 'rgb(255, 42, 0)')
    
    // Links should always be underlined
    cy.get('.album-data a').should('have.css', 'text-decoration').and('include', 'underline')
  })

  it('should have brutalist button styles', () => {
    // Default button styles - black background, white text, no border-radius
    cy.get('#play-pause').should('have.css', 'background-color', 'rgb(0, 0, 0)')
    cy.get('#play-pause').should('have.css', 'color', 'rgb(255, 255, 255)')
    cy.get('#play-pause').should('have.css', 'border-radius', '0px')
    cy.get('#play-pause').should('have.css', 'border-style', 'none')
    
    // Button padding - 12px 20px
    cy.get('#play-pause').should('have.css', 'padding', '12px 20px')
    
    // Navigation buttons should follow same pattern
    cy.get('#prev-slide').should('have.css', 'background-color', 'rgb(0, 0, 0)')
    cy.get('#next-slide').should('have.css', 'background-color', 'rgb(0, 0, 0)')
    
    // Playback controls should follow same pattern
    cy.get('#play-set').should('have.css', 'background-color', 'rgb(0, 0, 0)')
    cy.get('#play-all').should('have.css', 'background-color', 'rgb(0, 0, 0)')
  })

  it('should have hover states for buttons', () => {
    // Check that hover CSS rule exists by checking computed styles on force hover
    cy.get('#play-pause').invoke('attr', 'style', 'background-color: rgb(255, 255, 255) !important; color: rgb(0, 0, 0) !important; border: 1px solid rgb(0, 0, 0) !important;')
    cy.get('#play-pause').should('have.css', 'background-color', 'rgb(255, 255, 255)')
    cy.get('#play-pause').should('have.css', 'color', 'rgb(0, 0, 0)')
    
    // Reset the style
    cy.get('#play-pause').invoke('removeAttr', 'style')
    cy.get('#play-pause').should('have.css', 'background-color', 'rgb(0, 0, 0)')
  })

  it('should use 8px grid spacing system', () => {
    // H1 (album title) should have proper margins - 64px top, 24px bottom
    cy.get('.album-title').should('have.css', 'margin-top', '64px')
    cy.get('.album-title').should('have.css', 'margin-bottom', '24px')
    
    // Paragraphs should have 24px bottom margin
    cy.get('.album-data p').should('have.css', 'margin-bottom', '24px')
    
    // Captions/tags should have 8px top, 16px bottom
    cy.get('.tags').should('have.css', 'margin-top', '8px')
    cy.get('.tags').should('have.css', 'margin-bottom', '16px')
    
    // Buttons should have 16px vertical margin
    cy.get('#play-pause').should('have.css', 'margin', '16px 0px')
  })

  it('should have proper layout and alignment', () => {
    // Content should have max-width 100vw (computed as 1000px on 1000px viewport)
    cy.get('.layout-container').invoke('css', 'max-width').should('include', '1000px')
    cy.get('.layout-container').should('have.css', 'margin', '0px')
    
    // All text should be left-aligned (no center alignment)
    cy.get('.album-title').should('have.css', 'text-align', 'left')
    cy.get('.album-data p').should('have.css', 'text-align', 'left')
    cy.get('.tags').should('have.css', 'text-align', 'left')
  })

  it('should have no shadows or gradients', () => {
    // No box-shadow on any elements
    cy.get('*').each(($el) => {
      cy.wrap($el).should('have.css', 'box-shadow', 'none')
    })
    
    // No border-radius anywhere
    cy.get('*').each(($el) => {
      cy.wrap($el).should('have.css', 'border-radius', '0px')
    })
    
    // Background should be solid color, no gradients
    cy.get('body').should('have.css', 'background-image', 'none')
  })

  it('should have strong contrast and visual tension', () => {
    // Large heading paired with tiny metadata for visual tension
    cy.get('.album-title').should('have.css', 'font-size', '64px')
    cy.get('.album-counter').should('have.css', 'font-size', '12px')
    
    // Strong contrast - no gray-on-gray
    cy.get('.album-title').should('have.css', 'color', 'rgb(17, 17, 17)')
    cy.get('.album-counter').should('have.css', 'color', 'rgb(17, 17, 17)')
    
    // Background should be pure white for maximum contrast
    cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)')
  })

  it('should load required fonts from Google Fonts', () => {
    // Check that font link elements exist in head
    cy.get('head link[href*="fonts.googleapis.com"]').should('exist')
    
    // Check for Inter Tight
    cy.get('head link[href*="Inter+Tight"]').should('exist')
    
    // Check for IBM Plex Sans  
    cy.get('head link[href*="IBM+Plex+Sans"]').should('exist')
    
    // Check for Space Mono (alternative to Atkins Hyperlegible Mono)
    cy.get('head link[href*="Space+Mono"]').should('exist')
  })
})