# Repositories Layer

Repositories encapsulate data access and MySQL database operations:
1. Execute raw SQL queries or transactions using MySQL connection pool `pool.query()` / `pool.execute()`.
2. Map database table rows into domain objects/models.
3. Handle persistence operations (Create, Read, Update, Delete).

**Note:** Repositories are the ONLY layer that talks directly to the MySQL database.
