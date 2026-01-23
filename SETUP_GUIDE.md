
Which reports can be exported ({reportType})
downloadReport() only accepts these reportType values:

-coverage
-overdue_summary
-user_list
If you pass something else, it returns:
400 with {"error":"Invalid report type"}    
# Frontend examples
Export coverage as CSV
GET /api/v1/reports/download/coverage?format=csv
Authorization: Bearer <token>
Accept: application/json
# OR Export coverage as PDF
GET /api/v1/reports/download/coverage?format=pdf