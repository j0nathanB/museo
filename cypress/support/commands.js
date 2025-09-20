// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for Peroflota app
Cypress.Commands.add('waitForSlideshow', () => {
  cy.get('.slideshow-container').should('be.visible')
  cy.get('.slides').should('exist')
  cy.get('.album-data').should('be.visible')
})

Cypress.Commands.add('waitForImageLoad', () => {
  cy.get('.slides img').should('be.visible').and(($img) => {
    expect($img[0].naturalWidth).to.be.greaterThan(0)
  })
})