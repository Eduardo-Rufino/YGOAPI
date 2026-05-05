# Estágio de Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o arquivo de projeto usando o caminho relativo à raiz do GitHub
COPY ["api/YGOApi/YGOApi.csproj", "api/YGOApi/"]

# Restaura as dependências
RUN dotnet restore "api/YGOApi/YGOApi.csproj"

# Copia todo o conteúdo da pasta api para dentro do container
COPY api/ ./api/

# Define o diretório de trabalho onde o arquivo principal está
WORKDIR "/src/api/YGOApi"

# Compila o projeto
RUN dotnet build "YGOApi.csproj" -c Release -o /app/build

# Publica os arquivos
FROM build AS publish
RUN dotnet publish "YGOApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio Final (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expondo a porta que o Cloud Run usa
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "YGOApi.dll"]