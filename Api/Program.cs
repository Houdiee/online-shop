using Api.Data;
using Api.Extensions;
using Api.Services.User;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddTransient<UserService>();

builder.Services
  .AddFluentValidationServices()
  .AddResendServices(builder.Configuration);

builder.Services.AddDbContextPool<ApiDbContext>(options =>
{
  _ = options.UseNpgsql(builder.Configuration.GetConnectionString("Database"));
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
