# FLEXCUBE Automation - Complete Process Flow

This document explains how the entire FLEXCUBE Automation system works, from start to finish.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Step-by-Step Process Flow](#step-by-step-process-flow)
4. [Component Details](#component-details)
5. [Data Flow Diagram](#data-flow-diagram)
6. [API Routes](#api-routes)
7. [User Journey](#user-journey)

---

## 🎯 System Overview

**Purpose**: Automatically generate dynamic forms from FLEXCUBE Swagger API documentation, allowing users to input data without manually creating forms for each service.

**Key Benefit**: Zero manual form creation - forms are automatically generated based on Swagger JSON schema definitions.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLEXCUBE Automation                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐     │
│  │   Frontend   │◄─────┤   Next.js    │      │   FastAPI    │     │
│  │  (React UI)  │      │  App Router  │◄─────┤   Backend    │     │
│  └──────────────┘      └──────────────┘      └──────────────┘     │
│         │                      ▲                      ▲             │
│         ▼                      │                      │             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐     │
│  │  API Routes  │◄─────┤  File System │      │   Git Repo   │     │
│  │   (Next.js)  │      │   (swagger)  │      │ (FCUBS_CASA) │     │
│  └──────────────┘      └──────────────┘      └──────────────┘     │
│         │                      ▲                      ▲             │
│         ▼                      │                      │             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐     │
│  │    Schema    │      │  Rest Docs   │      │   GitHub     │     │
│  │    Parser    │─────►│   Folder     │      │   (jmrdevops)│     │
│  └──────────────┘      └──────────────┘      └──────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Step-by-Step Process Flow

### **Step 1: Application Startup**

1. User navigates to `http://localhost:3000`
2. Next.js server starts and renders the home page
3. Home page component (`app/page.tsx`) is loaded
4. Navbar component is rendered at the top

```javascript
// app/layout.tsx includes Navbar
<Navbar />
{children}
```

---

### **Step 2: Service Discovery**

1. **Navbar** and **Home Page** both fetch the list of services
2. API call made to: `GET /api/services`
3. Server-side API route executes:
   - Reads file system at: `E:\FLEXCUBE_AUTOMATION\Rest Documentation\Rest Documentation\`
   - Scans all directories in the folder
   - Checks each directory for `swagger.json` file
   - Returns list of services that have swagger.json files

```javascript
// API: app/api/services/route.ts
const entries = fs.readdirSync(restDocPath, { withFileTypes: true });
const services = entries
  .filter(entry => entry.isDirectory())
  .filter(serviceName => {
    const swaggerPath = path.join(restDocPath, serviceName, 'swagger.json');
    return fs.existsSync(swaggerPath);
  });
```

**Result**: List of 100+ services displayed in:
- Navbar dropdown (with search)
- Home page grid (first 12 services)

---

### **Step 3: User Selects a Service**

**Option A: Via Navbar Dropdown**
1. User clicks on the dropdown button in navbar
2. Dropdown opens showing all services
3. User can search by typing in the search box
4. Services filter in real-time
5. User clicks on a service name
6. Browser navigates to `/service/[ServiceName]`

**Option B: Via Home Page**
1. User clicks on a service card on home page
2. Browser navigates to `/service/[ServiceName]`

```
Navigation Flow:
/ (home) → /service/CustomerAccountService → Dynamic Form Page
```

---

### **Step 4: Schema Fetching**

1. Dynamic service page loads: `app/service/[serviceName]/page.tsx`
2. Page extracts service name from URL
3. API call made to: `GET /api/services/[serviceName]/schema`
4. Server-side API route executes:
   - Constructs path to swagger.json file
   - Reads the file from disk
   - Parses JSON content
   - Passes to schema parser

```javascript
// API: app/api/services/[serviceName]/schema/route.ts
const swaggerPath = path.join(
  process.cwd(),
  '..',
  'Rest Documentation',
  'Rest Documentation',
  serviceName,
  'swagger.json'
);
const swaggerContent = fs.readFileSync(swaggerPath, 'utf-8');
const swagger = JSON.parse(swaggerContent);
```

---

### **Step 5: Schema Parsing**

The Schema Parser (`utils/schemaParser.ts`) processes the Swagger JSON:

1. **Find Main Definition**
   - Looks for definitions ending with: `Input`, `Request`, `Dto`, `Create`, `Update`
   - Falls back to first definition if no match

2. **Extract Fields**
   - Gets all properties from the definition
   - Includes ALL fields (both required and optional)
   - Identifies required fields from `required` array

3. **Determine Field Types**
   - `string` → Text input
   - `number/integer` → Number input
   - `boolean` → Checkbox
   - `string with enum` → Dropdown
   - Fields with "description/comment/note" in name → Textarea

```javascript
// utils/schemaParser.ts
Object.entries(def.properties).forEach(([propName, propDef]) => {
  const field = createFieldDefinition(propName, propDef, requiredFields);
  fields.push(field);
});
```

**Output**: ServiceSchema object with array of FieldDefinitions

```typescript
{
  serviceName: "CustomerAccountService",
  fields: [
    { name: "customerId", type: "text", required: true, description: "..." },
    { name: "accountType", type: "dropdown", required: true, options: ["Savings", "Current"] },
    { name: "balance", type: "number", required: false }
  ]
}
```

---

### **Step 6: Dynamic Form Generation**

The DynamicForm component (`components/DynamicForm.tsx`) receives the schema:

1. **Render Form Fields**
   - Loops through each field in schema
   - Calls `renderField()` for each
   - Creates appropriate input based on field type

2. **Field Rendering Logic**
   ```javascript
   switch (field.type) {
     case 'text':      return <input type="text" />
     case 'number':    return <input type="number" />
     case 'dropdown':  return <select><option>...</option></select>
     case 'checkbox':  return <input type="checkbox" />
     case 'textarea':  return <textarea />
   }
   ```

3. **Field Styling**
   - Required fields: Red asterisk (*)
   - Optional fields: No asterisk
   - Error states: Red border + error message
   - Focused state: Blue ring

4. **Grid Layout**
   - 2 columns on desktop (`md:grid-cols-2`)
   - 1 column on mobile
   - Textarea fields span full width

---

### **Step 7: User Input & Validation**

1. **User Fills Form**
   - Types in text fields
   - Selects from dropdowns
   - Checks/unchecks checkboxes
   - Enters numbers

2. **Real-time State Management**
   ```javascript
   const [formData, setFormData] = useState({});

   const handleChange = (name, value) => {
     setFormData(prev => ({ ...prev, [name]: value }));
   };
   ```

3. **Validation on Submit**
   ```javascript
   const validateForm = () => {
     const newErrors = {};
     schema.fields.forEach(field => {
       if (field.required && !formData[field.name]) {
         newErrors[field.name] = `${field.name} is required`;
       }
     });
     return Object.keys(newErrors).length === 0;
   };
   ```

---

### **Step 8: Form Submission**

1. User clicks "Submit" button
2. Form validation runs
3. If validation fails:
   - Error messages appear below fields
   - Fields with errors get red border
4. If validation passes:
   - Form data sent to FastAPI backend at `http://localhost:8000/submit-form`
   - Backend processes data and pushes to FCUBS_CASA git repo
   - Success/error response displayed

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (validateForm()) {
    const response = await fetch('http://localhost:8000/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedEndpoint, data: formData })
    });
    if (response.ok) {
      const result = await response.json();
      setSubmittedData({ ...formData, serverResponse: result });
    } else {
      setErrors({ submit: 'Submission failed' });
    }
  }
};
```

### **Step 9: Data Storage in Git Repo**

1. FastAPI backend clones/pulls FCUBS_CASA repo
2. Appends form data to `data.csv` in repo
3. Commits with message "Add form data submission"
4. Pushes to https://github.com/jmrdevops/FCUBS_CASA.git
5. Data permanently stored in version-controlled git repository

**CSV Format**:
```csv
timestamp,endpoint,form_data
2025-01-28T10:30:00,GET /AccountBalance/getBalance/custAcNo/{custAcNo},"{""custAcNo"": ""12345"", ""amount"": 1000}"
```

---

## 🧩 Component Details

### **1. Navbar (`components/Navbar.tsx`)**
- **Purpose**: Global navigation and service selection
- **Features**:
  - Dropdown list of all services
  - Real-time search filtering
  - Shows current selected service
  - Service count display
  - Click outside to close
- **State**:
  - `services`: Array of all service names
  - `searchTerm`: Current search query
  - `isDropdownOpen`: Dropdown visibility
  - `loading`: Loading state

### **2. Home Page (`app/page.tsx`)**
- **Purpose**: Landing page with service overview
- **Features**:
  - Hero section with title
  - Stats cards (service count)
  - Grid of first 12 services
  - Feature highlights
- **Displays**:
  - Total services available
  - Dynamic/Auto form generation badges

### **3. Service Page (`app/service/[serviceName]/page.tsx`)**
- **Purpose**: Individual service form page
- **Features**:
  - Dynamic route based on service name
  - Schema fetching with loading state
  - Error handling and retry
  - DynamicForm integration

### **4. DynamicForm (`components/DynamicForm.tsx`)**
- **Purpose**: Form generator from schema
- **Features**:
  - Multi-field type support
  - Validation logic
  - Error display
  - Submit/Reset buttons
  - Submitted data display

### **5. Schema Parser (`utils/schemaParser.ts`)**
- **Purpose**: Convert Swagger JSON to form-ready schema
- **Functions**:
  - `parseSwaggerSchema()`: Main parser
  - `findMainDefinition()`: Find correct definition
  - `createFieldDefinition()`: Convert property to field

---

## 📊 Data Flow Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────┐
│  1. Open http://localhost:3000  │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  2. Home Page Loads             │
│     - Fetch /api/services       │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  3. Display Services in:        │
│     - Navbar Dropdown           │
│     - Home Page Grid            │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  4. User Selects Service        │
│     - Click in dropdown OR      │
│     - Click on grid card        │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  5. Navigate to Service Page    │
│     /service/[ServiceName]      │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  6. Fetch Schema                │
│     GET /api/services/          │
│         [ServiceName]/schema    │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  7. Read swagger.json from      │
│     File System                 │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  8. Parse Schema                │
│     - Extract definitions       │
│     - Identify field types      │
│     - Mark required fields      │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  9. Generate Dynamic Form       │
│     - Render input fields       │
│     - Apply styling             │
│     - Setup validation          │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  10. User Fills Form            │
│      - Enter data               │
│      - Validation feedback      │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  11. User Clicks Submit         │
│      - Validate all fields      │
│      - Send to FastAPI backend  │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  12. Backend Processes          │
│      - Clone FCUBS_CASA repo    │
│      - Append to data.csv       │
│      - Git commit & push        │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  13. Data Stored in Git         │
│      - Version controlled       │
│      - Accessible remotely      │
│      - Audit trail available    │
└─────────────────────────────────┘
```

---

## 🛣️ API Routes

### **Frontend API Routes (Next.js)**

---

### **GET /api/services**

### **GET /api/services**

**Purpose**: List all available services

**Implementation**: `app/api/services/route.ts`

**Process**:
1. Read directory: `Rest Documentation/Rest Documentation/`
2. Filter directories with `swagger.json`
3. Sort alphabetically
4. Return array

**Response**:
```json
{
  "success": true,
  "services": ["AccountBalanceService", "CustomerAccountService", ...],
  "count": 100
}
```

---

### **GET /api/services/[serviceName]/schema**

**Purpose**: Get parsed schema for a specific service

**Implementation**: `app/api/services/[serviceName]/schema/route.ts`

**Process**:
1. Extract `serviceName` from URL params
2. Build path to swagger.json file
3. Read and parse JSON
4. Pass to schema parser
5. Return parsed schema

**Response**:
```json
{
  "success": true,
  "schema": {
    "serviceName": "CustomerAccountService",
    "fields": [
      {
        "name": "customerId",
        "type": "text",
        "required": true,
        "description": "Customer ID"
      }
    ]
  }
}
```

---

### **Backend API Routes (FastAPI)**

#### **POST /submit-form**

**Purpose**: Submit form data and store in git repository

**Implementation**: `backend/main.py`

**Process**:
1. Receive form data with selected endpoint
2. Pull latest changes from FCUBS_CASA repo
3. Append data row to `data.csv`
4. Git add, commit with timestamp, push to repo

**Request Body**:
```json
{
  "selectedEndpoint": "GET /AccountBalance/getBalance/custAcNo/{custAcNo}",
  "data": {
    "custAcNo": "12345",
    "amount": 1000
  }
}
```

**Response**:
```json
{
  "message": "Form data saved to repository successfully",
  "timestamp": "2025-01-28T10:30:00"
}
```

#### **GET /form-data**

**Purpose**: Retrieve all submitted form data from repository

**Process**:
1. Pull latest changes from FCUBS_CASA repo
2. Read and parse `data.csv`
3. Return array of submissions

**Response**:
```json
{
  "data": [
    {
      "timestamp": "2025-01-28T10:30:00",
      "endpoint": "GET /AccountBalance/getBalance/custAcNo/{custAcNo}",
      "form_data": "{\"custAcNo\": \"12345\", \"amount\": 1000}"
    }
  ]
}
```

---

## 👤 User Journey

### **Scenario: User wants to submit data for "CustomerAccountService"**

1. **Start**: Open browser to `http://localhost:3000`

2. **Home Page**: See overview with 100+ services available

3. **Navigate**: Click dropdown in navbar

4. **Search**: Type "Customer" to filter services

5. **Select**: Click on "CustomerAccountService"

6. **Loading**: See loading spinner while schema loads

7. **Form Appears**: Dynamic form with all fields rendered
   - customerId (text) *
   - accountType (dropdown) *
   - balance (number)
   - description (textarea)

8. **Fill Form**:
   - Enter "12345" in customerId
   - Select "Savings" from accountType dropdown
   - Enter 1000 in balance
   - Type notes in description

9. **Submit**: Click "Submit" button

10. **Validation**: All required fields checked

11. **Backend Processing**: Data sent to FastAPI backend, stored in FCUBS_CASA git repo

12. **Success Confirmation**: Success message appears with timestamp:
    ```
    ✓ Data saved to CSV successfully
    Timestamp: 2025-01-28T10:30:00
    ```

13. **Data Storage**: Form data permanently stored in https://github.com/jmrdevops/FCUBS_CASA.git as CSV

14. **Next Steps**: User can:
    - Reset form and enter new data
    - Select different service from dropdown
    - Go back to home page
    - View all submissions in FCUBS_CASA repo

---

## 🎨 UI/UX Features

### **Navbar Dropdown**
- ✅ Click to open/close
- ✅ Search bar inside dropdown
- ✅ Real-time filtering
- ✅ Scrollable list (max-height: 320px)
- ✅ Current service highlighted
- ✅ Service count in footer
- ✅ Click outside to close

### **Dynamic Form**
- ✅ Responsive grid layout (1-2 columns)
- ✅ Required field indicators (*)
- ✅ Field descriptions as hints
- ✅ Error messages below fields
- ✅ Submit + Reset buttons
- ✅ Submitted data display
- ✅ Clean, modern styling

---

## 🔧 Technical Details

### **File System Structure**
```
E:\FLEXCUBE_AUTOMATION\
├── Rest Documentation\
│   └── Rest Documentation\
│       ├── CustomerAccountService\
│       │   └── swagger.json
│       ├── AccountBalanceService\
│       │   └── swagger.json
│       └── ... (100+ services)
└── flexcube-frontend\
    ├── app\
    ├── components\
    └── utils\
```

### **Technology Stack**
- **Frontend Framework**: Next.js 15 (App Router)
- **Frontend Language**: TypeScript
- **Backend Framework**: FastAPI (Python)
- **Backend Language**: Python 3.13
- **Styling**: Tailwind CSS
- **State Management**: React useState
- **Routing**: Next.js dynamic routes
- **File I/O**: Node.js fs module (server-side only)
- **Data Storage**: Git repository (GitHub)
- **API Communication**: REST (HTTP/JSON)

---

## 🚀 Performance Optimizations

1. **Client-side State**: Services cached after first load
2. **Lazy Loading**: Forms only load when service selected
3. **Efficient Filtering**: Real-time search with simple `.filter()`
4. **Sticky Navbar**: Always accessible, no scroll needed
5. **Optimized Rendering**: Only re-render on state changes

---

## 📝 Summary

**The entire process in one sentence:**

User selects a service → Schema fetched from swagger.json → Parser extracts fields → Dynamic form generated → User fills & submits → Data sent to FastAPI backend → Stored in FCUBS_CASA git repository.

**Key Innovations:**

1. Zero manual form creation - automatically generated from Swagger API documentation
2. Decentralized data storage - form submissions stored in version-controlled git repository
3. Multi-service support - handles 266+ FLEXCUBE services dynamically

---

**Last Updated**: 2025-10-28
**Version**: 2.0
