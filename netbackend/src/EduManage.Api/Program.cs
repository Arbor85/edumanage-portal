using EduManage.Api.Authentication;
using EduManage.Api.Authorization;
using EduManage.Api.Mcp;
using EduManage.Api.Services;
using EduManage.Api.Validators;
using EduManage.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
	.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
	.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true)
	.AddEnvironmentVariables();

const string frontendCorsPolicy = "FrontendCors";
const string auth0DomainConfigKey = "Authentication:Auth0:Domain";
const string auth0AudienceConfigKey = "Authentication:Auth0:Audience";

var auth0Domain = builder.Configuration[auth0DomainConfigKey]
	?? throw new InvalidOperationException($"Missing configuration value '{auth0DomainConfigKey}'.");
var auth0Audience = builder.Configuration[auth0AudienceConfigKey]
	?? throw new InvalidOperationException($"Missing configuration value '{auth0AudienceConfigKey}'.");

var auth0Authority = $"https://{auth0Domain.TrimEnd('/')}/";

builder.Services.AddHttpContextAccessor();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<ExcerciseWriteRequestValidator>();
builder.Services
	.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.Authority = auth0Authority;
		options.Audience = auth0Audience;
		options.MapInboundClaims = false;
		options.TokenValidationParameters.ValidTypes = ["JWT", "at+JWT", "at+jwt"];
		options.TokenValidationParameters.NameClaimType = "sub";
		options.TokenValidationParameters.ValidateLifetime = true;
		options.TokenValidationParameters.ClockSkew = TimeSpan.Zero;
		options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
		{
			OnAuthenticationFailed = ctx =>
			{
				var logger = ctx.HttpContext.RequestServices
					.GetRequiredService<ILogger<Program>>();
				logger.LogWarning("JWT auth failed: {Error}", ctx.Exception.Message);
				ctx.Response.Headers["X-Auth-Error"] = ctx.Exception.Message.ReplaceLineEndings(" ");
				return Task.CompletedTask;
			},
			OnChallenge = ctx =>
			{
				var logger = ctx.HttpContext.RequestServices
					.GetRequiredService<ILogger<Program>>();
				logger.LogWarning("JWT challenge: error={Error} description={Desc}",
					ctx.Error, ctx.ErrorDescription);
				return Task.CompletedTask;
			}
		};
	})
		.AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>(ApiKeyAuthenticationOptions.Scheme, _ => { });
builder.Services
	.AddControllers()
	.AddJsonOptions(options =>
	{
		options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
	});
builder.Services.AddAuthorization(options =>
{
	var schemes = new[] { JwtBearerDefaults.AuthenticationScheme, ApiKeyAuthenticationOptions.Scheme };

	options.DefaultPolicy = new AuthorizationPolicyBuilder(schemes)
		.RequireAuthenticatedUser()
		.Build();

	void AddPermissionPolicy(string name) =>
		options.AddPolicy(name, policy =>
		{
			policy.AddAuthenticationSchemes(schemes);
			policy.RequireAuthenticatedUser();
			policy.Requirements.Add(new HasPermissionRequirement(name));
		});

	AddPermissionPolicy("manage:clients");
	AddPermissionPolicy("manage:equipment");
	AddPermissionPolicy("manage:forms");
	AddPermissionPolicy("manage:organization");
	AddPermissionPolicy("manage:buildings");
	AddPermissionPolicy("manage:schedule-plans");
	AddPermissionPolicy("view:schedule");
	AddPermissionPolicy("manage:exercise");
});
builder.Services.AddSingleton<IAuthorizationHandler, HasPermissionHandler>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
	options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
	{
		Name = "Authorization",
		Type = SecuritySchemeType.Http,
		Scheme = "bearer",
		BearerFormat = "JWT",
		In = ParameterLocation.Header,
		Description = "Paste an Auth0 access token here."
	});

	options.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference
				{
					Type = ReferenceType.SecurityScheme,
					Id = "Bearer"
				}
			},
			Array.Empty<string>()
		}
	});
});
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=edumanage.db");
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
var allowedOriginsRaw = builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:5173";
string[] allowedOrigins = allowedOriginsRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddHealthChecks();

builder.Services.AddMcpServer()
    .WithHttpTransport()
    .WithTools<ExerciseTools>();

builder.Services.AddCors(options =>
{
	options.AddPolicy(frontendCorsPolicy, policy =>
	{
		policy
			.WithOrigins(allowedOrigins)
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EduManageDbContext>();
    await db.Database.EnsureCreatedAsync();
    await db.Database.ExecuteSqlRawAsync("""
        IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserChallengeLogs')
        CREATE TABLE UserChallengeLogs (
            UserId NVARCHAR(200) NOT NULL,
            ChallengeDate DATE NOT NULL,
            CONSTRAINT PK_UserChallengeLogs PRIMARY KEY (UserId, ChallengeDate)
        )
        """);
}

// await app.Services.SeedExercisesFromJsonAsync();

app.UseSwagger(options =>
{
	options.RouteTemplate = "openapi/{documentName}.json";
});
app.UseSwaggerUI();
app.MapScalarApiReference(options =>
{
	options.WithOpenApiRoutePattern("/openapi/{documentName}.json");
	options.WithTitle("EduManage API");
});

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors(frontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapMcp("/mcp").AllowAnonymous();

app.Run();
