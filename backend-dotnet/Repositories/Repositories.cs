using Microsoft.EntityFrameworkCore;
using PhoneBookApi.Data;
using PhoneBookApi.Models;

namespace PhoneBookApi.Repositories;

public interface IUserRepository
{
    Task<User?> FindByEmailAsync(string email);
    Task<User?> FindByIdAsync(int id);
    Task<User> SaveAsync(User user);
}

public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<User?> FindByEmailAsync(string email) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public Task<User?> FindByIdAsync(int id) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id);

    public async Task<User> SaveAsync(User user)
    {
        if (user.Id == 0)
            _db.Users.Add(user);

        await _db.SaveChangesAsync();
        return user;
    }
}

public interface IContactRepository
{
    IQueryable<Contact> Query();
    Task<Contact?> FindOwnedAsync(int id, int userId);
    Task<List<Contact>> FindOwnedIdsAsync(IEnumerable<int> ids, int userId);
    Task<List<Contact>> FindByUserAsync(int userId);
    Task<List<Contact>> FindOrphansAsync();
    Task<Contact> SaveAsync(Contact contact);
    Task DeleteAsync(Contact contact);
    Task DeleteAllAsync(IEnumerable<Contact> contacts);
    Task<bool> PhoneTakenAsync(string phone, int? exceptId = null);
    Task<bool> EmailTakenAsync(string email, int? exceptId = null);
}

public sealed class ContactRepository : IContactRepository
{
    private readonly AppDbContext _db;

    public ContactRepository(AppDbContext db)
    {
        _db = db;
    }

    public IQueryable<Contact> Query() =>
        _db.Contacts.AsNoTracking();

    public Task<Contact?> FindOwnedAsync(int id, int userId) =>
        _db.Contacts.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

    public Task<List<Contact>> FindOwnedIdsAsync(IEnumerable<int> ids, int userId) =>
        _db.Contacts.Where(c => ids.Contains(c.Id) && c.UserId == userId).ToListAsync();

    public Task<List<Contact>> FindByUserAsync(int userId) =>
        _db.Contacts.Where(c => c.UserId == userId).ToListAsync();

    public Task<List<Contact>> FindOrphansAsync() =>
        _db.Contacts.Where(c => c.UserId == null).ToListAsync();

    public async Task<Contact> SaveAsync(Contact contact)
    {
        if (contact.Id == 0)
            _db.Contacts.Add(contact);

        await _db.SaveChangesAsync();
        return contact;
    }

    public async Task DeleteAsync(Contact contact)
    {
        _db.Contacts.Remove(contact);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAllAsync(IEnumerable<Contact> contacts)
    {
        _db.Contacts.RemoveRange(contacts);
        await _db.SaveChangesAsync();
    }

    public Task<bool> PhoneTakenAsync(string phone, int? exceptId = null) =>
        _db.Contacts.AnyAsync(c =>
            c.PhoneNumber == phone &&
            (exceptId == null || c.Id != exceptId));

    public Task<bool> EmailTakenAsync(string email, int? exceptId = null) =>
        _db.Contacts.AnyAsync(c =>
            c.Email == email &&
            (exceptId == null || c.Id != exceptId));
}
