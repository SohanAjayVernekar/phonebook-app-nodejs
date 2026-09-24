namespace PhoneBookApi.Services;

/*
 * Carries an HTTP status plus the message shown to the client.
 * The exception middleware renders {detail, message} from it,
 * matching the previous backend's error shape.
 */
public sealed class ApiException : Exception
{
    public int StatusCode { get; }

    public ApiException(int statusCode, string message)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public static ApiException BadRequest(string message) =>
        new(StatusCodes.Status400BadRequest, message);

    public static ApiException Unauthorized(string message) =>
        new(StatusCodes.Status401Unauthorized, message);

    public static ApiException NotFound(string message) =>
        new(StatusCodes.Status404NotFound, message);

    public static ApiException Conflict(string message) =>
        new(StatusCodes.Status409Conflict, message);
}
