# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Museo is a web-based image gallery inspired by butdoesitfloat.com. It's a vanilla JavaScript application that displays curated image collections with slideshow functionality.

## Architecture

The application follows a class-based JavaScript architecture with three main classes:

- **Slides**: Manages individual slide creation, rendering, and navigation
- **Album**: Handles album data, image extraction from templates, and metadata display
- **Slideshow**: Orchestrates the overall application, managing albums, slides, and playback modes

## Key Components

### Core Files
- `index.html`: Main HTML structure with layout containers
- `gallery.js`: Contains all JavaScript logic for the slideshow functionality
- `style.css`: Styling and animations including fade transitions

### Data Flow
- Fetches album data from `https://floaties.s3.us-west-1.amazonaws.com/floaties.json`
- Images are loaded from `https://floaties.s3.amazonaws.com/img/`
- Album content templates contain image references that are parsed to extract image data

### Key Features
- Manual navigation (previous/next for slides and albums)
- Random image/album selection
- Three playback modes: "set" (current album), "all" (all albums), "random" (shuffled images)
- Album metadata display including titles, attributions, tags, and links

## Development Notes

### Running the Application
This is a static HTML/CSS/JavaScript application. Use the following commands:

- `npm run serve` - Start local development server on port 8080
- `npm run serve:bg` - Start server in background

### Testing with Cypress (TDD Approach)
The project now uses Test-Driven Development with Cypress for E2E testing:

- `npm test` - Run all Cypress tests headlessly
- `npm run test:open` - Open Cypress interactive test runner
- `npm run test:headless` - Run tests in headless mode

### Test Structure
- `cypress/e2e/slideshow.cy.js` - Core slideshow functionality tests
- `cypress/e2e/data-loading.cy.js` - API integration and data handling tests  
- `cypress/e2e/responsive-design.cy.js` - UI responsiveness and visual tests
- `cypress/support/commands.js` - Custom Cypress commands for the app

## **MANDATORY TDD WORKFLOW**

**For ANY code changes, feature additions, or bug fixes, you MUST follow this Test-Driven Development process:**

### Step 1: Write Failing Tests First
1. **Analyze the requirement** - Understand what needs to be implemented or changed
2. **Write comprehensive Cypress tests** that describe the desired behavior:
   - Add tests to appropriate spec files in `cypress/e2e/`
   - Use descriptive test names that explain the expected behavior
   - Include both positive and negative test cases
   - Test user interactions, visual elements, and functionality
3. **Run tests to confirm they fail**: Execute `npm test` and verify the new tests fail as expected

### Step 2: Implement Minimal Code
1. **Write only enough code** to make the failing tests pass
2. **Follow the existing code patterns** and architecture
3. **Make changes in this order of preference**:
   - Update JavaScript logic in `gallery.js`
   - Modify HTML structure in `index.html` 
   - Adjust styling in `style.css`

### Step 3: Verify Tests Pass
1. **Run the full test suite**: `npm test`
2. **Ensure ALL tests pass** (both new and existing)
3. **If tests fail**: Debug and fix until all tests are green

### Step 4: Refactor and Validate
1. **Run manual testing**: `npm run serve` and verify functionality works in browser
2. **Refactor code if needed** while keeping tests green
3. **Ensure no regressions** by running tests again after any refactoring

### TDD Test Writing Guidelines
- **Use existing custom commands**: `cy.waitForSlideshow()`, `cy.waitForImageLoad()`
- **Test user interactions**: Click events, navigation, playback controls
- **Verify visual elements**: Text content, CSS classes, element visibility
- **Check data integration**: API responses, counter updates, image loading
- **Include edge cases**: Empty states, error conditions, boundary values
- **Write readable test descriptions** that explain user behavior, not implementation details

### Example TDD Implementation:
```javascript
// 1. Write failing test first
it('should display user-friendly navigation labels', () => {
  cy.get('.slide-counter').should('match', /Image \d+ of \d+/)
  cy.get('#prev-album').should('contain', 'Previous collection')
})

// 2. Run tests - they should fail
// 3. Implement minimal changes to make tests pass
// 4. Run tests again - they should now pass
```

### Code Patterns
- Uses ES6 classes and async/await
- DOM manipulation via vanilla JavaScript (no frameworks)
- Event listeners are attached in the `loadFunctionality()` function
- Fisher-Yates shuffle algorithm for randomization
- Image references are extracted from content templates using regex patterns

### Styling
- Uses Courier Prime font for a monospace aesthetic
- Flexbox layout with left (images) and right (metadata/controls) containers
- CSS animations for fade transitions during slideshow playback
- Hover effects for navigation elements

### Testing Environment
- Cypress configured for localhost:8080
- Custom commands for slideshow-specific interactions
- Tests cover navigation, data loading, responsiveness, and error handling

## **CRITICAL REMINDERS**

1. **NEVER implement features without tests first**
2. **ALWAYS run `npm test` before and after changes**
3. **Ensure existing functionality remains intact**
4. **Write tests that describe user behavior, not implementation details**
5. **Keep the Red-Green-Refactor cycle tight and focused**

Following this TDD approach ensures code quality, prevents regressions, and maintains the application's reliability.