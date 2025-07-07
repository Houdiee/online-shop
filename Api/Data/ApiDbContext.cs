using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class ApiDbContext(DbContextOptions<ApiDbContext> options) : DbContext(options)
{
  public DbSet<UserModel> Users { get; set; } = null!;

  public DbSet<ShoppingCartModel> ShoppingCarts { get; set; } = null!;
  public DbSet<ShoppingCartItemModel> ShoppingCartItems { get; set; } = null!;

  public DbSet<ProductModel> Products { get; set; } = null!;
  public DbSet<ProductVariantModel> ProductVariants { get; set; } = null!;

  public DbSet<OrderModel> Orders { get; set; } = null!;
  public DbSet<OrderItemModel> OrderItems { get; set; } = null!;

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // User
    _ = modelBuilder.Entity<UserModel>(static user =>
    {
      _ = user.HasKey(static u => u.Id);

      _ = user.HasIndex(static u => u.Email).IsUnique();

      _ = user
            .HasOne(static u => u.ShoppingCart)
            .WithOne(static cart => cart.User)
            .HasForeignKey<ShoppingCartModel>(static cart => cart.UserId)
            .OnDelete(DeleteBehavior.Cascade);

      _ = user
            .HasMany(static u => u.Orders)
            .WithOne(static ord => ord.User)
            .HasForeignKey(static ord => ord.UserId);
    });


    // ShoppingCart and ShoppingCartItems
    _ = modelBuilder.Entity<ShoppingCartModel>(static shoppingCart =>
    {
      _ = shoppingCart.HasKey(static cart => cart.Id);

      _ = shoppingCart
                .HasMany(static cart => cart.Items)
                .WithOne(static item => item.ShoppingCart)
                .HasForeignKey(static item => item.ShoppingCartId);
    });
    _ = modelBuilder.Entity<ShoppingCartItemModel>().HasKey(static cartItem => cartItem.Id);


    // Product and ProductVariants
    _ = modelBuilder.Entity<ProductModel>(static products =>
    {
      _ = products.HasKey(static prod => prod.Id);

      _ = products
              .HasMany(static prod => prod.Variants)
              .WithOne(static prodvar => prodvar.Product)
              .HasForeignKey(static prodvar => prodvar.ProductId)
              .OnDelete(DeleteBehavior.Cascade);
    });
    _ = modelBuilder.Entity<ProductVariantModel>().HasKey(static productVar => productVar.Id);


    // Orders and OrderItems
    _ = modelBuilder.Entity<OrderModel>(static order =>
    {
      _ = order.HasKey(static ord => ord.Id);

      _ = order
                .Property(static ord => ord.Status)
                .HasConversion<string>();

      _ = order
                .HasMany(static ord => ord.OrderItems)
                .WithOne(static item => item.Order)
                .HasForeignKey(static item => item.OrderId);
    });
    _ = modelBuilder.Entity<OrderItemModel>().HasKey(static orderItem => orderItem.Id);
  }
}
