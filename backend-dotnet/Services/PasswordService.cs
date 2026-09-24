using System.Security.Cryptography;
using Konscious.Security.Cryptography;

namespace PhoneBookApi.Services;

/*
 * Argon2id with Spring Security's defaultsForSpringSecurity_v5_8
 * parameters (m=4096 KiB, t=3, p=1, 16-byte salt, 32-byte hash),
 * so every password hash stored by the previous backend verifies
 * unchanged, and new hashes use the identical format:
 *   $argon2id$v=19$m=4096,t=3,p=1$<salt>$<hash>
 */
public sealed class PasswordService
{
    private const int SaltLength = 16;
    private const int HashLength = 32;
    private const int MemoryKib = 4096;
    private const int Iterations = 3;
    private const int Parallelism = 1;

    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltLength);
        var hash = Compute(password, salt);

        return "$argon2id$v=19$m=4096,t=3,p=1$"
            + Base64NoPad(salt) + "$" + Base64NoPad(hash);
    }

    public bool Matches(string password, string? stored)
    {
        try
        {
            if (string.IsNullOrEmpty(stored))
                return false;

            var parts = stored.Split('$');
            // ["", "argon2id", "v=19", "m=4096,t=3,p=1", salt, hash]
            if (parts.Length != 6 || parts[1] != "argon2id")
                return false;

            var salt = FromBase64NoPad(parts[4]);
            var expected = FromBase64NoPad(parts[5]);
            var actual = Compute(password, salt);

            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch
        {
            return false;
        }
    }

    private static byte[] Compute(string password, byte[] salt)
    {
        var argon2 = new Argon2id(System.Text.Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = Parallelism,
            MemorySize = MemoryKib,
            Iterations = Iterations,
        };

        return argon2.GetBytes(HashLength);
    }

    private static string Base64NoPad(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=');

    private static byte[] FromBase64NoPad(string value)
    {
        var padded = value + new string('=', (4 - value.Length % 4) % 4);
        return Convert.FromBase64String(padded);
    }
}
