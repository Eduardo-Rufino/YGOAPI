FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY ["api/YGOApi/YGOApi.csproj", "api/YGOApi/"]
RUN dotnet restore "api/YGOApi/YGOApi.csproj"

# copy everything else and publish
COPY . .
WORKDIR /src/api/YGOApi
RUN dotnet publish "api/YGOApi/YGOApi.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "YGOApi.dll"]
