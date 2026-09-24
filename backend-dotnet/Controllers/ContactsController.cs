using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneBookApi.Data;
using PhoneBookApi.DTOs;
using PhoneBookApi.Models;
using PhoneBookApi.Repositories;
using PhoneBookApi.Services;

namespace PhoneBookApi.Controllers;

[ApiController]
[Route("api/contacts")]
[Authorize]
public sealed class ContactsController : ApiBaseController
{
    private static readonly HashSet<string> Categories =
        new(StringComparer.Ordinal) { "WORK", "FAMILY", "FRIEND" };

    private static readonly HashSet<string> Sorts =
        new(StringComparer.Ordinal)
        {
            "newest", "oldest", "name_asc", "name_desc",
        };

    private static readonly Regex PhonePattern = new(
        @"^\+?[1-9]\d{6,19}$",
        RegexOptions.Compiled);

    private readonly AppDbContext _db;
    private readonly IUserRepository _users;
    private readonly IContactRepository _contacts;

    public ContactsController(
        AppDbContext db,
        IUserRepository users,
        IContactRepository contacts)
    {
        _db = db;
        _users = users;
        _contacts = contacts;
    }

    /* ---------------- list ---------------- */

    [HttpGet]
    public async Task<ActionResult<Dictionary<string, object?>>> List(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? categories,
        [FromQuery] string? sort,
        [FromQuery(Name = "has_email")] string? hasEmail,
        [FromQuery(Name = "date_from")] string? dateFrom,
        [FromQuery(Name = "date_to")] string? dateTo,
        [FromQuery] int page = 1,
        [FromQuery(Name = "page_size")] int pageSize = 8)
    {
        var user = await CurrentUserAsync(_users);

        if (page < 1)
            throw ApiException.BadRequest("Page number must be at least 1");

        if (pageSize < 1 || pageSize > 100)
            throw ApiException.BadRequest("Page size must be between 1 and 100");

        var cats = ParseCategories(category, categories);
        var emailFlag = ParseHasEmail(hasEmail);
        var from = ParseBoundary(dateFrom, endOfDay: false);
        var to = ParseBoundary(dateTo, endOfDay: true);
        var term = string.IsNullOrWhiteSpace(search) ? null : search!.Trim();

        var query = _contacts.Query().Where(c => c.UserId == user.Id);

        if (term != null)
        {
            var pattern = LikePattern(term);
            query = query.Where(c =>
                EF.Functions.Like(c.Name.ToLower(), pattern) ||
                EF.Functions.Like(c.PhoneNumber.ToLower(), pattern));
        }

        if (cats.Count > 0)
            query = query.Where(c => cats.Contains(c.Category));

        if (emailFlag == true)
            query = query.Where(c => c.Email != null);

        if (emailFlag == false)
            query = query.Where(c => c.Email == null);

        if (from != null)
            query = query.Where(c => c.CreatedAt >= from);

        if (to != null)
            query = query.Where(c => c.CreatedAt < to);

        query = SortKey(sort) switch
        {
            "oldest" => query.OrderBy(c => c.Id),
            "name_asc" => query.OrderBy(c => c.Name).ThenByDescending(c => c.Id),
            "name_desc" => query.OrderByDescending(c => c.Name).ThenByDescending(c => c.Id),
            _ => query.OrderByDescending(c => c.Id),
        };

        var total = await query.CountAsync();
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => ContactResponse.From(c))
            .ToListAsync();

