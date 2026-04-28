using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Threading;
using YGOApi.Data;
using YGOApi.Integrations;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("CardConnection");

builder.Services.AddScoped<ICardProvider, YgoProDeckAdapter>();

builder.Services.AddDbContext<CardContext>(opts =>
    opts.UseMySql(connectionString,
        new MySqlServerVersion(new Version(8, 0, 31)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure()));


builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
// Add services to the container.

builder.Services.AddControllers().AddNewtonsoftJson();
// Configure CORS to allow requests from the frontend running on http://localhost:3000
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocal3000",
        policy => policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
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
app.UseCors("AllowLocal3000");

app.UseAuthorization();

app.MapControllers();
// Apply EF Core migrations at startup with simple retry to wait for the DB to be ready
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var db = services.GetRequiredService<CardContext>();
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
