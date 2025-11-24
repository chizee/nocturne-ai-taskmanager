/**
 * Property-based tests for CSVImporter
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CSVImporter } from '../csv-importer';
import { CSVRow } from '../types';

describe('CSVImporter Property Tests', () => {
  const importer = new CSVImporter();

  /**
   * Feature: nocturne-task-manager, Property 15: Valid CSV import
   * Validates: Requirements 5.1, 5.3, 5.4
   */
  it('Property 15: Valid CSV import', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            dueDate: fc.option(
              fc.date().map(d => d.toISOString().split('T')[0]),
              { nil: undefined }
            ),
            tags: fc.option(
              fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })
                .map(tags => tags.join(',')),
              { nil: undefined }
            ),
            project: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (csvRows) => {
          // Validate all rows
          const validRows: CSVRow[] = [];
          csvRows.forEach(row => {
            const validation = importer.validateRow(row);
            if (validation.valid) {
              validRows.push(row);
            }
          });

          // Convert to tasks
          const tasks = importer.convertToTasks(validRows);

          // Verify count matches
          expect(tasks.length).toBe(validRows.length);

          // Verify each task has required properties
          tasks.forEach((task, index) => {
            expect(task.description).toBe(validRows[index].description.trim());
            expect(task.completed).toBe(false);
            expect(Array.isArray(task.tags)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 16: Invalid CSV row handling
   * Validates: Requirements 5.2
   */
  it('Property 16: Invalid CSV row handling', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            description: fc.string({ maxLength: 100 }), // Can be empty
            dueDate: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
            tags: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
            project: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
          }),
          { minLength: 5, maxLength: 20 }
        ),
        (csvRows) => {
          const validRows: CSVRow[] = [];
          const invalidRows: Array<{ row: CSVRow; error: string }> = [];

          csvRows.forEach(row => {
            const validation = importer.validateRow(row);
            if (validation.valid) {
              validRows.push(row);
            } else {
              invalidRows.push({ row, error: validation.error || 'Unknown error' });
            }
          });

          // Convert only valid rows to tasks
          const tasks = importer.convertToTasks(validRows);

          // Verify only valid rows were converted
          expect(tasks.length).toBe(validRows.length);

          // Verify invalid rows were properly identified
          invalidRows.forEach(({ error }) => {
            expect(error).toBeDefined();
            expect(error.length).toBeGreaterThan(0);
          });

          // Total should equal original count
          expect(validRows.length + invalidRows.length).toBe(csvRows.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate rows with empty descriptions as invalid', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.trim().length === 0),
        (emptyDescription) => {
          const row: CSVRow = {
            description: emptyDescription,
          };

          const validation = importer.validateRow(row);
          expect(validation.valid).toBe(false);
          expect(validation.error).toContain('Description');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should parse tags correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        (description, tags) => {
          const row: CSVRow = {
            description,
            tags: tags.join(','),
          };

          const validation = importer.validateRow(row);
          expect(validation.valid).toBe(true);

          const tasks = importer.convertToTasks([row]);
          expect(tasks[0].tags.length).toBeGreaterThan(0);
          
          // Each tag should be trimmed
          tasks[0].tags.forEach(tag => {
            expect(tag).toBe(tag.trim());
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
