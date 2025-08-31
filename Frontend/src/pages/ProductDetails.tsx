import { Breadcrumb, Col, Divider, Flex, Layout, Row, Space, Button } from "antd";
import { useEffect, useState } from "react";
import ProductImageCarousel from "../components/product-details/ProductImageCarousel";
import AddToCartButton from "../components/product-details/AddToCartButton";
import ProductDescription from "../components/product-details/ProductDescription";
import ProductInfo from "../components/product-details/ProductInfo";
import ProductVariantSelector from "../components/product-details/ProductVariantSelector";
import QuantitySelector from "../components/product-details/QuantitySelector";
import type { Product, ProductVariant } from "../types/product";
import axios from "axios";
import { API_BASE_URL } from "../main";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Content } from "antd/es/layout/layout";
import { EditOutlined } from "@ant-design/icons";

export default function ProductDetails() {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdmin, setIsAdmin] = useState(true);

  const { id, variantId } = useParams<{ id: string; variantId?: string }>();
  const navigate = useNavigate();

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    navigate(`/products/${id}/${variant.id}`);
  };

  const handleEditClick = () => {
    navigate(`/admin/edit/${id}`);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        const fetchedProduct: Product = response.data;
        setProduct(fetchedProduct);

        if (!variantId) {
          navigate(`/products/${id}/${fetchedProduct.variants[0].id}`, { replace: true });
          return;
        }

        const initialVariant = fetchedProduct.variants.find(v => v.id === Number(variantId)) || fetchedProduct.variants[0];
        setSelectedVariant(initialVariant);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProduct();
  }, [id, variantId, navigate]);

  if (!product || !selectedVariant) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <Navbar />
      <Content className="!bg-white">
        <div className="px-4 py-8 md:px-8 lg:px-16 xl:px-24">
          <div className="max-w-screen-xl mx-auto">
            <Row gutter={[64, 24]} justify="center" align="stretch">
              {/* Left side (aka image) */}
              <Col xs={24} md={24} lg={12} xl={12}>
                <Flex vertical className="h-full">
                  <Breadcrumb
                    items={[
                      { title: <Link to="/products">Products</Link>, },
                      { title: product.name, },
                      { title: selectedVariant.name, },
                    ]}
                  />
                  <ProductImageCarousel photoUrls={selectedVariant.photoUrls} />
                </Flex>
              </Col>

              {/* Right side (aka title, description, variant, etc.) */}
              <Col xs={24} md={24} lg={12} xl={12}>
                <Flex vertical gap={10} className="h-full">
                  <Flex justify="space-between" align="center">
                    <ProductInfo name={product.name} price={selectedVariant.price.toFixed()} tags={product.tags} />
                    {isAdmin && (
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEditClick}
                        className="!bg-green-500 hover:!bg-green-600 !text-white !border-green-500"
                      >
                        Edit
                      </Button>
                    )}
                  </Flex>

                  <Divider className="!mb-0" />

                  <Space direction="vertical" size="large" className="w-full">
                    <ProductVariantSelector variants={product.variants} selectedVariant={selectedVariant} onSelectVariant={handleVariantSelect} />
                    <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
                  </Space>

                  <Flex>
                    <ProductDescription description={product.description} />
                  </Flex>

                  <AddToCartButton productVariantId={selectedVariant.id} quantity={quantity} />
                </Flex>
              </Col>
            </Row >
          </div>
        </div>
      </Content>
    </Layout>
  );
}
