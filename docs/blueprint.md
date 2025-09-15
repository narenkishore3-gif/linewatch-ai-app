# **App Name**: LineGuard

## Core Features:

- Sensor Data Display: Display real-time data from 5 current sensors, showing current values for each line.
- Relay Status Monitoring: Show the current status (ON/OFF) of each of the 6 relays, including the transformer relay.
- Manual Relay Control: Provide a user interface to manually toggle the state of each relay individually. All relays may also be triggered at once for safety, using a tool that reasons about when it would be useful.
- Anomaly Detection Alerts: Generate real-time alerts when sensor data indicates a high or zero current anomaly. 
- Block Representation: Visually represent each sensor and relay pair as a 'block' on the interface for easy association and control.

## Style Guidelines:

- Primary color: Deep Blue (#2E3192) to convey trust, security, and professionalism, reflecting the critical nature of the application.
- Background color: Light Gray (#F0F2F5), a desaturated version of the primary to ensure comfortable readability and a clean, modern interface.
- Accent color: Teal (#008080) for interactive elements (buttons, alerts) to draw attention and guide user interaction.
- Body and headline font: 'Inter', a sans-serif font, chosen for its clean, modern appearance and excellent readability, suitable for both data display and interface elements.
- Use minimalist, line-based icons to represent sensors, relays, and alert types, ensuring clarity and avoiding clutter.
- Implement a grid-based layout to organize sensor/relay blocks logically and maintain visual consistency across the interface.
- Use subtle transitions and animations (e.g., a smooth color change on relay status updates) to provide feedback and enhance user experience without being distracting.