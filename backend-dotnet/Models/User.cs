using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneBookApi.Models;

/* Mirrors the existing public.users table exactly. */
[Table("users")]
public class User
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = "";

    [Column("email")]
    public string Email { get; set; } = "";

    [Column("password_hash")]
    public string? PasswordHash { get; set; }

    [Column("google_id")]
    public string? GoogleId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
