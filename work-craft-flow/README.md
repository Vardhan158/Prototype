# Assembly Manager Pro

You are a Senior Product Designer, Senior Business Analyst, and Senior Full Stack Engineer.

Your task is to design and  build ONLY Section 14.9 – Assembly Management (BR-079 to BR-088). Do not generate UI, pages, APIs, database tables, or workflows for any other module. If another module (Inventory, Warehouse, Material Request, Finished Goods, etc.) is referenced, represent it only through mock data, dropdowns, or read-only references required for the Assembly workflow of an Enterprise Asset Management System (AMS) exactly according to the attached Business Requirements Document (BRD).

IMPORTANT RULES

1. Follow the BRD strictly.

2. Do NOT invent any business logic, buttons, fields, workflows, or validations.

3. Every screen, field, action, and workflow must be traceable to the BRD.

4. If a feature is not mentioned in the BRD, DO NOT add it.

5. The application should feel like a professional enterprise ERP used by companies like Rolls Royce, Siemens, ABB, Schneider Electric, etc.

6. The application should be responsive.

7. Use a clean enterprise UI.

8. Theme must be White + Light Blue only.

9. Use soft shadows, rounded cards, clean tables, modern forms, and professional dashboards.

10. Use icons only where appropriate.

11. Do not use dark mode.

==========================================================

MODULE TO BUILD

==========================================================

14.9 Assembly Management

Build ONLY the Assembly Management module.

The module must implement the following BRD requirements:

BR-079

Assembly Work Order Creation

BR-080

Bill of Materials Association

BR-081

Component Consumption Tracking

BR-082

Assembly Stage Tracking

BR-083

In-Process Quality Checkpoints

BR-084

Assembly Confirmation

BR-085

Rework and Scrap Recording

BR-086

Finished Goods Serial Generation

BR-087

Assembly Exception Handling

BR-088

Assembly Completion Certificate

Do not include other modules such as Procurement, Warehouse, Inventory, Dispatch, Document Management, etc., except where they are referenced by Assembly.

==========================================================

APPLICATION STRUCTURE

==========================================================

Create the following pages.

1. Login

2. Dashboard

3. Work Orders

4. Create Work Order

5. Work Order Details

6. BOM Details

7. Component Consumption

8. Assembly Progress

9. Quality Checkpoints

10. Rework & Scrap

11. Finished Goods

12. Assembly Certificates

==========================================================

DASHBOARD

==========================================================

Show KPI Cards

Total Work Orders

Pending

In Progress

Completed

Failed

Rework

Recent Work Orders

Assembly Status Chart

Stage Completion Progress

Operator Performance

Recent Activity

==========================================================

WORK ORDER PAGE

==========================================================

Table Columns

Work Order ID

Finished Product

Quantity

Priority

Assigned Operator

Current Stage

Status

Created Date

Completion Date

Actions

Buttons

Create Work Order

View

Edit

Assign Operator

Search

Filter

Pagination

==========================================================

CREATE WORK ORDER

==========================================================

Fields

Work Order Number

Finished Product

Finished Goods Specification

BOM Version

Quantity

Priority

Start Date

Expected Completion Date

Assigned Operator

Remarks

Buttons

Save

Cancel

==========================================================

BOM DETAILS

==========================================================

Display

Component Name

Component Code

Required Quantity

Consumed Quantity

Variance

Status

==========================================================

COMPONENT CONSUMPTION

==========================================================

Show

Expected Quantity

Actual Quantity

Difference

Variance Warning

Flag if consumed quantity exceeds BOM

==========================================================

ASSEMBLY STAGES

==========================================================

Track stages

Sub Assembly

Wiring

Integration

Testing

Final Assembly

Each stage should have

Status

Start Time

End Time

Assigned Operator

Buttons

Start Stage

Complete Stage

==========================================================

QUALITY CHECKPOINTS

==========================================================

Mandatory checkpoints

Electrical Continuity Test

Insulation Resistance Test

Load Test

Each checkpoint

Pass

Fail

Remarks

Inspector

Date

Prevent moving to the next stage until mandatory checks pass.

==========================================================

ASSEMBLY CONFIRMATION

==========================================================

Capture

Operator

Start Time

End Time

Labour Hours

Completion Time

Remarks

Button

Confirm Assembly

==========================================================

REWORK & SCRAP

==========================================================

Allow

Record Rework

Record Scrap

Fields

Reason Code

Description

Cost Impact

Operator

Approval Status

==========================================================

ASSEMBLY EXCEPTION

==========================================================

Handle

Missing Component

Failed Test

Damaged Component

Incorrect Component

Low Stock

Show

Severity

Status

Assigned Manager

Resolution

==========================================================

FINISHED GOODS

==========================================================

Generate automatically

Finished Goods Serial Number

Link

Consumed Component Serials

Batch Numbers

Completion Date

Status

==========================================================

ASSEMBLY CERTIFICATE

==========================================================

Generate a professional printable certificate.

Include

Work Order

Product

Operator

Manager

Components Used

Tests Performed

Serial Number

Completion Date

Approval

==========================================================

SEARCH

==========================================================

Allow searching by

Work Order

Operator

Product

Serial Number

Status

==========================================================

FILTERS

==========================================================

Status

Operator

Product

Date

Priority

==========================================================

DESIGN

==========================================================

Use

White background

Light Blue primary color

Very clean enterprise dashboard

Professional cards

Rounded corners

Soft shadows

Modern tables

Professional typography

Sticky sidebar

Top navigation bar

Minimal icons

Beautiful spacing

Responsive layout

==========================================================

OUTPUT

==========================================================

Generate a production-quality enterprise application with:

• complete UI

• navigation

• pages

• forms

• tables

• validation

• enterprise dashboard

• realistic sample data

• responsive design

Do not skip any BRD requirement.

If a requirement is unclear, preserve the BRD wording instead of making assumptions.

The generated application should be ready for implementation in React/Next.js with reusable components and enterprise-level UX.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0f70561d-870d-4b58-91bd-4f8332c845cb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
