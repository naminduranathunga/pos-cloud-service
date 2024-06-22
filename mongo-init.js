db.createUser(
    {
        user: "namindus7",
        pwd: "BMju1pd1fmOyJpAD",
        roles: [
            { role: "userAdminAnyDatabase", db: "admin" },
            { role: "readWriteAnyDatabase", db: "admin" },
        ]
    }
);