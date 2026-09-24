using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneBookApi.DTOs;
using PhoneBookApi.Models;
using PhoneBookApi.Repositories;
using PhoneBookApi.Services;

namespace PhoneBookApi.Controllers;

/*
 * Shared request validation + signed-in user resolution.
 * Messages reproduce the previous backend's validation and
 * auth errors exactly.
 */
public abstract class ApiBaseController : ControllerBase
{
    // Close to Hibernate Validator's default @Email pattern.
    private static readonly Regex EmailPattern = new(
        @"^[a-zA-Z0-9_+&*'-]+(?:\.[a-zA-Z0-9_+&*'-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$",
        RegexOptions.Compiled);

    protected async Task<User> CurrentUserAsync(IUserRepository users)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(sub, out var id))
            throw ApiException.Unauthorized(
                "Could not validate authentication credentials");

        // A valid token for a deleted account behaved as a
        // bad request on the previous backend — preserved.
        return await users.FindByIdAsync(id)
            ?? throw ApiException.BadRequest(
                "Could not validate authentication credentials");
    }

    protected static string RequireText(
        string? value,
        string blankMessage,
        int? min,
        int? max,
        string? sizeMessage)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw ApiException.BadRequest(blankMessage);

        if ((min.HasValue && value!.Length < min) ||
            (max.HasValue && value!.Length > max))
            throw ApiException.BadRequest(sizeMessage!);

        return value!;
    }

    protected static void RequireEmail(string? value)
    {
        if (value == null)
            return;

        if (!EmailPattern.IsMatch(value))
            throw ApiException.BadRequest(
                "must be a well-formed email address");
    }
}

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ApiBaseController
{
    private const string BadCredentials = "Could not validate authentication credentials";

    private readonly IUserRepository _users;
    private readonly PasswordService _passwords;
    private readonly JwtService _jwt;

    public AuthController(
        IUserRepository users,
        PasswordService passwords,
        JwtService jwt)
    {
        _users = users;
        _passwords = passwords;
        _jwt = jwt;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Register(
        [FromBody] UserRegisterRequest? request)
    {
        if (request == null)
            throw ApiException.BadRequest("Invalid request body");

        var name = RequireText(request.Name, "must not be blank", 2, 255,
            "size must be between 2 and 255");
        var email = RequireText(request.Email, "must not be blank", null, null, null);
        RequireEmail(email);
        var password = RequireText(request.Password, "must not be blank", 8, 128,
            "size must be between 8 and 128");

        email = email.Trim().ToLowerInvariant();

        if (await _users.FindByEmailAsync(email) != null)
            throw ApiException.Conflict("Email is already registered");

        var user = new User
        {
            Name = name.Trim(),
            Email = email,
            PasswordHash = _passwords.Hash(password),
            CreatedAt = DateTime.UtcNow,
        };

        await _users.SaveAsync(user);

        return StatusCode(
            StatusCodes.Status201Created,
            new TokenResponse(
                _jwt.CreateToken(user.Id),
                "bearer",
                UserResponse.From(user)));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Login(
        [FromBody] UserLoginRequest? request)
    {
        if (request == null)
            throw ApiException.BadRequest("Invalid request body");

        var email = RequireText(request.Email, "must not be blank", null, null, null);
        RequireEmail(email);
        var password = RequireText(request.Password, "must not be blank", null, null, null);

        var user = await _users.FindByEmailAsync(email.Trim().ToLowerInvariant());

        if (user == null)
            throw ApiException.Unauthorized("Invalid email or password");

        if (user.PasswordHash == null)
            throw ApiException.Unauthorized(
                "This account does not have a password. Please use a password account.");

        if (!_passwords.Matches(password, user.PasswordHash))
            throw ApiException.Unauthorized("Invalid email or password");

        return Ok(new TokenResponse(
            _jwt.CreateToken(user.Id),
            "bearer",
            UserResponse.From(user)));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> Me() =>
        Ok(UserResponse.From(await CurrentUserAsync(_users)));

    [HttpPatch("me")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> UpdateProfile(
        [FromBody] UpdateProfileRequest? request)
    {
        if (request == null)
            throw ApiException.BadRequest("Invalid request body");

        var name = RequireText(request.Name, "Name is required", 2, 255,
            "Name must be between 2 and 255 characters");

        var user = await CurrentUserAsync(_users);
        user.Name = name.Trim();
        await _users.SaveAsync(user);

        return Ok(UserResponse.From(user));
    }

    [HttpPatch("me/password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest? request)
    {
        if (request == null)
            throw ApiException.BadRequest("Invalid request body");

        var current = RequireText(
            request.CurrentPassword, "Current password is required",
            null, null, null);
        var next = RequireText(
            request.NewPassword, "New password is required", 8, 128,
            "New password must be between 8 and 128 characters");

        var user = await CurrentUserAsync(_users);

        if (user.PasswordHash == null || !_passwords.Matches(current, user.PasswordHash))
            throw ApiException.BadRequest("Current password is incorrect");

        if (current == next)
            throw ApiException.BadRequest(
                "New password must be different from the current one");

        user.PasswordHash = _passwords.Hash(next);
        await _users.SaveAsync(user);

        return NoContent();
    }
}
