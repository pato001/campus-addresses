import { describe, expect, it } from 'vitest';
import { createAddressModel } from '../createAddressModel';

describe('Create address view model', () => {
    describe('model input validation', () => {
        it('passes when optional field is provided', () => {
            const fields = createAddressFields().withStreet({ label: 'street' });
            // const fields = {
            //     street: { requirement: 'OPTIONAL', label: 'street' },
            // } satisfies Fields;
            const model = createAddressModel(fields);
            const formValues = { street: 'x' };

            const result = model.validate(formValues);

            expect(result).toEqual(formValues);
        });

        it('passes when required field is provided', () => {
            const fields = createAddressFields().withStreet({
                isRequired: true,
                label: 'street',
            });
            // const fields = {
            //     street: { requirement: 'MANDATORY', label: 'street' },
            // } satisfies Fields;
            const model = createAddressModel(fields);
            const formValues = { street: 'x' };

            const result = model.validate(formValues);

            expect(result).toEqual(formValues);
        });

        it('passes when required field is empty', () => {
            const fields = createAddressFields().withStreet({
                isRequired: true,
                label: 'street',
            });
            // const fields = {
            //     street: { requirement: 'MANDATORY', label: 'street' },
            // } satisfies Fields;
            const model = createAddressModel(fields);
            const formValues = { street: '' };

            expect(() => model.validate(formValues)).toThrowError('street is missing.');
        });
    });
});
