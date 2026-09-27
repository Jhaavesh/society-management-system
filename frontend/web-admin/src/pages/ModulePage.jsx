import { useState } from 'react';
import { useModuleData } from '../hooks/useModuleData.js';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters.js';
import { formatDate, formatDateTime, getRelativeTime } from '../utils/date.js';
import { recordToRow } from '../utils/recordToRow.js';
import { Card } from '../components/ui/Card.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { SearchInput } from '../components/forms/SearchInput.jsx';
import { RecordForm } from '../components/forms/RecordForm.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Icon } from '../components/ui/Icon.jsx';

const moduleConfigs = {
  residents: {
    title: 'Residents',
    subtitle: 'Manage society residents',
    action: 'Add Resident',
    loader: 'residents',
    creator: 'createResident',
    headers: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'flatId', label: 'Flat' },
      { key: 'role', label: 'Role' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john@example.com' },
      { name: 'flatId', label: 'Flat ID', type: 'text', required: true, placeholder: 'A-101' },
      { name: 'role', label: 'Role', type: 'select', required: true, placeholder: 'Select role', options: ['Owner', 'Tenant', 'Admin'] },
    ],
  },
  billing: {
    title: 'Billing & Payments',
    subtitle: 'Manage maintenance bills and payments',
    action: 'Create Bill',
    loader: 'bills',
    creator: 'createBill',
    headers: [
      { key: 'flatId', label: 'Flat' },
      { key: 'month', label: 'Month' },
      { key: 'year', label: 'Year' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'status', label: 'Status', align: 'center' },
      { key: 'dueDate', label: 'Due Date' },
    ],
    fields: [
      { name: 'flatId', label: 'Flat ID', type: 'text', required: true, placeholder: 'A-101' },
      { name: 'month', label: 'Month', type: 'number', required: true, placeholder: '1' },
      { name: 'year', label: 'Year', type: 'number', required: true, placeholder: '2024' },
      { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '5000' },
      { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
    ],
  },
  complaints: {
    title: 'Complaints',
    subtitle: 'Track and resolve complaints',
    action: 'File Complaint',
    loader: 'complaints',
    creator: 'createComplaint',
    headers: [
      { key: 'category', label: 'Category' },
      { key: 'flatId', label: 'Flat' },
      { key: 'priority', label: 'Priority', align: 'center' },
      { key: 'status', label: 'Status', align: 'center' },
    ],
    fields: [
      { name: 'category', label: 'Category', type: 'select', required: true, placeholder: 'Select category', options: ['Maintenance', 'Security', 'Cleanliness', 'Noise', 'Other'] },
      { name: 'flatId', label: 'Flat ID', type: 'text', required: true, placeholder: 'A-101' },
      { name: 'priority', label: 'Priority', type: 'select', required: true, placeholder: 'Select priority', options: ['Low', 'Medium', 'High', 'Urgent'] },
      { name: 'status', label: 'Status', type: 'select', required: true, placeholder: 'Select status', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
    ],
  },
  visitors: {
    title: 'Visitors',
    subtitle: 'Manage visitor entries',
    action: 'Add Visitor',
    loader: 'visitors',
    creator: 'createVisitor',
    headers: [
      { key: 'visitorName', label: 'Visitor Name' },
      { key: 'flatId', label: 'Flat' },
      { key: 'visitDate', label: 'Visit Date' },
      { key: 'status', label: 'Status', align: 'center' },
    ],
    fields: [
      { name: 'visitorName', label: 'Visitor Name', type: 'text', required: true, placeholder: 'John Visitor' },
      { name: 'flatId', label: 'Flat ID', type: 'text', required: true, placeholder: 'A-101' },
      { name: 'visitDate', label: 'Visit Date', type: 'datetime-local', required: true },
      { name: 'status', label: 'Status', type: 'select', required: true, placeholder: 'Select status', options: ['Expected', 'Checked In', 'Checked Out'] },
    ],
  },
  notices: {
    title: 'Notices',
    subtitle: 'Manage society notices',
    action: 'Create Notice',
    loader: 'notices',
    creator: 'createNotice',
    headers: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'priority', label: 'Priority', align: 'center' },
      { key: 'publishDate', label: 'Published' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Notice Title' },
      { name: 'content', label: 'Content', type: 'textarea', required: true, placeholder: 'Notice content...' },
      { name: 'category', label: 'Category', type: 'select', required: true, placeholder: 'Select category', options: ['General', 'Maintenance', 'Event', 'Emergency', 'Payment'] },
      { name: 'priority', label: 'Priority', type: 'select', required: true, placeholder: 'Select priority', options: ['Low', 'Medium', 'High'] },
    ],
  },
  reports: {
    title: 'Reports',
    subtitle: 'Financial reports and analytics',
    action: 'Generate Report',
    loader: 'payments',
    creator: 'createPayment',
    headers: [
      { key: 'flatId', label: 'Flat' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'method', label: 'Method' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status', align: 'center' },
    ],
    fields: [
      { name: 'flatId', label: 'Flat ID', type: 'text', required: true, placeholder: 'A-101' },
      { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '5000' },
      { name: 'method', label: 'Payment Method', type: 'select', required: true, placeholder: 'Select method', options: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'] },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', required: true, placeholder: 'Select status', options: ['Pending', 'Completed', 'Failed', 'Refunded'] },
    ],
  },
};

export function ModulePage({ module, societyId, society }) {
  const config = moduleConfigs[module];
  if (!config) return <div>Module not found</div>;

  const { records, loading, error, refetch, createRecord } = useModuleData(module, societyId);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;
    return Object.values(record).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const tableRows = filteredRecords.map((record) => recordToRow(record, config.headers));

  const stats = [
    { label: 'Total Records', value: formatNumber(records.length) },
    { label: 'This Month', value: formatNumber(records.filter((r) => {
      const date = new Date(r.createdAt || r.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length) },
    { label: 'Pending', value: formatNumber(records.filter((r) => r.status === 'Pending' || r.status === 'Open').length) },
  ];

  const handleSubmit = async (formData) => {
    try {
      await createRecord(formData);
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className='module-view'>
      <div className='module-heading'>
        <div>
          <a href='#' className='back-link' onClick={() => window.history.back()}>
            <Icon name='chevron-left' /> Back
          </a>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <Button className='primary' onClick={() => setShowForm(true)}>
          <Icon name='plus' /> {config.action}
        </Button>
      </div>

      <div className='module-stats'>
        {stats.map((stat, idx) => (
          <div key={idx} className='module-stat'>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className='module-toolbar'>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search records...'
        />
        <span>{filteredRecords.length} of {records.length} records</span>
      </div>

      <Card>
        <Table
          headers={config.headers}
          rows={tableRows}
          emptyMessage='No records found'
        />
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={config.action}>
        <RecordForm
          fields={config.fields}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
