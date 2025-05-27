# Class Names Reference for Page Components

This document provides a comprehensive list of semantic class names added to page components for easier development, testing, and styling.

## ReportPage.tsx

### Main Structure
- `report-page` - Main page container
- `report-container` - Content container with max-width
- `report-card` - Main form card wrapper (shadcn Card component)

### Header Section (CardHeader)
- `report-header` - Header section of the form (CardHeader)
- `report-title-section` - Title and icon container
- `report-icon` - Warning icon
- `report-title` - Main page title (CardTitle)
- `report-description` - Subtitle/description text (CardDescription)

### Content Section (CardContent)
- `report-content` - Main content wrapper (CardContent)
- `report-form` - Main form element
- `form-error-message` - Form-level error message container
- `error-text` - Error message text
- `form-sections` - Container for all form sections
- `form-actions` - Form buttons container
- `cancel-button` - Cancel button
- `submit-button` - Submit button
- `loading-spinner` - Loading spinner in submit button

## StoresPage.tsx

### Main Structure
- `stores-page` - Main page container
- `stores-container` - Content container with max-width

### Loading States
- `stores-page-loading` - Loading state container
- `loading-skeleton-container` - Initial loading skeleton wrapper
- `refreshing-skeleton-container` - Refresh loading skeleton wrapper

### Content States
- `error-container` - Error message container
- `no-stores-message` - Empty state container
- `empty-state-text` - Empty state message text

## DashboardPage.tsx

### Main Structure
- `dashboard-page` - Main page container
- `dashboard-title` - Page title
- `dashboard-tabs` - Tabs container
- `dashboard-tabs-list` - Tabs list wrapper

### Tab Components
- `store-requests-tab` - Store requests tab trigger
- `my-reports-tab` - My reports tab trigger
- `store-requests-content` - Store requests tab content
- `my-reports-content` - My reports tab content

## AdminPage.tsx

### Main Structure
- `admin-page` - Main page container
- `admin-container` - Content container with max-width

### Loading State
- `admin-page-loading` - Loading state container
- `loading-spinner` - Loading spinner

### Header Section
- `admin-header` - Header section
- `admin-header-content` - Header content wrapper
- `admin-title` - Page title
- `admin-description` - Page description

### Content Section
- `admin-content` - Main content wrapper
- `admin-main-content` - Main content area

### Store Management
- `admin-stores-list` - Stores list container
- `stores-list` - Stores list element
- `store-item` - Individual store item
- `empty-state` - Empty state message

### Modals
- `admin-store-modal` - Store detail modal wrapper
- `admin-reports-modal` - Reports modal wrapper

## Usage Guidelines

### For Developers
1. **Component Identification**: Use these class names to quickly identify components in DevTools
2. **Testing**: Use these class names as selectors in automated tests
3. **Styling**: Target these classes for component-specific styling
4. **Debugging**: Easily locate elements during development

### For Styling
```css
/* Example: Style the report page specifically */
.report-page {
  /* Page-specific styles */
}

/* Example: Style form actions across the app */
.form-actions {
  /* Consistent button layout */
}

/* Example: Style loading states */
.loading-spinner {
  /* Consistent spinner appearance */
}
```

### For Testing
```javascript
// Example: Cypress/Playwright selectors
cy.get('.submit-button').click();
cy.get('.form-error-message').should('be.visible');
cy.get('.admin-stores-list .store-item').should('have.length', 5);
```

### Naming Convention
- **Page Level**: `{page-name}-page` (e.g., `report-page`, `admin-page`)
- **Section Level**: `{section-name}-{element}` (e.g., `report-header`, `admin-content`)
- **Component Level**: `{component-name}-{element}` (e.g., `form-actions`, `loading-spinner`)
- **State Level**: `{state}-{element}` (e.g., `empty-state`, `error-container`)

This naming convention ensures consistency and makes it easy to understand the purpose and hierarchy of each element. 