import { FocusPageLayout, HeroTitle } from '@design-system';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { object, string, ValidationError } from 'yup';

type Field = {
    label: string;
    requirement: 'MANDATORY' | 'OPTIONAL';
    maxLength?: number;
    disabled?: boolean;
    value?: string;
};
type Fields = Partial<{
    buildingName: Field;
    street: Field;
    districtName: Field;
    postalCode: Field;
    townName: Field;
    regionName: Field;
    country: Field;
}>;

export const AddressesPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [generalError, setGeneralError] = useState<string>();
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
    const [selected, setSelected] = useState<string>('local');
    const [fields, setFields] = useState<Fields>();

    const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelected(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const formData = new FormData(e.currentTarget);
        const { type, ...data } = Object.fromEntries(formData.entries());

        if (!fields) {
            return;
        }

        setGeneralError(undefined);

        try {
            const schema = Object.entries(fields).reduce((result, [key, field]) => {
                if (field.requirement !== 'MANDATORY') {
                    return result;
                }

                return {
                    ...result,
                    [key]: string().required(`${field.label} is missing.`),
                };
            }, {});
            const address = object(schema).validateSync(data, { abortEarly: false });

            setIsLoading(true);

            const response = await fetch('http://localhost:3000/addresses', {
                method: 'POST',
                body: JSON.stringify(address),
            });

            if (!response.ok) {
                throw new Error('Failed to save address.');
            }

            setIsSaved(true);
        } catch (error) {
            if (error instanceof ValidationError) {
                setFieldErrors(
                    error.inner.reduce(
                        (result, { path, message }) => ({
                            ...result,
                            [path!]: message,
                        }),
                        {},
                    ),
                );
            } else {
                setGeneralError((error as Error).message ?? 'Unknown generalError.');
            }
        } finally {
            setIsLoading(false);
        }

        return false;
    };

    const handleAddAddress = () => {
        setIsSaved(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFieldErrors((errors) => {
            const { [e.target.name]: key, ...rest } = errors;

            return rest;
        });
    };

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        setFieldErrors((errors) => {
            const { [e.target.name]: key, ...rest } = errors;

            return rest;
        });
    };

    useEffect(() => {
        fetch(`http://localhost:3000/address-fields/${selected}`)
            .then((response) => response.json())
            .then((data) => {
                setFields(data);
            });
    }, [selected]);

    if (isSaved) {
        return (
            <FocusPageLayout>
                <HeroTitle title="Campus Addresses" />
                <p className="bg-green-100 p-3 text-xl">{"It's now saved!"}</p>
                <br />
                <button
                    data-test="add-more-control"
                    onClick={handleAddAddress}
                    className="mt-3 border-1 rounded px-4 "
                >
                    Add more
                </button>
            </FocusPageLayout>
        );
    }

    return (
        <FocusPageLayout>
            <HeroTitle title="Campus Addresses" />
            <form onSubmit={handleSubmit} data-test="address-form">
                {generalError && <p>{generalError}</p>}
                {fields && (
                    <>
                        <div className="mb-3 w-100">
                            <label htmlFor="type" className="block">
                                Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={selected}
                                onChange={handleTypeChange}
                                className="border-1 w-full"
                            >
                                <option value="local">Local</option>
                                <option value="international">International</option>
                            </select>
                        </div>
                        {Object.entries(fields)
                            .filter(([key]) => key !== 'id')
                            .map(([key, field]) => (
                                <div key={key} className="mb-3 w-100">
                                    <label htmlFor={key} className="block">
                                        {field.label}
                                    </label>

                                    {key === 'country' && (
                                        <select
                                            id={key}
                                            name={key}
                                            value={field.value}
                                            disabled={field.disabled === true}
                                            onSelect={handleSelect}
                                            className="border-1 w-full disabled:bg-gray-200 disabled:border-gray-400 disabled:text-gray-500"
                                        >
                                            <option value="IT">Italy</option>
                                            <option value="BR">Brazil</option>
                                            <option value="LV">Latvia</option>
                                            {selected === 'local' && (
                                                <option value="AT">Austria</option>
                                            )}
                                        </select>
                                    )}
                                    {key !== 'country' && (
                                        <input
                                            type="text"
                                            id={key}
                                            name={key}
                                            maxLength={field.maxLength}
                                            onChange={handleChange}
                                            className="border-1 w-full"
                                        />
                                    )}
                                    {fieldErrors[key] && (
                                        <p className="bg-red-500/10">
                                            {fieldErrors[key]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        <input
                            data-test="submit-control"
                            type="submit"
                            value="Save"
                            disabled={isLoading}
                            className="mt-3 border-1 rounded px-4 bg-blue-100 disabled:bg-gray-200 disabled:border-gray-400 disabled:text-gray-500"
                        />
                    </>
                )}
            </form>
        </FocusPageLayout>
    );
};
