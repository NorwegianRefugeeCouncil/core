describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('index.html')
  })

  it('displays two todo items by default', () => {
    cy.get('h1').should('have.length', 1).first().should('have.text', 'CORE')
    cy.get('img').should('have.length', 1)
    cy.get('a').should('have.length', 1)
  })

})
