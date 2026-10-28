# LifeCare Connect - Updated Prototype

## Latest updates
- Added Emergency Support to Admin and Staff dashboards with resident search, emergency alert workflow, medical summary, report saving, status tracking and emergency history.
- Start Emergency Alert checks approved family permission for the exact selected resident and opens a pre-filled emergency email to that authorized family account.
- Emergency Contact, Ambulance and Doctor actions now use pre-filled email messages to the configured recipient. Demo sender is meshramsakshi227@gmail.com and demo recipient is siddhithakare2007@gmail.com.
- Because this is a browser-only prototype, these actions open the configured email client using mailto; they do not silently send email without an email provider/backend.
- Emergency Support searches the local resident dataset and displays the selected resident's profile, medicine information and available medical survey records.
- Removed Family Account Requests from Admin Notifications; resident-specific family access requests remain.
- Added Shree Gadge Maharaj Vrudhashram, Amravati location to the main Dashboard for Admin, Staff, Visitor and Family. Family sees the location before and after resident-access approval.


## Changes in this version
- Added demo medical-survey / doctor-checkup records for all 10 residents.
- Medical survey includes doctor name, blood pressure, fasting sugar, temperature, pulse, weight, symptoms and doctor's remarks.
- Fasting sugar is explicitly labelled as a before-food reading.
- Staff can view all registered residents and their medical information.
- Removed "Access / Resident Note" from the Add Staff / Family Email form.
- Family accounts do not select a resident while being created by Admin.
- A family member must request permission for one specific resident from the Family portal.
- Admin approves/denies that resident-specific request from Notifications.
- After approval, the family member can see only that permitted resident's private information.
- Family access is limited to one permitted resident at a time.
- Included LifeCare_database.sql for a PostgreSQL/Netlify Database setup.

## Demo accounts
Admin: adm@lifecare.com / 123
Staff: stf@lifecare.com / 123
Family: fam@lifecare.com / 123
Visitor: any valid email / no password

The short login IDs `adm`, `stf`, and `fam` are also accepted for the three demo accounts.

## Family resident privacy workflow
- Family Dashboard does not show whole-home medical/medicine information.
- There is no separate "Permitted Resident Dashboard" option.
- Family has one **Permitted Resident** option.
- Before approval, the family member sees only general ashram information, monthly seminars, timetable, booking notifications and the permission-request screen.
- The family member must type the resident's complete name manually; the available resident names are never displayed.
- Admin receives each resident-access request in **Notifications** and can Approve or Deny it.
- After approval, only that specific resident's medical needs, results, disease history and report analysis are visible.
- To view another resident, the family member must submit another request and wait for another Admin approval.
- Approval replaces the previously permitted resident, so only one resident is visible to that family account at a time.
- The permitted-resident page also shows which resident is currently being viewed and relevant booking information.

## Run locally
Open index.html directly or use VS Code Live Server.

## Important
This prototype currently stores demo website data in browser localStorage. The included SQL file is the database schema/data for connecting the project to a real PostgreSQL/Netlify Database backend. Netlify deployment alone does not make browser localStorage into a shared database.

Medical values included in the demo are sample/test values and must not be treated as actual patient measurements.
