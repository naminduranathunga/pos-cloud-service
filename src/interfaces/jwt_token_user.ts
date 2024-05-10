export default interface JwtTokenUser {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;   // role id
    company?: string; // company id
}

export interface AuthenticatedUser{
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    company?: string; // company id
    role: {
        _id: string;
        name: string;
        slug: string;
        permissions: string[];
    };
};