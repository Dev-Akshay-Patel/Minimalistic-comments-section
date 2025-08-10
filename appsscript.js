function doPost(e) {
  try {
    const adminEmail = 'Akshay@build.com'; // securely stored - You have to enter this email to get verified Check on you own comment 
    const userEmail = e.parameter.email;
    const isAdmin = userEmail && userEmail.toLowerCase() === adminEmail.toLowerCase();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const topic = e.parameter.topic || 'default';
    let sheet = ss.getSheetByName(topic);
    if (!sheet) {
      sheet = ss.insertSheet(topic);
      sheet.appendRow([
        'timestamp', 'name', 'message', 'topic', 'parentId', 'immediateId',
        'isReply', 'replyToName', 'sortIndex', 'isAdmin'
      ]);
    }

    const timestamp = new Date().toISOString();
    const sortIndex = Date.now();

    sheet.appendRow([
      timestamp,
      e.parameter.name || 'Anonymous',
      e.parameter.message || '',
      topic,
      e.parameter.parentId || '',
      e.parameter.immediateId || '',
      e.parameter.isReply === 'true',
      e.parameter.replyToName || '',
      sortIndex,
      isAdmin
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true, isAdmin }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const topic = e.parameter.topic || 'default';
    let sheet = ss.getSheetByName(topic);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
