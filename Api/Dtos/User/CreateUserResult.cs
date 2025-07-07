namespace Api.Dtos.User;

public class CreateUserResult
{
  public bool IsSuccess { get; set; }
  public ICollection<string> Errors { get; private set; } = [];


  public static CreateUserResult Success()
  {
    return new CreateUserResult
    {
      IsSuccess = true,
    };
  }


  public static CreateUserResult Failure(params string[] errors)
  {
    return new CreateUserResult
    {
      IsSuccess = false,
      Errors = errors,
    };
  }
}
