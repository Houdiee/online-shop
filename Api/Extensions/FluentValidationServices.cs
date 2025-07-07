using FluentValidation;
using FluentValidation.AspNetCore;

namespace Api.Extensions;

public static class FluentValidationServices
{
  public static IServiceCollection AddFluentValidationServices(this IServiceCollection services)
  {
    services.AddFluentValidationAutoValidation();

    services.AddFluentValidationClientsideAdapters();

    services.AddValidatorsFromAssemblyContaining<Program>(ServiceLifetime.Scoped);

    return services;
  }
}
