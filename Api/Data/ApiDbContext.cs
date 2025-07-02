using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class ApiDbContext(DbContextOptions<ApiDbContext> options) : DbContext
{
    public DbSet<ProductModel> Products { get; set; } = null!;
    public DbSet<ProductVariantModel> ProductVariants { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        _ = modelBuilder.Entity<ProductModel>(static products =>
        {
            _ = products.HasKey(static p => p.Id);

            _ = products.HasMany(static p => p.Variants)
              .WithOne(static pv => pv.Product)
              .HasForeignKey(static pv => pv.ProductId)
              .OnDelete(DeleteBehavior.Cascade);
        });

        _ = modelBuilder.Entity<ProductVariantModel>().HasKey(static pv => pv.Id);
    }
}
