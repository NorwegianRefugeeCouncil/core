describe('home page', () => {
  beforeEach(() => {
    cy.visit('index.html')
  })

  it('shows all elements', () => {
    cy.get('h1').should('have.length', 1).first().should('have.text', 'CORE')
    cy.get('img').should('have.length', 1)
    cy.get('a').should('have.length', 1)
  })

})
