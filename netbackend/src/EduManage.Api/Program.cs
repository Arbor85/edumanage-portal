using EduManage.Api.Services;
using EduManage.Api.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
	.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
	.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

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
		options.TokenValidationParameters.ValidTypes = ["JWT", "at+jwt"];
		options.TokenValidationParameters.NameClaimType = "sub";
		options.TokenValidationParameters.ValidateLifetime = true;
		options.TokenValidationParameters.ClockSkew = TimeSpan.Zero;
	});
builder.Services.AddControllers();
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
builder.Services.AddInfrastructure();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddCors(options =>
{
	options.AddPolicy(frontendCorsPolicy, policy =>
	{
		policy
			.WithOrigins("http://localhost:5173")
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var app = builder.Build();

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

app.UseCors(frontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
