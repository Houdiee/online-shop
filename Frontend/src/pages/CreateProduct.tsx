import { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  Form,
  Button,
  message,
  Divider,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import axios from 'axios';

import GeneralDetailsForm from '../components/create-product/GeneralDetailsForm';
import ProductVariantsForm from '../components/create-product/ProductVariantsForm';
import Navbar from '../components/Navbar';

interface FormProduct {
  name: string;
  description: string | null;
  tags: string[];
  variants: any[];
  newTag?: string;
  useSameImages?: boolean;
  useSamePrices?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as Easing } },
};

export default function CreateProduct() {
  const [form] = Form.useForm<FormProduct>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [availableTags, setAvailableTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tags');
        const fetchedTags = response.data.map((tag: string) => ({
          value: tag,
          label: tag,
        }));
        setAvailableTags(fetchedTags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        message.error('Failed to load available tags.');
      }
    };
    fetchTags();
  }, []);

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

      const productToCreate = {
        name: values.name,
        description: values.description,
        tags: Array.from(allTags),
        variants: values.variants.map((v) => ({
          name: v.name,
          price: v.price,
          discountedPrice: v.discountedPrice,
          stockQuantity: v.stockQuantity,
        })),
      };

      const productResponse = await axios.post('http://localhost:5000/Products', productToCreate);
      const newProduct = productResponse.data;

      let photoPromises: Promise<any>[] = [];
      const useSameImages = form.getFieldValue('useSameImages');

      if (useSameImages) {
        const firstVariantData = values.variants[0];
        if (firstVariantData?.photoUrls?.length > 0) {
          const variantId = newProduct.variants[0].id;
          if (!variantId) throw new Error('Variant ID not found for the first variant');
          const formData = new FormData();
          firstVariantData.photoUrls.forEach((file) => {
            if (file.originFileObj) {
              formData.append('files', file.originFileObj, file.name);
            }
          });
          photoPromises = newProduct.variants.map((variant: any) =>
            axios.post(`http://localhost:5000/Products/images/${variant.id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
          );
        }
      } else {
        photoPromises = values.variants.map(async (variantData, index) => {
          if (variantData?.photoUrls?.length > 0) {
            const variantId = newProduct.variants[index].id;
            if (!variantId) throw new Error(`Variant ID not found for index ${index}`);
            const formData = new FormData();
            variantData.photoUrls.forEach((file) => {
              if (file.originFileObj) {
                formData.append('files', file.originFileObj, file.name);
              }
            });
            return axios.post(`http://localhost:5000/Products/images/${variantId}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          }
          return Promise.resolve();
        });
      }

      await Promise.all(photoPromises);

      message.success('Product created successfully!');
      form.resetFields();
      navigate('/');
    } catch (error) {
      console.error('Failed to create product or upload images:', error);
      message.error('Failed to create product. Please check the form data.');
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
            title={<h1 className="text-2xl font-bold text-gray-800">Create a New Product</h1>}
            className="rounded-xl shadow-lg border-none bg-gray-50"
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
                  {submitting ? 'Creating Product...' : 'Create Product'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
