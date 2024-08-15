export interface IUser {
    ID: string;
    name: string;
    surname: string;
    street: string;
    city: string;
    postcode: string;
    phone: string;
    companyName: string;
    email: string;
    agreeTerms: boolean;
    sex: boolean;
    isAdmin: boolean;
    picture: string;
    isVerified: boolean;
    metadata: any;
    createdAt: string;
    updatedAt: string;
}
