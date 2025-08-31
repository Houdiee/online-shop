import { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  Form,
  Button,
  message,
  Divider,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import axios from 'axios';
import type { UploadFile } from 'antd/es/upload/interface';

import GeneralDetailsForm from '../components/create-product/GeneralDetailsForm';
import ProductVariantsForm from '../components/create-product/ProductVariantsForm';
import Navbar from '../components/Navbar';
import type { Product, ProductVariant } from '../types/product';

interface FormVariant extends Omit<ProductVariant, 'id' | 'photoUrls'> {
  id?: number;
  photoUrls?: UploadFile[];
}

interface FormProduct {
  name: string;
  description: string | null;
  tags: string[];
  variants: FormVariant[];
  newTag?: string;
  useSameImages?: boolean;
  useSamePrices?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as Easing } },
};

export default function CreateProduct() {
  const { productId } = useParams<{ productId: string }>();
  const [form] = Form.useForm<FormProduct>();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(!!productId);
  const navigate = useNavigate();

  const [availableTags, setAvailableTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (productId) {
          setLoading(true);
          const productResponse = await axios.get<Product>(`http://localhost:5000/Products/${productId}`);
          const productData = productResponse.data;

          const formattedVariants = productData.variants.map(variant => ({
            ...variant,
            photoUrls: (variant.photoUrls || []).map((url, index) => ({
              uid: `${variant.id}-${index}`,
              name: `image-${index}.png`,
              status: 'done' as 'done',
              url: url,
            })),
          }));

          form.setFieldsValue({
            name: productData.name,
            description: productData.description,
            tags: productData.tags,
            variants: formattedVariants,
          });
          message.success('Product details loaded for editing.');
        }

        const tagsResponse = await axios.get('http://localhost:5000/tags');
        const fetchedTags = tagsResponse.data.map((tag: string) => ({
          value: tag,
          label: tag,
        }));
        setAvailableTags(fetchedTags);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('Failed to load product details or tags.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, form]);

  const onFinish = async (values: FormProduct) => {
    setSubmitting(true);
    try {
      const allTags = new Set([...(values.tags || [])]);
      if (values.newTag) {
        allTags.add(values.newTag);
      }

      if (allTags.size === 0) {
        message.error('Please select at least one existing tag or create a new one.');
        setSubmitting(false);
        return;
      }

      const productToSave = {
        name: values.name,
        description: values.description,
        tags: Array.from(allTags),
        variants: values.variants.map((v: any) => ({
          id: v.id,
          name: v.name,
          price: v.price,
          discountedPrice: v.discountedPrice,
          stockQuantity: v.stockQuantity,
        })),
      };

      let productResponse;
      if (productId) {
        productResponse = await axios.put(`http://localhost:5000/Products/${productId}`, productToSave);
      } else {
        productResponse = await axios.post('http://localhost:5000/Products', productToSave);
      }

      const savedProduct = productResponse.data;

      const photoPromises: Promise<any>[] = [];
      const useSameImages = form.getFieldValue('useSameImages');

      if (useSameImages) {
        const firstVariantData = values.variants[0];
        const newFilesToUpload = firstVariantData.photoUrls?.filter(file => !file.url) || [];
        if (newFilesToUpload.length > 0) {
          const variantId = savedProduct.variants[0].id;
          const formData = new FormData();
          newFilesToUpload.forEach((file) => {
            if (file.originFileObj) {
              formData.append('files', file.originFileObj, file.name);
            }
          });
          photoPromises.push(
            ...savedProduct.variants.map((variant: any) =>
              axios.put(`http://localhost:5000/Products/images/${variant.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
            )
          );
        }
      } else {
        values.variants.forEach((variantData, index) => {
          const newFilesToUpload = variantData.photoUrls?.filter(file => !file.url) || [];
          if (newFilesToUpload.length > 0) {
            const variantId = savedProduct.variants[index].id;
            const formData = new FormData();
            newFilesToUpload.forEach((file) => {
              if (file.originFileObj) {
                formData.append('files', file.originFileObj, file.name);
              }
            });
            photoPromises.push(
              axios.put(`http://localhost:5000/Products/images/${variantId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
            );
          }
        });
      }

      await Promise.all(photoPromises);

      message.success(`Product ${productId ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      navigate('/');
    } catch (error) {
      console.error(`Failed to ${productId ? 'update' : 'create'} product or upload images:`, error);
      message.error(`Failed to ${productId ? 'update' : 'create'} product. Please check the form data.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout className="bg-gray-100 min-h-screen font-sans">
      <Navbar />
      <div className="p-8 lg:p-12 w-full flex justify-center items-center">
        <motion.div
          className="w-full max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card
            title={<h1 className="text-2xl font-bold text-gray-800">{productId ? 'Edit Product' : 'Create a New Product'}</h1>}
            className="rounded-xl shadow-lg border-none bg-gray-50"
            loading={loading}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              initialValues={{ variants: [{}] }}
            >
              <GeneralDetailsForm availableTags={availableTags} />
              <Divider className="my-8" />
              <ProductVariantsForm form={form} />
              <Divider className="my-8" />
              <Form.Item className="mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={submitting}
                  className="!h-12 !text-lg !font-semibold !rounded-lg"
                >
                  {submitting ? (productId ? 'Updating Product...' : 'Creating Product...') : (productId ? 'Update Product' : 'Create Product')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
