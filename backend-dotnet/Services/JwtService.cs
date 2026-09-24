using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace PhoneBookApi.Services;

/*
 * HS256 tokens compatible with the previous backend:
 * subject = numeric user id, no issuer/audience, configurable
 * lifetime. Tokens minted by the old backend keep validating
 * as long as the same secret is configured.
 */
public sealed class JwtService
{
    public const string FallbackSecret =
        "change-this-secret-key-in-production-please-use-a-long-random-value";

    private readonly byte[] _key;
    private readonly int _expiryMinutes;

    public JwtService(IConfiguration config)
    {
        var secret = config["Jwt:Key"] ?? "";
        if (secret.Length < 32)
            secret = FallbackSecret;

        _key = Encoding.UTF8.GetBytes(secret);

        if (!int.TryParse(config["Jwt:ExpiryMinutes"], out _expiryMinutes))
            _expiryMinutes = 60;
    }

    public byte[] KeyBytes => _key;

    /*
     * jjwt infers the HMAC algorithm from the key length
     * (>= 64 bytes: HS512, >= 48 bytes: HS384, else HS256).
     * Mirrored here so tokens stay byte-compatible.
     */
    public string Algorithm => _key.Length >= 64
        ? SecurityAlgorithms.HmacSha512
        : _key.Length >= 48
            ? SecurityAlgorithms.HmacSha384
            : SecurityAlgorithms.HmacSha256;

    public string CreateToken(int userId)
    {
        var now = DateTime.UtcNow;

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            }),
            IssuedAt = now,
            Expires = now.AddMinutes(_expiryMinutes),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(_key),
                Algorithm),
        };

        return new JwtSecurityTokenHandler().CreateEncodedJwt(descriptor);
    }
}
