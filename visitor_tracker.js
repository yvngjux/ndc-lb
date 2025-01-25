function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  if (action === 'visitor_log') {
    // Get or create Web logs sheet
    let webLogsSheet = ss.getSheetByName('Web logs');
    
    // If sheet doesn't exist, create and format it
    if (!webLogsSheet) {
      webLogsSheet = ss.insertSheet('Web logs');
      
      // Set up headers with formatting
      const headers = [['IP Address', 'Last Visit', 'Total Visits', 'Pages Visited', 'Languages', 'Visit Details']];
      const headerRange = webLogsSheet.getRange(1, 1, 1, 6);
      headerRange.setValues(headers);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#E8EAF6');
      webLogsSheet.setFrozenRows(2); // Freeze both header and total rows
      
      // Add total statistics row below headers
      const totalRow = [['Daily Statistics:', new Date().toLocaleDateString(), '=COUNTA(A3:A)', 'Unique Pages', 'Unique Languages', 'Total Daily Visits']];
      const totalRange = webLogsSheet.getRange(2, 1, 1, 6);
      totalRange.setValues(totalRow);
      totalRange.setFontWeight('bold');
      totalRange.setBackground('#F3F4F6');
      
      // Set column widths
      webLogsSheet.setColumnWidth(1, 150); // IP Address
      webLogsSheet.setColumnWidth(2, 180); // Last Visit
      webLogsSheet.setColumnWidth(3, 100); // Total Visits
      webLogsSheet.setColumnWidth(4, 200); // Pages Visited
      webLogsSheet.setColumnWidth(5, 150); // Languages
      webLogsSheet.setColumnWidth(6, 300); // Visit Details
    }

    // Get parameters
    const ip = e.parameter.ip;
    const date = e.parameter.date;
    const time = e.parameter.time;
    const page = e.parameter.page.replace(/\.html$/, ''); // Remove .html extension
    const language = e.parameter.language.toUpperCase(); // Convert to uppercase
    const visitDetails = `[${date} ${time}] ${page} (${language})`;

    // Get all data (skip header and total rows)
    const data = webLogsSheet.getDataRange().getValues();
    let ipRow = -1;

    // Find existing IP (skip header and total rows)
    for (let i = 2; i < data.length; i++) {
      if (data[i][0] === ip) {
        ipRow = i + 1;
        break;
      }
    }

    // Clear any existing formatting (skip header and total rows)
    if (webLogsSheet.getLastRow() > 2) {
      const dataRange = webLogsSheet.getRange(3, 1, webLogsSheet.getLastRow() - 2, 6);
      dataRange.setBackground(null);
      dataRange.setBorder(false, false, false, false, false, false);
    }

    if (ipRow === -1) {
      // New IP - Add new row
      const newRow = [
        ip,                    // IP Address
        `${date} ${time}`,     // Last Visit
        1,                     // Total Visits
        page,                  // Pages Visited
        language,              // Languages
        visitDetails          // Visit Details
      ];
      webLogsSheet.appendRow(newRow);
      ipRow = webLogsSheet.getLastRow();
    } else {
      // Update existing IP
      const currentRow = data[ipRow-1];
      const totalVisits = Number(currentRow[2]) + 1; // Ensure it's treated as a number
      const pages = new Set(String(currentRow[3]).split(', ').filter(p => p));
      pages.add(page);
      const languages = new Set(String(currentRow[4]).split(', ').filter(l => l));
      languages.add(language);
      const details = String(currentRow[5]) + '\n' + visitDetails;

      // Update row
      const rowRange = webLogsSheet.getRange(ipRow, 1, 1, 6);
      rowRange.setValues([[
        ip,
        `${date} ${time}`,
        totalVisits,
        Array.from(pages).join(', '),
        Array.from(languages).join(', '),
        details
      ]]);
    }

    // Format the row
    const rowRange = webLogsSheet.getRange(ipRow, 1, 1, 6);
    rowRange.setBackground('#F8F9FA');
    rowRange.setBorder(true, true, true, true, true, true);

    // Add data validation for Visit Details column
    const detailsCell = webLogsSheet.getRange(ipRow, 6);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Click to view details'])
      .setAllowInvalid(false)
      .build();
    detailsCell.setDataValidation(rule);

    // Store full details in a note
    detailsCell.setNote(detailsCell.getValue());
    detailsCell.setValue('Click to view details');

    // Clean up Pages and Languages columns
    const pagesCell = webLogsSheet.getRange(ipRow, 4);
    const languagesCell = webLogsSheet.getRange(ipRow, 5);
    
    // Create dropdown for Pages
    const pagesRule = SpreadsheetApp.newDataValidation()
      .requireValueInList([page])
      .setAllowInvalid(false)
      .build();
    pagesCell.setDataValidation(pagesRule);
    pagesCell.setNote(Array.from(new Set(String(pagesCell.getValue()).split(', '))).join('\n'));
    
    // Create dropdown for Languages
    const languagesRule = SpreadsheetApp.newDataValidation()
      .requireValueInList([language])
      .setAllowInvalid(false)
      .build();
    languagesCell.setDataValidation(languagesRule);
    languagesCell.setNote(Array.from(new Set(String(languagesCell.getValue()).split(', '))).join('\n'));

    // Update total statistics row
    const totalRange = webLogsSheet.getRange(2, 1, 1, 6);
    const uniquePages = new Set();
    const uniqueLanguages = new Set();
    let totalDailyVisits = 0;

    // Calculate statistics from all rows (skip header and total rows)
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      const rowPages = String(row[3]).split(', ');
      const rowLanguages = String(row[4]).split(', ');
      
      rowPages.forEach(p => uniquePages.add(p));
      rowLanguages.forEach(l => uniqueLanguages.add(l));
      totalDailyVisits += Number(row[2]);
    }

    totalRange.setValues([[
      'Daily Statistics:',
      new Date().toLocaleDateString(),
      `${data.length - 2}`, // Number of unique IPs
      `${uniquePages.size} pages`,
      `${uniqueLanguages.size} languages`,
      `${totalDailyVisits} visits`
    ]]);

    // Auto-resize all columns to fit content
    webLogsSheet.autoResizeColumns(1, 6);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Visit logged successfully'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Handle AI chat logs
  if (action === 'log') {
    const sheet = ss.getSheetByName('AI Logs');
    const timestamp = new Date();
    const userMessage = e.parameter.user_message;
    const aiResponse = e.parameter.ai_response;
    
    sheet.appendRow([timestamp, userMessage, aiResponse]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'AI interaction logged successfully'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Invalid action specified'
  })).setMimeType(ContentService.MimeType.JSON);
} 