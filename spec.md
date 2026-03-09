# Alappuzha Tourism

## Current State
The app has four pages: Home, Places, Itinerary, and Admin. The Navbar links to these pages with Internet Identity login. No budget planning or AI assistance features exist.

## Requested Changes (Diff)

### Add
- **Budget Calculator page** (`/budget`): An interactive trip budget planner where users can:
  - Select number of days and group size
  - Choose accommodation type (budget guesthouse, mid-range hotel, premium resort)
  - Toggle activity categories (backwater cruise, beach activities, heritage tours, boat race viewing, bird watching)
  - Add estimated transport costs (bus, taxi, houseboat rental)
  - Add estimated food budget per day (local meals, mid-range restaurant, fine dining)
  - See a live-updated total cost breakdown with a visual summary card
  - Budget is stored in local component state (no backend needed)
- **AI Chatbot widget** (floating button on all pages): A local rule-based assistant that answers common tourism questions about Alappuzha:
  - Appears as a floating chat button (bottom-right) on all pages
  - Opens a chat panel/sheet
  - Responds to queries about best places to visit, best time to visit, food recommendations, houseboat bookings, travel tips, festivals, and transport
  - Powered by local keyword-matching (no external AI API — keeps it offline-capable)
  - Displays typing indicator briefly before responses
  - Suggested quick-reply chips for common questions

### Modify
- **App.tsx**: Add `"budget"` to the Page type, render `<BudgetPage />` and mount `<ChatbotWidget />` globally
- **Navbar**: Add "Budget" nav link between Itinerary and Admin

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/BudgetPage.tsx` with full calculator UI
2. Create `src/frontend/src/components/ChatbotWidget.tsx` with floating chat button and rule-based response engine
3. Update `App.tsx` to add `"budget"` page type, render BudgetPage, and mount ChatbotWidget globally
4. Update `Navbar.tsx` to add Budget nav link
