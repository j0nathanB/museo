# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peroflota is a web-based image gallery inspired by butdoesitfloat.com. It's a vanilla JavaScript application that displays curated image collections with slideshow functionality.

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

### TDD Workflow
1. Write failing tests first to define expected behavior
2. Implement minimal code to make tests pass
3. Refactor while keeping tests green
4. Run `npm test` to verify all functionality

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