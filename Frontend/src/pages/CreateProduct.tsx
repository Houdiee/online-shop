import { useState } from 'react';
import axios from 'axios';
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
  Space,
  Divider,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadFile } from 'antd/es/upload/interface';
import Navbar from '../components/Navbar';

interface CreateVariantRequest {
  name: string;
  price: number;
  discountedPrice: number | null;
  stockQuantity: number;
  photoUrls: string[];
}

interface CreateProductRequest {
  name: string;
  description: string | null;
  tags: string[];
  variants: CreateVariantRequest[];
}

export default function CreateProduct() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Function to handle the two-step photo upload process
  const uploadPhoto = async (file: UploadFile): Promise<string> => {
    // This is a placeholder for a real API call.
    // Replace this with your actual backend upload logic.
    console.log('Simulating file upload for:', file.name);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://placehold.co/400x400/000000/FFFFFF?text=${encodeURIComponent(file.name)}`);
      }, 500);
    });
  };

  const onFinish = async (values: CreateProductRequest) => {
    setSubmitting(true);
    try {
      // Process photo uploads for each variant
      const processedVariants = await Promise.all(values.variants.map(async (variant) => {
        const photoUrls = await Promise.all(variant.photoUrls.map(async (file) => {
          if (file.url) {
            return file.url; // Use existing URL if already uploaded
          }
          return uploadPhoto(file); // Upload new file and get URL
        }));
        return {
          ...variant,
          photoUrls,
        };
      }));

      // Create the final request body
      const productData = {
        ...values,
        variants: processedVariants,
      };

      console.log('Final product data to be sent:', productData);

      // This is the actual API call.
      // In a real application, you would uncomment this line and provide a valid backend.
      // const response = await axios.post(`${API_BASE_URL}/products`, productData);
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

  return (
    <Layout>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen font-sans">
        <Card
          title="Add a New Product"
          className="rounded-lg shadow-sm max-w-4xl mx-auto"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* General Product Details */}
            <h2 className="text-lg font-semibold mb-4">Product Details</h2>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[
                    { required: true, message: 'Please enter a product name' },
                    { max: 256, message: 'Name is too long (max 256 characters)' },
                  ]}
                >
                  <Input placeholder="e.g., Wireless Headphones" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="tags"
                  label="Tags (Max 5)"
                  rules={[
                    { required: true, message: 'Please select at least one tag' },
                    { type: 'array', max: 5, message: 'Maximum of 5 tags allowed' },
                  ]}
                >
                  <Select mode="tags" placeholder="e.g., electronics, audio" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { max: 1000, message: 'Description is too long (max 1000 characters)' },
              ]}
            >
              <Input.TextArea rows={4} placeholder="Describe the product..." />
            </Form.Item>

            <Divider />

            {/* Product Variants Section */}
            <h2 className="text-lg font-semibold mb-4">Product Variants</h2>
            <Form.List
              name="variants"
              rules={[
                { required: true, message: 'Please add at least one variant' },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      className="mb-4 bg-gray-50 rounded-lg shadow-sm"
                      extra={
                        <Button
                          type="text"
                          danger
                          onClick={() => remove(name)}
                          icon={<DeleteOutlined />}
                        />
                      }
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Variant Name"
                          rules={[
                            { required: true, message: 'Please enter a variant name' },
                            { max: 256, message: 'Variant name is too long (max 256 characters)' },
                          ]}
                        >
                          <Input placeholder="e.g., Black, Medium" />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
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
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
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
                              />
                            </Form.Item>
                          </Col>
                        </Row>
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
                              <div className="mt-2">Upload</div>
                            </div>
                          </Upload>
                        </Form.Item>
                      </Space>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Variant
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item className="mt-6">
              <Button type="primary" htmlType="submit" block loading={submitting}>
                {submitting ? 'Creating Product...' : 'Create Product'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}