        return Ok(new Dictionary<string, object?>
        {
            ["items"] = items,
            ["total"] = total,
            ["page"] = page,
            ["page_size"] = pageSize,
            ["total_pages"] = totalPages,
            ["category"] = category,
            ["sort"] = string.IsNullOrWhiteSpace(sort) ? "newest" : sort,
        });
    }

    /* ---------------- create ---------------- */

    [HttpPost]
    public async Task<ActionResult<ContactResponse>> Create(
        [FromBody] ContactRequest? request)
    {
        if (request == null)
            throw ApiException.BadRequest("Invalid request body");

        var user = await CurrentUserAsync(_users);
        var contact = await BuildValidatedAsync(request, null, user);

        return StatusCode(
            StatusCodes.Status201Created,
            ContactResponse.From(contact));
    }

    /* ---------------- read ---------------- */

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContactResponse>> Get(int id)
    {
        var user = await CurrentUserAsync(_users);
        return Ok(ContactResponse.From(await OwnedAsync(id, user.Id)));
    }

    /* ---------------- update ---------------- */

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ContactResponse>> Update(
        int id,
        [FromBody] ContactRequest? request)
    {
        if (request == null)
            throw ApiException.BadRequest("Invalid request body");

        var user = await CurrentUserAsync(_users);
        var contact = await OwnedAsync(id, user.Id);
        await ApplyValidatedAsync(contact, request);

        return Ok(ContactResponse.From(contact));
    }

    /* ---------------- delete ---------------- */

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<Dictionary<string, object>>> Delete(int id)
    {
        var user = await CurrentUserAsync(_users);
        var contact = await OwnedAsync(id, user.Id);
        await _contacts.DeleteAsync(contact);

        return Ok(new Dictionary<string, object>
        {
            ["message"] = "Contact deleted successfully",
            ["id"] = id,
        });
    }

    [HttpPost("bulk-delete")]
    public async Task<ActionResult<Dictionary<string, object>>> BulkDelete(
        [FromBody] BulkDeleteRequest? body)
    {
        var user = await CurrentUserAsync(_users);

        var ids = body?.Ids;
        if (ids == null || ids.Count == 0)
            throw ApiException.BadRequest("Provide at least one contact id");

        if (ids.Count > 100)
            throw ApiException.BadRequest(
                "You can delete at most 100 contacts at once");

        // Only contacts that belong to the signed-in user are removed.
        var owned = await _contacts.FindOwnedIdsAsync(
            new HashSet<int>(ids), user.Id);
        await _contacts.DeleteAllAsync(owned);

        return Ok(new Dictionary<string, object>
        {
            ["deleted"] = owned.Count,
        });
    }

    /* ---------------- helpers ---------------- */

    private async Task<Contact> OwnedAsync(int id, int userId) =>
        await _contacts.FindOwnedAsync(id, userId)
            ?? throw ApiException.NotFound("Contact not found");

    private async Task<Contact> BuildValidatedAsync(
        ContactRequest request,
        Contact? existing,
        User user)
    {
        var contact = existing ?? new Contact { UserId = user.Id };
        await ApplyValidatedAsync(contact, request);
        return contact;
    }

    private async Task ApplyValidatedAsync(Contact contact, ContactRequest r)
    {
        var name = RequireText(r.Name, "must not be blank", null, 255,
            "size must be between 0 and 255");
        var phone = RequireText(r.PhoneNumber, "must not be blank", 7, 20,
            "size must be between 7 and 20");
        RequireEmail(r.Email);

        if (r.Address != null && r.Address.Length > 10000)
            throw ApiException.BadRequest("size must be between 0 and 10000");

        phone = phone.Trim();
        if (!PhonePattern.IsMatch(phone))
            throw ApiException.BadRequest(
                "Phone number must contain 7-20 digits and may start with +");

        if (r.Category != null && !Categories.Contains(r.Category))
            throw ApiException.BadRequest(
                "Category must be WORK, FAMILY, or FRIEND");

        if (await _contacts.PhoneTakenAsync(phone, contact.Id == 0 ? null : contact.Id))
            throw ApiException.Conflict("Phone number is already in use");

        if (r.Email != null &&
            await _contacts.EmailTakenAsync(r.Email, contact.Id == 0 ? null : contact.Id))
            throw ApiException.Conflict("Email address is already in use");

        contact.Name = name.Trim();
        contact.PhoneNumber = phone;
        contact.Email = r.Email;
        contact.Address = r.Address;
        contact.Category = r.Category ?? "FRIEND";

        if (contact.Id == 0)
            contact.CreatedAt = DateTime.UtcNow;

        await _contacts.SaveAsync(contact);
    }

    private static string LikePattern(string value)
    {
        var sb = new System.Text.StringBuilder("%");
        foreach (var ch in value.ToLowerInvariant())
        {
            if (ch == '\\' || ch == '%' || ch == '_')
                sb.Append('\\');
            sb.Append(ch);
        }
        return sb.Append('%').ToString();
    }

    private static HashSet<string> ParseCategories(string? single, string? multi)
    {
        var result = new HashSet<string>(StringComparer.Ordinal);

        void Add(string raw)
        {
            var value = raw.Trim().ToUpperInvariant();
            if (value.Length == 0)
                return;
            if (!Categories.Contains(value))
                throw ApiException.BadRequest(
                    "Category must be WORK, FAMILY, or FRIEND");
            result.Add(value);
        }

        if (!string.IsNullOrWhiteSpace(single))
            Add(single!);

        if (!string.IsNullOrWhiteSpace(multi))
            foreach (var part in multi!.Split(','))
                Add(part);

        return result;
    }

    private static bool? ParseHasEmail(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        if (value!.Equals("true", StringComparison.OrdinalIgnoreCase))
            return true;

        if (value.Equals("false", StringComparison.OrdinalIgnoreCase))
            return false;

        throw ApiException.BadRequest("has_email must be true or false");
    }

    // date_from is inclusive; date_to covers the whole chosen day.
    private static DateTime? ParseBoundary(string? value, bool endOfDay)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        if (!DateOnly.TryParseExact(
                value!.Trim(),
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var date))
            throw ApiException.BadRequest("Dates must use the format yyyy-MM-dd");

        var day = endOfDay ? date.AddDays(1) : date;
        return day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
    }

    private static string SortKey(string? sort)
    {
        var key = string.IsNullOrWhiteSpace(sort) ? "newest" : sort!.Trim();

        if (!Sorts.Contains(key))
            throw ApiException.BadRequest(
                "sort must be one of newest, oldest, name_asc, name_desc");

        return key;
    }
}
