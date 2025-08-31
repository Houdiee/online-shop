import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Upload, Card, Row, Col, Space, Checkbox, Flex } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import type { FormInstance } from 'antd/es/form';
import type { UploadFile } from 'antd/es/upload/interface';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as Easing } },
};

interface ProductVariantsFormProps {
  form: FormInstance<any>;
}

interface VariantValues {
  name: string;
  price: number;
  discountedPrice: number | null;
  stockQuantity: number;
  photoUrls?: UploadFile[];
}

interface FormValues {
  useSameImages?: boolean;
  useSamePrices?: boolean;
  variants?: VariantValues[];
}

export default function ProductVariantsForm({ form }: ProductVariantsFormProps) {
  const [useSameImages, setUseSameImages] = useState<boolean>(false);
  const [useSamePrices, setUseSamePrices] = useState<boolean>(false);

  useEffect(() => {
    // Synchronize local state with form initial values
    const initialValues: FormValues = form.getFieldsValue(['useSameImages', 'useSamePrices']);
    setUseSameImages(initialValues.useSameImages || false);
    setUseSamePrices(initialValues.useSamePrices || false);
  }, [form]);

  useEffect(() => {
    if (useSamePrices) {
      const formValues: FormValues = form.getFieldsValue();
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
  }, [useSamePrices, form.getFieldsValue().variants?.[0]?.price, form.getFieldsValue().variants?.[0]?.discountedPrice, form]);

  return (
    <>
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
      <Form.List name="variants">
        {(fields, { add, remove }) => (
          <Space direction="vertical" className="w-full" size="large">
            {fields.map(({ key, name, ...restField }, index) => (
              <motion.div key={key} initial="hidden" animate="visible" variants={cardVariants}>
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
                        onClick={() => remove(name)}
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
                          { type: 'number', min: 0, message: 'Stock quantity cannot be negative' },
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
                          { type: 'number', min: 0.01, message: 'Price must be greater than 0' },
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
                                return Promise.reject(
                                  new Error('Discounted price must be less than the regular price')
                                );
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
                      getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                      rules={[
                        { required: true, message: 'Please upload at least one photo' },
                        {
                          validator: (_, value) => {
                            if (value && value.length > 3) {
                              return Promise.reject(new Error('Maximum of 3 photos allowed'));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Upload name="photo" listType="picture-card" multiple maxCount={3} beforeUpload={() => false}>
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
    </>
  );
}
