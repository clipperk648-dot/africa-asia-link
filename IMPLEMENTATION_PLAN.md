# TradeLink - Enhanced Features Implementation Plan

## Overview
This plan outlines the implementation of comprehensive clustering, filtering, admin management, and customer service features for the TradeLink platform.

## Phase 1: Database Setup

### Completed
- [x] SQL migration script created with full schema: `docs/migrations/001_initial_schema.sql`

### To Do
1. **Execute SQL Migration**
   - Run the migration script in Supabase
   - Verify all tables are created
   - Seed predefined data (categories, shipping methods)

2. **Table Structure Summary**
   - `profiles`: User management with roles (buyer, seller, admin)
   - `product_categories`: Dynamic category management
   - `products`: Product listings with category relations
   - `shipping_methods`: Configurable shipping options
   - `clusters`: Buying groups with max member limits
   - `cluster_members`: Cluster membership with admin role tracking
   - `notifications`: User notifications
   - `support_tickets` & `support_messages`: Customer service system
   - `cluster_polls`: Admin polls in clusters
   - `orders`: Cluster-based orders
   - `wallets` & `transactions`: Payment system

---

## Phase 2: Backend API Functions

### Core Functions to Implement in `src/lib/db.ts`

#### 2.1 Product & Category Management
```
✓ getProducts() - Existing, needs filter enhancement
- getProductsByCategory(categoryId)
- searchProducts(query, filters)
- getAllCategories()
- createCategory(name, description) - Admin only
- updateCategory(id, data) - Admin only
- deleteCategory(id) - Admin only
```

#### 2.2 Cluster Management
```
✓ getClusters() - Existing
✓ getClusterById() - Existing
✓ createCluster() - Needs modification (remove target amount, product, minimum order fields)
✓ joinCluster() - Existing
✓ leaveCluster() - Existing
✓ updateCluster() - Existing
- getClustersByProduct(productId) - Get clusters for a product
- autoCreateClusterForProduct(productId) - Create cluster if none exists
- getClusterMembers(clusterId) - Get all members in a cluster
- updateClusterMaxMembers(clusterId, maxMembers) - Creator/admin only
- getClusterMemberRole(clusterId, userId) - Check if user is admin
- getClustersForAdmin() - Get all clusters (admin only)
```

#### 2.3 Shipping Management
```
- updateClusterShippingStatus(clusterId, status) - Update to transit/warehouse/delivered
- getShippingCountdownDays(shippingMethodId)
- calculateExpectedDeliveryDate(clusterId)
- stopShippingCountdown(clusterId) - Admin only
- editShippingCountdown(clusterId, newDays) - Admin only
```

#### 2.4 Customer Service / Support
```
- createSupportTicket(userId, subject, description)
- getSupportTickets(userId)
- getAllSupportTickets() - Admin only
- updateSupportTicketStatus(ticketId, status) - Admin only
- sendSupportMessage(ticketId, senderId, message)
- getSupportMessages(ticketId)
- replyToSupportTicket(ticketId, adminId, message) - Creates notification
```

#### 2.5 Cluster Messaging & Polls
```
- sendClusterMessage(clusterId, userId, message)
- getClusterMessages(clusterId)
- createClusterPoll(clusterId, question, options) - Admin only
- getClusterPolls(clusterId)
- voteOnPoll(pollId, optionId, userId)
- getPollResults(pollId)
```

#### 2.6 Admin Management
```
- getAllUsers() - Already exists, needs role info
- getUsersWithRoles() - Get all users with their roles
- updateUserRole(userId, role) - Admin only
- getAdminDashboardStats() - Total users, clusters, orders, etc.
- getAuditLogs(filters) - Admin only
```

#### 2.7 Notifications
```
- createNotification(userId, title, message, type)
- getUserNotifications(userId)
- markNotificationAsRead(notificationId)
- deleteNotification(notificationId)
```

---

## Phase 3: Frontend Pages & Components

### 3.1 Product Browsing & Filtering
**Pages:**
- `/products` - Enhanced product listing with filters
  - Search bar
  - Category filter (dropdown)
  - Shipping method filter (checkbox)
  - Sort options (price, newest, etc.)

**Components:**
- `ProductFilterBar` - Filter and search controls
- `ProductCard` - Enhanced product display
- `ProductGrid` - Responsive grid layout

### 3.2 Cluster Management
**Pages:**
- `/clusters` - List of clusters
  - Filter by product category
  - Show cluster status and members count
  - Join/Leave buttons

- `/cluster/:id` - Cluster details page
  - Cluster info and members list
  - Other members display (names, quantities)
  - Product details
  - Shipping status and countdown timer
  - Admin controls (if creator or admin)
  - Message/chat section for cluster members

- `/clusters/create` - Create new cluster page
  - Product selection
  - Max members setting (default 5)
  - Ship method selection
  - **Removed fields:** target amount, target product, minimum order

