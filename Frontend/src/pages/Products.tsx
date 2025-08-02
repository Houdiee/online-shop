import { Col, Flex, Row } from "antd";
import ProductCard from "../components/products/ProductCard";
import { type Product } from "../types/product";
import FilterMenu from "../components/products/FilterMenu";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../main";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [selectedSortKey, setSelectedSortKey] = useState<string>("sort-group-relevant");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, tagsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/tags`)
        ]);
        setProducts(productsResponse.data);
        setCategories(tagsResponse.data);
      } catch (error) {
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
    </>
  );
}

