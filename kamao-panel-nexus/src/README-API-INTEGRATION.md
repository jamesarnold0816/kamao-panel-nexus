# API Integration Guide for Kamao Panel Nexus

This document provides instructions for updating components to work with the API-connected context providers.

## Context Changes Summary

We've updated the following contexts to use the API instead of local storage:

1. **UserContext**: 
   - Now uses real API authentication with JWT tokens
   - Login and signup functions make API calls to `/auth/login` and `/auth/signup`

2. **ProductContext**:
   - Changed interface properties to match server naming convention (`accessPlan` → `access_plan`, `createdAt` → `created_at`)
   - Added loading state
   - Replaced mock data with API calls
   - Added `fetchProducts` and `fetchCategories` functions

3. **CartContext**:
   - Changed interface properties to match server naming
   - Added loading state
   - Replaced local storage orders and plan requests with API calls
   - Added `fetchOrders` and `fetchPlanRequests` functions
   - All functions now return Promises

## Component Updates Needed

### General Updates:

1. Update all references to renamed properties:
   - `accessPlan` → `access_plan`
   - `createdAt` → `created_at`
   - `productId` → `product_id`
   - `resellerId` → `reseller_id`
   - `resellerName` → `reseller_name`
   - `resellerEmail` → `reseller_email`
   - `currentPlan` → `current_plan`
   - `requestedPlan` → `requested_plan`
   - `zipCode` → `zip_code`

2. Add loading indicators where appropriate using the `loading` state from contexts

### Product Components:

1. Update product filtering:
   ```jsx
   // Old approach
   const filtered = filteredProducts(category, searchQuery, user?.plan);
   
   // New approach
   useEffect(() => {
     fetchProducts(category, searchQuery, user?.plan);
   }, [category, searchQuery, user?.plan]);
   
   // Then use filteredProducts state directly
   ```

2. Update product creation/editing forms to match API parameters

### Order Components:

1. Update order listing pages to call `fetchOrders()` on mount
2. Update order status updates to use `updateOrderStatus(id, status)` instead of `updateOrder(id, {status})`
3. Update order detail components to use new property names

### Plan Upgrade Components:

1. Update plan request creation to use:
   ```jsx
   requestPlanUpgrade(user.plan, 'vip')
   ```
   
   Instead of:
   ```jsx
   requestPlanUpgrade(user.id, user.name, user.email, user.plan, 'vip')
   ```

2. Add loading indicators when approving/rejecting plan requests

## Error Handling

All API calls now include proper error handling:

```jsx
try {
  // API call
  // Success toast
} catch (error) {
  console.error('Error:', error);
  toast.error(error.response?.data?.message || 'Default error message');
}
```

Make sure UI properly handles errors and loading states.

## Testing

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```

2. Start the frontend application:
   ```
   cd kamao-panel-nexus
   npm run dev
   ```

3. Test all main features:
   - Authentication
   - Product listing and filtering
   - Cart operations
   - Order creation and management
   - Plan upgrade requests 