using Resend;

namespace Api.Extensions;

public static class ResendServices
{
  public static IServiceCollection AddResendServices(this IServiceCollection services, IConfiguration configuration)
  {
    services.AddOptions();

    services.AddHttpClient<ResendClient>();

    services.Configure<ResendClientOptions>(options =>
    {
      options.ApiToken = configuration["ApiKeys.Resend"]!;
    });

    return services;
  }
}
