# Master Core

Act as a Senior UI/UX Designer and Senior Frontend Engineer with experience designing Enterprise ERP, Warehouse Management Systems (WMS), Supply Chain Management (SCM), and Manufacturing applications.

Build a complete, production-quality, responsive web application UI (Frontend only) for a module called:

MASTER DATA MANAGEMENT

Purpose:

This module manages all foundational master/reference data used across Warehouse, Inventory, Procurement, Manufacturing, Logistics, and Finance.

Do NOT build a simple CRUD page.

Design it like a modern enterprise application similar to SAP, Oracle, Microsoft Dynamics, or Odoo.

---------------------------------------

THEME

---------------------------------------

Use a clean enterprise design.

Primary Color:

Light Blue (#3B82F6 or similar)

Background:

White (#FFFFFF)

Secondary Background:

Very Light Blue (#F8FBFF)

Cards:

White

Borders:

Very light gray

Typography:

Modern and clean

Icons:

Lucide Icons

Buttons:

Rounded

Professional

Subtle shadows

No dark theme.

The application should feel premium, modern, and easy to use.

---------------------------------------

LAYOUT

---------------------------------------

Include

✔ Left Sidebar Navigation (Collapsible)

Logo

Master Data Management

Dashboard

Supplier Master

Customer Master

Item Master

Warehouse Master

Employee Master

Vehicle & Carrier Master

Country & Currency Master

Settings

Help

Top Navigation Bar

Search

Notifications

Profile

Theme placeholder

Responsive Design

Desktop

Tablet

Mobile

---------------------------------------

DASHBOARD

---------------------------------------

Design a professional dashboard showing

Summary Cards

Total Suppliers

Total Customers

Total Items

Warehouses

Employees

Vehicles

Countries

Recent Activity

Latest created masters

Quick Actions

Create Supplier

Create Customer

Create Item

Create Warehouse

Charts

Items by Category

Suppliers by Country

Warehouse Utilization

Recent Updates Timeline

---------------------------------------

MASTER SCREENS

---------------------------------------

Every Master should have

Professional Data Table

Search

Sorting

Filtering

Pagination

Column Selector

Export

Import

Refresh

Add New

View

Edit

Delete

Bulk Delete

Bulk Export

Status Toggle

Active/Inactive

Top Action Toolbar

Professional Empty States

Loading Skeleton

Confirmation Dialogs

---------------------------------------

1. SUPPLIER MASTER

---------------------------------------

Fields

Supplier Code

Supplier Name

Supplier Type

Contact Person

Phone

Email

Website

Address

City

State

Country

Postal Code

GST Number

Tax Number

Certification Status

Certification Expiry

Approved Commodities

Payment Terms

Currency

Bank Details

Status

Notes

Features

Search Supplier

Filter

Supplier Details Page

Timeline

Attachments

Documents

Supplier History

---------------------------------------

2. CUSTOMER MASTER

---------------------------------------

Fields

Customer Code

Customer Name

Contact Person

Phone

Email

Billing Address

Shipping Address

Delivery Locations

Shipment Preferences

Payment Terms

Currency

Tax Number

Country

Priority

Status

Customer Category

Notes

---------------------------------------

3. ITEM MASTER

---------------------------------------

Fields

Item Code

Item Name

Description

Category

Sub Category

Raw Material

Component

Sub Assembly

Finished Goods

Unit

Weight

Dimensions

Manufacturer

Brand

Barcode

SKU

Cost

Selling Price

Minimum Stock

Maximum Stock

Reorder Level

Shelf Life

Hazard Classification

Storage Conditions

HSN Code

Status

Images

Documents

---------------------------------------

4. WAREHOUSE / RACK / SHELF / BIN MASTER

---------------------------------------

Support Hierarchy

Warehouse

↓

Rack

↓

Shelf

↓

Bin

Warehouse Fields

Warehouse Code

Warehouse Name

Location

Manager

Capacity

Status

Rack

Rack Number

Shelf

Shelf Number

Bin

Bin Code

Capacity

Occupancy

Barcode

Visual Tree View

Location Mapping

Storage Map

---------------------------------------

5. EMPLOYEE MASTER

---------------------------------------

Fields

Employee ID

Name

Photo

Department

Designation

Role

Email

Phone

Joining Date

Manager

Shift

Warehouse Assignment

Permissions

Role Based Access

Status

---------------------------------------

6. VEHICLE & CARRIER MASTER

---------------------------------------

Vehicle

Vehicle Number

Vehicle Type

Capacity

Weight

Volume

Driver

Insurance

Fitness

GPS

Status

Carrier

Carrier Name

Contact

Phone

Email

Special Handling

Refrigerated

Hazard Transport

License Number

---------------------------------------

7. COUNTRY & CURRENCY MASTER

---------------------------------------

Fields

Country

Country Code

Flag

Currency

Currency Symbol

Exchange Rate

Tax Rules

Import Duty

Compliance Rules

Time Zone

Language

Status

---------------------------------------

COMMON FEATURES

---------------------------------------

Professional Forms

Form Validation

Stepper Forms

Tabs

Basic Information

Contact

Documents

History

Preview

Auto Save Indicator

Success Toast

Error Toast

Confirmation Popup

Unsaved Changes Warning

Breadcrumb Navigation

Global Search

Advanced Filters

Date Filters

Multi Select

Dropdowns

Tooltips

Hover Effects

Professional Tables

Sticky Headers

Resizable Columns

Pagination

Row Selection

Keyboard Friendly

Accessibility

Responsive Design

---------------------------------------

DETAIL VIEW

---------------------------------------

Every master record should open a professional detail page with

Overview

Information Cards

Related Records

Activity Timeline

Attachments

Audit History

Edit Button

Deactivate Button

---------------------------------------

UI COMPONENTS

---------------------------------------

Cards

Professional Tables

Charts

Stat Cards

Progress Bars

Badges

Tags

Breadcrumbs

Tabs

Accordions

Dialogs

Drawers

Dropdowns

Date Pickers

Search Bars

Pagination

Avatars

Upload Components

Status Chips

Empty States

Skeleton Loaders

---------------------------------------

DESIGN QUALITY

---------------------------------------

The UI should look suitable for a Fortune 500 manufacturing company.

Avoid generic admin templates.

Use generous whitespace.

Use consistent spacing.

Use enterprise typography.

Use modern cards.

Use clean forms.

Use subtle animations.

Use smooth hover effects.

Maintain consistent alignment.

Everything should appear polished and production-ready.

---------------------------------------

TECHNOLOGY

---------------------------------------

Use

React

TypeScript

Tailwind CSS

shadcn/ui

Lucide Icons

Responsive Design

Component-based architecture

---------------------------------------

OUTPUT

---------------------------------------

Generate the complete frontend UI with all pages connected through navigation.

Include realistic sample data in tables.

The application should be fully navigable.

The design should be suitable for presenting as an enterprise ERP/WMS Master Data Management module.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a23f3cfd-fd29-425f-b87c-592c663f7c6c).

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
