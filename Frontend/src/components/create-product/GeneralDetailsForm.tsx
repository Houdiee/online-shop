import { Form, Input, Select, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';

const formItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as Easing } },
};

interface GeneralDetailsFormProps {
  availableTags: { value: string; label: string }[];
}

export default function GeneralDetailsForm({ availableTags }: GeneralDetailsFormProps) {
  return (
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
                { type: 'array', max: 5, message: 'Maximum of 5 tags allowed' },
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
  );
}
