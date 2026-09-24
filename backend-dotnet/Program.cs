using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PhoneBookApi.Data;
using PhoneBookApi.Middleware;
using PhoneBookApi.Repositories;
using PhoneBookApi.Services;

var builder = WebApplication.CreateBuilder(args);

/*
 * Honor the previous backend's environment variable names, so
 * existing deployments keep working without changes.
 */
var jwtSecretEnv = Environment.GetEnvironmentVariable("JWT_SECRET");
if (!string.IsNullOrWhiteSpace(jwtSecretEnv))
    builder.Configuration["Jwt:Key"] = jwtSecretEnv;

var jwtExpiryEnv = Environment.GetEnvironmentVariable("JWT_EXPIRATION_MINUTES");
if (!string.IsNullOrWhiteSpace(jwtExpiryEnv))
    builder.Configuration["Jwt:ExpiryMinutes"] = jwtExpiryEnv;

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PhoneBook API",
        Version = "v1",
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT as: Bearer <token>",
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer",
                },
            },
            Array.Empty<string>()
        },
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

/* Validation failures leave the API as {detail, message}. */
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var message = context.ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault(_ => true) ?? "Validation error";

        return new BadRequestObjectResult(new
        {
            detail = message,
            message,
        });
    };
});

var jwtService = new JwtService(builder.Configuration);

builder.Services.AddSingleton(jwtService);
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // HS512/HS384/HS256 inferred from key length — identical to the old tokens.
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtService.KeyBytes),
            ValidAlgorithms = new[] { jwtService.Algorithm },
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };

        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                return context.Response.WriteAsJsonAsync(new
                {
                    detail = "Could not validate authentication credentials",
                    message = "Could not validate authentication credentials",
                });
            },
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

/*
 * Same-origin deployment (Nginx serves frontend + /api on one
 * port, Vite proxies in dev), so no CORS policy is required.
 */

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

/* Schema guard + demo-account seeder (idempotent, non-destructive). */
using (var scope = app.Services.CreateScope())
{
    await DbInitializer.InitializeAsync(scope.ServiceProvider);
}

app.Run();
