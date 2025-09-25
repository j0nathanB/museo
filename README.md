# Museo 

A web-based image gallery inspired by [butdoesitfloat.com](https://butdoesitfloat.com). Museo is a tribute to the iconic design blog, reimagined with a brutalist aesthetic that emphasizes raw functionality and uncompromising visual hierarchy.

## Philosophy

The brutalist approach strips away unnecessary ornamentation, focusing on bold typography, stark contrasts, and direct interaction patterns. This design philosophy mirrors the uncompromising curatorial vision of butdoesitfloat.com while creating a distinct, purposeful viewing experience.

## Architecture

Museo follows a class-based vanilla JavaScript architecture with three core components:

### Core Classes
- **Slideshow**: Orchestrates the application, managing collections, playback modes, and overall state
- **Album**: Handles collection data, image extraction from content templates, and metadata display  
- **Slides**: Manages individual slide creation, rendering, and navigation logic

### Key Features
- Manual navigation (previous/next for slides and collections)
- Random selection algorithms for discovery
- Three playback modes: "set" (current collection), "all" (sequential), "random" (shuffled)
- Rich metadata display with titles, attributions, tags, and source links

## Technology Stack

- **Vanilla JavaScript**: ES6 classes with async/await patterns
- **HTML5**: Semantic structure with flexbox layout containers
- **CSS3**: Brutalist styling and fade transitions
- **Cypress**: End-to-end testing for TDD workflow

## Development

```bash
npm run serve      # Start development server on :8080
npm test          # Run Cypress test suite
npm run test:open # Interactive test runner
```

## Contributing

Contributions welcome! Follow the TDD workflow outlined in `CLAUDE.md`. 