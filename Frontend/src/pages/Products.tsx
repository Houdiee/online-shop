import { Col, Flex, Layout, Row } from "antd";
import ProductCard from "../components/products/ProductCard";
import { type Product, type ProductVariant } from "../types/product";
import FilterMenu from "../components/products/FilterMenu";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../main";
import Navbar from "../components/Navbar";
import { useSearchParams } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedSortKey, setSelectedSortKey] = useState<string>(searchParams.get("sort") || "sort-group-relevant");
  const [minPrice, setMinPrice] = useState<number>(Number(searchParams.get("minPrice")) || 0);
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get("maxPrice")) || 0);
  const [maxPriceRange, setMaxPriceRange] = useState<number>(1000);
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.getAll("tags") || []);

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

          if (maxPrice === 0) {
            setMaxPrice(maxPriceValue);
          }
          setMaxPriceRange(maxPriceValue);
        }
      }
      catch (error) {
        console.log("Failed to fetch initial data:", error);
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

    const newMaxPrice = Math.max(...filtered.map(p => p.variants[0]?.price || 0));
    if (maxPrice === 0 || newMaxPrice > maxPrice) {
      setMaxPrice(newMaxPrice);
    }

    setDisplayedProducts(filtered);

  }, [products, selectedSortKey, minPrice, maxPrice, selectedTags]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sort", selectedSortKey);
    params.set("minPrice", minPrice.toString());
    selectedTags.forEach(tag => params.append("tags", tag));
    setSearchParams(params);
  }, [selectedSortKey, minPrice, selectedTags, setSearchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("maxPrice", maxPrice.toString());
    setSearchParams(params);
  }, [maxPrice, searchParams, setSearchParams]);

  return (
    <Layout>
      <Navbar />
      <Flex vertical>
        <Row gutter={[15, 15]}>
          <Col xs={24} md={7} lg={7} xl={5}>
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

          <Col xs={24} md={17} lg={17} xl={19}>
            <Flex wrap gap={9} className="!w-full">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Flex>
          </Col>
        </Row>

      </Flex>
    </Layout>
  );
}

