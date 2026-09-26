# Services Layer

Services contain the business logic:
1. Validate domain rules and conditions.
2. Coordinate and orchestrate calls across one or more Repositories.
3. Compute derived data (e.g. calculating GPA, grade point conversions).
4. Throw domain errors using `AppError`.

**Note:** Services do not access `req` or `res` objects, nor do they write direct SQL.
