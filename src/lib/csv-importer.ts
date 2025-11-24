/**
 * CSVImporter - Handles CSV file parsing and task import
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import Papa from 'papaparse';
import { CSVRow, ParseResult, ValidationResult, Task } from './types';
import { isNonEmptyString } from './utils';
import { CSV_IMPORT, ERROR_MESSAGES } from './constants';

export class CSVImporter {
  /**
   * Parse a CSV file
   * Requirement: 5.1 - Parse file and create tasks for valid rows
   */
  async parseFile(file: File): Promise<ParseResult> {
    // Check file size
    if (file.size > CSV_IMPORT.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${CSV_IMPORT.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      throw new Error(ERROR_MESSAGES.INVALID_CSV_FORMAT);
    }

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const validRows: CSVRow[] = [];
          const invalidRows: Array<{ row: number; data: CSVRow; error: string }> = [];

          results.data.forEach((row: unknown, index: number) => {
            const csvRow = row as Record<string, string>;
            const parsedRow: CSVRow = {
              description: csvRow.description || '',
              dueDate: csvRow.dueDate || csvRow.due_date || undefined,
              tags: csvRow.tags || undefined,
              project: csvRow.project || undefined,
            };

            const validation = this.validateRow(parsedRow);
            if (validation.valid) {
              validRows.push(parsedRow);
            } else {
              invalidRows.push({
                row: index + 2, // +2 because: +1 for 1-based indexing, +1 for header row
                data: parsedRow,
                error: validation.error || 'Unknown error',
              });
            }
          });

          resolve({ validRows, invalidRows });
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  }

  /**
   * Validate a CSV row
   * Requirement: 5.2 - Skip invalid rows
   */
  validateRow(row: CSVRow): ValidationResult {
    // Check required field: description
    if (!isNonEmptyString(row.description)) {
      return {
        valid: false,
        error: 'Description is required and cannot be empty',
      };
    }

    // Validate due date if present
    if (row.dueDate) {
      const date = this.parseDate(row.dueDate);
      if (!date) {
        return {
          valid: false,
          error: `Invalid date format: ${row.dueDate}. Use YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Convert CSV rows to Task objects
   * Requirement: 5.3 - Support columns for description, due date, tags, project
   */
  convertToTasks(rows: CSVRow[]): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] {
    return rows.map(row => ({
      description: row.description.trim(),
      completed: false,
      dueDate: row.dueDate ? this.parseDate(row.dueDate) : undefined,
      tags: row.tags ? this.parseTags(row.tags) : [],
      projectId: undefined, // Will be set later if project name matches
    }));
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateString: string): Date | undefined {
    // Try ISO format (YYYY-MM-DD)
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try MM/DD/YYYY
    const mmddyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [, month, day, year] = mmddyyyy;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try DD/MM/YYYY
    const ddmmyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return undefined;
  }

  /**
   * Parse tags from comma-separated string
   */
  private parseTags(tagsString: string): string[] {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  /**
   * Generate example CSV content
   */
  generateExampleCSV(): string {
    const headers = ['description', 'dueDate', 'tags', 'project'];
    const examples = [
      ['Complete project proposal', '2025-12-01', 'work,urgent', 'Q4 Planning'],
      ['Review pull requests', '2025-11-25', 'code-review,team', 'Development'],
      ['Update documentation', '', 'docs', 'Documentation'],
    ];

    const csv = [
      headers.join(','),
      ...examples.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Download example CSV file
   */
  downloadExampleCSV(): void {
    const csv = this.generateExampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nocturne-tasks-example.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const csvImporter = new CSVImporter();
