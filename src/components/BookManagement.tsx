import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Book {
  BookID: number;
  ISBN: string;
  Title: string;
  Author: string;
  Publisher: string;
  PublishYear: number;
  Category: string;
  TotalCopies: number;
  AvailableCopies: number;
  Location: string;
}

const BookManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      message.error('获取图书列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const columns = [
    {
      title: '图书ID',
      dataIndex: 'BookID',
      key: 'BookID',
    },
    {
      title: 'ISBN',
      dataIndex: 'ISBN',
      key: 'ISBN',
    },
    {
      title: '书名',
      dataIndex: 'Title',
      key: 'Title',
    },
    {
      title: '作者',
      dataIndex: 'Author',
      key: 'Author',
    },
    {
      title: '出版社',
      dataIndex: 'Publisher',
      key: 'Publisher',
    },
    {
      title: '出版年份',
      dataIndex: 'PublishYear',
      key: 'PublishYear',
    },
    {
      title: '分类',
      dataIndex: 'Category',
      key: 'Category',
    },
    {
      title: '总藏书量',
      dataIndex: 'TotalCopies',
      key: 'TotalCopies',
    },
    {
      title: '可借数量',
      dataIndex: 'AvailableCopies',
      key: 'AvailableCopies',
    },
    {
      title: '馆藏位置',
      dataIndex: 'Location',
      key: 'Location',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Book) => (
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
            onClick={() => handleDelete(record.BookID)}
          >
            删除
          </Button>
        </span>
      ),
    },
  ];

  const handleAdd = async (values: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        message.success('添加图书成功');
        setModalVisible(false);
        form.resetFields();
        fetchBooks();
      } else {
        message.error('添加图书失败');
      }
    } catch (error) {
      message.error('添加图书失败');
    }
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setEditModalVisible(true);
    editForm.setFieldsValue(book);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedBook) return;
    try {
      const response = await fetch(`http://localhost:3001/api/books/${selectedBook.BookID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        message.success('更新图书成功');
        setEditModalVisible(false);
        setSelectedBook(null);
        editForm.resetFields();
        fetchBooks();
      } else {
        message.error('更新图书失败');
      }
    } catch (error) {
      message.error('更新图书失败');
    }
  };

  const handleDelete = async (bookId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        message.success('删除成功');
        fetchBooks();
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
        添加图书
      </Button>
      <Table
        columns={columns}
        dataSource={books}
        loading={loading}
        rowKey="BookID"
      />
      <Modal
        title="添加图书"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item
            name="ISBN"
            label="ISBN"
            rules={[{ required: true, message: '请输入ISBN' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="Publisher" label="出版社">
            <Input />
          </Form.Item>
          <Form.Item name="PublishYear" label="出版年份">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="Category" label="分类">
            <Input />
          </Form.Item>
          <Form.Item name="TotalCopies" label="总藏书量" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="Location" label="馆藏位置">
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
        title="编辑图书"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedBook(null);
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="ISBN"
            label="ISBN"
            rules={[{ required: true, message: '请输入ISBN' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="Publisher" label="出版社">
            <Input />
          </Form.Item>
          <Form.Item name="PublishYear" label="出版年份">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="Category" label="分类">
            <Input />
          </Form.Item>
          <Form.Item name="TotalCopies" label="总藏书量">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="Location" label="馆藏位置">
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

export default BookManagement;