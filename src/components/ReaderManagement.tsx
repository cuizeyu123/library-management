import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Reader {
  ReaderID: number;
  Name: string;
  Gender: string;
  Phone: string;
  Email: string;
  Address: string;
  RegisterDate: string;
  Status: string;
}

const ReaderManagement: React.FC = () => {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchReaders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/readers');
      const data = await response.json();
      setReaders(data);
    } catch (error) {
      message.error('获取读者列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReaders();
  }, []);

  const columns = [
    {
      title: '读者ID',
      dataIndex: 'ReaderID',
      key: 'ReaderID',
    },
    {
      title: '姓名',
      dataIndex: 'Name',
      key: 'Name',
    },
    {
      title: '性别',
      dataIndex: 'Gender',
      key: 'Gender',
    },
    {
      title: '电话',
      dataIndex: 'Phone',
      key: 'Phone',
    },
    {
      title: '邮箱',
      dataIndex: 'Email',
      key: 'Email',
    },
    {
      title: '地址',
      dataIndex: 'Address',
      key: 'Address',
    },
    {
      title: '注册日期',
      dataIndex: 'RegisterDate',
      key: 'RegisterDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Reader) => (
        <span>
          <Button 
            type="link" 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            onClick={() => handleDelete(record.ReaderID)}
          >
            删除
          </Button>
        </span>
      ),
    },
  ];

  const handleAdd = async (values: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/readers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        message.success('添加读者成功');
        setModalVisible(false);
        form.resetFields();
        fetchReaders();
      } else {
        message.error('添加读者失败');
      }
    } catch (error) {
      message.error('添加读者失败');
    }
  };

  const handleEdit = (reader: Reader) => {
    setSelectedReader(reader);
    setEditModalVisible(true);
    editForm.setFieldsValue(reader);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedReader) return;
    try {
      const response = await fetch(`http://localhost:3001/api/readers/${selectedReader.ReaderID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        message.success('更新读者成功');
        setEditModalVisible(false);
        setSelectedReader(null);
        editForm.resetFields();
        fetchReaders();
      } else {
        message.error('更新读者失败');
      }
    } catch (error) {
      message.error('更新读者失败');
    }
  };

  const handleDelete = async (readerId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/readers/${readerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        message.success('删除成功');
        fetchReaders();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        添加读者
      </Button>
      <Table
        columns={columns}
        dataSource={readers}
        loading={loading}
        rowKey="ReaderID"
      />
      <Modal
        title="添加读者"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item
            name="Name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="Gender" label="性别">
            <Input />
          </Form.Item>
          <Form.Item name="Phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="Email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="Address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="编辑读者"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedReader(null);
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="Name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="Gender" label="性别">
            <Input />
          </Form.Item>
          <Form.Item name="Phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="Email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="Address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReaderManagement;