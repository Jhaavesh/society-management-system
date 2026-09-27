// src/types/index.js
export const Theme = {
  navy: '#111b31',
  blue: '#6572ef',
  ink: '#172033',
  muted: '#7b8496',
  line: '#e9edf3',
  canvas: '#f7f8fb',
  mint: '#43c6a5',
  amber: '#f4b45b',
  rose: '#ef7184',
};

export const SESSION_KEY = 'societyOS.resident.session';

export const TABS = [
  { name: 'Home', icon: 'grid' },
  { name: 'Bills', icon: 'card' },
  { name: 'Notices', icon: 'notifications' },
  { name: 'Requests', icon: 'add-circle' },
  { name: 'Profile', icon: 'person' },
];

export const REQUEST_KINDS = ['complaint', 'visitor'];

/**
 * @typedef {Object} ResidentSession
 * @property {string} token
 * @property {Object} user
 * @property {string} user.name
 * @property {string} [user.email]
 * @property {string} [user.role]
 * @property {string} [user.flatId]
 * @property {string[]} [user.societyIds]
 */

/**
 * @typedef {Object} FlatData
 * @property {string} flatNumber
 * @property {string} [wing]
 */

/**
 * @typedef {Object} BillData
 * @property {string} [_id]
 * @property {number} month
 * @property {number} year
 * @property {number} amount
 * @property {string} status
 */

/**
 * @typedef {Object} PaymentData
 * @property {string} [_id]
 * @property {string} paymentDate
 * @property {number} amountPaid
 * @property {string} [method]
 */

/**
 * @typedef {Object} NoticeData
 * @property {string} [_id]
 * @property {string} title
 * @property {string} content
 * @property {string} createdAt
 */

/**
 * @typedef {Object} VisitorData
 * @property {string} [_id]
 * @property {string} visitorName
 * @property {string} visitorMobile
 * @property {string} visitDate
 * @property {string} status
 */

/**
 * @typedef {Object} ResidentData
 * @property {Object} [society]
 * @property {string} society.name
 * @property {FlatData} [flat]
 * @property {BillData[]} [bills]
 * @property {PaymentData[]} [payments]
 * @property {NoticeData[]} [notices]
 * @property {VisitorData[]} [visitors]
 */
