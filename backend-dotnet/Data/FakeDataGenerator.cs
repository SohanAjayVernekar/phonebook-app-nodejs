using PhoneBookApi.Models;

namespace PhoneBookApi.Data;

/*
 * Runtime fake-contact generator. Ports the previous backend's
 * generator one-to-one: same name/city pools, same chances,
 * same phone/email shapes, same 18-month spread.
 */
public sealed class FakeDataGenerator
{
    private static readonly string[] FirstNames =
    {
        "Aarav", "Vihaan", "Aditya", "Arjun", "Rohan",
        "Rahul", "Karan", "Kabir", "Siddharth", "Vikram",
        "Nikhil", "Rajesh", "Amit", "Dev", "Ishaan",
        "Ananya", "Diya", "Ishita", "Aisha", "Priya",
        "Sneha", "Meera", "Kavya", "Nisha", "Rhea",
        "Aanya", "Tara", "Zara", "Kirti", "Pooja",
        "Liam", "Noah", "Ethan", "Oliver", "Lucas",
        "Olivia", "Emma", "Amelia", "Sophia", "Mia",
    };

    private static readonly string[] LastNames =
    {
        "Sharma", "Patel", "Verma", "Mehta", "Nair",
        "Joshi", "Desai", "Kulkarni", "Iyer", "Rao",
        "Singh", "Khan", "Gupta", "Mishra", "Pawar",
        "Naik", "Reddy", "Chawla", "Bansal", "Malhotra",
        "Kapoor", "Chopra", "Das", "Dutta", "Bose",
    };

    private static readonly string[] Cities =
    {
        "Mumbai", "Pune", "Bengaluru", "Delhi", "Hyderabad",
        "Chennai", "Goa", "Nashik", "Jaipur", "Lucknow",
        "Indore", "Kochi", "Surat", "Chandigarh", "Bhopal",
    };

    private static readonly string[] Streets =
    {
        "Rose Lane", "MG Road", "Lake View Road", "Hill Street",
        "Park Avenue", "River Side", "Temple Road", "Station Road",
        "Market Lane", "Garden Street", "Palm Grove", "Sunset Road",
    };

    private static readonly string[] Categories = { "WORK", "FAMILY", "FRIEND" };

    private const double EmailChance = 0.85;
    private const double AddressChance = 0.8;
    private const int MaxAgeDays = 540;
    private const string EmailSuffixChars = "abcdefghijklmnopqrstuvwxyz0123456789";

    private readonly Random _random = new();

    public List<Contact> Generate(
        User user,
        int count,
        HashSet<string> takenPhones,
        HashSet<string> takenEmails)
    {
        var batch = new List<Contact>(count);

        for (var i = 0; i < count; i++)
            batch.Add(One(user, takenPhones, takenEmails));

        return batch;
    }

    private Contact One(
        User user,
        HashSet<string> takenPhones,
        HashSet<string> takenEmails)
    {
        var firstName = Pick(FirstNames);
        var lastName = Pick(LastNames);

        return new Contact
        {
            UserId = user.Id,
            Name = firstName + " " + lastName,
            PhoneNumber = UniquePhone(takenPhones),
            Email = UniqueEmail(firstName, lastName, takenEmails),
            Address = _random.NextDouble() < AddressChance ? RandomAddress() : null,
            Category = Pick(Categories),
            CreatedAt = RandomCreatedAt(),
        };
    }

    private string UniquePhone(HashSet<string> takenPhones)
    {
        string phone;
        do
        {
            phone = "9" + _random.Next(0, 1_000_000_000).ToString("D9");
        } while (!takenPhones.Add(phone));

        return phone;
    }

    private string? UniqueEmail(
        string firstName,
        string lastName,
        HashSet<string> takenEmails)
    {
        if (_random.NextDouble() >= EmailChance)
            return null;

        string email;
        do
        {
            email = firstName.ToLowerInvariant()
                + "." + lastName.ToLowerInvariant()
                + "." + Suffix()
                + "@example.com";
        } while (!takenEmails.Add(email));

        return email;
    }

    private string RandomAddress()
    {
        var houseNumber = _random.Next(400) + 1;
        return houseNumber + " " + Pick(Streets) + ", " + Pick(Cities) + ", India";
    }

    private DateTime RandomCreatedAt() =>
        DateTime.UtcNow
            .AddDays(-_random.Next(MaxAgeDays))
            .AddHours(-_random.Next(24))
            .AddMinutes(-_random.Next(60));

    private string Suffix()
    {
        var chars = new char[4];
        for (var i = 0; i < chars.Length; i++)
            chars[i] = EmailSuffixChars[_random.Next(EmailSuffixChars.Length)];

        return new string(chars);
    }

    private string Pick(string[] options) =>
        options[_random.Next(options.Length)];
}
