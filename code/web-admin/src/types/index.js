/**
 * @typedef {Object} Society
 * @property {string} id - Society ID
 * @property {string} _id - MongoDB ID
 * @property {string} name - Society name
 * @property {string} city - City
 * @property {string} state - State
 * @property {number} homes - Number of homes
 * @property {number} rate - Collection rate
 * @property {boolean} active - Active status
 */

/**
 * @typedef {Object} DashboardKPIs
 * @property {number} homes - Total homes
 * @property {number} collected - Collected amount
 * @property {number} openRequests - Open requests count
 * @property {number} collectionRate - Collection rate percentage
 */

/**
 * @typedef {Object} DashboardData
 * @property {DashboardKPIs} kpis - KPI data
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} role - User role
 */

/**
 * @typedef {Object} Session
 * @property {string} token - Auth token
 * @property {User} user - User info
 */

/**
 * @typedef {Object} Resident
 * @property {string} id - Resident ID
 * @property {string} name - Resident name
 * @property {string} email - Resident email
 * @property {string} flatId - Flat ID reference
 * @property {string} role - Resident role
 */

/**
 * @typedef {Object} Bill
 * @property {string} id - Bill ID
 * @property {string} flatId - Flat ID reference
 * @property {number} month - Bill month
 * @property {number} year - Bill year
 * @property {number} amount - Bill amount
 * @property {string} status - Bill status
 * @property {string} dueDate - Due date
 */

/**
 * @typedef {Object} Complaint
 * @property {string} id - Complaint ID
 * @property {string} category - Category
 * @property {string} flatId - Flat ID reference
 * @property {string} priority - Priority level
 * @property {string} status - Complaint status
 */

/**
 * @typedef {Object} Visitor
 * @property {string} id - Visitor ID
 * @property {string} visitorName - Visitor name
 * @property {string} flatId - Flat ID reference
 * @property {string} visitDate - Visit date
 * @property {string} status - Visitor status
 */

/**
 * @typedef {Object} FormField
 * @property {string} name - Field name
 * @property {string} label - Field label
 * @property {string} [type='text'] - Input type
 * @property {boolean} [required=true] - Required flag
 * @property {string} [placeholder=''] - Placeholder text
 */

/**
 * @typedef {Object} ModuleConfig
 * @property {string} title - Module title
 * @property {string} subtitle - Module subtitle
 * @property {string} action - Action button text
 * @property {string} loader - API loader function name
 * @property {string} creator - API creator function name
 * @property {string[]} headers - Table headers
 * @property {FormField[]} fields - Form fields
 */

/**
 * @typedef {Object} KPICardProps
 * @property {string} icon - Icon name
 * @property {string|number} value - KPI value
 * @property {string} label - KPI label
 * @property {string} [tone='blue'] - Color tone
 */
