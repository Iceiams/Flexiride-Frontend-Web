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
  Tooltip,
  Checkbox,
} from "antd";
import moment from "moment";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { QRCodeCanvas } from "qrcode.react";
import api from "../../api/axiosConfig";
import axios from "axios";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const VoucherList = () => {
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
    dateRange: null,
    include_deleted: false, // Thêm bộ lọc hiển thị dữ liệu đã xóa
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form] = Form.useForm();

  // Trạng thái hiển thị mã QR
  const [showQRCode, setShowQRCode] = useState({});

  const handleToggleQRCode = (id, customId) => {
    setShowQRCode((prev) => {
      const isCurrentlyShown = prev[id];
      if (isCurrentlyShown) return { ...prev, [id]: null }; // Ẩn mã QR
      return { ...prev, [id]: customId }; // Hiển thị mã QR
    });
  };

  const fetchServices = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/service-option/getAllServicesWithOptions"
      );
      if (data.success) {
        const formattedServices = data.data.map((service) => ({
          value: service._id,
          label: service.name,
        }));
        setServices(formattedServices);

        // Lấy tùy chọn dịch vụ từ mỗi service
        const formattedServiceOptions = data.data.flatMap((service) =>
          service.service_options.map((option) => ({
            value: option._id,
            label: `${service.name} - ${option.name}`,
          }))
        );
        setServiceOptions(formattedServiceOptions);
      } else {
        message.error("Failed to fetch services");
      }
    } catch (error) {
      message.error(`Error fetching services: ${error.message}`);
    }
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current || 1,
        limit: pagination.pageSize || 10,
        include_deleted: filters.include_deleted ? "true" : "false", // Gửi trạng thái checkbox
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
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

  const handleStatusChange = async (voucherId, newStatus) => {
    try {
      const response = await api.put(`/voucher/update-voucher/${voucherId}`, {
        status: newStatus,
      });
      if (response.data.success) {
        message.success("Cập nhật trạng thái thành công!");
        fetchVouchers(); // Cập nhật lại danh sách
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error(`Lỗi khi cập nhật trạng thái: ${error.message}`);
    }
  };

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

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/voucher/delete-voucher/${id}`);
      if (response.data.success) {
        message.success("Voucher deleted successfully");
        setVouchers((prev) => prev.filter((voucher) => voucher._id !== id));
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error(`Failed to delete voucher: ${error.message}`);
    }
  };
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
      title: "ID",
      key: "id",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <div>{record.custom_id}</div>
          {showQRCode[record.custom_id] ? (
            <QRCodeCanvas value={showQRCode[record.custom_id]} size={54} />
          ) : (
            <Button
              type="primary"
              style={{
                backgroundColor: "#FFA500",
                borderColor: "#FFA500",
                color: "#FFF",
              }}
              onClick={() =>
                handleToggleQRCode(record.custom_id, record.custom_id)
              }
            >
              QR Code
            </Button>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 75,
      render: (status, record) => {
        if (record.is_deleted) {
          return <span style={{ color: "red" }}>Đã xóa</span>;
        }
        const isExpired = new Date(record.end_date) < new Date();
        if (isExpired) {
          return <span style={{ color: "blue" }}>Hết hạn</span>;
        }
        return (
          <Select
            value={status}
            onChange={(newStatus) => handleStatusChange(record._id, newStatus)}
            style={{ width: 120 }}
          >
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Không hoạt động</Option>
          </Select>
        );
      },
    },

    {
      title: "Thứ tự",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Điểm",
      dataIndex: "points_required",
      key: "points_required",
    },
    {
      title: "Loại voucher",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const types = {
          percentage: "Percentage",
          fixed: "Fixed Amount",
          free_trip: "Free Trip",
          discounted_seat: "Discounted Seat",
          priority_service: "Priority Service",
        };
        return types[type] || type;
      },
    },
    {
      title: "Số lần/1 khách",
      dataIndex: "limit_per_user",
      key: "limit_per_user",
    },
    {
      title: "Giá trị & Giảm tối đa",
      key: "value",
      render: (_, record) => {
        const value =
          record.type === "percentage"
            ? `${record.value}%`
            : `${record.value.toLocaleString()} VND`;
        return (
          <div>
            <div>{value}</div>
            {record.max_discount && (
              <Tooltip
                title={`Max Discount: ${record.max_discount.toLocaleString()} VND`}
              >
                <span style={{ color: "gray" }}>
                  (Max: {record.max_discount.toLocaleString()} VND)
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    // {
    //   title: "Dịch vụ áp dụng",
    //   key: "services",
    //   render: (_, record) => (
    //     <div>
    //       {record.applicable_services?.map((service) => (
    //         <span key={service._id} style={{ display: "block" }}>
    //           {service.name}
    //         </span>
    //       ))}
    //     </div>
    //   ),
    // },
    {
      title: "Điều kiện",
      dataIndex: "min_order_value",
      key: "min_order_value",
      render: (value) => `${value.toLocaleString()} VND`,
    },
    {
      title: "Hạn sử dụng",
      key: "period",
      render: (_, record) =>
        `${new Date(record.start_date).toLocaleDateString()} - 
         ${new Date(record.end_date).toLocaleDateString()}`,
    },

    {
      title: "Phương thức thanh toán",
      key: "payment_methods",
      render: (_, record) =>
        record.payment_methods?.length
          ? record.payment_methods.join(", ")
          : "Không áp dụng",
    },
    // {
    //   title: "Dịch vụ áp dụng",
    //   key: "services",
    //   render: (_, record) =>
    //     record.applicable_services?.length
    //       ? record.applicable_services.map((service) => service.name).join(", ")
    //       : "Không áp dụng",
    // },
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
      title: "Số mã voucher",
      key: "quantity",
      render: (_, record) => `${record.used_quantity}/${record.total_quantity}`,
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
                onClick={() =>
                  Modal.confirm({
                    title: "Confirm delete",
                    content: "Do you want to delete this voucher?",
                    okText: "Yes",
                    cancelText: "No",
                    onOk: () => handleDelete(record._id),
                  })
                }
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
        type: "percentage",
        limit_per_user: 1,
        priority: 0,
      }}
    >
      <Form.Item
        name="name"
        label="Tên voucher"
        rules={[{ required: true, message: "Hãy nhập tên voucher!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Mô tả">
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item
        name="type"
        label="Loại voucher"
        rules={[{ required: true, message: "Hãy chọn loại voucher!" }]}
      >
        <Select>
          <Option value="percentage">Percentage</Option>
          <Option value="fixed">Fixed Amount</Option>
          <Option value="free_trip">Free Trip</Option>
          <Option value="discounted_seat">Discounted Seat</Option>
          <Option value="priority_service">Priority Service</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="value"
        label="Giá trị"
        rules={[
          { required: true, message: "Hãy nhập giá trị!" },
          {
            type: "number",
            min: 0,
            message: "Giá trị phải lớn hơn hoặc bằng 0!",
          },
        ]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="max_discount" label="Giảm giá tối đa">
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="Nhập số tiền tối đa (nếu có)"
        />
      </Form.Item>

      <Form.Item
        name="dateRange"
        label="Thời gian hiệu lực"
        rules={[
          { required: true, message: "Hãy chọn thời gian hiệu lực!" },
          {
            validator: (_, value) =>
              value && value[0] <= value[1]
                ? Promise.resolve()
                : Promise.reject("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!"),
          },
        ]}
      >
        <RangePicker showTime style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="total_quantity"
        label="Tổng số lượng"
        rules={[
          { required: true, message: "Hãy nhập tổng số lượng!" },
          {
            type: "number",
            min: 0,
            message: "Số lượng phải lớn hơn hoặc bằng 0!",
          },
        ]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="points_required"
        label="Điểm yêu cầu"
        rules={[
          { required: true, message: "Hãy nhập điểm yêu cầu!" },
          { type: "number", min: 0, message: "Điểm phải lớn hơn hoặc bằng 0!" },
        ]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="min_order_value"
        label="Giá trị đơn hàng tối thiểu"
        rules={[
          { required: true, message: "Hãy nhập giá trị đơn hàng tối thiểu!" },
          {
            type: "number",
            min: 0,
            message: "Giá trị đơn hàng phải lớn hơn hoặc bằng 0!",
          },
        ]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      {/* <Form.Item name="applicable_services" label="Dịch vụ áp dụng">
        <Select
          mode="multiple"
          placeholder="Chọn các dịch vụ"
          options={services}
        />
      </Form.Item> */}

      <Form.Item
        name="applicable_service_options"
        label="Tùy chọn dịch vụ áp dụng"
      >
        <Select
          mode="multiple"
          placeholder="Chọn các tùy chọn dịch vụ"
          options={serviceOptions}
        />
      </Form.Item>

      <Form.Item name="payment_methods" label="Phương thức thanh toán">
        <Select
          mode="multiple"
          placeholder="Chọn phương thức thanh toán"
          options={[
            { value: "credit_card", label: "Credit Card" },
            { value: "cash", label: "Cash" },
          ]}
        />
      </Form.Item>

      <Form.Item name="priority" label="Thứ tự ưu tiên">
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="Ưu tiên cao hơn với số nhỏ hơn"
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Trạng thái"
        rules={[{ required: true, message: "Hãy chọn trạng thái!" }]}
      >
        <Select>
          <Option value="active">Hoạt động</Option>
          <Option value="inactive">Không hoạt động</Option>
          <Option value="expired" disabled>
            Hết hạn (Tự động)
          </Option>
        </Select>
      </Form.Item>
    </Form>
  );

  useEffect(() => {
    fetchServices();
    fetchVouchers();
  }, [pagination.current, pagination.pageSize, JSON.stringify(filters)]);

  return (
    <Card title="Quản Lí Mã Khuyến Mãi">
      <Space style={{ marginBottom: 16, marginRight: 20 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Tạo Voucher Mới
        </Button>
        <Checkbox
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              include_deleted: e.target.checked,
            }))
          }
        >
          Hiển thị đã xóa
        </Checkbox>
      </Space>
      <Space>
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

        <Select
          placeholder="Loại voucher"
          value={filters.type}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, type: value || undefined }))
          }
          style={{ width: 200 }}
          allowClear
        >
          <Option value="percentage">Percentage</Option>
          <Option value="fixed">Fixed Amount</Option>
          <Option value="free_trip">Free Trip</Option>
          <Option value="discounted_seat">Discounted Seat</Option>
          <Option value="priority_service">Priority Service</Option>
        </Select>
        <RangePicker
          value={filters.dateRange}
          onChange={(dates) =>
            setFilters((prev) => ({ ...prev, dateRange: dates || undefined }))
          }
        />
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
