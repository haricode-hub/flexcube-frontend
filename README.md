# FLEXCUBE Automation Frontend

A Next.js application that dynamically generates forms from FLEXCUBE service Swagger schemas, showing **only mandatory fields** for streamlined data entry.

## Features

- 📋 **Dynamic Form Generation** - Automatically creates forms from Swagger JSON schemas
- ✨ **Mandatory Fields Only** - Shows only required fields for cleaner, focused forms
- 🎨 **Modern UI** - Built with Tailwind CSS for a clean, responsive design
- ⚡ **Fast Performance** - Powered by Next.js App Router
- ✅ **Form Validation** - Automatic validation based on required fields
- 🔍 **Service Search** - Quick search to find services in navbar
- 📊 **Data Display** - View submitted form data in JSON format
- 🧭 **Service Tabs** - Quick navigation between services via navbar tabs

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React State Management

## Project Structure

```
flexcube-frontend/
├── app/
│   ├── api/
│   │   └── services/              # API routes
│   │       ├── route.ts           # List all services
│   │       └── [serviceName]/
│   │           └── schema/
│   │               └── route.ts   # Get service schema
│   ├── service/
│   │   └── [serviceName]/
│   │       └── page.tsx           # Dynamic service page
│   ├── layout.tsx                 # Root layout with Navbar
│   └── page.tsx                   # Home page
├── components/
│   ├── DynamicForm.tsx            # Form generator component
│   ├── LoadingSpinner.tsx         # Loading component
│   └── Navbar.tsx                 # Navigation bar
├── utils/
│   ├── schemaParser.ts            # Swagger schema parser
│   └── types.ts                   # TypeScript types
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- FLEXCUBE Rest Documentation folder at: `E:\FLEXCUBE_AUTOMATION\Rest Documentation\Rest Documentation\`

### Installation

1. Navigate to the project directory:
```bash
cd E:\FLEXCUBE_AUTOMATION\flexcube-frontend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How It Works

1. **Service Discovery**: The API route `/api/services` scans the Rest Documentation folder and lists all available services with swagger.json files.

2. **Navigation**:
   - Browse services on the home page in a grid layout
   - Use the navbar search to quickly filter services
   - Click service tabs in the navbar for instant navigation

3. **Schema Loading**: When you select a service, the app fetches the schema from `/api/services/[serviceName]/schema`.

4. **Form Generation**: The `schemaParser.ts` utility extracts **only mandatory/required fields** from the Swagger schema, identifying:
   - Field types (text, number, dropdown, checkbox, textarea)
   - Required fields (only these are shown)
   - Enum values for dropdowns
   - Field descriptions

5. **Dynamic Rendering**: The `DynamicForm` component renders appropriate input fields based on the parsed schema.

6. **Validation & Submission**: Forms validate all fields (all are required) and display submitted data in JSON format below the form.

## Supported Field Types

| Swagger Type | Form Input Type |
|-------------|----------------|
| `string` | Text input |
| `number` / `integer` | Number input |
| `boolean` | Checkbox |
| `string` with `enum` | Dropdown/Select |
| Fields with "description" in name | Textarea |

## API Routes

### GET /api/services
Returns a list of all available services.

**Response:**
```json
{
  "success": true,
  "services": ["CustomerAccountService", "AccountBalanceService", ...],
  "count": 100
}
```

### GET /api/services/[serviceName]/schema
Returns the parsed schema for a specific service.

**Response:**
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

## Key Implementation Details

### Mandatory Fields Only
The schema parser filters fields to show **only required fields**. This is implemented in `utils/schemaParser.ts`:
```typescript
if (requiredFields.includes(propName)) {
  const field = createFieldDefinition(propName, propDef, requiredFields);
  fields.push(field);
}
```

### Navbar Features
- **Search Bar**: Filters services in real-time as you type
- **Service Tabs**: Shows up to 20 filtered services for quick access
- **Service Count**: Displays total number of available services

## Customization

### Including Optional Fields
To show all fields (not just required ones), modify `utils/schemaParser.ts` line 25-33 to remove the `if (requiredFields.includes(propName))` condition.

### Adding Custom Field Types

Edit `utils/schemaParser.ts` to add support for more Swagger types.

### Styling

The project uses Tailwind CSS with modern class names:
- `bg-linear-to-br` for gradients
- `shrink-0` instead of `flex-shrink-0`

Customize the theme in `tailwind.config.ts`.

### Form Behavior

Modify `components/DynamicForm.tsx` to change form validation, submission handling, or add custom fields.

## Troubleshooting

### Services not loading
- Verify the Rest Documentation folder path is correct
- Check that swagger.json files exist in service folders
- Look for errors in the browser console and terminal

### Schema parsing errors
- Some swagger.json files may have different structures
- Check the `schemaParser.ts` logic for your specific schema format

## Current Implementation Summary

✅ **Completed Features:**
- Dynamic form generation from Swagger schemas
- Mandatory fields only (streamlined forms)
- Service search and navigation via navbar tabs
- Loading states and error handling
- Responsive design with Tailwind CSS
- Form validation and data display
- Support for multiple field types (text, number, dropdown, checkbox, textarea)

## Future Enhancements

- Support for nested objects/arrays in forms
- API request submission to actual FLEXCUBE endpoints
- Form response handling and display
- Save/load form templates
- Export/import form data
- Batch form submissions
- Form history and audit trail