- `/cluster/:id/members` - Members list page
  - All cluster members with their quantities
  - Admin badge for cluster creator
  - Leave cluster button

**Components:**
- `ClusterCard` - Cluster preview
- `ClusterMembersList` - Display cluster members
- `ShippingCountdown` - Display countdown timer
- `ClusterMessaging` - Cluster chat interface
- `ClusterPoll` - Poll display and voting

### 3.3 Admin Dashboard
**Pages:**
- `/admin/dashboard` - Admin overview
  - Stats cards (total users, clusters, orders, revenue)
  - Recent activities
  - Links to admin sections

- `/admin/clusters` - Manage all clusters
  - List all clusters with their status
  - Filter by status, shipping method
  - Approve/reject clusters
  - Change shipping status
  - Edit shipping countdown

- `/admin/users` - User management
  - List all users with their roles
  - Search and filter by role
  - Edit user roles
  - View user activity

- `/admin/categories` - Category management
  - Create, edit, delete categories
  - Manage predefined categories

- `/admin/shipping-methods` - Shipping method management
  - Create, edit, delete shipping methods
  - Configure delivery days

- `/admin/products` - Product management
  - List all products
  - Add new products (only admin can)
  - Edit/delete products
  - Manage product stock

- `/admin/support` - Support ticket management
  - View all support tickets
  - Filter by status
  - Reply to tickets
  - Close tickets

### 3.4 Customer Service
**Pages:**
- `/customer-service` - Customer service bot page
  - Conversation view
  - Create new ticket or view existing ones
  - Chat with admin support
  - Ticket status tracking

**Components:**
- `SupportTicketList` - List user's support tickets
- `SupportChat` - Chat interface for tickets
- `TicketStatus` - Status badge for tickets

### 3.5 User Notifications
**Components:**
- `NotificationBell` - Notification icon in header
- `NotificationPanel` - Dropdown with notifications
- `NotificationItem` - Individual notification

### 3.6 Auto-Cluster Creation
**Logic:**
- When user searches/filters products and no cluster exists
- Show "No cluster yet" message with "Create Cluster" button
- Button pre-fills with the searched product
- Auto-create cluster endpoint for direct product links

---

## Phase 4: Feature Implementation Details

### 4.1 Product Search & Filtering
**Requirements:**
- Search by product name/description
- Filter by category (predefined + custom)
- Filter by shipping method
- Sort by price (asc/desc), newest, popularity
- Show total results count
- Pagination

**API Flow:**
1. `searchProducts(query, filters: {category, shippingMethod, sort})`
2. If no results → Show "No cluster yet" message
3. User can create cluster for that product

### 4.2 Cluster Creation & Management
**Requirements:**
- Cluster creator automatically becomes "cluster admin"
- Admin role only visible within that cluster
- Max members default: 5 (editable by creator)
- Removed fields: target amount, target product, minimum order
- Auto-create cluster if user tries to join non-existent cluster for a product

**Workflow:**
1. User creates cluster for product
2. Becomes "cluster admin" (role tracked in `cluster_members.role`)
3. Can edit max members
4. Can approve members
5. Members can see each other in member list
6. Admin can send messages, create polls

### 4.3 Shipping Status Management
**Requirements:**
- Default status: "not_started"
- Admin can change to: "in_transit", "in_warehouse", "delivered"
- Countdown timers per shipping method:
  - Sea: 60 days
  - FedEx: 5 days
  - Air Freight: 18 days
  - Express: 12 days
- Admin can edit countdown
- Admin can stop counting

**Implementation:**
- Store `shipping_started_at` timestamp
- Calculate `expected_delivery_date` based on method
- Countdown display: `expected_delivery_date - now()`
- Stop counting: set `expected_delivery_date` to NULL

### 4.4 Customer Service System
**Requirements:**
- Users create support tickets
- Admin replies appear in both:
  1. Customer service page (chat interface)
  2. Notification page (as notification)
- Tickets have statuses: open, in_progress, resolved, closed
- Priority levels: low, normal, high, urgent

**Workflow:**
1. User creates ticket
2. View ticket history
3. Admin replies
4. Create notification for that user
5. User sees reply in both places

### 4.5 Admin Access Control
**Requirements:**
- Admins can access ALL clusters
- Post messages to any cluster
- Create polls in any cluster
- View all users and their roles
- Only admins can add products
- Only admins can create categories/shipping methods

**Implementation:**
- Check user role in API functions
- Enforce in frontend (hide/disable controls)
- Log admin actions to `audit_logs`

### 4.6 Cluster Member List
**Requirements:**
- All members visible to all members
- Show member names, quantities, join date
- Cluster creator has "admin" badge
- Badge only shows in that cluster

