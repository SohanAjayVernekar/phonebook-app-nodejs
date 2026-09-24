using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneBookApi.Models;

/* Mirrors the existing public.contacts table exactly. */
[Table("contacts")]
public class Contact
{
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    public User? User { get; set; }

    [Column("name")]
    public string Name { get; set; } = "";

    [Column("phone_number")]
    public string PhoneNumber { get; set; } = "";

    [Column("email")]
    public string? Email { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("category")]
    public string Category { get; set; } = "FRIEND";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
