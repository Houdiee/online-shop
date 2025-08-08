import { Col, Flex, Row } from "antd";
import ProductCard from "../components/products/ProductCard";
import { type Product, type ProductVariant } from "../types/product";
import FilterMenu from "../components/products/FilterMenu";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../main";
import Navbar from "../components/Navbar";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [selectedSortKey, setSelectedSortKey] = useState<string>("sort-group-relevant");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [maxPriceRange, setMaxPriceRange] = useState<number>(1000);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, tagsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/tags`)
        ]);

        const fetchedProducts = productsResponse.data;
        setProducts(fetchedProducts);
        setCategories(tagsResponse.data);

        fetchedProducts
          .flatMap((p: Product) => p.variants)
          .map((v: ProductVariant) => v.price)
          .filter((price: number) => price !== undefined && price !== null);

        if (fetchedProducts.length > 0) {
          const firstVariantPrices = fetchedProducts
            .map((p: Product) => p.variants[0]?.price)
            .filter((price: number | undefined): price is number => price !== undefined && price !== null);

          const maxPriceValue = firstVariantPrices.length > 0 ? Math.max(...firstVariantPrices) : 500;

          setMaxPrice(maxPriceValue);
          setMaxPriceRange(maxPriceValue);
        }
      }
      catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;

    filtered = filtered.filter(product => {
      const firstVariantPrice = product.variants[0]?.price || 0;
      return firstVariantPrice >= minPrice && firstVariantPrice <= maxPrice;
    });

    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        product.tags.some(tag => selectedTags.includes(tag))
      );
    }

    if (selectedSortKey === "sort-group-low-to-high") {
      filtered.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (selectedSortKey === "sort-group-high-to-low") {
      filtered.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    } else if (selectedSortKey === "sort-group-newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setDisplayedProducts(filtered);

  }, [products, selectedSortKey, minPrice, maxPrice, selectedTags]);

  return (
    <>
      <Flex vertical>
        <Navbar />
        <Row gutter={[50, 50]}>
          <Col xs={24} md={8} lg={7} xl={6}>
            <FilterMenu
              className="bg-white rounded-lg font-inter h-full"
              selectedSortKey={selectedSortKey}
              onSortChange={setSelectedSortKey}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={({ min, max }) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              tags={categories}
              selectedTags={selectedTags}
              onTagChange={setSelectedTags}
              maxRange={maxPriceRange}
            />
          </Col>

          <Col xs={24} md={16} lg={17} xl={18}>
            <Flex wrap gap={14}>
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Flex>
          </Col>
        </Row>

      </Flex>
    </>
  );
}

