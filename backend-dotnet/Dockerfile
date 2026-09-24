# SDK image
#   ↓
# dotnet restore
#   ↓
# dotnet build + publish
#   ↓
# ASP.NET Core runtime image
#   ↓
# Application on :8000 (same internal port the Nginx
# reverse proxy already forwards /api/* to)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY PhoneBookApi.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8000
ENV ASPNETCORE_URLS=http://+:8000

ENTRYPOINT ["dotnet", "PhoneBookApi.dll"]
