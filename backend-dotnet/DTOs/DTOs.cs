using System.Text.Json.Serialization;

namespace PhoneBookApi.DTOs;

/* ---------- auth ---------- */

public record UserRegisterRequest(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("email")] string? Email,
    [property: JsonPropertyName("password")] string? Password);

public record UserLoginRequest(
    [property: JsonPropertyName("email")] string? Email,
    [property: JsonPropertyName("password")] string? Password);

public record UpdateProfileRequest(
    [property: JsonPropertyName("name")] string? Name);

public record ChangePasswordRequest(
    [property: JsonPropertyName("current_password")] string? CurrentPassword,
    [property: JsonPropertyName("new_password")] string? NewPassword);

public record TokenResponse(
    [property: JsonPropertyName("access_token")] string AccessToken,
    [property: JsonPropertyName("token_type")] string TokenType,
    [property: JsonPropertyName("user")] UserResponse User);

public record UserResponse(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("google_id")] string? GoogleId,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt)
{
    public static UserResponse From(Models.User u) =>
        new(u.Id, u.Name, u.Email, u.GoogleId, u.CreatedAt);
}

/* ---------- contacts ---------- */

public record ContactRequest(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("phone_number")] string? PhoneNumber,
    [property: JsonPropertyName("email")] string? Email,
    [property: JsonPropertyName("address")] string? Address,
    [property: JsonPropertyName("category")] string? Category);

public record ContactResponse(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("phone_number")] string PhoneNumber,
    [property: JsonPropertyName("email")] string? Email,
    [property: JsonPropertyName("address")] string? Address,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt)
{
    public static ContactResponse From(Models.Contact c) =>
        new(c.Id, c.Name, c.PhoneNumber, c.Email, c.Address, c.Category, c.CreatedAt);
}

public record BulkDeleteRequest(
    [property: JsonPropertyName("ids")] List<int>? Ids);
