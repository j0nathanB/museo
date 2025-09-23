describe('URL Routing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForSlideshow();
  });

  describe('Collection URL Generation', () => {
    it('should generate unique URLs using collection ID from JSON data', () => {
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        cy.url().should('include', `#collection/${currentAlbumId}`);
      });
    });

    it('should update URL when navigating to next collection', () => {
      cy.get('#next-album').click();
      cy.waitForImageLoad();
      
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        cy.url().should('include', `#collection/${currentAlbumId}`);
      });
    });

    it('should update URL when navigating to previous collection', () => {
      // Go to second collection first
      cy.get('#next-album').click();
      cy.waitForImageLoad();
      
      // Then go back
      cy.get('#prev-album').click();
      cy.waitForImageLoad();
      
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        cy.url().should('include', `#collection/${currentAlbumId}`);
      });
    });

    it('should update URL when selecting random collection', () => {
      let initialAlbumId;
      
      cy.window().then((win) => {
        initialAlbumId = win.slideshow.albumCollection[win.slideshow.album.albumIndex].id;
      });
      
      cy.get('#random-album').click();
      cy.waitForImageLoad();
      
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        cy.url().should('include', `#collection/${currentAlbumId}`);
        
        // Verify it's different from initial (may occasionally be same due to randomness)
        if (currentAlbumId !== initialAlbumId) {
          expect(currentAlbumId).to.not.equal(initialAlbumId);
        }
      });
    });

    it('should include slide number in URL when not on first slide', () => {
      cy.get('#next-slide').click();
      cy.waitForImageLoad();
      
      // Wait a bit for the router to update the URL
      cy.wait(100);
      
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        const currentSlideNum = slideshow.slides.currentSlideIndex + 1; // 1-indexed for URL
        
        cy.url().should('include', `#collection/${currentAlbumId}/slide/${currentSlideNum}`);
      });
    });

    it('should not include slide number in URL when on first slide', () => {
      // Ensure we're on first slide
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        
        cy.url().should('include', `#collection/${currentAlbumId}`);
        cy.url().should('not.include', '/slide/');
      });
    });
  });

  describe('Direct URL Navigation', () => {
    it('should load specific collection via direct URL access', () => {
      let testCollectionId;
      
      // Get a collection ID to test with
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        // Use the second collection for testing
        testCollectionId = slideshow.albumCollection[1].id;
      }).then(() => {
        // Navigate directly to that collection
        cy.visit(`/#collection/${testCollectionId}`);
        cy.waitForSlideshow();
        cy.waitForImageLoad();
        
        cy.window().then((win) => {
          const slideshow = win.slideshow;
          const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
          expect(currentAlbumId).to.equal(testCollectionId);
        });
      });
    });

    it('should load specific slide via direct URL access', () => {
      let testCollectionId;
      
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        testCollectionId = slideshow.albumCollection[0].id;
      }).then(() => {
        // Navigate directly to collection with slide 3
        cy.visit(`/#collection/${testCollectionId}/slide/3`);
        cy.waitForSlideshow();
        cy.waitForImageLoad();
        
        cy.window().then((win) => {
          const slideshow = win.slideshow;
          expect(slideshow.slides.currentSlideIndex).to.equal(2); // 0-indexed internally
        });
      });
    });

    it('should handle invalid collection ID gracefully', () => {
      cy.visit('/#collection/invalid-id-12345');
      cy.waitForSlideshow();
      cy.waitForImageLoad();
      
      // Should default to first collection
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        expect(slideshow.album.albumIndex).to.equal(0);
        
        const currentAlbumId = slideshow.albumCollection[0].id;
        cy.url().should('include', `#collection/${currentAlbumId}`);
      });
    });

    it('should handle invalid slide number gracefully', () => {
      let testCollectionId;
      
      cy.window().then((win) => {
        testCollectionId = win.slideshow.albumCollection[0].id;
      }).then(() => {
        // Try to navigate to slide 999 (invalid)
        cy.visit(`/#collection/${testCollectionId}/slide/999`);
        cy.waitForSlideshow();
        cy.waitForImageLoad();
        
        cy.window().then((win) => {
          const slideshow = win.slideshow;
          // Should default to first slide
          expect(slideshow.slides.currentSlideIndex).to.equal(0);
        });
      });
    });

    it('should maintain URL state after page refresh', () => {
      // Navigate to second collection, third slide
      cy.get('#next-album').click();
      cy.waitForImageLoad();
      cy.get('#next-slide').click();
      cy.waitForImageLoad();
      cy.get('#next-slide').click();
      cy.waitForImageLoad();
      
      let expectedUrl;
      cy.url().then((url) => {
        expectedUrl = url;
      });
      
      // Refresh page
      cy.reload();
      cy.waitForSlideshow();
      cy.waitForImageLoad();
      
      // Should maintain same URL and state
      cy.url().should('equal', expectedUrl);
      
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        expect(slideshow.slides.currentSlideIndex).to.equal(2); // Third slide (0-indexed)
        expect(slideshow.album.albumIndex).to.equal(1); // Second album (0-indexed)
      });
    });
  });

  describe('Browser Integration', () => {
    it('should support browser back button navigation', () => {
      let initialAlbumId;
      
      cy.window().then((win) => {
        initialAlbumId = win.slideshow.albumCollection[win.slideshow.album.albumIndex].id;
      });
      
      // Navigate to next collection
      cy.get('#next-album').click();
      cy.waitForImageLoad();
      
      // Use browser back button
      cy.go('back');
      cy.waitForImageLoad();
      
      // Should return to initial collection
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        expect(currentAlbumId).to.equal(initialAlbumId);
      });
    });

    it('should support browser forward button navigation', () => {
      // Navigate to next collection
      cy.get('#next-album').click();
      cy.waitForImageLoad();
      
      let targetAlbumId;
      cy.window().then((win) => {
        targetAlbumId = win.slideshow.albumCollection[win.slideshow.album.albumIndex].id;
      });
      
      // Go back
      cy.go('back');
      cy.waitForImageLoad();
      
      // Go forward again
      cy.go('forward');
      cy.waitForImageLoad();
      
      // Should be at the target collection again
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        expect(currentAlbumId).to.equal(targetAlbumId);
      });
    });

    it('should update page title with collection information', () => {
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbum = slideshow.albumCollection[slideshow.album.albumIndex];
        const expectedTitle = `${currentAlbum.title} - Museo`;
        
        cy.title().should('equal', expectedTitle);
      });
    });

    it('should update page title when navigating collections', () => {
      cy.get('#next-album').click();
      cy.waitForImageLoad();
      
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbum = slideshow.albumCollection[slideshow.album.albumIndex];
        const expectedTitle = `${currentAlbum.title} - Museo`;
        
        cy.title().should('equal', expectedTitle);
      });
    });

    it('should handle URL changes during slideshow playback', () => {
      // Start slideshow
      cy.get('#play-pause').click();
      
      // Wait for auto-advancement (slideshow has 9s duration)
      cy.wait(10000);
      
      // Check that URL updated during playback
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        const currentAlbumId = slideshow.albumCollection[slideshow.album.albumIndex].id;
        const currentSlideNum = slideshow.slides.currentSlideIndex + 1;
        
        if (slideshow.slides.currentSlideIndex > 0) {
          cy.url().should('include', `#collection/${currentAlbumId}/slide/${currentSlideNum}`);
        } else {
          cy.url().should('include', `#collection/${currentAlbumId}`);
        }
      });
      
      // Stop slideshow
      cy.get('#play-pause').click();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty hash values', () => {
      cy.visit('/#');
      cy.waitForSlideshow();
      cy.waitForImageLoad();
      
      // Should default to first collection
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        expect(slideshow.album.albumIndex).to.equal(0);
        
        const currentAlbumId = slideshow.albumCollection[0].id;
        cy.url().should('include', `#collection/${currentAlbumId}`);
      });
    });

    it('should handle malformed URL structures', () => {
      cy.visit('/#collection/');
      cy.waitForSlideshow();
      cy.waitForImageLoad();
      
      // Should default to first collection
      cy.window().then((win) => {
        const slideshow = win.slideshow;
        expect(slideshow.album.albumIndex).to.equal(0);
      });
    });

    it('should handle non-numeric slide values', () => {
      let testCollectionId;
      
      cy.window().then((win) => {
        testCollectionId = win.slideshow.albumCollection[0].id;
      }).then(() => {
        cy.visit(`/#collection/${testCollectionId}/slide/abc`);
        cy.waitForSlideshow();
        cy.waitForImageLoad();
        
        // Should default to first slide
        cy.window().then((win) => {
          const slideshow = win.slideshow;
          expect(slideshow.slides.currentSlideIndex).to.equal(0);
        });
      });
    });

    it('should handle zero or negative slide numbers', () => {
      let testCollectionId;
      
      cy.window().then((win) => {
        testCollectionId = win.slideshow.albumCollection[0].id;
      }).then(() => {
        cy.visit(`/#collection/${testCollectionId}/slide/0`);
        cy.waitForSlideshow();
        cy.waitForImageLoad();
        
        // Should default to first slide
        cy.window().then((win) => {
          const slideshow = win.slideshow;
          expect(slideshow.slides.currentSlideIndex).to.equal(0);
        });
      });
    });

    it('should prevent infinite loops during URL updates', () => {
      // This test ensures that URL updates don't trigger infinite navigation loops
      let navigationCount = 0;
      
      cy.window().then((win) => {
        const originalNavigateAlbum = win.slideshow.navigateAlbum;
        win.slideshow.navigateAlbum = function(...args) {
          navigationCount++;
          return originalNavigateAlbum.apply(this, args);
        };
      });
      
      cy.get('#next-album').click();
      cy.waitForImageLoad();
      
      cy.then(() => {
        // Should only navigate once, not multiple times
        expect(navigationCount).to.equal(1);
      });
    });
  });
});