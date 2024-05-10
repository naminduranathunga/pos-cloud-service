# System Company Manager
This module is responsible for managing companies in the system. It is only allowed for super-admins to manage companies.


# Create a company

This endpoint allows system admins to create a new company profile for customers.

> POST /api/v1/sys-company-manager/company/create

Requset body *JSON*

```json
{
    name: string;
    brn: string;
    address: string;
    email: string;
    phone: string;
    subsribed_modules: string[];
    user: any
}
```

Response on success

```json
{
    _id: string;
    name: string;
    brn: string;
    address: string;
    email: string;
    phone: string;
    subsribed_modules: string[];
    user: any
}
```