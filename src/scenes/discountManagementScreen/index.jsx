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
    include_deleted: false,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form] = Form.useForm();
  const formatDate = (date) => moment(date).format("DD/MM/YYYY");

  const fetchServiceOptions = async () => {
    try {
      const { data } = await api.get(
        "http://localhost:3000/service-option/getAllServicesWithOptions"
      );
      if (data.success) {
        const formattedOptions = data.data.flatMap((service) =>
          service.service_options
            .filter((option) => option?._id)
            .map((option) => ({
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
      const cleanedOptions = values.applicable_service_options?.filter(
        (option) => option !== null && option !== undefined
      );

      const voucherData = {
        ...values,
        applicable_service_options: cleanedOptions,
        type: "fixed",
        min_order_value: values.min_order_value || 0,
        start_date:
          editingVoucher?.start_date === values.dateRange[0]?.toISOString()
            ? editingVoucher.start_date
            : values.dateRange[0]?.toISOString(),
        end_date: values.dateRange[1]?.toISOString(),
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
          editingVoucher?.status === "expired" &&
            voucherData.end_date > new Date()
            ? "Trạng thái voucher đã được đặt lại thành 'Không hoạt động'."
            : `Voucher ${editingVoucher ? "đã cập nhật" : "đã tạo"} thành công!`
        );
        setModalVisible(false);
        form.resetFields();
        fetchVouchers();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error(`Lỗi: ${error.message}`);
    }
  };

  // Xóa voucher
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/voucher/delete-voucher/${id}`);
      if (response.data.success) {
        message.success("Cập nhật thành công!");
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
        message.success("Khôi phục thành công!");
        fetchVouchers();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error(`Failed to restore voucher: ${error.message}`);
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      const response = await api.put(`/voucher/update-voucher/${id}`, {
        status: newStatus,
      });

      if (response.data.success) {
        message.success("Cập nhật trạng thái thành công!");
        fetchVouchers();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái: " + error.message);
    }
  };

  const confirmDelete = (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa voucher này?",
      onOk: () => handleDelete(id),
    });
  };

  const showCreateModal = () => {
    setEditingVoucher(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record) => {
    const validOptions = record.applicable_service_options
      ?.filter((option) => option && option._id)
      .map((option) => option._id);

    form.setFieldsValue({
      ...record,
      dateRange: [moment(record.start_date), moment(record.end_date)],
      type: record.type, // Hiển thị loại voucher
      min_order_value: record.min_order_value, // Hiển thị giá trị tối thiểu
      applicable_service_options: validOptions,
    });
    setEditingVoucher(record);
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
        const now = moment();
        const isExpired = moment(record.end_date).isBefore(now);

        const statusLabel = isExpired
          ? "Hết hạn"
          : status === "active"
          ? "Hoạt động"
          : "Không hoạt động";

        return (
          <Select
            value={statusLabel}
            style={{ width: 120 }}
            onChange={(newStatus) => {
              if (!isExpired) {
                handleChangeStatus(
                  record._id,
                  newStatus === "Hoạt động" ? "active" : "inactive"
                );
              }
            }}
            options={[
              { value: "Hoạt động", label: "Hoạt động" },
              { value: "Không hoạt động", label: "Không hoạt động" },
            ]}
            disabled={isExpired}
          />
        );
      },
    },
    {
      title: "Loại Voucher",
      dataIndex: "type",
      key: "type",
      render: (type) =>
        type === "fixed" ? "Giảm giá cố định" : "Không xác định",
    },
    {
      title: "Giá trị tối thiểu",
      dataIndex: "min_order_value",
      key: "min_order_value",
      render: (value) =>
        `${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value || 0)}`,
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
      render: (_, record) => {
        const isOutOfStock = record.used_quantity >= record.total_quantity;
        return (
          <span style={{ color: isOutOfStock ? "red" : "inherit" }}>
            {record.used_quantity}/{record.total_quantity}
          </span>
        );
      },
    },

    {
      title: "Hạn sử dụng",
      key: "period",
      render: (_, record) =>
        `${formatDate(record.start_date)} - ${formatDate(record.end_date)}`,
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
                onClick={() => confirmDelete(record._id)}
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
        type: "fixed",
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

      {/* Loại voucher */}
      <Form.Item
        name="type"
        label="Loại voucher"
        initialValue="fixed"
        rules={[{ required: true, message: "Loại voucher là bắt buộc." }]}
      >
        <Input disabled value="fixed" /> {/* Không cho phép chỉnh sửa */}
      </Form.Item>

      {/* Giá trị tối thiểu */}
      <Form.Item
        name="min_order_value"
        label="Giá trị tối thiểu"
        rules={[
          { required: true, message: "Hãy nhập giá trị tối thiểu!" },
          {
            type: "number",
            min: 0,
            message: "Giá trị tối thiểu không được âm.",
          },
        ]}
      >
        <InputNumber
          min={0}
          step={1000}
          style={{ width: "100%" }}
          placeholder="Nhập giá trị tối thiểu"
        />
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
            min: 1000,
            message: "Giá trị giảm giá phải lớn hơn hoặc bằng 1,000 VND.",
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
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || !value[0] || !value[1]) {
                return Promise.reject("Ngày bắt đầu và kết thúc là bắt buộc.");
              }
              const [start, end] = value;
              const now = moment().startOf("day");

              // Cho phép ngày bắt đầu là hôm nay hoặc ngày tương lai
              if (
                (!editingVoucher ||
                  editingVoucher.start_date !== start.toISOString()) &&
                start.isBefore(now)
              ) {
                return Promise.reject(
                  "Ngày bắt đầu phải là hôm nay hoặc ngày trong tương lai."
                );
              }

              if (start.isAfter(end, "day")) {
                return Promise.reject(
                  "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc."
                );
              }

              return Promise.resolve();
            },
          }),
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
      <Form.Item
        name="applicable_service_options"
        label="Dịch vụ áp dụng"
        rules={[
          {
            validator: (_, value) => {
              if (!value || value.length === 0) {
                return Promise.reject(
                  "Vui lòng chọn ít nhất một dịch vụ áp dụng."
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Chọn các dịch vụ áp dụng"
          options={serviceOptions} // Đảm bảo options được load từ API
          style={{ width: "100%" }}
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
          <Option value="">Tất cả</Option> {/* Thêm tùy chọn Tất cả */}
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
