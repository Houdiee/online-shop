import { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  message,
  Select,
  Row,
  Col,
  Divider,
  Space,
  Checkbox,
  Flex,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadFile } from 'antd/es/upload/interface';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import axios from 'axios';

interface FormVariant {
  name: string;
  price: number;
  discountedPrice: number | null;
  stockQuantity: number;
  photoUrls: UploadFile[];
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

export default function CreateProduct() {
  const [form] = Form.useForm<FormProduct>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [useSameImages, setUseSameImages] = useState(false);
  const [useSamePrices, setUseSamePrices] = useState(false);

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

      // Check if both 'tags' and 'newTag' are empty
      if (allTags.size === 0) {
        message.error('Please select at least one existing tag or create a new one.');
        setSubmitting(false);
        return;
      }

      const finalVariants = values.variants.map((variant, index) => {
        if (useSamePrices && index > 0) {
          const firstVariant = values.variants[0];
          return {
            ...variant,
            price: firstVariant.price,
            discountedPrice: firstVariant.discountedPrice,
          };
        }
        return variant;
      });

      const productToCreate = {
        name: values.name,
        description: values.description,
        tags: Array.from(allTags), // Convert Set back to Array for submission
        variants: finalVariants.map((v) => ({
          name: v.name,
          price: v.price,
          discountedPrice: v.discountedPrice,
          stockQuantity: v.stockQuantity,
        })),
      };

      const productResponse = await axios.post('http://localhost:5000/Products', productToCreate);
      const newProduct = productResponse.data;

      let photoPromises: Promise<any>[] = [];
      if (useSameImages) {
        const firstVariantData = values.variants[0];
        const variantId = newProduct.variants[0].id;

        if (!variantId) {
          throw new Error('Variant ID not found for the first variant');
        }

        const formData = new FormData();
        firstVariantData.photoUrls.forEach((file) => {
          if (file.originFileObj) {
            formData.append('files', file.originFileObj, file.name);
          }
        });

        if (firstVariantData.photoUrls.length > 0) {
          photoPromises = newProduct.variants.map((variant: any) =>
            axios.post(`http://localhost:5000/Products/images/${variant.id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
          );
        }
      } else {
        photoPromises = values.variants.map(async (variantData, index) => {
          const variantId = newProduct.variants[index].id;
          if (!variantId) {
            throw new Error(`Variant ID not found for index ${index}`);
          }

          const formData = new FormData();
          variantData.photoUrls.forEach((file) => {
            if (file.originFileObj) {
              formData.append('files', file.originFileObj, file.name);
            }
          });

          if (variantData.photoUrls.length > 0) {
            return axios.post(`http://localhost:5000/Products/images/${variantId}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          }
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

  useEffect(() => {
    if (useSamePrices) {
      const formValues = form.getFieldsValue();
      const firstVariantPrices = {
        price: formValues.variants?.[0]?.price,
        discountedPrice: formValues.variants?.[0]?.discountedPrice,
      };

      if (formValues.variants) {
        formValues.variants.forEach((_, index) => {
          if (index > 0) {
            form.setFieldValue(['variants', index, 'price'], firstVariantPrices.price);
            form.setFieldValue(['variants', index, 'discountedPrice'], firstVariantPrices.discountedPrice);
          }
        });
      }
    }
  }, [useSamePrices, form.getFieldsValue().variants?.[0]?.price, form.getFieldsValue().variants?.[0]?.discountedPrice]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as Easing } },
  };

  const formItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as Easing } },
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
              <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">General Product Details</h2>
                <Row gutter={24}>
                  <Col span={24} md={12}>
                    <motion.div variants={formItemVariants}>
                      <Form.Item
                        name="name"
                        label="Product Name"
                        rules={[
                          { required: true, message: 'Please enter a product name' },
                          { max: 256, message: 'Name is too long (max 256 characters)' },
                        ]}
                      >
                        <Input placeholder="e.g., Wireless Headphones" size="large" />
                      </Form.Item>
                    </motion.div>
                  </Col>
                  <Col span={24} md={12}>
                    <motion.div variants={formItemVariants}>
                      <Form.Item
                        name="tags"
                        label="Existing Tags (Max 5)"
                        rules={[
                          // Removed the required rule here
                          { type: 'array', max: 5, message: 'Maximum of 5 tags allowed' },
                          // Added the custom validator
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const newTag = getFieldValue('newTag');
                              if (!value?.length && !newTag) {
                                return Promise.reject(new Error('Please select at least one existing tag or create a new one.'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select existing tags"
                          size="large"
                          className="w-full"
                          options={availableTags}
                        />
                      </Form.Item>
                      <Form.Item
                        name="newTag"
                        label="New Tag Name (Optional)"
                        rules={[
                          { max: 50, message: 'Tag name is too long' },
                        ]}
                      >
                        <Input placeholder="e.g., new-product-line" />
                      </Form.Item>
                    </motion.div>
                  </Col>
                </Row>
                <motion.div variants={formItemVariants}>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[
                      { max: 1000, message: 'Description is too long (max 1000 characters)' },
                    ]}
                  >
                    <Input.TextArea rows={4} placeholder="Describe the product in detail..." />
                  </Form.Item>
                </motion.div>
              </div>

              <Divider className="my-8" />

              <h2 className="text-lg font-semibold text-gray-700 mb-4">Product Variants</h2>
              <Flex vertical>
                <Form.Item name="useSameImages" valuePropName="checked" noStyle>
                  <Checkbox
                    onChange={(e) => setUseSameImages(e.target.checked)}
                    className="!mb-4 text-gray-600 mr-4"
                  >
                    Use same images for all variants
                  </Checkbox>
                </Form.Item>
                <Form.Item name="useSamePrices" valuePropName="checked" noStyle>
                  <Checkbox
                    onChange={(e) => setUseSamePrices(e.target.checked)}
                    className="!mb-4 text-gray-600"
                  >
                    Use same prices for all variants
                  </Checkbox>
                </Form.Item>
              </Flex>
              <Form.List
                name="variants"
              >
                {(fields, { add, remove }) => (
                  <Space direction="vertical" className="w-full" size="large">
                    {fields.map(({ key, name, ...restField }, index) => (
                      <motion.div
                        key={key}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                      >
                        <Card
                          title={
                            <h3 className="font-semibold text-gray-700">
                              Variant {index + 1} {index === 0 && '(Default)'}
                            </h3>
                          }
                          className="w-full border-2 border-gray-200 rounded-lg shadow-sm bg-white"
                          extra={
                            index > 0 && (
                              <Button
                                type="text"
                                danger
                                onClick={() => {
                                  if (fields.length > 1) {
                                    remove(name);
                                  } else {
                                    message.warning('You must have at least one variant.');
                                  }
                                }}
                                icon={<DeleteOutlined />}
                                className="!text-red-500 hover:!text-red-700"
                              />
                            )
                          }
                        >
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'name']}
                                label="Variant Name"
                                rules={[
                                  { required: true, message: 'Please enter a variant name' },
                                  { max: 256, message: 'Variant name is too long' },
                                ]}
                              >
                                <Input placeholder="e.g., Black, Medium" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'stockQuantity']}
                                label="Stock Quantity"
                                rules={[
                                  { required: true, message: 'Please enter stock quantity' },
                                  { type: 'number', min: 0, message: 'Stock quantity cannot be negative' }
                                ]}
                              >
                                <InputNumber min={0} className="w-full" placeholder="e.g., 50" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'price']}
                                label="Price ($)"
                                rules={[
                                  { required: true, message: 'Please enter a price' },
                                  { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
                                ]}
                              >
                                <InputNumber
                                  min={0.01}
                                  step={0.01}
                                  className="w-full"
                                  placeholder="e.g., 99.99"
                                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  disabled={useSamePrices && index > 0}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'discountedPrice']}
                                label="Discounted Price ($)"
                                rules={[
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (value && value >= getFieldValue(['variants', name, 'price'])) {
                                        return Promise.reject(new Error('Discounted price must be less than the regular price'));
                                      }
                                      return Promise.resolve();
                                    },
                                  }),
                                ]}
                              >
                                <InputNumber
                                  min={0}
                                  step={0.01}
                                  className="w-full"
                                  placeholder="Optional"
                                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  disabled={useSamePrices && index > 0}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {(!useSameImages || index === 0) && (
                            <Form.Item
                              {...restField}
                              name={[name, 'photoUrls']}
                              label="Photos"
                              valuePropName="fileList"
                              getValueFromEvent={(e) => {
                                if (Array.isArray(e)) {
                                  return e;
                                }
                                return e?.fileList;
                              }}
                              rules={[
                                { required: true, message: 'Please upload at least one photo' },
                                {
                                  validator: (_, value) => {
                                    if (value && value.length > 3) {
                                      return Promise.reject(new Error('Maximum of 3 photos allowed'));
                                    }
                                    return Promise.resolve();
                                  }
                                }
                              ]}
                            >
                              <Upload
                                name="photo"
                                listType="picture-card"
                                multiple
                                maxCount={3}
                                beforeUpload={() => false}
                              >
                                <div>
                                  <PlusOutlined />
                                  <div className="mt-2 text-xs">Upload</div>
                                </div>
                              </Upload>
                            </Form.Item>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        className="!h-12 !border-2 !border-dashed !border-gray-300 !text-gray-600 hover:!border-blue-500 hover:!text-blue-500 transition-colors"
                      >
                        Add Another Variant
                      </Button>
                    </Form.Item>
                  </Space>
                )}
              </Form.List>

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
