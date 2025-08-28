import { App } from '../../../App';

describe('Create Address', () => {
    it('create local address', () => {
        cy.intercept('GET', '**/address-fields/local', {
            body: createAddressFields()
                .withStreet({ isRequired: true })
                .withZip({ isRequired: true })
                .withCity({ isRequired: true })
                .withCountry({ isDisabled: true, value: 'AT' }),
            // body: {
            //     street: {
            //         label: 'Street',
            //         requirement: 'MANDATORY',
            //     },
            //     postalCode: {
            //         label: 'Post code',
            //         requirement: 'MANDATORY',
            //     },
            //     townName: {
            //         label: 'City',
            //         requirement: 'MANDATORY',
            //     },
            //     country: {
            //         disabled: true,
            //         label: 'Country',
            //         requirement: 'OPTIONAL',
            //         value: 'AT',
            //     },
            // },
        });
        cy.intercept('POST', '**/addresses', {
            body: {
                street: 'Baker Street 22',
                postalCode: 'NW1 6XE',
                townName: 'London',
            },
        });

        cy.mount(<App />, '/addresses');

        cy.getByTestId('submit-control').click();

        cy.contains('Street is missing.').should('be.visible');

        cy.get('input[name="street"]').type('Baker Street 22');
        cy.get('input[name="postalCode"]').type('NW1 6XE');
        cy.get('input[name="townName"]').type('London');

        cy.getByTestId('submit-control').click();

        cy.contains("It's now saved!").should('be.visible');
        cy.getByTestId('address-form').should('not.exist');

        cy.getByTestId('add-more-control').click();

        cy.url().should('include', '/addresses');
        cy.get('input[name="street"]').should('be.empty');
    });
    it('create international address', () => {
        cy.intercept('GET', '**/address-fields/local', { body: {} });
        cy.intercept('GET', '**/address-fields/international', {
            body: createAddressFields()
                .withStreet({ isRequired: true })
                .withZip({ isRequired: true })
                .withCity({ isRequired: true })
                .withCountry({ isRequired: true }),
            // body: {
            //     street: { // streetName
            //         label: 'Street',
            //         requirement: 'MANDATORY',
            //     },
            //     postalCode: {
            //         label: 'Post code',
            //         requirement: 'MANDATORY',
            //     },
            //     townName: {
            //         label: 'City',
            //         requirement: 'MANDATORY',
            //     },
            //     country: {
            //         label: 'Country',
            //         requirement: 'MANDATORY',
            //     },
            // },
        });
        cy.intercept('POST', '**/addresses', {
            body: {
                street: 'Baker Street 22',
                postalCode: 'NW1 6XE',
                townName: 'London',
                country: 'Brazil',
            },
        });

        cy.mount(<App />, '/addresses');

        cy.getByTestId('type-control').select('International');

        cy.get('input[name="street"]').type('Baker Street 22');
        cy.get('input[name="postalCode"]').type('NW1 6XE');
        cy.get('input[name="townName"]').type('London');
        cy.get('select[name="country"]').select('Brazil');

        cy.getByTestId('submit-control').click();

        cy.contains("It's now saved!").should('be.visible');
        cy.getByTestId('address-form').should('not.exist');
    });
});
