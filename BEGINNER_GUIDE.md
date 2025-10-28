# FLEXCUBE Automation - Beginner's Guide 🚀

Welcome! This guide will help you understand how the FLEXCUBE Automation system works, even if you're completely new to programming.

---

## 📚 Table of Contents

1. [What Does This App Do?](#what-does-this-app-do)
2. [Understanding the Big Picture](#understanding-the-big-picture)
3. [Key Concepts Explained](#key-concepts-explained)
4. [How Everything Works Together](#how-everything-works-together)
5. [Step-by-Step: What Happens When You Use the App](#step-by-step-what-happens-when-you-use-the-app)
6. [Understanding the Code Structure](#understanding-the-code-structure)
7. [Glossary of Terms](#glossary-of-terms)

---

## 🎯 What Does This App Do?

### **The Problem:**
Imagine you have 100+ different bank services (like "Open Account", "Check Balance", "Transfer Money", etc.). For each service, you need to fill out a form with different information.

Normally, you would need to:
- Manually create 100+ different forms
- Code each form separately
- Update forms whenever requirements change

This is **very time-consuming and repetitive**!

### **The Solution:**
This app **automatically creates forms** for you!

Instead of manually creating forms, the app:
1. Reads documentation files that already exist
2. Understands what information each service needs
3. Automatically creates the perfect form for that service
4. All done in seconds!

**Analogy:** Think of it like having a smart assistant who reads the instruction manual and automatically creates the perfect form for you, instead of you having to create each form by hand.

---

## 🌍 Understanding the Big Picture

Let me break down how this system works using simple terms:

### **The Three Main Parts:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. THE LIBRARY (Swagger Files)                    │
│     📚 Documentation files for each service         │
│     Location: Rest Documentation folder             │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  2. THE TRANSLATOR (Schema Parser)                 │
│     🔄 Reads library files and converts them       │
│     Turns documentation into form instructions     │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  3. THE DISPLAY (Dynamic Form)                     │
│     📝 Shows the form to users                     │
│     Lets users fill in information                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔑 Key Concepts Explained

### **1. What is Swagger JSON?**

Think of Swagger JSON as an **instruction manual** for a service.

**Example:** Imagine a recipe card:
```
Recipe: Chocolate Cake
Ingredients (Required):
- Flour (2 cups)
- Sugar (1 cup)
- Eggs (3 eggs)

Ingredients (Optional):
- Vanilla extract
```

Similarly, a Swagger JSON file says:
```json
{
  "CustomerAccountService": {
    "Required Fields": ["customerId", "accountType"],
    "Optional Fields": ["balance", "description"]
  }
}
```

It tells the computer:
- What information is needed
- Which fields are required vs optional
- What type of data (text, number, dropdown, etc.)

---

### **2. What is a Schema Parser?**

A **Schema Parser** is like a **translator**.

**Analogy:**
- You have a recipe in French
- You need to cook it, but you speak English
- A translator converts French → English for you

Similarly:
- You have Swagger JSON (computer documentation format)
- You need a user-friendly form
- Schema Parser converts Swagger → Form Instructions

**What it does:**
```
INPUT (Swagger JSON):
{
  "name": "customerId",
  "type": "string",
  "required": true
}

OUTPUT (Form Instruction):
"Show a text box labeled 'customerId', mark it required with *"
```

---

### **3. What is a Dynamic Form?**

A **Dynamic Form** is a form that **builds itself automatically**.

**Traditional Form (Static):**
- You write HTML code by hand
- Fixed fields that never change
- One form = one purpose

**Dynamic Form (Our App):**
- Form creates itself based on instructions
- Changes based on which service you select
- One form = works for ALL services

**Example:**
```
You click "CustomerAccountService" → Form shows:
- customerId (text box) *
- accountType (dropdown) *
- balance (number box)

You click "AccountBalanceService" → Same form shows:
- accountNumber (text box) *
- branch (dropdown) *
- date (date picker)
```

Same form component, different fields!

---

## 🔄 How Everything Works Together

Let me explain with a **real-world analogy**:

### **Analogy: Ordering Food at a Restaurant**

1. **Menu (Swagger Files)**
   - Restaurant has a menu with all dishes
   - Each dish lists ingredients needed

2. **Waiter (Schema Parser)**
   - Reads the menu
   - Asks you questions based on the dish
   - "What size?", "Any allergies?", etc.

3. **Order Form (Dynamic Form)**
   - Shows questions relevant to your dish
   - Pizza → "Toppings?", "Size?"
   - Salad → "Dressing?", "Extra veggies?"

### **In Our App:**

1. **Swagger Files (The Menu)**
   - 100+ services documented
   - Each has list of required information

2. **Schema Parser (The Waiter)**
   - Reads the service documentation
   - Figures out what questions to ask

3. **Dynamic Form (The Order Form)**
   - Shows appropriate input fields
   - Collects your answers

---

## 👣 Step-by-Step: What Happens When You Use the App

Let me walk you through **exactly** what happens, from start to finish:

### **Step 1: Opening the App**

**What you see:**
- Browser opens to `http://localhost:3000`
- Home page appears with "FLEXCUBE Automation" title

**What happens behind the scenes:**
```javascript
// 1. Next.js server starts
// 2. Home page component loads
// 3. Makes API call: "Give me list of all services"
// 4. Server reads folder: "Rest Documentation"
// 5. Finds 100+ folders (each = one service)
// 6. Returns list: ["CustomerAccountService", "AccountBalanceService", ...]
// 7. Home page displays the list
```

---

### **Step 2: Clicking the Dropdown**

**What you see:**
- Click on dropdown in navbar
- List of services appears
- Search box to filter

**What happens behind the scenes:**
```javascript
// 1. Dropdown state changes: isOpen = true
// 2. List of services already loaded (from Step 1)
// 3. Services displayed in dropdown
// 4. Search box lets you filter the list in real-time
```

**Code snippet (simplified):**
```javascript
const [services, setServices] = useState([]); // Empty list at start
const [isOpen, setIsOpen] = useState(false);  // Dropdown closed

// When you click dropdown button:
setIsOpen(true); // Opens dropdown
// Shows list of services
```

---

### **Step 3: Selecting a Service (e.g., "CustomerAccountService")**

**What you see:**
- Click "CustomerAccountService"
- Loading spinner appears briefly
- Then form appears with input fields

**What happens behind the scenes:**
```javascript
// 1. URL changes to: /service/CustomerAccountService
// 2. Service page component loads
// 3. Makes API call: "Give me schema for CustomerAccountService"
// 4. Server receives request
// 5. Server builds file path:
//    "E:\FLEXCUBE_AUTOMATION\Rest Documentation\Rest Documentation\CustomerAccountService\swagger.json"
// 6. Server reads the file (it's a JSON file)
// 7. Server parses the JSON (extracts field information)
// 8. Server sends back parsed schema
// 9. Frontend receives schema
// 10. Dynamic form generates input fields
// 11. You see the form!
```

**Visual representation:**
```
YOU CLICK SERVICE
     ↓
API CALL: /api/services/CustomerAccountService/schema
     ↓
SERVER READS: swagger.json file
     ↓
SCHEMA PARSER: Extracts fields
     ↓
SENDS BACK: Field instructions
     ↓
DYNAMIC FORM: Creates input fields
     ↓
YOU SEE: Complete form ready to fill!
```

---

### **Step 4: The Schema Parser Does Its Magic**

This is the **most important part**! Let me explain in detail.

**Input (Swagger JSON file):**
```json
{
  "paths": {
    "/CustomerAccount/Create": {
      "post": {
        "parameters": [
          {
            "name": "BRANCH",
            "in": "header",
            "type": "string",
            "required": true,
            "description": "Enter Transaction Branch"
          },
          {
            "name": "SOURCE",
            "in": "header",
            "type": "string",
            "required": true,
            "description": "Enter Source Code"
          }
        ]
      }
    }
  },
  "definitions": {
    "CustomerAccountDto": {
      "properties": {
        "customerId": {
          "type": "string",
          "description": "Customer ID"
        },
        "accountType": {
          "type": "string",
          "enum": ["Savings", "Current"],
          "description": "Type of account"
        },
        "balance": {
          "type": "number",
          "description": "Opening balance"
        }
      },
      "required": ["customerId", "accountType"]
    }
  }
}
```

**Schema Parser Processing:**

```javascript
// STEP 1: Extract fields from "paths" (API parameters)
const pathFields = [];

// Found in paths:
pathFields.push({
  name: "BRANCH",
  type: "text",
  required: true,
  description: "Enter Transaction Branch"
});

pathFields.push({
  name: "SOURCE",
  type: "text",
  required: true,
  description: "Enter Source Code"
});

// STEP 2: Extract fields from "definitions" (Data models)
const definitionFields = [];

definitionFields.push({
  name: "customerId",
  type: "text",
  required: true,
  description: "Customer ID"
});

definitionFields.push({
  name: "accountType",
  type: "dropdown",
  required: true,
  options: ["Savings", "Current"],
  description: "Type of account"
});

definitionFields.push({
  name: "balance",
  type: "number",
  required: false,
  description: "Opening balance"
});

// STEP 3: Combine both (avoid duplicates)
const allFields = [...pathFields, ...definitionFields];

// STEP 4: Send back to frontend
return { serviceName: "CustomerAccountService", fields: allFields };
```

**Output (Field Instructions):**
```javascript
{
  serviceName: "CustomerAccountService",
  fields: [
    { name: "BRANCH", type: "text", required: true, description: "..." },
    { name: "SOURCE", type: "text", required: true, description: "..." },
    { name: "customerId", type: "text", required: true, description: "..." },
    { name: "accountType", type: "dropdown", required: true, options: ["Savings", "Current"] },
    { name: "balance", type: "number", required: false, description: "..." }
  ]
}
```

---

### **Step 5: Dynamic Form Creates the UI**

Now the Dynamic Form component receives the field instructions and creates HTML:

**Instructions received:**
```javascript
fields = [
  { name: "BRANCH", type: "text", required: true },
  { name: "accountType", type: "dropdown", options: ["Savings", "Current"] }
]
```

**Form generation logic:**
```javascript
// For each field:
fields.forEach(field => {

  if (field.type === "text") {
    // Create text input
    <input type="text" name={field.name} required={field.required} />
  }

  else if (field.type === "dropdown") {
    // Create dropdown
    <select name={field.name}>
      {field.options.map(option =>
        <option value={option}>{option}</option>
      )}
    </select>
  }

  else if (field.type === "number") {
    // Create number input
    <input type="number" name={field.name} />
  }

  // ... and so on for other types
});
```

**HTML Output:**
```html
<form>
  <label>BRANCH *</label>
  <input type="text" name="BRANCH" required />

  <label>accountType *</label>
  <select name="accountType">
    <option>Savings</option>
    <option>Current</option>
  </select>

  <label>balance</label>
  <input type="number" name="balance" />

  <button type="submit">Submit</button>
</form>
```

**What you see:**
- Clean form with labels
- Text boxes for text fields
- Dropdown for selections
- Number inputs for numbers
- Red asterisk (*) for required fields

---

### **Step 6: You Fill Out the Form**

**What you do:**
- Type in text boxes
- Select from dropdowns
- Enter numbers

**What happens behind the scenes:**
```javascript
// React state tracks your input in real-time
const [formData, setFormData] = useState({});

// When you type in "BRANCH" field:
formData = { BRANCH: "MAIN_BRANCH" };

// When you select "Savings" from accountType:
formData = {
  BRANCH: "MAIN_BRANCH",
  accountType: "Savings"
};

// And so on for each field...
```

---

### **Step 7: You Click Submit**

**What you see:**
- Click "Submit" button
- Form validates (checks required fields)
- If valid: Success! Data appears below form
- If invalid: Error messages appear

**What happens behind the scenes:**
```javascript
// 1. Validation function runs
function validateForm() {
  const errors = {};

  // Check each required field
  fields.forEach(field => {
    if (field.required && !formData[field.name]) {
      errors[field.name] = `${field.name} is required`;
    }
  });

  return errors;
}

// 2. If no errors:
if (Object.keys(errors).length === 0) {
  // Success!
  setSubmittedData(formData);
  console.log("Submitted:", formData);
}

// 3. If errors:
else {
  // Show error messages
  setErrors(errors);
}
```

**Output (on success):**
```json
{
  "BRANCH": "MAIN_BRANCH",
  "SOURCE": "WEB",
  "customerId": "12345",
  "accountType": "Savings",
  "balance": 1000
}
```

This appears below the form in a nice formatted box!

---

## 📁 Understanding the Code Structure

Let me explain what each folder and file does:

```
flexcube-frontend/
├── app/                          ← Main application folder
│   ├── api/                      ← Backend API routes
│   │   └── services/
│   │       ├── route.ts          ← Lists all services
│   │       └── [serviceName]/
│   │           └── schema/
│   │               └── route.ts  ← Gets schema for one service
│   │
│   ├── service/                  ← Service pages
│   │   └── [serviceName]/
│   │       └── page.tsx          ← Dynamic service page
│   │
│   ├── layout.tsx                ← Main layout (includes Navbar)
│   └── page.tsx                  ← Home page
│
├── components/                   ← Reusable UI components
│   ├── Navbar.tsx                ← Navigation bar with dropdown
│   ├── DynamicForm.tsx           ← Form generator
│   └── LoadingSpinner.tsx        ← Loading animation
│
├── utils/                        ← Helper functions
│   ├── schemaParser.ts           ← THE TRANSLATOR! (most important)
│   └── types.ts                  ← TypeScript type definitions
│
└── package.json                  ← Project dependencies
```

### **Key Files Explained:**

#### **1. `schemaParser.ts` (The Translator) 🔄**

**Purpose:** Converts Swagger JSON → Form Instructions

**Simple explanation:**
```
INPUT: Complex Swagger JSON file
↓
PROCESSING: Reads paths + definitions
↓
OUTPUT: Simple list of fields
```

**Key functions:**
- `parseSwaggerSchema()` - Main function that does everything
- `findMainDefinition()` - Finds the right data model to use
- `createFieldDefinition()` - Converts one property into a field
- `mapSwaggerTypeToFieldType()` - Maps types (string → text, etc.)

---

#### **2. `DynamicForm.tsx` (The Form Builder) 📝**

**Purpose:** Creates and displays the form based on field instructions

**Simple explanation:**
```
INPUT: List of field instructions
↓
PROCESSING: For each field, create appropriate input
↓
OUTPUT: Complete HTML form
```

**Key functions:**
- `renderField()` - Creates HTML for one field
- `handleChange()` - Tracks when you type/select
- `validateForm()` - Checks if all required fields filled
- `handleSubmit()` - Processes form submission

---

#### **3. `Navbar.tsx` (The Menu) 🧭**

**Purpose:** Navigation bar with service selector

**Simple explanation:**
```
Displays:
- Logo (links to home)
- Dropdown with all services
- Search box to filter services
- Service count
```

**Key features:**
- Click to open/close dropdown
- Real-time search filtering
- Highlights current service
- Routes to selected service

---

#### **4. API Routes (The Data Fetchers) 🔌**

**`app/api/services/route.ts`**
- Purpose: Get list of ALL services
- Returns: Array of service names

**`app/api/services/[serviceName]/schema/route.ts`**
- Purpose: Get schema for ONE specific service
- Returns: Parsed field definitions

**How API routes work:**
```javascript
// These run on the SERVER (not in browser)
// They have access to the file system

export async function GET(request) {
  // 1. Read file from disk
  const file = fs.readFileSync('path/to/swagger.json');

  // 2. Parse it
  const swagger = JSON.parse(file);

  // 3. Send back to browser
  return { success: true, data: swagger };
}
```

---

## 📖 Glossary of Terms

### **Programming Terms:**

**API (Application Programming Interface)**
- A way for programs to talk to each other
- Like a waiter between customer (frontend) and kitchen (backend)

**Component**
- A reusable piece of UI
- Like a LEGO block you can use multiple times

**State**
- Data that changes over time
- Example: Form input values, dropdown open/closed

**Props**
- Data passed from parent to child component
- Like passing ingredients to a recipe

**JSON (JavaScript Object Notation)**
- A way to store data in text format
- Human-readable and computer-parseable

**TypeScript**
- JavaScript with type checking
- Helps catch errors before running code

**Next.js**
- A framework for building React applications
- Handles routing, server-side code, etc.

**React**
- A library for building user interfaces
- Makes it easy to create interactive UIs

**Tailwind CSS**
- A utility-first CSS framework
- Provides pre-made styling classes

---

### **Our App-Specific Terms:**

**Swagger JSON**
- Documentation file for each service
- Contains field definitions, types, requirements

**Schema Parser**
- Function that reads Swagger JSON
- Converts it to simple field instructions

**Dynamic Form**
- Form that changes based on instructions
- Same component works for all services

**Field Definition**
- Instructions for one input field
- Contains: name, type, required, description, options

**Service**
- A banking operation (Open Account, Check Balance, etc.)
- Each has its own Swagger JSON file

---

## 🎓 Learning Path

If you want to understand the code better, here's the order to learn:

### **Level 1: Basics** (Start here!)
1. Understand what the app does (this guide!)
2. Open the app and click around
3. Look at the home page code (`app/page.tsx`)
4. Look at the Navbar code (`components/Navbar.tsx`)

### **Level 2: Intermediate**
1. Study the Dynamic Form (`components/DynamicForm.tsx`)
2. Understand React state (`useState`)
3. Look at API routes (`app/api/services/route.ts`)
4. Understand Next.js routing

### **Level 3: Advanced**
1. Study the Schema Parser (`utils/schemaParser.ts`)
2. Understand TypeScript types (`utils/types.ts`)
3. Learn about Swagger/OpenAPI specification
4. Understand the full data flow

---

## 💡 Quick Tips

### **To See What's Happening:**

1. **Open Browser Developer Tools** (Press F12)
   - Console tab: See logs and errors
   - Network tab: See API calls
   - Elements tab: See HTML structure

2. **Add Console Logs**
   ```javascript
   console.log("Current formData:", formData);
   console.log("Schema received:", schema);
   ```

3. **Check the API Response**
   - Open: `http://localhost:3000/api/services`
   - See list of all services

4. **Check a Specific Schema**
   - Open: `http://localhost:3000/api/services/CustomerAccountService/schema`
   - See parsed schema for that service

---

## 🆘 Common Questions

### **Q: Where do the Swagger files come from?**
A: They're stored in: `E:\FLEXCUBE_AUTOMATION\Rest Documentation\Rest Documentation\`
Each folder contains one service's documentation.

### **Q: What if I add a new service?**
A: Just add a new folder with a `swagger.json` file. The app will automatically detect it!

### **Q: Can I modify how fields are displayed?**
A: Yes! Edit the `renderField()` function in `DynamicForm.tsx`

### **Q: How do I add a new field type?**
A: 1. Add type to `utils/types.ts`
   2. Handle it in `schemaParser.ts`
   3. Create UI in `DynamicForm.tsx`

### **Q: What happens to submitted data?**
A: Currently, it's just displayed. In future, you can add code to send it to a backend API.

---

## 🎉 Conclusion

You now understand:
- ✅ What the app does (auto-generates forms)
- ✅ How it works (reads Swagger, parses, displays)
- ✅ The three main parts (files, parser, form)
- ✅ Step-by-step process (from click to submit)
- ✅ Code structure (what each file does)
- ✅ Key terminology (API, component, state, etc.)

**Remember:** The beauty of this system is:
- No manual form creation
- Add/update services easily
- One codebase for 100+ services
- Automatic and scalable!

---

**Need Help?**
- Read the code comments
- Use console.log() to debug
- Check the browser developer tools
- Experiment and break things (that's how you learn!)

**Happy Coding! 🚀**
