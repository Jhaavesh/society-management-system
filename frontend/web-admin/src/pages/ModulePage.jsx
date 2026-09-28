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
  societies: {
    title: 'Societies',
    subtitle: 'Manage workspaces',
    action: 'Add Society',
    loader: 'societies',
    creator: 'createSociety',
    headers: [
      { key: 'name', label: 'Name' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
    ],
    fields: [
      { name: 'name', label: 'Society Name', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'state', label: 'State', type: 'text' },
      { name: 'pincode', label: 'Pincode', type: 'text' },
      { name: 'logoUrl', label: 'Logo URL', type: 'text' },
    ],
  },
  buildings: {
    title: 'Buildings',
    subtitle: 'Manage buildings and blocks',
    action: 'Add Building',
    loader: 'buildings',
    creator: 'createBuilding',
    headers: [
      { key: 'name', label: 'Name / Block' },
      { key: 'floors', label: 'Total Floors', align: 'center' },
    ],
    fields: [
      { name: 'name', label: 'Building Name', type: 'text', required: true },
      { name: 'floors', label: 'Total Floors', type: 'number', required: true },
    ],
  },
  flats: {
    title: 'Flats',
    subtitle: 'Manage residential units',
    action: 'Add Flat',
    loader: 'flats',
    creator: 'createFlat',
    headers: [
      { key: 'flatNumber', label: 'Flat Number' },
      { key: 'buildingId', label: 'Building ID' },
      { key: 'floor', label: 'Floor' },
      { key: 'status', label: 'Status' },
    ],
    fields: [
      { name: 'flatNumber', label: 'Flat Number', type: 'text', required: true },
      { name: 'buildingId', label: 'Building ID', type: 'text', required: true },
      { name: 'floor', label: 'Floor', type: 'number' },
      { name: 'wing', label: 'Wing', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['vacant', 'occupied'] },
    ],
  },
  residents: {
    title: 'Residents',
    subtitle: 'Manage society residents',
    action: 'Add Resident',
    loader: 'residents',
    creator: 'createResident',
    headers: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'flatId', label: 'Flat ID' },
      { key: 'phone', label: 'Phone' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'flatId', label: 'Flat ID', type: 'text', required: true },
    ],
  },
  billing: {
    title: 'Billing & Payments',
    subtitle: 'Manage maintenance bills and payments',
    action: 'Create Bill',
    loader: 'bills',
    creator: 'createBill',
    headers: [
      { key: 'flatId', label: 'Flat ID' },
      { key: 'month', label: 'Month' },
      { key: 'year', label: 'Year' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'status', label: 'Status', align: 'center' },
      { key: 'dueDate', label: 'Due Date' },
    ],
    fields: [
      { name: 'flatId', label: 'Flat ID', type: 'text', required: true },
      { name: 'month', label: 'Month', type: 'number', required: true },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
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
      { key: 'flatId', label: 'Flat ID' },
      { key: 'priority', label: 'Priority', align: 'center' },
      { key: 'status', label: 'Status', align: 'center' },
    ],
    fields: [
      { name: 'flatId', label: 'Flat ID (Optional)', type: 'text' },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'normal', 'high'] },
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
      { key: 'flatId', label: 'Flat ID' },
      { key: 'visitDate', label: 'Visit Date' },
      { key: 'status', label: 'Status', align: 'center' },
    ],
    fields: [
      { name: 'flatId', label: 'Flat ID (Optional)', type: 'text' },
      { name: 'visitorName', label: 'Visitor Name', type: 'text', required: true },
      { name: 'visitorMobile', label: 'Visitor Mobile', type: 'text' },
      { name: 'purpose', label: 'Purpose', type: 'text' },
      { name: 'visitDate', label: 'Visit Date', type: 'datetime-local', required: true },
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
      { key: 'validTill', label: 'Valid Till' },
      { key: 'createdAt', label: 'Published' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'validTill', label: 'Valid Till', type: 'date' },
    ],
  },
  reports: {
    title: 'Reports',
    subtitle: 'Financial reports and analytics',
    action: 'Generate Report',
    loader: 'payments',
    creator: 'createPayment',
    headers: [
      { key: 'billId', label: 'Bill ID' },
      { key: 'flatId', label: 'Flat ID' },
      { key: 'amountPaid', label: 'Amount Paid', align: 'right' },
      { key: 'method', label: 'Method' },
      { key: 'createdAt', label: 'Date' },
    ],
    fields: [
      { name: 'billId', label: 'Bill ID', type: 'text', required: true },
      { name: 'flatId', label: 'Flat ID', type: 'text', required: true },
      { name: 'amountPaid', label: 'Amount Paid', type: 'number', required: true },
      { name: 'method', label: 'Payment Method', type: 'select', options: ['cash', 'cheque', 'online'] },
      { name: 'transactionRef', label: 'Transaction Reference', type: 'text' },
      { name: 'date', label: 'Date', type: 'date', required: true },
    ],
  },
};

export function ModulePage({ module, societyId, society }) {
  const config = moduleConfigs[module];
  if (!config) return <div>Module not found</div>;

  const { records, loading, error, refetch, createRecord } = useModuleData(module, societyId, config.loader, config.creator);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!Array.isArray(records)) {
    console.error(`CRASH AVERTED for ${module}: records is not an array. Value:`, records);
    return (
      <div className='module-error'>
        <Icon name='alert-circle' />
        <p>Invalid data format received from API for {config.title}</p>
        <pre>{JSON.stringify(records, null, 2)}</pre>
      </div>
    );
  }

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
