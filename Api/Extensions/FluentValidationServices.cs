using FluentValidation;
using FluentValidation.AspNetCore;

namespace Api.Extensions;

public static class FluentValidationServices
{
    public static IServiceCollection AddFluentValidationServices(this IServiceCollection services)
    {
        return services
          .AddFluentValidationAutoValidation()
          .AddFluentValidationClientsideAdapters()
          .AddValidatorsFromAssemblyContaining<Program>(ServiceLifetime.Scoped);
    }
}
