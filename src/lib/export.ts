import * as XLSX from 'xlsx'

export interface ExportColumn {
    key: string
    label: string
    format?: (value: any) => string
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    columns?: ExportColumn[]
): void {
    if (data.length === 0) {
        console.warn('No data to export')
        return
    }

    const formattedData = formatDataForExport(data, columns)

    // Convert to CSV
    const headers = columns?.map(col => col.label) || Object.keys(data[0])
    const csvRows = [
        headers.join(','),
        ...formattedData.map(row =>
            Object.values(row).map(value => {
                // Escape values containing commas or quotes
                const stringValue = String(value ?? '')
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`
                }
                return stringValue
            }).join(',')
        )
    ]

    const csvContent = csvRows.join('\n')
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
}

/**
 * Export data to Excel format
 */
export function exportToExcel<T extends Record<string, any>>(
    data: T[],
    filename: string,
    sheetName: string = 'Sheet1',
    columns?: ExportColumn[]
): void {
    if (data.length === 0) {
        console.warn('No data to export')
        return
    }

    const formattedData = formatDataForExport(data, columns)

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

/**
 * Format data for export based on column configuration
 */
export function formatDataForExport<T extends Record<string, any>>(
    data: T[],
    columns?: ExportColumn[]
): Record<string, any>[] {
    if (!columns) {
        return data
    }

    return data.map(item => {
        const formatted: Record<string, any> = {}
        columns.forEach(column => {
            const value = item[column.key]
            formatted[column.label] = column.format ? column.format(value) : value
        })
        return formatted
    })
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
}
