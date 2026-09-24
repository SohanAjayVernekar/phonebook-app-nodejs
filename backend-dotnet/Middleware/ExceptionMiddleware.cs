using System.Text.Json;
using PhoneBookApi.Services;

namespace PhoneBookApi.Middleware;

/*
 * Centralized error handling. Every error leaves the API as
 * {"detail": ..., "message": ...} so existing clients keep
 * working; stack traces and secrets never leak.
 */
public sealed class ExceptionMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = null,
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _log;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> log)
    {
        _next = next;
        _log = log;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ApiException ex)
        {
            await WriteAsync(context, ex.StatusCode, ex.Message);
        }
        catch (BadHttpRequestException ex)
        {
            await WriteAsync(
                context,
                StatusCodes.Status400BadRequest,
                ex.Message);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Unhandled error");
            await WriteAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "An unexpected error occurred");
        }
    }

    private static Task WriteAsync(
        HttpContext context,
        int status,
        string message)
    {
        if (context.Response.HasStarted)
            return Task.CompletedTask;

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";

        return context.Response.WriteAsync(
            JsonSerializer.Serialize(
                new { detail = message, message },
                JsonOptions));
    }
}
