# Alappuzha Tourism

## Current State
No existing implementation. Starting fresh.

## Requested Changes (Diff)

### Add
- Public homepage with a list of tourist places in Alappuzha (name, description, category, Google Maps link)
- Itinerary planner: users can add places to a day-by-day itinerary and view/save it
- User login via Internet Identity (no Gmail or phone login — platform limitation)
- Admin panel (accessible to admin principal) to add/edit/remove tourist places
- Simple navigation: Home, Places, Itinerary Planner, Admin

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: store tourist places (id, name, description, category, mapsUrl, imageUrl); CRUD for admin; store user itineraries by principal
2. Frontend:
   - Homepage with hero section and featured places
   - Places page: grid of all tourist places with Google Maps link buttons
   - Itinerary Planner: add/remove places per day, view full itinerary
   - Admin page: add/edit/delete places (only shown to admin principal)
   - Login/logout using Internet Identity via authorization component
