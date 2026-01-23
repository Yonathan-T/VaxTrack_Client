# reports
i have this in my back end

Route::middleware('role:admin|health_official')->prefix('reports')->group(function () {
         Route::get('/coverage', [AdminController::class, 'vaccineCoverageReport']);
         Route::get('/download/{reportType}', [AdminController::class, 'downloadReport']);
         Route::get('/stats', [AdminController::class, 'stats']);
    });
# and for stats 
GET v1/reports/stats
{
    "success": true,
    "data": {
        "total_children": 0,
        "total_parents": 0,
        "total_nurses": 1,
        "total_health_officials": 0,
        "total_vaccines_given": 0,
        "total_overdue": 0,
        "coverage_bcg": 0,
        "coverage_measles1": 0
    }
}
# the download,  this is the method
```
 public function downloadReport(Request $request, $reportType)
    {
        $format = $request->query('format', 'csv');
        $columns = [];
        $data = [];
        $title = 'Report';
        $summary = '';

        $facilityId = auth()->user()->facility_id;

        if ($reportType === 'coverage') {
            $data = $this->generateCoverageReportData($columns, $facilityId); 
            $title = 'Vaccine Coverage Report';
            $summary = 'This report shows the vaccination coverage percentage for each vaccine.';
        } elseif ($reportType === 'overdue_summary') {
            $data = $this->generateOverdueSummaryData($columns, $facilityId);
            $title = 'Overdue Vaccinations Summary';
            $summary = 'This report lists children with overdue vaccinations.';
        } elseif ($reportType === 'user_list') {
            $data = $this->generateUserData($columns, $facilityId);
            $title = 'System Users List';
        } else {
            return response()->json(['error' => 'Invalid report type'], 400);
        }

        if ($format === 'pdf') {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.generic', [
                'title' => $title,
                'summary' => $summary,
                'columns' => $columns,
                'data' => $data
            ]);
            
            $filename = "report_{$reportType}_" . now()->format('Ymd_His') . ".pdf";
            return $pdf->download($filename);
        }

        // CSV (Default)
        $filename = "report_{$reportType}_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"          => "text/csv",
            "Content-Disposition"   => "attachment; filename={$filename}",
            "Pragma"                => "no-cache",
            "Cache-Control"         => "must-revalidate, post-check=0, pre-check=0",
            "Expires"               => "0"
        ];

        $callback = function() use ($data, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns); 

            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
    ```

# for vaccine coverage we got this
```
public function vaccineCoverageReport()
    {
        $vaccines = \App\Models\Vaccine::all();
        $report = [];
        $facilityId = auth()->user()->facility_id;
        $totalChildren = Child::query()->when($facilityId, fn($q) => $q->where('facility_id', $facilityId))->count();

        if ($totalChildren > 0) {
            foreach ($vaccines as $vaccine) {
                $given = VaccinationRecord::where('vaccine_id', $vaccine->id)
                    ->where('status', 'completed')
                    ->whereHas('child', function($q) use ($facilityId) {
                        $q->when($facilityId, fn($sub) => $sub->where('facility_id', $facilityId));
                    })
                    ->count();
                
                $report[] = [
                    'vaccine' => $vaccine->name,
                    'code' => $vaccine->code,
                    'total_given' => $given,
                    'coverage_percentage' => round(($given / $totalChildren) * 100, 1)
                ];
            }
        }
        ```
    