using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Npgsql;
using System.Reflection;
using System.Text;
using YGOApi.Data;
using YGOApi.Data.Enums;
using YGOApi.Integrations;
using YGOApi.Models;
using YGOApi.Services.Autenticator;
using YGOApi.Services.Gatcha;
using YGOApi.Services.PlayerCollection;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("CardConnection");

builder.Services.AddScoped<ICardProvider, YgoProDeckAdapter>();

builder.Services.AddScoped<IAutenticatorService, AutenticatorService>();

builder.Services.AddScoped<IPlayerCollectionService, PlayerCollectionService>();

builder.Services.AddScoped<IGatchaService, GatchaService>();

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<CardAtribute>();
dataSourceBuilder.MapEnum<CardBanStatus>();
dataSourceBuilder.MapEnum<CardRace>();
dataSourceBuilder.MapEnum<CardSubType>();
dataSourceBuilder.MapEnum<CardType>();
dataSourceBuilder.MapEnum<UserRole>();
dataSourceBuilder.MapEnum<ContestStage>();
dataSourceBuilder.MapEnum<ContestType>();
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<WriteContext>(opts =>
    opts.UseNpgsql(dataSource, npgsqlOptions => {
        npgsqlOptions.EnableRetryOnFailure(); // Ative o retry aqui dentro
    }));

builder.Services.AddAuthentication(opts =>
{
    opts.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opts.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetSection("Jwt:Key").Value)),
        ClockSkew = TimeSpan.Zero,
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Admin", policy => policy.RequireRole("ADMIN"))
    .AddPolicy("Player", policy => policy.RequireRole("ADMIN", "PLAYER"));

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
// Add services to the container.

builder.Services.AddControllers().AddNewtonsoftJson();
// Configure CORS to allow requests from the frontend running on http://localhost:3000
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.AllowAnyOrigin() // Isso libera QUALQUER URL da Vercel
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});



// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "YGOApi", Version = "v1" });
    
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS using the configured policy
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// Apply EF Core migrations at startup with simple retry to wait for the DB to be ready
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var db = services.GetRequiredService<WriteContext>();
    const int maxRetries = 10;
    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            db.Database.Migrate();
            logger.LogInformation("Database migrations applied.");
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Database migration attempt {Attempt} of {Max} failed.", attempt, maxRetries);
            if (attempt == maxRetries) throw;
            Thread.Sleep(TimeSpan.FromSeconds(5));
        }
    }
}

app.Run();
