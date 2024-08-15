/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const getError = (error: any) => {
    const message = error.message || 'Failed';
    return new Error(message);
};

