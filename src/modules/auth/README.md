# Accounts and authentication

Author: Sazid Ahmed Ekram

This module uses JWT bearer tokens. Register and login are public routes. All
other routes require `Authorization: Bearer <accessToken>`. A role guard checks
the user's current role from the database for routes marked with `@Roles(...)`.

Set `JWT_BEARER_SECRET` to a long random value and `JWT_TTL` to the token
lifetime in seconds in `.env`. For example, `JWT_TTL=86400` means one day.
Run the user migration with `npm run migration:run` after setting the database
connection values.

## Try the account routes

Register a researcher (use a strong password with upper and lower case letters,
a number, and a symbol):

```sh
curl -i -X POST http://localhost:5000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Sazid Ahmed Ekram","email":"sazid@example.com","password":"LabifyDemo1!"}'
```

Login. Save the `accessToken` from the response:

```sh
curl -i -X POST http://localhost:5000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sazid@example.com","password":"LabifyDemo1!"}'
```

Read the current account. Replace `YOUR_TOKEN` with the login token:

```sh
curl -i http://localhost:5000/auth/me \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Calling `/auth/me` without the header returns `401 Unauthorized`. Invalid or
expired tokens also return 401. Routes decorated with `@Roles('admin')` return
`403 Forbidden` when a signed-in user has another role.

## Try admin user management

For a local demo, first register a user, then promote that user through the
database as an administrator. This avoids allowing public self-registration as
an admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'sazid@example.com';
```

Log in again to get a token with the new role. List users with pagination:

```sh
curl -i 'http://localhost:5000/users?page=1&limit=10' \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

The admin-only routes are `POST /users`, `GET /users`, `GET /users/:id`,
`PATCH /users/:id`, and `DELETE /users/:id`. Every response omits `passwordHash`.

## Files in this part

- `auth/`: registration, login, current-account route, JWT strategy, and DTOs.
- `users/`: user entity, validation DTOs, password hashing, and admin CRUD.
- `common/decorators/public.decorator.ts`: marks routes that skip JWT checks.
- `common/guard/jwt-auth.guard.ts`: reads bearer tokens and protects routes.
- `common/guard/roles.guard.ts`: checks role metadata on protected routes.
- `database/migrations/1794505000000-CreateUsersTable.ts`: creates the users table.
