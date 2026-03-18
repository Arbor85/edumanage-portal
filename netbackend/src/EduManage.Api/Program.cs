using EduManage.Api.Services;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "FrontendCors";
const string jwtIssuerConfigKey = "Authentication:Jwt:Issuer";
const string jwtAudienceConfigKey = "Authentication:Jwt:Audience";
const string jwtSigningKeyConfigKey = "Authentication:Jwt:SigningKey";

var jwtIssuer = builder.Configuration[jwtIssuerConfigKey]
	?? throw new InvalidOperationException($"Missing configuration value '{jwtIssuerConfigKey}'.");
var jwtAudience = builder.Configuration[jwtAudienceConfigKey]
	?? throw new InvalidOperationException($"Missing configuration value '{jwtAudienceConfigKey}'.");
var jwtSigningKey = builder.Configuration[jwtSigningKeyConfigKey]
	?? throw new InvalidOperationException($"Missing configuration value '{jwtSigningKeyConfigKey}'.");

builder.Services.AddHttpContextAccessor();
builder.Services
	.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidIssuer = jwtIssuer,
			ValidateAudience = true,
			ValidAudience = jwtAudience,
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
			ValidateLifetime = true,
			ClockSkew = TimeSpan.Zero
		};
	});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors(frontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
