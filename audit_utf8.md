# Export Audit Report

## EventLogs.tsx

**UI Table Columns:**
{['Timestamp', 'Module', 'Action', 'Actor', 'Detail'].map(h => ( {h}

**XLSX Export Headers:** 0
**PDF Export Headers:** 'TIMESTAMP', 'MODULE', 'ACTION', 'ACTOR', 'DETAIL'

## Reports.tsx

**UI Table Columns:**
{headers.map(h => ( {h}

**XLSX Export Headers:** 'Full Name', 'Farm Name', 'National ID', 'Phone', 'Email', 'District', 'Sector', 'Cell', 'Village', 'Produce Types', 'Farm Size (ha)', 'Capacity (Tons)', 'Status', 'Registered'
**XLSX Export Headers:** 'Cycle ID', 'Crop Name', 'Season', 'Status', 'Start Date'
**XLSX Export Headers:** 'Stock ID', 'Crop', 'Received (kg)', 'Processed (kg)', 'Rejected (kg)', 'Loss %', 'Room', 'Status', 'Date'
**XLSX Export Headers:** 'PL Number', 'Flight', 'Airline', 'Destination', 'Client', 'Weight (kg)', 'Boxes', 'AWB Number', 'Invoice', 'Status', 'Departure Date'
**XLSX Export Headers:** 'Name', 'Email', 'Role', 'Phone', 'Status', 'Joined'
**XLSX Export Headers:** 
**PDF Export Headers:** 'METRIC', 'VALUE'
**PDF Export Headers:** 'RANK', 'FARMER', 'FARM NAME', 'TOTAL VOLUME'
**PDF Export Headers:** 'FARMER / FARM', 'NATIONAL ID', 'CONTACT INFO', 'PHYSICAL ADDRESS', 'MAIN CROP', 'SIZE', 'STATUS'
**PDF Export Headers:** 'CYCLE ID', 'CROP', 'SEASON', 'STATUS', 'START DATE'
**PDF Export Headers:** 'STOCK ID', 'CROP', 'RECEIVED (KG)', 'PROCESSED (KG)', 'LOSS %', 'STATUS', 'DATE'
**PDF Export Headers:** 'PL NUMBER', 'FLIGHT', 'DESTINATION', 'CLIENT', 'WEIGHT (KG)', 'STATUS', 'DEPARTURE'
**PDF Export Headers:** 'NAME', 'EMAIL', 'ROLE', 'PHONE', 'STATUS', 'JOINED'

## UserManagement.tsx

**UI Table Columns:**
{['User', 'Role', 'Phone', 'Status', 'Joined', 'Actions'].map(h => ( {h}

**XLSX Export Headers:** 0
**PDF Export Headers:** 'NAME', 'EMAIL', 'ROLE', 'STATUS', 'JOINED'

## Fleet.tsx

**UI Table Columns:**
{activeTab === 'vehicles' ? ( <> Plate Number | Type & Capacity | Current Driver | Next Service | Status | Actions | Name | Contact | License Details | Current Vehicle | Status | Actions

**XLSX Export Headers:** 0
**PDF Export Headers:** 'PLATE', 'TYPE', 'CAPACITY', 'NEXT SERVICE', 'STATUS'
**PDF Export Headers:** 'NAME', 'PHONE', 'LICENSE', 'VEHICLE', 'STATUS'

## PendingPickups.tsx

**UI Table Columns:**
{['Crop', 'Farm / Farmer', 'Est. Weight', 'Declared By', 'Time', 'Status', 'Action'].map(h => ( {h}

**XLSX Export Headers:** 0
**PDF Export Headers:** 'CROP', 'FARM / FARMER', 'WEIGHT', 'DECLARED BY', 'DATE', 'STATUS'

## BatchDetailModal.tsx


## CropCycleDetailModal.tsx

**UI Table Columns:**
Activity | Category | Est. Cost

**XLSX Export Headers:** 'Category Name', 'Allocated (Rwf)', 'Approved (Rwf)', 'Spent (Rwf)', 'Variance (Rwf)'
**XLSX Export Headers:** 'Date', 'Submitted By', 'Period', 'Activities', 'Amount (Rwf)', 'Status', 'PM Note'
**XLSX Export Headers:** 'Submission Date', 'Harvest Date', 'Predicted (kg)', 'Confidence', 'Status', 'Notes'
**XLSX Export Headers:** 255, 255, 255
**PDF Export Headers:** 'CATEGORY', 'ALLOCATED', 'APPROVED', 'ACTUAL SPENT', 'VARIANCE'
**PDF Export Headers:** 'DATE', 'ACTIVITIES', 'REQUESTED AMOUNT', 'APPROVAL STATUS'

## FarmerProfile.tsx

**UI Table Columns:**
Block | Crop | Planted | Yield Goal | Status | Date | Crop | Quantity | Status

**XLSX Export Headers:** 'Block', 'Crop', 'Planted', 'Yield Goal (kg)', 'Status'
**XLSX Export Headers:** 'Date', 'Crop', 'Quantity (kg)', 'Status'
**XLSX Export Headers:** 0
**PDF Export Headers:** 'SPECIFICATION', 'DETAILS'
**PDF Export Headers:** 'BLOCK', 'CROP NAME', 'PLANTING DATE', 'YIELD GOAL', 'STATUS'
**PDF Export Headers:** 'DECLARATION DATE', 'CROP', 'DECLARED QTY', 'CURRENT STATUS'

## FindBatchModal.tsx

**PDF Export Headers:** stageLabel, toTC(node.title)
**PDF Export Headers:** 'CERTIFICATE OF SUPPLY CHAIN INTEGRITY'

## StockDetailModal.tsx

**PDF Export Headers:** 'BATCH ID', 'CLIENT', 'DESTINATION', 'ALLOCATED (KG)', 'BOXES', 'TARGET DATE', 'STATUS'

## AnalyticsReporting.tsx

**UI Table Columns:**
{headers.map(h => ( {h}

**XLSX Export Headers:** 'Metric', 'Value'
**XLSX Export Headers:** 'Full Name', 'Farm Name', 'Province', 'District', 'Produce', 'Farm Size (ha)', 'Status', 'Registered'
**XLSX Export Headers:** 'Cycle ID', 'Crop', 'Season', 'Status', 'Started'
**XLSX Export Headers:** 'Stock ID', 'Crop', 'Received (kg)', 'Processed (kg)', 'Rejected (kg)', 'Loss %', 'Status', 'Date'
**XLSX Export Headers:** 'PL Number', 'Flight', 'Destination', 'Client', 'Weight (kg)', 'Boxes', 'Status', 'Departure'
**PDF Export Headers:** 'METRIC', 'VALUE'
**PDF Export Headers:** 'FULL NAME', 'DISTRICT', 'PRODUCE', 'FARM SIZE', 'STATUS', 'JOINED'
**PDF Export Headers:** 'STOCK ID', 'CROP', 'RECEIVED (KG)', 'PROCESSED (KG)', 'LOSS %', 'STATUS', 'DATE'
**PDF Export Headers:** 'PL NUMBER', 'FLIGHT', 'DESTINATION', 'CLIENT', 'WEIGHT (KG)', 'STATUS', 'DEPARTURE'

## FarmerManagement.tsx

**UI Table Columns:**
Farmer / Farm Name | National ID | Phone Number | Email | Physical Address | Main Crop | Land Size | Date Joined | Status | Actions

**XLSX Export Headers:** 'Cycle ID', 'Crop Name', 'Season', 'Status', 'Start Date'
**XLSX Export Headers:** 0
**PDF Export Headers:** 'RANK', 'FARMER', 'FARM NAME', 'TOTAL VOLUME'
**PDF Export Headers:** 'FARMER / FARM', 'CONTACT INFO', 'PHYSICAL ADDRESS', 'MAIN CROP', 'SIZE', 'STATUS'

## InventoryManagement.tsx

**UI Table Columns:**
Stock ID | Produce | Farmer / Source | Grade | Processed | Rejected | Allocated | Available | Location | Date In Stock | Status | Actions | Batch ID | Client / Destination | Composition | Shipment Date | PL Number | Status | Action | Time | Event | Description | Impact | Performed By

**XLSX Export Headers:** 'Time', 'Event', 'Description', 'Impact', 'Performed By'
**XLSX Export Headers:** 'Stock ID', 'Produce', 'Farmer / Source', 'Grade', 'Processed (kg)', 'Rejected (kg)', 'Defect Type', 'Allocated (kg)', 'Available (kg)', 'Storage', 'Date In Stock', 'Status'
**XLSX Export Headers:** 'Batch ID', 'Produce', 'Client', 'Destination', 'Weight (kg)', 'Status', 'Departure'
**PDF Export Headers:** 'TIME', 'EVENT', 'DESCRIPTION', 'IMPACT', 'USER'
**PDF Export Headers:** 'ID', 'PRODUCE', 'SOURCE', 'GRADE', 'PROC.', 'REJ.', 'ALLOC.', 'AVAIL.', 'LOCATION', 'DATE', 'STATUS'
**PDF Export Headers:** 'BATCH ID', 'PRODUCE', 'CLIENT', 'DESTINATION', 'WEIGHT (KG)', 'STATUS'

## Traceability.tsx

**UI Table Columns:**
Entity | Type | ID Number | Status | Expiry

**PDF Export Headers:** stageLabel, toTC(node.title)
**PDF Export Headers:** 'CERTIFICATE OF SUPPLY CHAIN INTEGRITY'

## ColdRoom.tsx

**UI Table Columns:**
{['Batch ID', 'Crop', 'Received (kg)', 'Processed (kg)', 'Rejected (kg)', 'Net Stock (kg)', 'Entry Date', 'Status'].map(h => ( {h}

**XLSX Export Headers:** 0
**PDF Export Headers:** 'BATCH ID', 'CROP', 'RECEIVED', 'PROCESSED', 'NET STOCK', 'STATUS'

## Intake.tsx

**UI Table Columns:**
{['Ref ID', 'Crop', 'Supplier', 'Arrival', 'Weight', 'Driver / Vehicle', 'Status'].map(h => ( {h}

**XLSX Export Headers:** 0
**PDF Export Headers:** 'REF ID', 'CROP', 'SUPPLIER', 'ARRIVAL', 'WEIGHT', 'STATUS'


done
