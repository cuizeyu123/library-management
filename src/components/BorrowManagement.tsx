import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

interface Book {
  BookID: number;
  Title: string;
  Author: string;
  AvailableCopies: number;
}

interface Reader {
  ReaderID: number;
  Name: string;
}

interface BorrowRecord {
  BorrowID: number;
  BookID: number;
  ReaderID: number;
  BorrowDate: string;
  DueDate: string;
  ReturnDate: string | null;
  Status: string;
  Fine: number;
  BookTitle: string;
  ReaderName: string;
}

const BorrowManagement: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([
    {
      BorrowID: 1,
      BookID: 1,
      ReaderID: 1,
      BorrowDate: '2024-03-20',
      DueDate: '2024-04-20',
      ReturnDate: null,
      Status: '借出',
      Fine: 0,
      BookTitle: '测试图书',
      ReaderName: '测试读者'
    }
  ]);
  const [books, setBooks] = useState<Book[]>([
    {
      BookID: 1,
      Title: '测试图书',
      Author: '测试作者',
      AvailableCopies: 5
    }
  ]);
  const [readers, setReaders] = useState<Reader[]>([
    {
      ReaderID: 1,
      Name: '测试读者'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, booksRes, readersRes] = await Promise.all([
        fetch('http://localhost:3001/api/borrow'),
        fetch('http://localhost:3001/api/books'),
        fetch('http://localhost:3001/api/readers')
      ]);
      
      const [recordsData, booksData, readersData] = await Promise.all([
        recordsRes.json(),
        booksRes.json(),
        readersRes.json()
      ]);

      setRecords(Array.isArray(recordsData) ? recordsData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
      setReaders(Array.isArray(readersData) ? readersData : []);
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
      setRecords([]);
      setBooks([]);
      setReaders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: '借阅ID',
      dataIndex: 'BorrowID',
      key: 'BorrowID',
    },
    {
      title: '图书名称',
      dataIndex: 'BookTitle',
      key: 'BookTitle',
    },
    {
      title: '读者姓名',
      dataIndex: 'ReaderName',
      key: 'ReaderName',
    },
    {
      title: '借阅日期',
      dataIndex: 'BorrowDate',
      key: 'BorrowDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '应还日期',
      dataIndex: 'DueDate',
      key: 'DueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '归还日期',
      dataIndex: 'ReturnDate',
      key: 'ReturnDate',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
    },
    {
      title: '罚金',
      dataIndex: 'Fine',
      key: 'Fine',
      render: (fine: number) => `¥${fine.toFixed(2)}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: BorrowRecord) => (
        <span>
          <Button 
            type="link" 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.Status === '借出' && (
            <Button 
              type="link" 
              onClick={() => handleReturn(record.BorrowID)}
            >
              归还
            </Button>
          )}
          <Button 
            type="link" 
            danger 
            onClick={() => handleDelete(record.BorrowID)}
          >
            删除
          </Button>
        </span>
      ),
    },
  ];

  const handleBorrow = async (values: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          DueDate: values.DueDate.format('YYYY-MM-DD'),
        }),
      });
      
      if (response.ok) {
        message.success('借阅成功');
        setModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        message.error('借阅失败');
      }
    } catch (error) {
      message.error('借阅失败');
    }
  };

  const handleEdit = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      ...record,
      DueDate: moment(record.DueDate),
    });
  };

  const handleUpdate = async (values: any) => {
    if (!selectedRecord) return;
    try {
      const response = await fetch(`http://localhost:3001/api/borrow/${selectedRecord.BorrowID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          DueDate: values.DueDate.format('YYYY-MM-DD'),
        }),
      });
      
      if (response.ok) {
        message.success('更新借阅记录成功');
        setEditModalVisible(false);
        setSelectedRecord(null);
        editForm.resetFields();
        fetchData();
      } else {
        message.error('更新借阅记录失败');
      }
    } catch (error) {
      message.error('更新借阅记录失败');
    }
  };

  const handleReturn = async (borrowId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/borrow/${borrowId}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        message.success('归还成功');
        fetchData();
      } else {
        message.error('归还失败');
      }
    } catch (error) {
      message.error('归还失败');
    }
  };

  const handleDelete = async (borrowId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/borrow/${borrowId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        message.success('删除成功');
        fetchData();
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
        新增借阅
      </Button>
      <Table
        columns={columns}
        dataSource={records}
        loading={loading}
        rowKey="BorrowID"
      />
      <Modal
        title="新增借阅"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleBorrow} layout="vertical">
          <Form.Item
            name="BookID"
            label="选择图书"
            rules={[{ required: true, message: '请选择图书' }]}
          >
            <Select>
              {books.map(book => (
                <Select.Option key={book.BookID} value={book.BookID}>
                  {book.Title} - {book.Author} (可借: {book.AvailableCopies})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="ReaderID"
            label="选择读者"
            rules={[{ required: true, message: '请选择读者' }]}
          >
            <Select>
              {readers.map(reader => (
                <Select.Option key={reader.ReaderID} value={reader.ReaderID}>
                  {reader.Name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="DueDate"
            label="应还日期"
            rules={[{ required: true, message: '请选择应还日期' }]}
          >
            <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < moment().startOf('day')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="编辑借阅记录"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="BookID"
            label="选择图书"
            rules={[{ required: true, message: '请选择图书' }]}
          >
            <Select>
              {books.map(book => (
                <Select.Option key={book.BookID} value={book.BookID}>
                  {book.Title} - {book.Author} (可借: {book.AvailableCopies})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="ReaderID"
            label="选择读者"
            rules={[{ required: true, message: '请选择读者' }]}
          >
            <Select>
              {readers.map(reader => (
                <Select.Option key={reader.ReaderID} value={reader.ReaderID}>
                  {reader.Name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="DueDate"
            label="应还日期"
            rules={[{ required: true, message: '请选择应还日期' }]}
          >
            <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < moment().startOf('day')} />
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

export default BorrowManagement;