# Controllers Layer

Controllers handle incoming HTTP requests:
1. Extract request parameters, body, query, and headers.
2. Call the corresponding Service methods.
3. Return HTTP response using `successResponse` or forward errors via `next(error)`.

**Note:** No business logic or direct database queries should reside here.