**Components:**
```tsx
<ClusterMembersList
  clusterId={clusterId}
  isClusterAdmin={userIsClusterAdmin}
  members={clusterMembers}
/>
```

---

## Phase 5: UI/UX Components

### Global Components to Create/Update
- `ProductFilterBar` - Reusable filter component
- `ShippingCountdown` - Animated countdown timer
- `NotificationBell` - Header notification icon
- `ClusterAdminBadge` - Indicator for cluster admin role
- `UserRoleBadge` - Role display (buyer/seller/admin)

### Layout Updates
- Add notification bell to header
- Add admin menu to header (if admin)
- Add navigation to customer service

---

## Phase 6: Testing & Validation

### Unit Tests
- [ ] Product search and filtering
- [ ] Cluster creation and membership
- [ ] Shipping countdown calculations
- [ ] Admin permission checks
- [ ] Notification creation

### Integration Tests
- [ ] End-to-end cluster workflow
- [ ] Customer service ticket workflow
- [ ] Admin approval workflow
- [ ] User/cluster relationship integrity

### Manual Testing
- [ ] Product browsing with filters
- [ ] Cluster creation and joining
- [ ] Shipping status transitions
- [ ] Customer service interactions
- [ ] Admin dashboard features

---

## Implementation Order

1. **Database Setup** (Phase 1)
   - Execute SQL migration
   - Verify data integrity

2. **Backend API** (Phase 2)
   - Implement all db.ts functions
   - Add error handling and validation
   - Write integration tests

3. **Frontend Pages** (Phase 3)
   - Product browsing with filters
   - Cluster management pages
   - Admin dashboard
   - Customer service page

4. **Components** (Phase 5)
   - Create reusable components
   - Integrate with pages

5. **Testing** (Phase 6)
   - Write and run tests
   - Fix issues
   - User acceptance testing

---

## Key Considerations

### Performance
- Index frequently queried columns (already done in SQL)
- Implement pagination for large datasets
- Use React Query for caching

### Security
- RLS policies on Supabase (defined in migration)
- Verify admin role before sensitive operations
- Audit log all admin actions

### User Experience
- Clear messaging for "no cluster yet"
- Intuitive filter interface
- Real-time notifications
- Smooth countdown animations

### Scalability
- Cluster messages should have pagination
- Support large member lists with virtualization
- Consider denormalization for frequently accessed data

---

## Success Criteria

- ✓ Users can search products with multiple filters
- ✓ Auto-cluster creation when no cluster exists
- ✓ Cluster creators have admin role (visible only in their clusters)
- ✓ Members can see each other
- ✓ Shipping status with correct countdown timers
- ✓ Admin access to all clusters and users
- ✓ Customer service system with notifications
- ✓ Only admins can add products and categories
- ✓ All required pages implemented
- ✓ No removed fields appear in cluster creation

---

## Files to Create/Modify

### Database
- [x] `docs/migrations/001_initial_schema.sql` - Schema migration

### Backend (`src/lib/db.ts`)
- [ ] Add all new API functions listed in Phase 2

### Pages (to create)
- [ ] `src/pages/products.tsx` - Product browsing
- [ ] `src/pages/clusters.tsx` - Cluster listing
- [ ] `src/pages/cluster-detail.tsx` - Single cluster view
- [ ] `src/pages/cluster-create.tsx` - Create cluster
- [ ] `src/pages/customer-service.tsx` - Support system
- [ ] `src/pages/admin/dashboard.tsx`
- [ ] `src/pages/admin/clusters.tsx`
- [ ] `src/pages/admin/users.tsx`
- [ ] `src/pages/admin/categories.tsx`
- [ ] `src/pages/admin/shipping.tsx`
- [ ] `src/pages/admin/products.tsx`
- [ ] `src/pages/admin/support.tsx`

### Components (to create)
- [ ] `src/components/ProductFilterBar.tsx`
- [ ] `src/components/ProductCard.tsx`
- [ ] `src/components/ClusterCard.tsx`
- [ ] `src/components/ClusterMembersList.tsx`
- [ ] `src/components/ShippingCountdown.tsx`
- [ ] `src/components/NotificationBell.tsx`
- [ ] `src/components/SupportTicket.tsx`
- [ ] And more...

### Utilities
- [ ] `src/utils/shipping.ts` - Shipping calculations
- [ ] `src/utils/admin.ts` - Admin helper functions
- [ ] `src/utils/notifications.ts` - Notification helpers

---

## Next Steps

1. **Review and Approve**: Confirm this plan meets requirements
2. **Execute SQL Migration**: Set up database in Supabase
3. **Implement Backend**: Add functions to `src/lib/db.ts`
4. **Build Frontend**: Create pages and components
5. **Test**: Validate all workflows
6. **Deploy**: Push to production

---

**Last Updated**: May 9, 2026
**Status**: Ready for Implementation
