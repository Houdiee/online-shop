using System.Text.Json.Serialization;

namespace Api.Models;

public class ShoppingCartModel
{
    public int Id { get; set; }

    public required ICollection<ShoppingCartItemModel> Items { get; set; }

    [JsonIgnore]
    public int UserId { get; set; }
    [JsonIgnore]
    public UserModel User { get; set; } = null!;
}

