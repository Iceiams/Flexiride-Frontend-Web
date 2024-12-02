import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  message,
  Modal,
  Form,
  InputNumber,
} from "antd";
import moment from "moment";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import api from "../../api/axiosConfig";

const { RangePicker } = DatePicker;
const { Option } = Select;

const VoucherList = () => {
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateRange: null,
    include_deleted: false, // Lọc voucher đã xóa
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form] = Form.useForm();

  // Lấy dữ liệu tùy chọn dịch vụ
  const fetchServiceOptions = async () => {
    try {
      const { data } = await api.get(
        "http://localhost:3000/service-option/getAllServicesWithOptions"
      );
      if (data.success) {
        const formattedOptions = data.data.flatMap((service) =>
          service.service_options.map((option) => ({
            value: option._id,
            label: `${service.name} - ${option.name}`,
          }))
        );
        setServiceOptions(formattedOptions);
      } else {
        message.error("Failed to fetch service options");
      }
    } catch (error) {
      message.error(`Error fetching service options: ${error.message}`);
    }
  };

  // Lấy danh sách voucher
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current || 1,
        limit: pagination.pageSize || 10,
        include_deleted: filters.include_deleted ? "true" : "false",
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.dateRange) {
        params.start_date = filters.dateRange[0]?.toISOString();
        params.end_date = filters.dateRange[1]?.toISOString();
      }

      const { data } = await api.get("voucher/view-voucher", { params });

      if (data.success) {
        setVouchers(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
        }));
      } else {
        message.error("Failed to fetch vouchers");
      }
    } catch (error) {
      message.error(
        "Failed to fetch vouchers: " +
          (error.response?.data?.message || error.message)
      );
    }
    setLoading(false);
  };

  // Tạo mới hoặc cập nhật voucher
  const handleCreateOrUpdate = async (values) => {
    try {
      const voucherData = {
        ...values,
        start_date: values.dateRange[0].toISOString(),
        end_date: values.dateRange[1].toISOString(),
      };
      delete voucherData.dateRange;

      let response;
      if (editingVoucher) {
        response = await api.put(
          `/voucher/update-voucher/${editingVoucher._id}`,
          voucherData
        );
      } else {
        response = await api.post("/voucher/create-voucher", voucherData);
      }

      if (response.data.success) {
        message.success(
          `Voucher ${editingVoucher ? "updated" : "created"} successfully`
        );
        setModalVisible(false);
        form.resetFields();
        fetchVouchers();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error(
        `Failed to ${editingVoucher ? "update" : "create"} voucher: ${
          error.message
        }`
      );
    }
  };

  // Xóa voucher
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/voucher/delete-voucher/${id}`);
      if (response.data.success) {
        message.success("Voucher deleted successfully");
        fetchVouchers();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error(`Failed to delete voucher: ${error.message}`);
    }
  };

  // Khôi phục voucher
  const handleRestore = async (id) => {
    try {
      const response = await api.put(`/restore-voucher/${id}`);
      if (response.data.success) {
        message.success("Voucher restored successfully");
        fetchVouchers();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error(`Failed to restore voucher: ${error.message}`);
    }
  };

  // Hiển thị form tạo/cập nhật
  const showCreateModal = () => {
    setEditingVoucher(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      ...record,
      dateRange: [moment(record.start_date), moment(record.end_date)],
    });
    setModalVisible(true);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        if (record.is_deleted) {
          return (
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>Đã xóa</span>
          );
        }

        const statusColors = {
          active: "#52c41a", // Xanh lá cây
          inactive: "#bfbfbf", // Xám
          expired: "#ff4d4f", // Đỏ
        };

        const statusLabels = {
          active: "Hoạt động",
          inactive: "Không hoạt động",
          expired: "Hết hạn",
        };

        return (
          <span style={{ color: statusColors[status], fontWeight: "bold" }}>
            {statusLabels[status] || status}
          </span>
        );
      },
    },
    {
      title: "Giá trị giảm",
      dataIndex: "value",
      key: "value",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, record) => `${record.used_quantity}/${record.total_quantity}`,
    },
    {
      title: "Hạn sử dụng",
      key: "period",
      render: (_, record) =>
        `${new Date(record.start_date).toLocaleDateString()} - 
         ${new Date(record.end_date).toLocaleDateString()}`,
    },
    {
      title: "Dịch vụ áp dụng",
      key: "service_options",
      render: (_, record) =>
        record.applicable_service_options?.length
          ? record.applicable_service_options
              .map((option) => option.name)
              .join(", ")
          : "Không áp dụng",
    },
    {
      title: "",
      key: "actions",
      render: (_, record) => (
        <Space>
          {!record.is_deleted ? (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
              />
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(record._id)}
              />
            </>
          ) : (
            <Button type="primary" onClick={() => handleRestore(record._id)}>
              Khôi phục
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const voucherForm = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleCreateOrUpdate}
      initialValues={{
        status: "inactive",
      }}
    >
      {/* Validate Tên voucher */}
      <Form.Item
        name="name"
        label="Tên voucher"
        rules={[
          { required: true, message: "Hãy nhập tên voucher!" },
          { max: 255, message: "Tên voucher không được dài quá 255 ký tự!" },
        ]}
      >
        <Input />
      </Form.Item>

      {/* Validate Mô tả */}
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ max: 500, message: "Mô tả không được dài hơn 500 ký tự!" }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      {/* Validate Giá trị giảm */}
      <Form.Item
        name="value"
        label="Số tiền giảm"
        rules={[
          { required: true, message: "Giá trị giảm giá là bắt buộc." },
          {
            type: "number",
            min: 1,
            message: "Giá trị giảm giá phải lớn hơn 0.",
          },
          {
            type: "number",
            max: 1000000,
            message: "Giá trị giảm giá không được vượt quá 1,000,000 VND.",
          },
        ]}
      >
        <InputNumber min={1} max={1000000} style={{ width: "100%" }} />
      </Form.Item>

      {/* Validate Thời gian hiệu lực */}
      <Form.Item
        name="dateRange"
        label="Thời gian hiệu lực"
        rules={[
          {
            required: true,
            // message: "Ngày bắt đầu và kết thúc là bắt buộc.",
          },
          {
            validator: (_, value) => {
              if (!value)
                return Promise.reject("Ngày bắt đầu và kết thúc là bắt buộc.");
              const [start, end] = value;
              const now = moment();

              if (start <= now) {
                return Promise.reject(
                  "Ngày bắt đầu phải là ngày trong tương lai."
                );
              }

              if (start >= end) {
                return Promise.reject(
                  "Ngày bắt đầu phải nhỏ hơn ngày kết thúc."
                );
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <RangePicker showTime style={{ width: "100%" }} />
      </Form.Item>

      {/* Validate Tổng số lượng */}
      <Form.Item
        name="total_quantity"
        label="Số lượng tổng cộng"
        rules={[
          { required: true, message: "Tổng số lượng là bắt buộc." },
          { type: "number", min: 0, message: "Tổng số lượng không được âm." },
          {
            type: "number",
            max: 10000,
            message: "Tổng số lượng không được vượt quá 10,000.",
          },
        ]}
      >
        <InputNumber min={0} max={10000} style={{ width: "100%" }} />
      </Form.Item>

      {/* Validate Dịch vụ áp dụng */}
      <Form.Item name="applicable_service_options" label="Dịch vụ áp dụng">
        <Select
          mode="multiple"
          placeholder="Chọn các dịch vụ áp dụng"
          options={serviceOptions}
        />
      </Form.Item>
    </Form>
  );

  useEffect(() => {
    fetchServiceOptions();
    fetchVouchers();
  }, [pagination.current, pagination.pageSize, JSON.stringify(filters)]);

  return (
    <Card title="Quản Lí Mã Khuyến Mãi">
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Tạo Voucher
        </Button>
        <Input.Search
          placeholder="Tìm kiếm voucher..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              search: e.target.value || undefined,
            }))
          }
          style={{ width: 300 }}
        />
        <Select
          placeholder="Trạng thái"
          value={filters.status}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value || undefined }))
          }
          style={{ width: 150 }}
          allowClear
        >
          <Option value="active">Hoạt động</Option>
          <Option value="inactive">Không hoạt động</Option>
          <Option value="expired">Hết hạn</Option>
        </Select>
        <RangePicker
          value={filters.dateRange}
          onChange={(dates) =>
            setFilters((prev) => ({ ...prev, dateRange: dates || undefined }))
          }
        />
        <Button
          type="default"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              include_deleted: !prev.include_deleted,
            }))
          }
        >
          {filters.include_deleted ? "Ẩn đã xóa" : "Hiện đã xóa"}
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={vouchers}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize,
            }));
          },
        }}
        loading={loading}
        locale={{
          emptyText: filters.include_deleted
            ? "Không có voucher nào đã xóa"
            : "Không có voucher nào",
        }}
      />
      <Modal
        title={editingVoucher ? "Cập Nhật Voucher" : "Tạo Voucher"}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        {voucherForm}
      </Modal>
    </Card>
  );
};

export default VoucherList;
