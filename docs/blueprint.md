# **App Name**: Ticketera 2.0

## Core Features:

- Public Event Billboard: Implements a public event billboard, showcasing events with images, names, dates, and prices, categorized by event type or promoter, integrating a rotating banner.
- Authentication System: Uses Firebase Auth for user authentication via email, password, and Google, including a dedicated login for organizers/RRPPs redirecting to the admin dashboard.
- Admin Dashboard: Provides role-based access control (Super Admin, Admin, Manager, RRPP, Data, Customer) to a comprehensive admin dashboard featuring dynamic statistical cards, real-time interactive graphs, and collapsable sidebar navigation.
- Persistent Cart: Enables the persistant storage of users shopping cart data
- AI event recommendations: Dynamically recommends events to the user, based on what is known about their habits.

## Style Guidelines:

- Primary color: #30B4D3, a vibrant cyan aligning with BasquetID's branding and creating a dynamic, engaging interface.
- Background color: #0A2647, a deep desaturated blue evoking a sense of depth.
- Accent color: #A7D1AB, a bright muted green providing contrast and visual interest.
- Body font: 'PT Sans', a sans-serif font, for a balance of modernity and warmth, suitable for body text.
- Headline font: 'Playfair', a modern serif font with a high-end feel.
- Employs Lucide React icons for a consistent, modern, and user-friendly visual language.
- Adopts a mobile-first, responsive design approach using Tailwind CSS, ensuring accessibility and optimal viewing across devices (320px to 1280px+).