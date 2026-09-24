using Microsoft.EntityFrameworkCore;
using Npgsql;
using PhoneBookApi.Models;
using PhoneBookApi.Repositories;
using PhoneBookApi.Services;

namespace PhoneBookApi.Data;

/*
 * Startup schema guard + demo-account seeder. Ports the previous
 * backend's DatabaseMigration + DataSeeder one-to-one:
 *
 *  - every statement is IF NOT EXISTS / idempotent — the
 *    existing tables, constraints and data are never altered
 *    or deleted (except orphan contacts with no owner, which
 *    the old seeder removed as well);
 *  - the documented test account always exists with the
 *    documented password;
 *  - the account is topped up to 1000 contacts with generated
 *    demo data, never duplicating an existing phone or email.
 */
public static class DbInitializer
{
    private const string TestEmail = "testuser@example.com";
    private const string TestPassword = "Test@12345";
    private const int TargetRecords = 1000;

    public static async Task InitializeAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();
        var users = services.GetRequiredService<IUserRepository>();
        var contacts = services.GetRequiredService<IContactRepository>();
        var passwords = services.GetRequiredService<PasswordService>();
        var generator = new FakeDataGenerator();

        await EnsureSchemaAsync(db);

        var user = await users.FindByEmailAsync(TestEmail);
        if (user == null)
        {
            user = await users.SaveAsync(new User
            {
                Name = "Test User",
                Email = TestEmail,
                PasswordHash = passwords.Hash(TestPassword),
                CreatedAt = DateTime.UtcNow,
            });
        }

        // Always reset the documented credentials so they work
        // even if the account was created by an earlier run.
        user.Name = "Test User";
        user.PasswordHash = passwords.Hash(TestPassword);
        user = await users.SaveAsync(user);

        // Drop unassigned leftovers from the removed hardcoded seeder.
        var orphans = await contacts.FindOrphansAsync();
        if (orphans.Count > 0)
            await contacts.DeleteAllAsync(orphans);

        var existing = await contacts.FindByUserAsync(user.Id);

        if (existing.Count >= TargetRecords)
        {
            Console.WriteLine(
                "Test account ready: " + TestEmail +
                " with " + existing.Count + " contacts.");
            return;
        }

        var takenPhones = new HashSet<string>(StringComparer.Ordinal);
        var takenEmails = new HashSet<string>(StringComparer.Ordinal);
        foreach (var contact in existing)
        {
            takenPhones.Add(contact.PhoneNumber);
            if (contact.Email != null)
                takenEmails.Add(contact.Email);
        }

        var missing = TargetRecords - existing.Count;
        await using var connection = (NpgsqlConnection)db.Database.GetDbConnection();
        await connection.OpenAsync();
        await using var batch = new NpgsqlBatch(connection);

        foreach (var contact in generator.Generate(user, missing, takenPhones, takenEmails))
        {
            var command = new NpgsqlBatchCommand(
                "INSERT INTO contacts " +
                "(user_id, name, phone_number, email, address, category, created_at) " +
                "VALUES ($1, $2, $3, $4, $5, $6, $7)");
            command.Parameters.AddWithValue(user.Id);
            command.Parameters.AddWithValue(contact.Name);
            command.Parameters.AddWithValue(contact.PhoneNumber);
            command.Parameters.AddWithValue((object?)contact.Email ?? DBNull.Value);
            command.Parameters.AddWithValue((object?)contact.Address ?? DBNull.Value);
            command.Parameters.AddWithValue(contact.Category);
            command.Parameters.AddWithValue(contact.CreatedAt);
            batch.BatchCommands.Add(command);
        }

        await batch.ExecuteNonQueryAsync();

        var total = (await contacts.FindByUserAsync(user.Id)).Count;
        Console.WriteLine(
            "Test account ready: " + TestEmail + " / " + TestPassword +
            " with " + total + " contacts.");
    }

    private static async Task EnsureSchemaAsync(AppDbContext db)
    {
        const string sql = """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255),
                google_id VARCHAR(255) UNIQUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                name VARCHAR(255) NOT NULL,
                phone_number VARCHAR(20) NOT NULL UNIQUE,
                email VARCHAR(255) UNIQUE,
                address TEXT,
                category VARCHAR(20) NOT NULL DEFAULT 'FRIEND',
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id INTEGER;
            CREATE INDEX IF NOT EXISTS ix_contacts_user_id ON contacts(user_id);
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname='contacts_user_id_fkey'
                ) THEN
                    ALTER TABLE contacts
                    ADD CONSTRAINT contacts_user_id_fkey
                    FOREIGN KEY (user_id) REFERENCES users(id);
                END IF;
            END $$;
            """;

        await db.Database.ExecuteSqlRawAsync(sql);
    }
}
