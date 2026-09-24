using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneBookApi.Data;

namespace PhoneBookApi.Controllers;

[ApiController]
[AllowAnonymous]
public sealed class HealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("api/health")]
    public async Task<ActionResult<Dictionary<string, string>>> Health()
    {
        var database = "online";

        try
        {
            await _db.Database.ExecuteSqlRawAsync("SELECT 1");
        }
        catch
        {
            database = "offline";
        }

        return Ok(new Dictionary<string, string>
        {
            ["api"] = "online",
            ["database"] = database,
        });
    }
}
