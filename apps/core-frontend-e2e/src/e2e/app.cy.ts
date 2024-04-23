import { getHeading } from '../support/app.po';

describe('core-frontend-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    // Function helper example, see `../support/app.po.ts` file
    getHeading().contains(/CORE/);
  });
});
