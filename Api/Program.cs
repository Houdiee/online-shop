using Api.Data;
using Api.Extensions;
using Api.Filters;
using Microsoft.EntityFrameworkCore;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

StripeConfiguration.ApiKey = builder.Configuration["ApiKeys:Stripe:SecretKey"];

builder.Services.AddScoped<VerifyUserExistsAttribute>();

builder.Services
  .AddFluentValidationServices()
  .AddResendServices(builder.Configuration);

builder.Services.AddDbContextPool<ApiDbContext>(options =>
{
  _ = options.UseNpgsql(builder.Configuration.GetConnectionString("Database"));
});

builder.Services.AddCors(options =>
{
  options.AddDefaultPolicy(policy =>
  {
    policy
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowAnyOrigin();
  });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();
