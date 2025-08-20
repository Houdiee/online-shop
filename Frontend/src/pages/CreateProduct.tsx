import { useState } from 'react';
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
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadFile } from 'antd/es/upload/interface';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';

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
}

export default function CreateProduct() {
  const [form] = Form.useForm<FormProduct>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const uploadPhoto = async (file: UploadFile): Promise<string> => {
    return new Promise((resolve) => {
      console.log('Simulating file upload for:', file.name);
      setTimeout(() => {
        resolve(`https://placehold.co/400x400/1890ff/ffffff?text=${encodeURIComponent(file.name)}`);
      }, 500);
    });
  };

  const onFinish = async (values: FormProduct) => {
    setSubmitting(true);
    try {
      const processedVariants = await Promise.all(values.variants.map(async (variant) => {
        const photoUrls = await Promise.all(variant.photoUrls.map(async (file) => {
          if (file.url) {
            return file.url;
          }
          return uploadPhoto(file);
        }));

        return {
          ...variant,
          photoUrls,
        };
      }));

      const productData = {
        ...values,
        variants: processedVariants,
      };

      console.log('Final product data to be sent:', productData);

      // In a real application, you would make the API call here
      // const response = await axios.post('/api/products', productData);
      // console.log('Product created successfully:', response.data);

      message.success('Product created successfully!');
      form.resetFields();
      navigate('/');

    } catch (error) {
      console.error('Failed to create product:', error);
      message.error('Failed to create product. Please check the form data.');
    } finally {
      setSubmitting(false);
    }
  };

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
              initialValues={{ variants: [{}] }} // Ensure at least one variant is present
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
                        label="Tags (Max 5)"
                        rules={[
                          { required: true, message: 'Please select at least one tag' },
                          { type: 'array', max: 5, message: 'Maximum of 5 tags allowed' },
                        ]}
                      >
                        <Select
                          mode="tags"
                          placeholder="e.g., electronics, audio"
                          size="large"
                          className="w-full"
                        />
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
                                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
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
                                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

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
