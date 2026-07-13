# excel

> Excel file processing for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { parseExcel, generateExcel } from 'xnest-kit/excel';

// Parse uploaded Excel file
const data = await parseExcel(file.buffer);

// Generate Excel for download
const buffer = await generateExcel(data, {
  sheetName: 'Users',
});
```

## API

### configExcel(app, options)

Configure Excel processing for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Excel configuration options

### parseExcel(buffer, options)

Parse an Excel file buffer into structured data.

**Parameters:**
- `buffer` - Excel file buffer
- `options` - Parsing options

**Options:**
- `sheetName` - Sheet to parse
- `headerRow` - Header row index

### generateExcel(data, options)

Generate an Excel file buffer from data.

**Parameters:**
- `data` - Array of objects to include
- `options` - Generation options

**Options:**
- `sheetName` - Sheet name
- `columns` - Column definitions

### ExcelUpload(options)

Decorator for handling Excel file uploads in controllers.

### ExcelDownload(options)

Decorator for returning Excel file downloads from controllers.

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
